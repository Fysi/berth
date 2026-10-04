import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpRequest, BERTH_MCP_TOOLS } from './index.ts';

function createMockMcpEnv() {
  const mockCoordinator = {
    claimAttempt: async (taskId: string, agentName: string) => ({
      attemptId: 'att-1',
      forkRepoName: `berth-${taskId}-att-1`,
      forkRemote: `https://artifacts.cloudflare.net/git/default/berth-${taskId}-att-1.git`
    }),
    getContextPack: async (attemptId: string) => ({
      attemptId,
      taskStatus: 'Exploring',
      remainingBudgetUsd: 10.0
    }),
    requestLease: async (attemptId: string, paths: string[]) => ({
      granted: true,
      grantedPaths: paths
    }),
    propose: async (attemptId: string, commitSha: string, evidenceIds: string[]) => ({
      status: 'Proposed',
      proposalId: 'prop-1'
    }),
    escalate: async (attemptId: string, question: string) => ({
      status: 'Escalated',
      escalationId: 'esc-1'
    }),
    reportCost: async (attemptId: string, costUsd: number) => ({
      terminated: false,
      remainingBudgetUsd: 8.50
    }),
    reportFriction: async (attemptId: string, obstacle: string) => ({
      recorded: true
    })
  };

  return {
    TASK_COORDINATOR: {
      idFromName: (name: string) => name,
      get: () => mockCoordinator
    }
  };
}

test("GET /mcp returns tool catalog with 7 mandatory tools", async () => {
  const req = new Request("http://localhost/mcp", { method: "GET" });
  const res = await handleMcpRequest(req, createMockMcpEnv());
  assert.equal(res.status, 200);

  const data = await res.json() as any;
  assert.equal(data.tools_count, 7);
  assert.equal(data.tools.length, 7);
});

test("POST /mcp with initialize handshake returns MCP protocol capabilities", async () => {
  const req = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { clientInfo: { name: "antigravity", version: "1.2.16" } }
    })
  });

  const res = await handleMcpRequest(req, createMockMcpEnv());
  const data = await res.json() as any;
  assert.equal(data.jsonrpc, "2.0");
  assert.equal(data.id, 1);
  assert.equal(data.result.serverInfo.name, "berth-mcp-server");
});

test("POST /mcp with tools/list returns BERTH_MCP_TOOLS", async () => {
  const req = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list"
    })
  });

  const res = await handleMcpRequest(req, createMockMcpEnv());
  const data = await res.json() as any;
  assert.equal(data.result.tools.length, 7);
});

test("POST /mcp with tools/call routes to TaskCoordinator", async () => {
  const env = createMockMcpEnv();

  // Test claim_task
  const claimReq = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "claim_task",
        arguments: { task_id: "task-001", agent_name: "test-bot" }
      }
    })
  });
  const claimRes = await handleMcpRequest(claimReq, env);
  const claimData = await claimRes.json() as any;
  assert.equal(claimData.id, 3);
  const parsedClaim = JSON.parse(claimData.result.content[0].text);
  assert.equal(parsedClaim.attemptId, "att-1");

  // Test request_lease
  const leaseReq = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "request_lease",
        arguments: { attempt_id: "att-1", paths: ["src/auth/*"] }
      }
    })
  });
  const leaseRes = await handleMcpRequest(leaseReq, env);
  const leaseData = await leaseRes.json() as any;
  const parsedLease = JSON.parse(leaseData.result.content[0].text);
  assert.equal(parsedLease.granted, true);

  // Test propose
  const propReq = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "propose",
        arguments: { attempt_id: "att-1", commit_sha: "sha-123", evidence_ids: ["ev-1"] }
      }
    })
  });
  const propRes = await handleMcpRequest(propReq, env);
  const propData = await propRes.json() as any;
  const parsedProp = JSON.parse(propData.result.content[0].text);
  assert.equal(parsedProp.status, "Proposed");
});
