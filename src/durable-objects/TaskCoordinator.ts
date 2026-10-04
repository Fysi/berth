let BaseDurableObject: any;
try {
  // @ts-ignore
  const cf = await import("cloudflare:workers");
  BaseDurableObject = cf.DurableObject;
} catch {
  BaseDurableObject = class {
    ctx: any;
    env: any;
    constructor(ctx: any, env: any) {
      this.ctx = ctx;
      this.env = env;
    }
  };
}

export interface Env {
  ARTIFACTS: any;
  AI_GATEWAY_TOKEN?: string;
}

export type TaskStatus = 
  | 'Intent' 
  | 'Exploring' 
  | 'Proposed' 
  | 'Vouched' 
  | 'Landing' 
  | 'Landed' 
  | 'Escalated';

export interface TaskRecord {
  task_id: string;
  title: string;
  intent: string;
  status: TaskStatus;
  owner_email: string;
  budget_usd: number;
  spent_usd: number;
  created_at: number;
  updated_at: number;
}

export interface AttemptRecord {
  attempt_id: string;
  task_id: string;
  agent_id: string;
  fork_repo_name: string;
  fork_remote_url: string;
  container_instance_id?: string;
  status: string;
  spent_usd: number;
  tokens_in: number;
  tokens_out: number;
  stop_reason?: string;
  commit_sha?: string;
  created_at: number;
  updated_at: number;
}

export interface LeaseRecord {
  lease_id: string;
  task_id: string;
  attempt_id: string;
  path_pattern: string;
  granted_at: number;
  expires_at: number;
}

export interface DecisionLogRecord {
  log_id: string;
  task_id: string;
  attempt_id?: string;
  decision: string;
  reason: string;
  created_at: number;
}

