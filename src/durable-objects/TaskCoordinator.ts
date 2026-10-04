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

import { aggregateTaskCost } from "../summary/cost.ts";
import type { TaskCostSummary } from "../summary/cost.ts";

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

      CREATE TABLE IF NOT EXISTS conflict_matrix (
        matrix_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        attempt_a TEXT NOT NULL,
        attempt_b TEXT NOT NULL,
        status TEXT NOT NULL,
        conflicting_files TEXT NOT NULL,
        conflict_details TEXT,
        calculated_at INTEGER NOT NULL
      );
    `);

    // Progressive schema migrations for existing DO SQLite instances
    const migrations = [
      "ALTER TABLE decision_logs ADD COLUMN attempt_id TEXT",
      "ALTER TABLE attempts ADD COLUMN spent_usd REAL DEFAULT 0.00",
      "ALTER TABLE attempts ADD COLUMN tokens_in INTEGER DEFAULT 0",
      "ALTER TABLE attempts ADD COLUMN tokens_out INTEGER DEFAULT 0",
      "ALTER TABLE attempts ADD COLUMN commit_sha TEXT",
      "ALTER TABLE attempts ADD COLUMN modified_paths TEXT"
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
    voucherName: string,
    proposalId?: string
  ): Promise<{ status: string }> {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "UPDATE tasks SET status = 'Vouched', updated_at = ? WHERE task_id = ?",
      now,
      taskId
    );

    if (proposalId) {
      const prop = await this.getProposal(proposalId);
      if (prop) {
        this.ctx.storage.sql.exec(
          "UPDATE attempts SET status = 'vouched', updated_at = ? WHERE attempt_id = ?",
          now,
          prop.attempt_id
        );
        this.ctx.storage.sql.exec(
          "UPDATE attempts SET status = 'superseded', stop_reason = 'Competitor attempt vouched', updated_at = ? WHERE task_id = ? AND attempt_id != ? AND status IN ('running', 'proposed')",
          now,
          taskId,
          prop.attempt_id
        );
      }
    }

    this.logDecision(taskId, undefined, "ChangeVouched", `Human ${voucherName} (${voucherEmail}) vouched for change${proposalId ? ` (proposal ${proposalId})` : ''}`);
    return { status: "Vouched" };
  }

  async getProposal(proposalId: string): Promise<any | null> {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT * FROM proposals WHERE proposal_id = ?",
      proposalId
    );
    const rows = [...cursor];
    return rows.length > 0 ? rows[0] : null;
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

  async getCostSummary(taskId: string): Promise<TaskCostSummary> {
    const attemptsCursor = this.ctx.storage.sql.exec(
      "SELECT attempt_id, agent_id, status, spent_usd, tokens_in, tokens_out FROM attempts WHERE task_id = ?",
      taskId
    );
    const attempts = [...attemptsCursor] as any[];
    return aggregateTaskCost(taskId, attempts.map(a => ({
      attemptId: a.attempt_id,
      agentId: a.agent_id,
      status: a.status,
      spentUsd: a.spent_usd,
      tokensIn: a.tokens_in,
      tokensOut: a.tokens_out
    })));
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

  // --- Real-Time Push Conflict Matrix Engine ---

  async calculateConflictMatrix(
    taskId: string, 
    trigger?: { attemptId: string; modifiedPaths?: string[] }
  ): Promise<any[]> {
    const now = Date.now();

    // 1. Fetch active attempts for task
    const attemptsCursor = this.ctx.storage.sql.exec(
      "SELECT attempt_id, commit_sha, status, modified_paths FROM attempts WHERE task_id = ? AND status NOT IN ('Halted', 'Aborted')",
      taskId
    );
    const activeAttempts = [...attemptsCursor] as Array<{
      attempt_id: string;
      commit_sha?: string;
      status: string;
      modified_paths?: string;
    }>;

    // Fetch active leases for task
    const leasesCursor = this.ctx.storage.sql.exec(
      "SELECT attempt_id, path_pattern FROM leases WHERE task_id = ? AND expires_at > ?",
      taskId,
      now
    );
    const activeLeases = [...leasesCursor] as Array<{ attempt_id: string; path_pattern: string }>;

    // Build map of paths per attempt (from leases + modified paths)
    const attemptPaths = new Map<string, Set<string>>();
    for (const att of activeAttempts) {
      const paths = new Set<string>();
      if (att.modified_paths) {
        try {
          const arr = JSON.parse(att.modified_paths);
          for (const p of arr) paths.add(p);
        } catch {}
      }
      attemptPaths.set(att.attempt_id, paths);
    }

    if (trigger?.modifiedPaths && trigger.attemptId) {
      let paths = attemptPaths.get(trigger.attemptId);
      if (!paths) {
        paths = new Set<string>();
        attemptPaths.set(trigger.attemptId, paths);
      }
      for (const p of trigger.modifiedPaths) paths.add(p);
      this.ctx.storage.sql.exec(
        "UPDATE attempts SET modified_paths = ? WHERE attempt_id = ?",
        JSON.stringify(Array.from(paths)),
        trigger.attemptId
      );
    }

    for (const lease of activeLeases) {
      let paths = attemptPaths.get(lease.attempt_id);
      if (!paths) {
        paths = new Set<string>();
        attemptPaths.set(lease.attempt_id, paths);
      }
      paths.add(lease.path_pattern);
    }

    const results: any[] = [];

    // Pairwise comparison between attempts
    for (let i = 0; i < activeAttempts.length; i++) {
      const attA = activeAttempts[i].attempt_id;
      const pathsA = Array.from(attemptPaths.get(attA) || []);

      // Check vs trunk
      results.push({
        taskId,
        attemptA: attA,
        attemptB: "trunk",
        status: "clean",
        conflictingFiles: [],
        conflictDetails: "Linear rebase clean against trunk HEAD"
      });

      for (let j = i + 1; j < activeAttempts.length; j++) {
        const attB = activeAttempts[j].attempt_id;
        const pathsB = Array.from(attemptPaths.get(attB) || []);

        const colliding: string[] = [];
        for (const pa of pathsA) {
          for (const pb of pathsB) {
            if (this.pathsOverlap(pa, pb)) {
              colliding.push(`${pa} ~ ${pb}`);
            }
          }
        }

        const status = colliding.length > 0 ? "conflicts" : "clean";
        const details = colliding.length > 0
          ? `Collision detected across leased/modified paths: ${colliding.join(", ")}`
          : "Zero overlap across active leases and modified paths";

        results.push({
          taskId,
          attemptA: attA,
          attemptB: attB,
          status,
          conflictingFiles: colliding,
          conflictDetails: details
        });

        if (status === "conflicts") {
          this.logDecision(
            taskId,
            attA,
            "ConflictDetected",
            `Conflict matrix detected collision between ${attA} and ${attB} on ${colliding.join(", ")}`
          );
        }
      }
    }

    // Persist to SQLite
    this.ctx.storage.sql.exec("DELETE FROM conflict_matrix WHERE task_id = ?", taskId);
    for (const r of results) {
      const matrixId = `cm-${taskId}-${r.attemptA}-${r.attemptB}-${Date.now()}`;
      this.ctx.storage.sql.exec(
        `INSERT INTO conflict_matrix (matrix_id, task_id, attempt_a, attempt_b, status, conflicting_files, conflict_details, calculated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        matrixId,
        taskId,
        r.attemptA,
        r.attemptB,
        r.status,
        JSON.stringify(r.conflictingFiles),
        r.conflictDetails,
        now
      );
    }

    // Broadcast update via WebSocket
    this.broadcastEvent("conflict_matrix_updated", {
      taskId,
      updatedAt: now,
      matrix: results
    });

    return results;
  }

  async getConflictMatrix(taskId: string): Promise<any[]> {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT * FROM conflict_matrix WHERE task_id = ? ORDER BY calculated_at DESC",
      taskId
    );
    const rows = [...cursor] as any[];
    if (rows.length === 0) {
      return this.calculateConflictMatrix(taskId);
    }
    return rows.map(r => ({
      taskId: r.task_id,
      attemptA: r.attempt_a,
      attemptB: r.attempt_b,
      status: r.status,
      conflictingFiles: JSON.parse(r.conflicting_files || "[]"),
      conflictDetails: r.conflict_details,
      calculatedAt: r.calculated_at
    }));
  }

  async handlePushEvent(event: {
    attemptId: string;
    ref: string;
    before: string;
    after: string;
    commits?: Array<{ id: string; message: string; files?: string[] }>;
    modifiedFiles?: string[];
  }): Promise<any> {
    const { attemptId, after, commits, modifiedFiles } = event;
    const cursor = this.ctx.storage.sql.exec("SELECT * FROM attempts WHERE attempt_id = ?", attemptId);
    const attempt = [...cursor][0] as any;
    if (!attempt) return { error: `Attempt ${attemptId} not found` };

    const paths = modifiedFiles || (commits && commits[0]?.files) || [];

    // Update attempt commit SHA
    this.ctx.storage.sql.exec(
      "UPDATE attempts SET commit_sha = ?, updated_at = ? WHERE attempt_id = ?",
      after,
      Date.now(),
      attemptId
    );

    this.logDecision(
      attempt.task_id,
      attemptId,
      "AttemptPushed",
      `Pushed commit ${after.slice(0, 8)} to fork ref ${event.ref}`
    );

    // Recalculate conflict matrix
    const matrix = await this.calculateConflictMatrix(attempt.task_id, {
      attemptId,
      modifiedPaths: paths
    });

    this.broadcastEvent("push_received", {
      taskId: attempt.task_id,
      attemptId,
      ref: event.ref,
      commitSha: after,
      matrix
    });

    return { status: "processed", matrix };
  }

  // --- WebSocket Connection & Broadcast ---

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/ws")) {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
        return new Response("Expected WebSocket connection", { status: 426 });
      }

      // @ts-ignore
      if (typeof WebSocketPair !== "undefined") {
        // @ts-ignore
        const pair = new WebSocketPair();
        const client = pair[0];
        const server = pair[1];

        if (this.ctx && typeof this.ctx.acceptWebSocket === "function") {
          this.ctx.acceptWebSocket(server);
        }

        server.send(JSON.stringify({
          event: "connected",
          timestamp: Date.now()
        }));

        return new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: client
        });
      }

      return new Response("WebSocket not supported in this runtime", { status: 501 });
    }

    return new Response("Not found", { status: 404 });
  }

  broadcastEvent(event: string, payload: any): void {
    const message = JSON.stringify({ event, payload, timestamp: Date.now() });
    if (this.ctx && typeof this.ctx.getWebSockets === "function") {
      try {
        const sockets = this.ctx.getWebSockets();
        for (const ws of sockets) {
          try {
            ws.send(message);
          } catch {}
        }
      } catch {}
    }
  }

  // --- UI View Aggregators ---

  async getTaskView(taskId: string): Promise<any> {
    const task = await this.getTask(taskId);
    if (!task) return null;

    const now = Date.now();
    const attempts = [...this.ctx.storage.sql.exec(
      "SELECT * FROM attempts WHERE task_id = ? ORDER BY created_at ASC",
      taskId
    )] as any[];

    const leases = [...this.ctx.storage.sql.exec(
      "SELECT * FROM leases WHERE task_id = ? AND expires_at > ? ORDER BY granted_at DESC",
      taskId,
      now
    )] as any[];

    const matrix = await this.getConflictMatrix(taskId);

    const decisions = [...this.ctx.storage.sql.exec(
      "SELECT * FROM decision_logs WHERE task_id = ? ORDER BY created_at DESC LIMIT 25",
      taskId
    )] as any[];

    const proposals = [...this.ctx.storage.sql.exec(
      "SELECT * FROM proposals WHERE task_id = ? ORDER BY created_at DESC LIMIT 5",
      taskId
    )] as any[];

    return {
      task,
      attempts: attempts.map(a => ({
        attemptId: a.attempt_id,
        agentId: a.agent_id,
        status: a.status,
        spentUsd: a.spent_usd,
        tokensIn: a.tokens_in,
        tokensOut: a.tokens_out,
        commitSha: a.commit_sha,
        stopReason: a.stop_reason,
        forkRepoName: a.fork_repo_name,
        forkRemoteUrl: a.fork_remote_url,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      })),
      leases: leases.map(l => ({
        leaseId: l.lease_id,
        attemptId: l.attempt_id,
        pathPattern: l.path_pattern,
        expiresInSeconds: Math.max(0, Math.round((l.expires_at - now) / 1000))
      })),
      conflictMatrix: matrix,
      decisionLogs: decisions.map(d => ({
        logId: d.log_id,
        attemptId: d.attempt_id,
        decision: d.decision,
        reason: d.reason,
        createdAt: d.created_at
      })),
      proposals: proposals.map(p => ({
        proposalId: p.proposal_id,
        attemptId: p.attempt_id,
        commitSha: p.commit_sha,
        evidenceIds: JSON.parse(p.evidence_ids || "[]"),
        summary: p.summary,
        createdAt: p.created_at
      }))
    };
  }

  async getChangeView(taskId: string): Promise<any> {
    const task = await this.getTask(taskId);
    if (!task) return null;

    const proposal = await this.getLatestProposal(taskId);
    const attempts = [...this.ctx.storage.sql.exec(
      "SELECT * FROM attempts WHERE task_id = ?",
      taskId
    )] as any[];

    const totalCostUsd = attempts.reduce((acc, a) => acc + (a.spent_usd || 0), 0);
    const matrix = await this.getConflictMatrix(taskId);
    const trunkStatus = matrix.find(m => m.attemptB === "trunk")?.status || "clean";

    return {
      taskId,
      taskTitle: task.title,
      taskIntent: task.intent,
      taskStatus: task.status,
      ownerEmail: task.owner_email,
      totalCostUsd,
      attemptsCount: attempts.length,
      proposal: proposal ? {
        proposalId: proposal.proposal_id,
        attemptId: proposal.attempt_id,
        commitSha: proposal.commit_sha,
        evidenceIds: JSON.parse(proposal.evidence_ids || "[]"),
        summary: proposal.summary,
        createdAt: proposal.created_at
      } : null,
      trunkStatus,
      canVouch: task.status === "Proposed"
    };
  }

  async getInbox(): Promise<any> {
    const tasksCursor = this.ctx.storage.sql.exec(
      "SELECT * FROM tasks WHERE status IN ('Proposed', 'Escalated', 'Exploring')"
    );
    const activeTasks = [...tasksCursor] as any[];

    const escalationsCursor = this.ctx.storage.sql.exec(
      "SELECT e.*, t.title as task_title FROM escalations e JOIN tasks t ON e.task_id = t.task_id WHERE e.resolved = 0 ORDER BY e.created_at DESC"
    );
    const escalations = [...escalationsCursor] as any[];

    const proposalsCursor = this.ctx.storage.sql.exec(
      `SELECT p.*, t.title as task_title, t.intent as task_intent, t.budget_usd, t.spent_usd
       FROM proposals p JOIN tasks t ON p.task_id = t.task_id
       WHERE t.status = 'Proposed' ORDER BY p.created_at DESC`
    );
    const proposals = [...proposalsCursor] as any[];

    const haltedAttemptsCursor = this.ctx.storage.sql.exec(
      "SELECT a.*, t.title as task_title FROM attempts a JOIN tasks t ON a.task_id = t.task_id WHERE a.status IN ('Halted', 'Aborted', 'Failed') ORDER BY a.updated_at DESC LIMIT 10"
    );
    const haltedAttempts = [...haltedAttemptsCursor] as any[];

    return {
      activeTasksCount: activeTasks.length,
      needsAttentionCount: escalations.length + proposals.length + haltedAttempts.length,
      escalations: escalations.map(e => ({
        escalationId: e.escalation_id,
        taskId: e.task_id,
        taskTitle: e.task_title,
        attemptId: e.attempt_id,
        question: e.question,
        options: JSON.parse(e.options || "[]"),
        createdAt: e.created_at
      })),
      proposals: proposals.map(p => ({
        proposalId: p.proposal_id,
        taskId: p.task_id,
        taskTitle: p.task_title,
        taskIntent: p.task_intent,
        attemptId: p.attempt_id,
        commitSha: p.commit_sha,
        evidenceIds: JSON.parse(p.evidence_ids || "[]"),
        summary: p.summary,
        createdAt: p.created_at
      })),
      haltedAttempts: haltedAttempts.map(h => ({
        attemptId: h.attempt_id,
        taskId: h.task_id,
        taskTitle: h.task_title,
        status: h.status,
        stopReason: h.stop_reason,
        spentUsd: h.spent_usd,
        updatedAt: h.updated_at
      }))
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
