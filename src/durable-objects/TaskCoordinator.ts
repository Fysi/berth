import { DurableObject } from "cloudflare:workers";

export interface Env {
  ARTIFACTS: any;
  AI_GATEWAY_TOKEN?: string;
}

export class TaskCoordinator extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initDatabase();
  }

  private initDatabase(): void {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        intent TEXT NOT NULL,
        status TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        budget_usd REAL NOT NULL DEFAULT 5.00,
        spent_usd REAL NOT NULL DEFAULT 0.00,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempts (
        attempt_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        fork_repo_name TEXT NOT NULL,
        fork_remote_url TEXT NOT NULL,
        container_instance_id TEXT,
        status TEXT NOT NULL,
        stop_reason TEXT,
        head_sha TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leases (
        lease_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_id TEXT NOT NULL,
        path_pattern TEXT NOT NULL,
        granted_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decision_logs (
        log_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  async getTask(taskId: string): Promise<any> {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT * FROM tasks WHERE task_id = ?",
      taskId
    );
    const rows = [...cursor];
    return rows[0] ?? null;
  }

  async createTask(task: {
    taskId: string;
    title: string;
    intent: string;
    ownerEmail: string;
    budgetUsd?: number;
  }): Promise<void> {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO tasks (task_id, title, intent, status, owner_email, budget_usd, spent_usd, created_at, updated_at)
       VALUES (?, ?, ?, 'Intent', ?, ?, 0.00, ?, ?)`,
      task.taskId,
      task.title,
      task.intent,
      task.ownerEmail,
      task.budgetUsd ?? 5.00,
      now,
      now
    );
  }

  async claimAttempt(taskId: string, agentName: string): Promise<any> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const attemptCountCursor = this.ctx.storage.sql.exec(
      "SELECT COUNT(*) as count FROM attempts WHERE task_id = ?",
      taskId
    );
    const count = [...attemptCountCursor][0]?.count ?? 0;
    const attemptId = `att-${Number(count) + 1}`;
    const forkRepoName = `berth-${taskId}-${attemptId}`;

    // Fork the repository via Artifacts binding
    using mainRepo = await this.env.ARTIFACTS.get("berth");
    const forkResult = await mainRepo.fork(forkRepoName, {
      defaultBranchOnly: true,
      readOnly: false,
    });

    const now = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO attempts (attempt_id, task_id, agent_id, fork_repo_name, fork_remote_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
      attemptId,
      taskId,
      agentName,
      forkRepoName,
      forkResult.remote,
      now,
      now
    );

    // Update task status to Exploring
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Exploring', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    return {
      attemptId,
      forkRepoName,
      forkRemote: forkResult.remote,
      token: forkResult.token,
      budgetRemainingUsd: task.budget_usd - task.spent_usd,
    };
  }

  async requestLease(attemptId: string, paths: string[]): Promise<boolean> {
    const now = Date.now();
    const expiresAt = now + 1800 * 1000; // 30 minutes
    const taskCursor = this.ctx.storage.sql.exec(
      "SELECT task_id FROM attempts WHERE attempt_id = ?",
      attemptId
    );
    const taskRow = [...taskCursor][0];
    if (!taskRow) return false;

    for (const p of paths) {
      const leaseId = `${attemptId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      this.ctx.storage.sql.exec(
        `INSERT INTO leases (lease_id, task_id, attempt_id, path_pattern, granted_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        leaseId,
        taskRow.task_id,
        attemptId,
        p,
        now,
        expiresAt
      );
    }
    return true;
  }
}
