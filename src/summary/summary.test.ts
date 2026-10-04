import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateHumanSummary, countWords } from "./validator.ts";
import { generateHumanSummary } from "./generator.ts";

describe("Human Summary Validator (Manifesto Specification)", () => {
  it("accepts a perfectly valid 5-line summary under 80 words", () => {
    const validSummary = 
`Why:           Reviewers lack real-time visibility into parallel attempt collisions and risk hunks.
What changes:  Calculates commit conflict matrices, formats 5-line summaries, and powers keyboard-first review views.
Look at:       src/durable-objects/TaskCoordinator.ts: updateConflictMatrix() and src/ui/dashboard.ts
Verified:      Unit test suite (30 passed)   Not verified: Live WebSocket browser reconnect under network partition
Cost:          $0.45 across 2 attempts`;

    const result = validateHumanSummary(validSummary);
    assert.equal(result.valid, true, `Expected valid, got errors: ${result.errors.join(", ")}`);
    assert.ok(result.wordCount <= 80, `Word count ${result.wordCount} > 80`);
    assert.equal(result.lines.why, "Reviewers lack real-time visibility into parallel attempt collisions and risk hunks.");
    assert.equal(result.lines.notVerified, "Live WebSocket browser reconnect under network partition");
  });

  it("rejects summaries exceeding 80 words budget", () => {
    const wordyWhy = new Array(85).fill("word").join(" ");
    const summary = 
`Why:           ${wordyWhy}
What changes:  Small change.
Look at:       file.ts
Verified:      Tests   Not verified: Edge cases
Cost:          $1.00 across 1 attempt`;

    const result = validateHumanSummary(summary);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes("exceeds maximum allowed budget of 80 words")));
  });

  it("rejects summaries where 'Not verified:' is empty or 'None'", () => {
    const noVerify = 
`Why:           Fix crash in login.
What changes:  Ensures tokens are refreshed safely before expiration.
Look at:       auth.ts
Verified:      Unit tests   Not verified: None
Cost:          $0.20 across 1 attempt`;

    const result = validateHumanSummary(noVerify);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes("cannot be 'None' or 'N/A'")));
  });

  it("rejects summaries where 'What changes:' is solely a list of modified files", () => {
    const fileListSummary = 
`Why:           Fix crash in login.
What changes:  src/auth.ts, src/token.ts, config.json
Look at:       src/auth.ts
Verified:      Unit tests   Not verified: Production edge cases
Cost:          $0.20 across 1 attempt`;

    const result = validateHumanSummary(fileListSummary);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes("must explain behavioral differences")));
  });

  it("rejects summaries missing required lines", () => {
    const incomplete = `Why: Just a reason\nCost: $1 across 1 attempt`;
    const result = validateHumanSummary(incomplete);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length >= 3);
  });
});

describe("Human Summary Generator", () => {
  it("generates deterministic manifesto-compliant summary under 80 words", async () => {
    const result = await generateHumanSummary({
      intent: "Reviewers need immediate push conflict feedback across attempts",
      behaviorChange: "Computes commit collision matrices, generates strict summaries, and streams updates",
      criticalHunks: ["src/durable-objects/TaskCoordinator.ts", "src/mirror/index.ts"],
      evidence: ["All 28 unit tests pass"],
      notVerified: "High-concurrency stress test with 50 simultaneous attempts",
      costUsd: 0.85,
      attemptsCount: 2
    });

    assert.equal(result.validation.valid, true, `Generated summary errors: ${result.validation.errors.join(", ")}`);
    assert.ok(result.validation.wordCount <= 80);
    assert.ok(result.summary.includes("Why:"));
    assert.ok(result.summary.includes("Not verified: High-concurrency stress test with 50 simultaneous attempts"));
    assert.ok(result.summary.includes("$0.85 across 2 attempts"));
  });
});
