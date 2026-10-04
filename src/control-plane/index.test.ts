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