export class TaskCoordinator extends (BaseDurableObject as new (ctx: any, env: Env) => any) {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initDatabase();
  }

  initDatabase(): void {
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
        spent_usd REAL NOT NULL DEFAULT 0.00,
        tokens_in INTEGER NOT NULL DEFAULT 0,
        tokens_out INTEGER NOT NULL DEFAULT 0,
        stop_reason TEXT,
        commit_sha TEXT,
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

      CREATE TABLE IF NOT EXISTS proposals (
        proposal_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_id TEXT NOT NULL,
        commit_sha TEXT NOT NULL,
        evidence_ids TEXT NOT NULL,
        summary TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS escalations (
        escalation_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_id TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT,
        resolved INTEGER NOT NULL DEFAULT 0,
        resolution TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS friction_logs (
        friction_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_id TEXT NOT NULL,
        obstacle TEXT NOT NULL,
        command_or_tool TEXT,
        suggested_fix TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decision_logs (
        log_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_id TEXT,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Progressive schema migrations for existing DO SQLite instances
    const migrations = [
      "ALTER TABLE decision_logs ADD COLUMN attempt_id TEXT",
      "ALTER TABLE attempts ADD COLUMN spent_usd REAL DEFAULT 0.00",
      "ALTER TABLE attempts ADD COLUMN tokens_in INTEGER DEFAULT 0",
      "ALTER TABLE attempts ADD COLUMN tokens_out INTEGER DEFAULT 0",
      "ALTER TABLE attempts ADD COLUMN commit_sha TEXT"
    ];

    for (const migration of migrations) {
      try {
        sql.exec(migration);
      } catch {}
    }
  }

  // --- Task Queries & Mutations ---

  async getTask(taskId: string): Promise<TaskRecord | null> {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT * FROM tasks WHERE task_id = ?",
      taskId
    );
    const rows = [...cursor];
    return (rows[0] as TaskRecord) ?? null;
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

    this.logDecision(task.taskId, undefined, "TaskCreated", `Task registered with budget $${task.budgetUsd ?? 5.00}`);
  }

  // --- Attempt Lifecycle Management ---

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

    let forkRemote = `https://artifacts.cloudflare.net/git/default/${forkRepoName}.git`;
    let forkToken = `token-${attemptId}-${Date.now()}`;

    // Provision isolated Artifacts fork if binding is present
    if (this.env?.ARTIFACTS?.get) {
      try {
        using mainRepo = await this.env.ARTIFACTS.get("berth");
        const forkResult = await mainRepo.fork(forkRepoName, {
          defaultBranchOnly: true,
          readOnly: false,
        });
        forkRemote = forkResult.remote;
        forkToken = forkResult.token;
      } catch (err: any) {
        console.warn(`Artifacts fork creation note: ${err.message}`);
      }
    }

    const now = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO attempts (attempt_id, task_id, agent_id, fork_repo_name, fork_remote_url, status, spent_usd, tokens_in, tokens_out, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', 0.00, 0, 0, ?, ?)`,
      attemptId,
      taskId,
      agentName,
      forkRepoName,
      forkRemote,
      now,
      now
    );

    // Transition task status to Exploring
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Exploring', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    this.logDecision(taskId, attemptId, "AttemptClaimed", `Agent ${agentName} claimed attempt ${attemptId} in fork ${forkRepoName}`);

    return {
      taskId,
      attemptId,
      forkRepoName,
      forkRemote,
      token: forkToken,
      budgetRemainingUsd: Math.max(0, task.budget_usd - task.spent_usd),
      taskStatus: "Exploring"
    };
  }

  // --- Strict Lease Mutual Exclusion ---

  async requestLease(
    attemptId: string, 
    paths: string[], 
    durationSeconds = 1800
  ): Promise<{ granted: boolean; grantedPaths?: string[]; reason?: string; conflictingAttemptId?: string }> {
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;

    const taskCursor = this.ctx.storage.sql.exec(
      "SELECT task_id FROM attempts WHERE attempt_id = ?",
      attemptId
    );
    const taskRow = [...taskCursor][0];
    if (!taskRow) {
      return { granted: false, reason: `Attempt ${attemptId} not found` };
    }
    const taskId = (taskRow as any).task_id;

    // Check for conflicting active leases held by OTHER attempts
    const activeLeasesCursor = this.ctx.storage.sql.exec(
      "SELECT * FROM leases WHERE task_id = ? AND attempt_id != ? AND expires_at > ?",
      taskId,
      attemptId,
      now
    );
    const activeLeases = [...activeLeasesCursor] as LeaseRecord[];

    for (const requestedPath of paths) {
      for (const existingLease of activeLeases) {
        if (this.pathsOverlap(requestedPath, existingLease.path_pattern)) {
          const reason = `Path '${requestedPath}' conflicts with active lease on '${existingLease.path_pattern}' held by ${existingLease.attempt_id}`;
          this.logDecision(taskId, attemptId, "LeaseDenied", reason);
          return {
            granted: false,
            reason,
            conflictingAttemptId: existingLease.attempt_id
          };
        }
      }
    }

    // No conflict: grant all requested leases
    for (const p of paths) {
      const leaseId = `lease-${attemptId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      this.ctx.storage.sql.exec(
        `INSERT INTO leases (lease_id, task_id, attempt_id, path_pattern, granted_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        leaseId,
        taskId,
        attemptId,
        p,
        now,
        expiresAt
      );
    }

    this.logDecision(taskId, attemptId, "LeaseGranted", `Granted leases for: ${paths.join(', ')} for ${durationSeconds}s`);
    return { granted: true, grantedPaths: paths };
  }

  private pathsOverlap(pathA: string, pathB: string): boolean {
    const cleanA = pathA.replace(/[*]+$/, '').replace(/\/$/, '');
    const cleanB = pathB.replace(/[*]+$/, '').replace(/\/$/, '');
    return cleanA.startsWith(cleanB) || cleanB.startsWith(cleanA);
  }

  // --- Proposal & Vouch Lifecycle ---

  async propose(
    attemptId: string, 
    commitSha: string, 
    evidenceIds: string[], 
    summary?: string
  ): Promise<{ status: string; proposalId: string; taskId: string }> {
    const taskCursor = this.ctx.storage.sql.exec(
      "SELECT task_id, status FROM attempts WHERE attempt_id = ?",
      attemptId
    );
    const attempt = [...taskCursor][0] as any;
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    const taskId = attempt.task_id;
    const now = Date.now();
    const proposalId = `prop-${attemptId}-${now}`;

    this.ctx.storage.sql.exec(
      `INSERT INTO proposals (proposal_id, task_id, attempt_id, commit_sha, evidence_ids, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      proposalId,
      taskId,
      attemptId,
      commitSha,
      JSON.stringify(evidenceIds),
      summary || "",
      now
    );

    this.ctx.storage.sql.exec(
      "UPDATE attempts SET status = 'proposed', commit_sha = ?, updated_at = ? WHERE attempt_id = ?",
      commitSha,
      now,
      attemptId
    );

    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Proposed', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    this.logDecision(taskId, attemptId, "ChangeProposed", `Attempt ${attemptId} proposed commit ${commitSha} with ${evidenceIds.length} evidence attachments`);

    return { status: "Proposed", proposalId, taskId };
  }

  async recordVouch(
    taskId: string, 
    voucherEmail: string, 
    voucherName: string
  ): Promise<{ status: string }> {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Vouched', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    this.logDecision(taskId, undefined, "ChangeVouched", `Human ${voucherName} (${voucherEmail}) vouched for change`);
    return { status: "Vouched" };
  }

  async recordLanding(taskId: string): Promise<{ status: string }> {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Landing', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );
    this.logDecision(taskId, undefined, "LandingStarted", "Change queued in MergeQueue and landing sequence started");
    return { status: "Landing" };
  }

  async recordLanded(taskId: string, message: string): Promise<{ status: string }> {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Landed', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );
    this.ctx.storage.sql.exec(
      "DELETE FROM leases WHERE task_id = ?",
      taskId
    );
    this.logDecision(taskId, undefined, "ChangeLanded", message);
    return { status: "Landed" };
  }

  async getLatestProposal(taskId: string): Promise<any | null> {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT * FROM proposals WHERE task_id = ? ORDER BY created_at DESC LIMIT 1",
      taskId
    );
    const rows = [...cursor];
    return rows[0] || null;
  }

  // --- Escalation Management ---

  async escalate(
    attemptId: string, 
    question: string, 
    options: string[] = []
  ): Promise<{ status: string; escalationId: string }> {
    const taskCursor = this.ctx.storage.sql.exec(
      "SELECT task_id FROM attempts WHERE attempt_id = ?",
      attemptId
    );
    const attempt = [...taskCursor][0] as any;
    if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

    const taskId = attempt.task_id;
    const now = Date.now();
    const escalationId = `esc-${attemptId}-${now}`;

    this.ctx.storage.sql.exec(
      `INSERT INTO escalations (escalation_id, task_id, attempt_id, question, options, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      escalationId,
      taskId,
      attemptId,
      question,
      JSON.stringify(options),
      now
    );

    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Escalated', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    this.logDecision(taskId, attemptId, "EscalationRaised", `Question: ${question}`);
    return { status: "Escalated", escalationId };
  }

  // --- Budget Enforcement & Cost Accounting ---

  async reportCost(
    attemptId: string, 
    costUsd: number, 
    tokensIn = 0, 
    tokensOut = 0
  ): Promise<{ terminated: boolean; remainingBudgetUsd: number; reason?: string }> {
    const taskCursor = this.ctx.storage.sql.exec(
      `SELECT t.task_id, t.budget_usd, t.spent_usd, a.spent_usd as attempt_spent
       FROM attempts a JOIN tasks t ON a.task_id = t.task_id
       WHERE a.attempt_id = ?`,
      attemptId
    );
    const row = [...taskCursor][0] as any;
    if (!row) throw new Error(`Attempt ${attemptId} not found`);

    const now = Date.now();
    const newAttemptSpent = Number(row.attempt_spent) + costUsd;
    const newTaskSpent = Number(row.spent_usd) + costUsd;

    this.ctx.storage.sql.exec(
      "UPDATE attempts SET spent_usd = ?, tokens_in = tokens_in + ?, tokens_out = tokens_out + ?, updated_at = ? WHERE attempt_id = ?",
      newAttemptSpent,
      tokensIn,
      tokensOut,
      now,
      attemptId
    );

    this.ctx.storage.sql.exec(
      "UPDATE tasks SET spent_usd = ?, updated_at = ? WHERE task_id = ?",
      newTaskSpent,
      now,
      row.task_id
    );

    // Budget limit enforcement
    if (newTaskSpent >= Number(row.budget_usd)) {
      this.ctx.storage.sql.exec(
        "UPDATE attempts SET status = 'stopped_over_budget', stop_reason = 'budget_exhausted', updated_at = ? WHERE attempt_id = ?",
        now,
        attemptId
      );

      // Release unexpired leases
      this.ctx.storage.sql.exec(
        "DELETE FROM leases WHERE attempt_id = ?",
        attemptId
      );

      const reason = `Coordinator stopped attempt ${attemptId}: budget exceeded ($${newTaskSpent.toFixed(2)} >= $${Number(row.budget_usd).toFixed(2)})`;
      this.logDecision(row.task_id, attemptId, "AttemptTerminatedOverBudget", reason);

      return {
        terminated: true,
        remainingBudgetUsd: 0,
        reason
      };
    }

    return {
      terminated: false,
      remainingBudgetUsd: Math.max(0, Number(row.budget_usd) - newTaskSpent)
    };
  }

  // --- Platform Friction Reporting ---

  async reportFriction(
    attemptId: string, 
    obstacle: string, 
    commandOrTool?: string, 
    suggestedFix?: string
  ): Promise<{ recorded: boolean }> {
    const taskCursor = this.ctx.storage.sql.exec(
      "SELECT task_id FROM attempts WHERE attempt_id = ?",
      attemptId
    );
    const attempt = [...taskCursor][0] as any;
    if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

    const now = Date.now();
    const frictionId = `fric-${attemptId}-${now}`;

    this.ctx.storage.sql.exec(
      `INSERT INTO friction_logs (friction_id, task_id, attempt_id, obstacle, command_or_tool, suggested_fix, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      frictionId,
      attempt.task_id,
      attemptId,
      obstacle,
      commandOrTool || "",
      suggestedFix || "",
      now
    );

    this.logDecision(attempt.task_id, attemptId, "FrictionReported", `Obstacle: ${obstacle}`);
    return { recorded: true };
  }

  // --- Context Pack Aggregator ---

  async getContextPack(attemptId: string): Promise<any> {
    const cursor = this.ctx.storage.sql.exec(
      `SELECT a.*, t.title as task_title, t.intent as task_intent, t.status as task_status, 
              t.budget_usd, t.spent_usd as task_spent_usd
       FROM attempts a JOIN tasks t ON a.task_id = t.task_id
       WHERE a.attempt_id = ?`,
      attemptId
    );
    const attempt = [...cursor][0] as any;
    if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

    const now = Date.now();
    const activeLeases = [...this.ctx.storage.sql.exec(
      "SELECT path_pattern, attempt_id, expires_at FROM leases WHERE task_id = ? AND expires_at > ?",
      attempt.task_id,
      now
    )];

    const decisions = [...this.ctx.storage.sql.exec(
      "SELECT decision, reason, created_at FROM decision_logs WHERE task_id = ? ORDER BY created_at DESC LIMIT 10",
      attempt.task_id
    )];

    return {
      attemptId,
      taskId: attempt.task_id,
      taskTitle: attempt.task_title,
      taskIntent: attempt.task_intent,
      taskStatus: attempt.task_status,
      remainingBudgetUsd: Math.max(0, Number(attempt.budget_usd) - Number(attempt.task_spent_usd)),
      activeLeases,
      recentDecisions: decisions,
      forkRemote: attempt.fork_remote_url,
      forkRepoName: attempt.fork_repo_name
    };
  }

  // --- Decision Logger Helper ---

  private logDecision(taskId: string, attemptId: string | undefined, decision: string, reason: string): void {
    const logId = `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.ctx.storage.sql.exec(
      `INSERT INTO decision_logs (log_id, task_id, attempt_id, decision, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      logId,
      taskId,
      attemptId || null,
      decision,
      reason,
      Date.now()
    );
  }
}
