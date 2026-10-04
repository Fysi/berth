import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { TaskCoordinator } from './TaskCoordinator.ts';

function createMockCoordinator(): TaskCoordinator {
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
    ARTIFACTS: {
      async get(name: string) {
        return {
          async fork(forkName: string) {
            return {
              remote: `https://artifacts.cloudflare.net/git/default/${forkName}.git`,
              token: `mock-token-${forkName}`,
              defaultBranch: 'main'
            };
          },
          async info() {
            return { defaultBranch: 'main', defaultBranchSha: 'abc1234' };
          },
          [Symbol.dispose]() {}
        };
      }
    }
  };

  return new TaskCoordinator(mockCtx, mockEnv);
}

describe("Conflict Matrix Engine & Real-Time Push Ingestion", () => {
  it("computes clean conflict matrix when active attempts touch non-overlapping paths", async () => {
    const coordinator = createMockCoordinator();

    await coordinator.createTask({
      taskId: "task-matrix-clean",
      title: "Parallel Feature",
      intent: "Test clean parallel attempts",
      ownerEmail: "reviewer@example.com"
    });

    await coordinator.claimAttempt("task-matrix-clean", "agent-1");
    await coordinator.claimAttempt("task-matrix-clean", "agent-2");

    // Attempt 1 leases src/auth/*
    await coordinator.requestLease("att-1", ["src/auth/*"], 1800);
    // Attempt 2 leases src/billing/*
    await coordinator.requestLease("att-2", ["src/billing/*"], 1800);

    const matrix = await coordinator.calculateConflictMatrix("task-matrix-clean");
    assert.ok(matrix.length >= 2, "Expected matrix pairs");

    const pair = matrix.find(m => m.attemptA === "att-1" && m.attemptB === "att-2");
    assert.ok(pair, "Expected pair att-1 vs att-2");
    assert.equal(pair.status, "clean");
    assert.equal(pair.conflictingFiles.length, 0);
  });

  it("detects conflict when attempts modify overlapping paths", async () => {
    const coordinator = createMockCoordinator();

    await coordinator.createTask({
      taskId: "task-matrix-conflict",
      title: "Contended Feature",
      intent: "Test conflict detection",
      ownerEmail: "reviewer@example.com"
    });

    await coordinator.claimAttempt("task-matrix-conflict", "agent-1");
    await coordinator.claimAttempt("task-matrix-conflict", "agent-2");

    // Attempt 1 leases src/durable-objects/*
    await coordinator.requestLease("att-1", ["src/durable-objects/*"], 1800);

    // Attempt 2 pushes changes touching src/durable-objects/TaskCoordinator.ts
    const pushResult = await coordinator.handlePushEvent({
      attemptId: "att-2",
      ref: "refs/heads/main",
      before: "00000000",
      after: "commit-sha-222",
      modifiedFiles: ["src/durable-objects/TaskCoordinator.ts"]
    });

    assert.equal(pushResult.status, "processed");
    const pair = pushResult.matrix.find((m: any) => m.attemptA === "att-1" && m.attemptB === "att-2");
    assert.ok(pair, "Expected pair att-1 vs att-2");
    assert.equal(pair.status, "conflicts");
    assert.ok(pair.conflictingFiles.length > 0);
  });

  it("provides comprehensive Task View and Change View with zero raw git clutter", async () => {
    const coordinator = createMockCoordinator();

    await coordinator.createTask({
      taskId: "task-view-test",
      title: "UI View Test",
      intent: "Verify aggregated view representations",
      ownerEmail: "reviewer@example.com",
      budgetUsd: 15.00
    });

    await coordinator.claimAttempt("task-view-test", "agent-ui");
    await coordinator.requestLease("att-1", ["src/ui/*"], 1800);

    const taskView = await coordinator.getTaskView("task-view-test");
    assert.equal(taskView.task.task_id, "task-view-test");
    assert.equal(taskView.attempts.length, 1);
    assert.equal(taskView.leases.length, 1);
    assert.ok(taskView.leases[0].expiresInSeconds > 0);
    assert.ok(Array.isArray(taskView.conflictMatrix));

    const changeView = await coordinator.getChangeView("task-view-test");
    assert.equal(changeView.taskId, "task-view-test");
    assert.equal(changeView.trunkStatus, "clean");
  });
});
