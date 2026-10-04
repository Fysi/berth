import test from 'node:test';
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

test("TaskCoordinator initializes database and creates a task in 'Intent' state", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-100',
    title: 'Build Auth Service',
    intent: 'Implement OAuth and JWT session tokens',
    ownerEmail: 'architect@example.com',
    budgetUsd: 5.00
  });

  const task = await coordinator.getTask('task-100');
  assert.ok(task);
  assert.equal(task.task_id, 'task-100');
  assert.equal(task.status, 'Intent');
  assert.equal(task.budget_usd, 5.00);
  assert.equal(task.spent_usd, 0.00);
});

test("Claiming an attempt transitions task to 'Exploring' and assigns isolated fork", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-200',
    title: 'Test Claims',
    intent: 'Test',
    ownerEmail: 'dev@example.com'
  });

  const attempt1 = await coordinator.claimAttempt('task-200', 'agent-alpha');
  assert.equal(attempt1.attemptId, 'att-1');
  assert.equal(attempt1.forkRepoName, 'berth-task-200-att-1');
  assert.equal(attempt1.taskStatus, 'Exploring');

  const task = await coordinator.getTask('task-200');
  assert.equal(task?.status, 'Exploring');

  // Claiming a second attempt on same task produces att-2
  const attempt2 = await coordinator.claimAttempt('task-200', 'agent-beta');
  assert.equal(attempt2.attemptId, 'att-2');
  assert.equal(attempt2.forkRepoName, 'berth-task-200-att-2');
});

test("Enforces strict mutual exclusion on path leases across parallel attempts", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-300',
    title: 'Lease Test',
    intent: 'Test Leases',
    ownerEmail: 'dev@example.com'
  });

  await coordinator.claimAttempt('task-300', 'agent-1'); // att-1
  await coordinator.claimAttempt('task-300', 'agent-2'); // att-2

  // att-1 leases src/auth/*
  const lease1 = await coordinator.requestLease('att-1', ['src/auth/*']);
  assert.equal(lease1.granted, true);

  // att-2 attempts to lease overlapping path src/auth/login.ts -> MUST BE DENIED
  const lease2 = await coordinator.requestLease('att-2', ['src/auth/login.ts']);
  assert.equal(lease2.granted, false);
  assert.ok(lease2.reason?.includes('conflicts with active lease'));
  assert.equal(lease2.conflictingAttemptId, 'att-1');

  // att-2 requests non-overlapping path src/payments/* -> GRANTED
  const lease3 = await coordinator.requestLease('att-2', ['src/payments/*']);
  assert.equal(lease3.granted, true);
});

test("Proposing change transitions task to 'Proposed'", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-400',
    title: 'Proposal Test',
    intent: 'Test Proposals',
    ownerEmail: 'dev@example.com'
  });

  await coordinator.claimAttempt('task-400', 'agent-1');

  const prop = await coordinator.propose('att-1', 'commit-sha-456', ['ev-1', 'ev-2'], 'Implemented feature');
  assert.equal(prop.status, 'Proposed');

  const task = await coordinator.getTask('task-400');
  assert.equal(task?.status, 'Proposed');
});

test("Vouching records human attribution and transitions to 'Vouched'", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-500',
    title: 'Vouch Test',
    intent: 'Test Vouch',
    ownerEmail: 'dev@example.com'
  });

  await coordinator.claimAttempt('task-500', 'agent-1');
  await coordinator.propose('att-1', 'sha-999', ['ev-test']);

  const vouch = await coordinator.recordVouch('task-500', 'richard1.ashton@gmail.com', 'Richard Ashton');
  assert.equal(vouch.status, 'Vouched');

  const task = await coordinator.getTask('task-500');
  assert.equal(task?.status, 'Vouched');
});

test("Escalating transitions task to 'Escalated'", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-600',
    title: 'Escalate Test',
    intent: 'Test Escalate',
    ownerEmail: 'dev@example.com'
  });

  await coordinator.claimAttempt('task-600', 'agent-1');
  const esc = await coordinator.escalate('att-1', 'Which OAuth provider should we support first?', ['GitHub', 'Google']);
  assert.equal(esc.status, 'Escalated');

  const task = await coordinator.getTask('task-600');
  assert.equal(task?.status, 'Escalated');
});

test("Budget enforcement tracks spend and terminates attempts exceeding budget limit", async () => {
  const coordinator = createMockCoordinator();
  await coordinator.createTask({
    taskId: 'task-700',
    title: 'Budget Test',
    intent: 'Test Budget',
    ownerEmail: 'dev@example.com',
    budgetUsd: 3.00
  });

  await coordinator.claimAttempt('task-700', 'agent-1');
  await coordinator.requestLease('att-1', ['src/worker.ts']);

  // Report cost within budget: $1.50 spent / $3.00 budget
  const cost1 = await coordinator.reportCost('att-1', 1.50, 500, 200);
  assert.equal(cost1.terminated, false);
  assert.equal(cost1.remainingBudgetUsd, 1.50);

  // Report cost exceeding budget: +$2.00 ($3.50 total > $3.00) -> TERMINATED
  const cost2 = await coordinator.reportCost('att-1', 2.00, 1000, 400);
  assert.equal(cost2.terminated, true);
  assert.equal(cost2.remainingBudgetUsd, 0);
  assert.ok(cost2.reason?.includes('budget exceeded'));

  // Context pack reflects decision log and terminated budget
  const contextPack = await coordinator.getContextPack('att-1');
  assert.equal(contextPack.remainingBudgetUsd, 0);
  assert.ok(contextPack.recentDecisions.some((d: any) => d.decision === 'AttemptTerminatedOverBudget'));
  // Leases were released upon termination
  assert.equal(contextPack.activeLeases.length, 0);
});
