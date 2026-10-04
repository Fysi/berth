import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { MergeQueue } from './MergeQueue.ts';
import type { GitPlumber, MergeCheckResult, LinearizeResult, PreflightTestResult, CasPushResult, RestackResult } from './MergeQueue.ts';

function createMockQueue(customPlumber?: GitPlumber): MergeQueue {
  const db = new DatabaseSync(':memory:');
  const mockCtx = {
    storage: {
      sql: {
        exec(sqlStr: string, ...params: any[]) {
          if (params.length === 0 && (sqlStr.includes('CREATE TABLE') || sqlStr.includes(';\n'))) {
            db.exec(sqlStr);
            return [];
          }
          const stmt = db.prepare(sqlStr);
          if (sqlStr.trim().toUpperCase().startsWith('SELECT')) {
            return stmt.all(...params);
          } else {
            stmt.run(...params);
            return [];
          }
        }
      }
    }
  } as any;

  const mockEnv = {
    ARTIFACTS: {},
    TASK_COORDINATOR: {}
  };

  return new MergeQueue(mockCtx, mockEnv, customPlumber);
}

class TestPlumber implements GitPlumber {
  public trunkHead = "trunk-sha-001";
  public mergeClean = true;
  public conflicts: string[] = [];
  public testsPass = true;
  public casFailTimes = 0;
  private casAttempts = 0;
  public restackedAttempts: string[] = [];

  async getTrunkHead(): Promise<string> {
    return this.trunkHead;
  }

  async mergeTreeCheck(_baseSha: string, _attemptSha: string): Promise<MergeCheckResult> {
    return {
      clean: this.mergeClean,
      treeSha: this.mergeClean ? "tree-clean-999" : undefined,
      conflicts: this.conflicts
    };
  }

  async linearizeReplay(baseSha: string, attemptSha: string, options: { vouchedBy: string }): Promise<LinearizeResult> {
    return {
      success: true,
      linearizedSha: `lin-${attemptSha}-onto-${baseSha}`,
      droppedMergeCommitsCount: 1,
      commitMessage: `feat: linearized\n\nVouched-by: ${options.vouchedBy}`
    };
  }

  async runPreflightTests(_commitSha: string): Promise<PreflightTestResult> {
    return {
      passed: this.testsPass,
      output: this.testsPass ? "All 18 tests passed" : "Test failed: assertion error in auth",
      durationMs: 120
    };
  }

  async casPushTrunk(expectedTrunkSha: string, newLinearizedSha: string): Promise<CasPushResult> {
    this.casAttempts++;
    if (this.casAttempts <= this.casFailTimes) {
      this.trunkHead = `trunk-sha-concurrent-${this.casAttempts}`;
      return { success: false, reason: "Trunk moved concurrently" };
    }
    this.trunkHead = newLinearizedSha;
    return { success: true };
  }

  async restackAttempt(newTrunkSha: string, oldTrunkSha: string, attemptSha: string, attemptId: string): Promise<RestackResult> {
    this.restackedAttempts.push(attemptId);
    return {
      success: true,
      attemptId,
      originalSha: attemptSha,
      restackedSha: `restacked-${attemptSha}-onto-${newTrunkSha}`
    };
  }
}

test("MergeQueue initializes tables and enqueues change with FIFO ordering", async () => {
  const queue = createMockQueue();
  
  const entry1 = await queue.enqueueChange({
    taskId: "task-01",
    attemptId: "att-1",
    changeId: "change-01",
    commitSha: "sha-111",
    vouchedBy: "Alice <alice@example.com>",
    autoProcess: false
  });

  const entry2 = await queue.enqueueChange({
    taskId: "task-02",
    attemptId: "att-2",
    changeId: "change-02",
    commitSha: "sha-222",
    vouchedBy: "Bob <bob@example.com>",
    autoProcess: false
  });

  assert.equal(entry1.status, "Queued");
  assert.equal(entry1.position, 1);
  assert.equal(entry2.position, 2);

  const list = await queue.listQueue();
  assert.equal(list.length, 2);
  assert.equal(list[0].task_id, "task-01");
  assert.equal(list[1].task_id, "task-02");
});

