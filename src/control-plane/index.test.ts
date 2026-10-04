import test from "node:test";
import assert from "node:assert/strict";
import { BERTH_MCP_TOOLS } from "../mcp/index.ts";

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
