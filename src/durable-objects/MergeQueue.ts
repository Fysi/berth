import { DurableObject } from "cloudflare:workers";

export interface Env {
  ARTIFACTS: any;
}

export class MergeQueue extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initDatabase();
  }

  private initDatabase(): void {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS queue (
        entry_id TEXT PRIMARY KEY,
        change_id TEXT NOT NULL UNIQUE,
        attempt_id TEXT NOT NULL,
        status TEXT NOT NULL,
        vouched_by TEXT NOT NULL,
        enqueued_at INTEGER NOT NULL,
        landed_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS landing_log (
        log_id TEXT PRIMARY KEY,
        change_id TEXT NOT NULL,
        commit_sha TEXT NOT NULL,
        vouched_by TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  async enqueueChange(changeId: string, attemptId: string, vouchedBy: string): Promise<string> {
    const entryId = `queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO queue (entry_id, change_id, attempt_id, status, vouched_by, enqueued_at)
       VALUES (?, ?, ?, 'Queued', ?, ?)`,
      entryId,
      changeId,
      attemptId,
      vouchedBy,
      now
    );
    return entryId;
  }

  async listQueue(): Promise<any[]> {
    const cursor = this.ctx.storage.sql.exec("SELECT * FROM queue ORDER BY enqueued_at ASC");
    return [...cursor];
  }
}
