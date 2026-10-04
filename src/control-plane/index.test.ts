import test from "node:test";
import assert from "node:assert/strict";
import { BERTH_MCP_TOOLS } from "../mcp/index.ts";
import controlPlane from "./index.ts";

test("MCP tools registry contains all 7 mandatory Berth tools", () => {
  const toolNames = BERTH_MCP_TOOLS.map(t => t.name);
  const expected = [
    "claim_task",
    "get_context_pack",
    "request_lease",
    "propose",
    "escalate",
    "report_cost",
    "report_friction"
  ];

  for (const name of expected) {
    assert.ok(toolNames.includes(name), `Missing mandatory MCP tool: ${name}`);
  }
  assert.equal(toolNames.length, 7);
});

test("propose tool schema requires attempt_id, commit_sha, evidence_ids", () => {
  const propose = BERTH_MCP_TOOLS.find(t => t.name === "propose");
  assert.ok(propose, "propose tool should exist");
  assert.deepEqual(propose.inputSchema.required, ["attempt_id", "commit_sha", "evidence_ids"]);
});

test("escalate tool schema requires attempt_id, question", () => {
  const escalate = BERTH_MCP_TOOLS.find(t => t.name === "escalate");
  assert.ok(escalate, "escalate tool should exist");
  assert.deepEqual(escalate.inputSchema.required, ["attempt_id", "question"]);
});

test("Control plane routes /api/queue and /api/queue/history", async () => {
  const mockQueueEntries = [
    { entry_id: "q-1", task_id: "task-1", status: "Queued", enqueued_at: 1000 }
  ];
  const mockLandingLogs = [
    { log_id: "l-1", task_id: "task-0", status: "Landed", landed_at: 2000 }
  ];

  const mockEnv: any = {
    MERGE_QUEUE: {
      idFromName: (_name: string) => "queue-id",
      get: (_id: any) => ({
        async listQueue() {
          return mockQueueEntries;
        },
        async listLandingLog() {
          return mockLandingLogs;
        }
      })
    }
  };

  const resQueue = await controlPlane.fetch(
    new Request("https://berth.test/api/queue"),
    mockEnv
  );
  assert.equal(resQueue.status, 200);
  const queueJson = await resQueue.json() as any;
  assert.deepEqual(queueJson.queue, mockQueueEntries);

  const resHistory = await controlPlane.fetch(
    new Request("https://berth.test/api/queue/history"),
    mockEnv
  );
  assert.equal(resHistory.status, 200);
  const historyJson = await resHistory.json() as any;
  assert.deepEqual(historyJson.history, mockLandingLogs);
});

test("Vouching a task automatically enqueues change into MergeQueue", async () => {
  let enqueuedPayload: any = null;
  let taskRecordedLanding = false;

  const mockEnv: any = {
    TASK_COORDINATOR: {
      idFromName: (_name: string) => "coord-id",
      get: (_id: any) => ({
        async recordVouch(_taskId: string, email: string, name: string) {
          return { status: "Vouched" };
        },
        async getLatestProposal(_taskId: string) {
          return {
            proposal_id: "prop-123",
            attempt_id: "att-1",
            commit_sha: "sha-final-123"
          };
        },
        async recordLanding(_taskId: string) {
          taskRecordedLanding = true;
          return { status: "Landing" };
        }
      })
    },
    MERGE_QUEUE: {
      idFromName: (_name: string) => "queue-id",
      get: (_id: any) => ({
        async enqueueChange(entry: any) {
          enqueuedPayload = entry;
          return { entryId: "queue-entry-99", status: "Queued", position: 1 };
        }
      })
    }
  };

  const req = new Request("https://berth.test/api/tasks/task-xyz/vouch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voucherEmail: "lead@example.com",
      voucherName: "Engineering Lead"
    })
  });

  const res = await controlPlane.fetch(req, mockEnv);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.status, "Vouched");
  assert.equal(json.queue.entryId, "queue-entry-99");
  assert.ok(taskRecordedLanding);
  assert.equal(enqueuedPayload.taskId, "task-xyz");
  assert.equal(enqueuedPayload.attemptId, "att-1");
  assert.equal(enqueuedPayload.commitSha, "sha-final-123");
  assert.equal(enqueuedPayload.vouchedBy, "Engineering Lead <lead@example.com>");
});

