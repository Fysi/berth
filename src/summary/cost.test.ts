import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { 
  formatAigMetadataHeader, 
  calculateInferenceCost, 
  aggregateTaskCost 
} from "./cost.ts";

describe("AI Gateway Cost Attribution & Budget Gauges", () => {
  it("formats cf-aig-metadata header with taskId and attemptId attribution", () => {
    const header = formatAigMetadataHeader({
      taskId: "task-cost-1",
      attemptId: "att-1",
      model: "cloudflare/auto"
    });

    assert.ok(header["cf-aig-metadata"]);
    const parsed = JSON.parse(header["cf-aig-metadata"]);
    assert.equal(parsed.taskId, "task-cost-1");
    assert.equal(parsed.attemptId, "att-1");
    assert.equal(parsed.model, "cloudflare/auto");
  });

  it("calculates model inference pricing correctly", () => {
    const cost = calculateInferenceCost(1000, 500, "cloudflare/auto");
    // (1000 / 1000) * 0.0015 + (500 / 1000) * 0.002 = 0.0015 + 0.0010 = 0.0025
    assert.equal(cost, 0.0025);
  });

  it("aggregates cumulative cost across active and discarded attempts", () => {
    const attempts = [
      { attemptId: "att-1", agentId: "agent-1", status: "proposed", spentUsd: 0.45, tokensIn: 12000, tokensOut: 2000 },
      { attemptId: "att-2", agentId: "agent-2", status: "Halted", spentUsd: 0.30, tokensIn: 8000, tokensOut: 1000 },
      { attemptId: "att-3", agentId: "agent-3", status: "Aborted", spentUsd: 0.15, tokensIn: 4000, tokensOut: 500 }
    ];

    const summary = aggregateTaskCost("task-multi-att", attempts);
    assert.equal(summary.taskId, "task-multi-att");
    assert.equal(summary.attemptsCount, 3);
    assert.equal(summary.totalCostUsd, 0.90);
    assert.equal(summary.activeAttemptsCost, 0.45);
    assert.equal(summary.discardedAttemptsCost, 0.45);
    assert.equal(summary.totalTokens, 27500);
    assert.equal(summary.costPerAttemptAvg, 0.30);
  });
});