test("Successful landing pipeline runs preflight, linearize, tests, and CAS push", async () => {
  const plumber = new TestPlumber();
  const queue = createMockQueue(plumber);

  const { entryId } = await queue.enqueueChange({
    taskId: "task-10",
    attemptId: "att-1",
    changeId: "change-10",
    commitSha: "sha-aaa",
    vouchedBy: "Richard Ashton <richard1.ashton@gmail.com>",
    autoProcess: false
  });

  await queue.processQueue();

  const entry = await queue.getQueueEntry(entryId);
  assert.ok(entry);
  assert.equal(entry.status, "Landed");
  assert.ok(entry.landed_at && entry.landed_at > 0);
  assert.ok(entry.transit_ms !== undefined && entry.transit_ms >= 0);
  assert.equal(entry.linearized_sha, "lin-sha-aaa-onto-trunk-sha-001");
  assert.equal(entry.retry_count, 0);

  const history = await queue.listLandingLog();
  assert.equal(history.length, 1);
  assert.equal(history[0].task_id, "task-10");
  assert.equal(history[0].linearized_sha, "lin-sha-aaa-onto-trunk-sha-001");
  assert.equal(history[0].status, "Landed");
});

test("Detects merge conflict in preflight check and rejects change without landing", async () => {
  const plumber = new TestPlumber();
  plumber.mergeClean = false;
  plumber.conflicts = ["src/auth.ts", "package.json"];
  const queue = createMockQueue(plumber);

  const { entryId } = await queue.enqueueChange({
    taskId: "task-20",
    attemptId: "att-1",
    changeId: "change-20",
    commitSha: "sha-conflict",
    vouchedBy: "Charlie <charlie@example.com>",
    autoProcess: false
  });

  await queue.processQueue();

  const entry = await queue.getQueueEntry(entryId);
  assert.ok(entry);
  assert.equal(entry.status, "Conflicted");
  assert.ok(entry.error_message?.includes("Merge conflict detected"));
  assert.ok(entry.error_message?.includes("src/auth.ts"));

  // Landing log should be empty
  const history = await queue.listLandingLog();
  assert.equal(history.length, 0);
});

test("Preflight test failure aborts landing before CAS push", async () => {
  const plumber = new TestPlumber();
  plumber.testsPass = false;
  const queue = createMockQueue(plumber);

  const { entryId } = await queue.enqueueChange({
    taskId: "task-30",
    attemptId: "att-1",
    changeId: "change-30",
    commitSha: "sha-broken-test",
    vouchedBy: "Dev <dev@example.com>",
    autoProcess: false
  });

  await queue.processQueue();

  const entry = await queue.getQueueEntry(entryId);
  assert.ok(entry);
  assert.equal(entry.status, "Failed");
  assert.ok(entry.error_message?.includes("Preflight verification tests failed"));

  const history = await queue.listLandingLog();
  assert.equal(history.length, 0);
});

test("CAS contention triggers retry loop and lands after re-linearizing onto new trunk", async () => {
  const plumber = new TestPlumber();
  plumber.casFailTimes = 1; // Fails once then succeeds
  const queue = createMockQueue(plumber);

  const { entryId } = await queue.enqueueChange({
    taskId: "task-40",
    attemptId: "att-1",
    changeId: "change-40",
    commitSha: "sha-retry",
    vouchedBy: "Lead <lead@example.com>",
    autoProcess: false
  });

  await queue.processQueue();

  const entry = await queue.getQueueEntry(entryId);
  assert.ok(entry);
  assert.equal(entry.status, "Landed");
  assert.equal(entry.retry_count, 1);
  // Linearized onto the new trunk SHA discovered after CAS failure
  assert.equal(entry.linearized_sha, "lin-sha-retry-onto-trunk-sha-concurrent-1");

  const history = await queue.listLandingLog();
  assert.equal(history.length, 1);
});

test("Landing change automatically restacks sibling open attempts", async () => {
  const plumber = new TestPlumber();
  const queue = createMockQueue(plumber);

  // Enqueue winning attempt
  await queue.enqueueChange({
    taskId: "task-50",
    attemptId: "att-winner",
    changeId: "change-50-winner",
    commitSha: "sha-win",
    vouchedBy: "Voucher <voucher@example.com>",
    autoProcess: false
  });

  // Enqueue sibling competing attempt on task-51
  await queue.enqueueChange({
    taskId: "task-51",
    attemptId: "att-sibling",
    changeId: "change-51-sibling",
    commitSha: "sha-sibling",
    vouchedBy: "Voucher <voucher@example.com>",
    autoProcess: false
  });

  // Process only first entry
  const firstEntry = (await queue.listQueue())[0];
  const landResult = await queue.landEntry(firstEntry);
  assert.equal(landResult.success, true);

  // Verify that att-sibling was restacked
  assert.ok(plumber.restackedAttempts.includes("att-sibling"));

  // Check that sibling's commit_sha in queue was updated to the restacked SHA
  const sibling = (await queue.listQueue())[1];
  assert.ok(sibling.commit_sha.startsWith("restacked-sha-sibling"));
});