test("Control plane serves HTML dashboard on /ui and / with Accept text/html", async () => {
  const mockEnv: any = {};
  const res = await controlPlane.fetch(
    new Request("https://berth.test/ui"),
    mockEnv
  );
  assert.equal(res.status, 200);
  assert.ok(res.headers.get("Content-Type")?.includes("text/html"));
  const html = await res.text();
  assert.ok(html.includes("BERTH"));
  assert.ok(html.includes("Inbox — Needs You"));
  assert.ok(html.includes("Real-time Push Conflict Matrix"));
  assert.ok(html.includes("Vouch & Land"));
});

test("Control plane serves candidate preview environment on /preview/:taskId", async () => {
  const mockEnv: any = {};
  const res = await controlPlane.fetch(
    new Request("https://berth.test/preview/M4-review"),
    mockEnv
  );
  assert.equal(res.status, 200);
  assert.ok(res.headers.get("Content-Type")?.includes("text/html"));
  const html = await res.text();
  assert.ok(html.includes("Candidate Deployment Sandbox"));
  assert.ok(html.includes("M4-review"));
  assert.ok(html.includes("Vouch &amp; Land Candidate"));

  // Check healthz probe
  const healthRes = await controlPlane.fetch(
    new Request("https://berth.test/preview/M4-review/healthz"),
    mockEnv
  );
  assert.equal(healthRes.status, 200);
  const healthJson = await healthRes.json() as any;
  assert.equal(healthJson.status, "healthy");
  assert.equal(healthJson.preview, true);
  assert.equal(healthJson.taskId, "M4-review");
});

