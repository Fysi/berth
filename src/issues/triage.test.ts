import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseProductionIssue, processIssueWebhook } from "./triage.ts";

describe("Production Issues to Autonomous Task Loop", () => {
  it("parses Cloudflare Observability issue payload and extracts culprit stack location", () => {
    const rawPayload = {
      issue_id: "obs-err-9912",
      message: "TypeError: Cannot read properties of undefined (reading 'split')",
      stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at handleMcpRequest (file:///src/mcp/index.ts:42:15)\n    at fetch (file:///src/control-plane/index.ts:31:14)",
      environment: "production",
      timestamp: 1791138000000
    };

    const parsed = parseProductionIssue(rawPayload);
    assert.equal(parsed.issueId, "obs-err-9912");
    assert.ok(parsed.title.includes("Cannot read properties of undefined"));
    assert.equal(parsed.culpritFile, "src/mcp/index.ts");
    assert.equal(parsed.culpritLine, 42);
    assert.equal(parsed.environment, "production");
  });

  it("triages production issue into TaskCoordinator, spawns parallel attempts, and surfaces proposed fix", async () => {
    let createdTask: any = null;
    const claimedAttempts: string[] = [];
    let proposedFix: any = null;

    const mockCoordinatorNamespace: any = {
      idFromName: (name: string) => `id-${name}`,
      get: (_id: any) => ({
        async createTask(task: any) {
          createdTask = task;
          return { status: "created", taskId: task.taskId };
        },
        async claimAttempt(taskId: string, agentName: string) {
          claimedAttempts.push(agentName);
          return { attemptId: `att-${agentName}`, taskId, forkRepoName: `berth-${taskId}-${agentName}` };
        },
        async requestLease(_attemptId: string, _paths: string[], _duration: number) {
          return { granted: true };
        },
        async propose(attemptId: string, commitSha: string, evidenceIds: string[], summary: string) {
          proposedFix = { attemptId, commitSha, evidenceIds, summary };
          return { status: "Proposed", proposalId: `prop-${attemptId}` };
        }
      })
    };

    const parsedIssue = parseProductionIssue({
      issue_id: "crash-404-auth",
      message: "ReferenceError: userToken is not defined",
      file: "src/auth/token.ts",
      line: 18
    });

    const result = await processIssueWebhook(parsedIssue, mockCoordinatorNamespace);

    assert.equal(result.status, "Proposed");
    assert.equal(result.taskId, "task-issue-crash-404-auth");
    assert.ok(result.proposalId.startsWith("prop-"));
    assert.ok(result.summary.includes("Why:"));
    assert.ok(result.summary.includes("What changes:"));

    assert.equal(createdTask.taskId, "task-issue-crash-404-auth");
    assert.equal(claimedAttempts.length, 2);
    assert.ok(claimedAttempts.includes("agent-reproducer"));
    assert.ok(claimedAttempts.includes("agent-fixer"));
    assert.ok(proposedFix);
  });
});
