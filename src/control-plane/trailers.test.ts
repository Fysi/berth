import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateCommitMessage, 
  containsConflictMarkers, 
  generateChangeId, 
  decorateCommitMessage 
} from './trailers.ts';

test("validateCommitMessage detects missing trailers", () => {
  const invalidMsg = "feat: some commit\n\nTask: 123";
  const result = validateCommitMessage(invalidMsg);
  assert.equal(result.valid, false);
  assert.ok(result.missingTrailers.includes('Attempt:'));
  assert.ok(result.missingTrailers.includes('Session:'));
  assert.ok(result.missingTrailers.includes('Change-Id:'));

  const validMsg = "feat: some commit\n\nTask: 123\nAttempt: 1\nSession: abc\nChange-Id: Ideafbeef";
  const validResult = validateCommitMessage(validMsg);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.missingTrailers.length, 0);
});

test("containsConflictMarkers correctly detects conflict markers", () => {
  const cleanCode = "const a = 1;\nconst b = 2;\n";
  assert.equal(containsConflictMarkers(cleanCode), false);

  const conflictedCode = "const a = 1;\n<<<<<<< HEAD\nconst b = 2;\n=======\nconst b = 3;\n>>>>>>> feature\n";
  assert.equal(containsConflictMarkers(conflictedCode), true);
});

test("generateChangeId produces Gerrit-compliant I-prefixed 41-char hash", () => {
  const changeId = generateChangeId("test commit seed");
  assert.match(changeId, /^I[0-9a-f]{40}$/);
});

test("decorateCommitMessage appends missing trailers", () => {
  const base = "feat: new feature";
  const decorated = decorateCommitMessage(base, {
    taskId: "task-99",
    attemptId: "att-2",
    sessionId: "sess-42"
  });

  assert.ok(decorated.includes("Task: task-99"));
  assert.ok(decorated.includes("Attempt: att-2"));
  assert.ok(decorated.includes("Session: sess-42"));
  assert.match(decorated, /Change-Id: I[0-9a-f]{40}/);

  const reDecorated = decorateCommitMessage(decorated, {
    taskId: "task-99",
    attemptId: "att-2",
    sessionId: "sess-42"
  });
  assert.equal(reDecorated, decorated);
});