test("Control plane routes /api/summary/generate and /api/summary/validate", async () => {
  const mockEnv: any = {};
  
  // Validation endpoint test
  const valReq = new Request("https://berth.test/api/summary/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `Why:           Fix login crash
What changes:  Refreshes session token safely before expiry
Look at:       auth.ts
Verified:      Unit test suite   Not verified: Edge network drops
Cost:          $0.15 across 1 attempt`
    })
  });

  const valRes = await controlPlane.fetch(valReq, mockEnv);
  assert.equal(valRes.status, 200);
  const valJson = await valRes.json() as any;
  assert.equal(valJson.valid, true);
  assert.ok(valJson.wordCount <= 80);

  // Generation endpoint test
  const genReq = new Request("https://berth.test/api/summary/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "Prevent race condition in token refresh",
      behaviorChange: "Ensures tokens are refreshed safely with mutex lock",
      criticalHunks: ["src/auth.ts: refreshToken()"],
      evidence: ["35 unit tests passing"],
      notVerified: "Distributed partition scenario",
      costUsd: 0.35,
      attemptsCount: 1
    })
  });

  const genRes = await controlPlane.fetch(genReq, mockEnv);
  assert.equal(genRes.status, 200);
  const genJson = await genRes.json() as any;
  assert.equal(genJson.validation.valid, true);
  assert.ok(genJson.summary.includes("Why:"));
  assert.ok(genJson.summary.includes("Not verified: Distributed partition scenario"));
});

test("Control plane routes /api/inbox, /api/views/task/:id, and /api/views/change/:id", async () => {
  const mockEnv: any = {
    TASK_COORDINATOR: {
      idFromName: (_name: string) => "coord-id",
      get: (_id: any) => ({
        async getInbox() {
          return { activeTasksCount: 1, needsAttentionCount: 1, proposals: [{ taskId: "t-1" }] };
        },
        async getTaskView(taskId: string) {
          return { task: { task_id: taskId }, attempts: [], conflictMatrix: [] };
        },
        async getChangeView(taskId: string) {
          return { taskId, taskTitle: "Change View Test", canVouch: true };
        },
        async getConflictMatrix(taskId: string) {
          return [{ taskId, attemptA: "att-1", attemptB: "trunk", status: "clean" }];
        }
      })
    }
  };

  const inboxRes = await controlPlane.fetch(new Request("https://berth.test/api/inbox"), mockEnv);
  assert.equal(inboxRes.status, 200);
  const inboxJson = await inboxRes.json() as any;
  assert.equal(inboxJson.needsAttentionCount, 1);

  const taskViewRes = await controlPlane.fetch(new Request("https://berth.test/api/views/task/t-1"), mockEnv);
  assert.equal(taskViewRes.status, 200);
  const taskViewJson = await taskViewRes.json() as any;
  assert.equal(taskViewJson.task.task_id, "t-1");

  const changeViewRes = await controlPlane.fetch(new Request("https://berth.test/api/views/change/t-1"), mockEnv);
  assert.equal(changeViewRes.status, 200);
  const changeViewJson = await changeViewRes.json() as any;
  assert.equal(changeViewJson.canVouch, true);

  const matrixRes = await controlPlane.fetch(new Request("https://berth.test/api/tasks/t-1/matrix"), mockEnv);
  assert.equal(matrixRes.status, 200);
  const matrixJson = await matrixRes.json() as any;
  assert.equal(matrixJson.matrix[0].status, "clean");
});

test("Vouch action extracts Cf-Access-Authenticated-User-Email header", async () => {
  let recordedEmail = "";
  const mockEnv: any = {
    TASK_COORDINATOR: {
      idFromName: (_name: string) => "coord-id",
      get: (_id: any) => ({
        async recordVouch(_taskId: string, email: string, _name: string) {
          recordedEmail = email;
          return { status: "Vouched" };
        },
        async getLatestProposal() { return null; },
        async recordLanding() { return { status: "Landing" }; }
      })
    },
    MERGE_QUEUE: null
  };

  const req = new Request("https://berth.test/api/tasks/task-cf-access/vouch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cf-Access-Authenticated-User-Email": "cf-user@theashtons.dev"
    },
    body: JSON.stringify({})
  });

  const res = await controlPlane.fetch(req, mockEnv);
  assert.equal(res.status, 200);
  assert.equal(recordedEmail, "cf-user@theashtons.dev");
});

test("Control plane routes /api/webhooks/issues and triggers autonomous triage", async () => {
  const mockEnv: any = {
    TASK_COORDINATOR: {
      idFromName: (_name: string) => "coord-id",
      get: (_id: any) => ({
        async createTask() { return { status: "created" }; },
        async claimAttempt(_taskId: string, agentName: string) { return { attemptId: `att-${agentName}` }; },
        async requestLease() { return { granted: true }; },
        async propose() { return { status: "Proposed", proposalId: "prop-auto-fix" }; }
      })
    }
  };

  const issueReq = new Request("https://berth.test/api/webhooks/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      issue_id: "obs-crash-prod",
      message: "Uncaught TypeError: networkError is undefined",
      stack: "TypeError: networkError is undefined\n    at handleRequest (file:///src/control-plane/index.ts:18:12)",
      environment: "production"
    })
  });

  const issueRes = await controlPlane.fetch(issueReq, mockEnv);
  assert.equal(issueRes.status, 200);
  const issueJson = await issueRes.json() as any;
  assert.equal(issueJson.triageStatus, "triaged");
  assert.equal(issueJson.status, "Proposed");
  assert.equal(issueJson.taskId, "task-issue-obs-crash-prod");
  assert.ok(issueJson.proposalId);
  assert.equal(issueJson.inboxUrl, "/ui#inbox");
});

test("Control plane routes /api/snapshots for rapid container boot management", async () => {
  const mockEnv: any = {};
  const listRes = await controlPlane.fetch(new Request("https://berth.test/api/snapshots"), mockEnv);
  assert.equal(listRes.status, 200);
  const listJson = await listRes.json() as any;
  assert.ok(listJson.snapshots.length >= 1);

  const restoreReq = new Request("https://berth.test/api/snapshots/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "berth-base-v1", attemptId: "att-restore" })
  });

  const restoreRes = await controlPlane.fetch(restoreReq, mockEnv);
  assert.equal(restoreRes.status, 200);
  const restoreJson = await restoreRes.json() as any;
  assert.equal(restoreJson.ready, true);
  assert.ok(restoreJson.bootDurationMs <= 2000);
});


