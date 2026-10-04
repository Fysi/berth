import { TaskCoordinator } from "../durable-objects/TaskCoordinator.ts";
import { MergeQueue } from "../durable-objects/MergeQueue.ts";

export { TaskCoordinator, MergeQueue };

export interface Env {
  ARTIFACTS: any;
  TASK_COORDINATOR: DurableObjectNamespace;
  MERGE_QUEUE: DurableObjectNamespace;
  SESSIONS_BUCKET?: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return Response.json({
        platform: "Berth",
        status: "healthy",
        version: "0.1.0",
        timestamp: new Date().toISOString()
      });
    }

    // Task coordinator routing
    if (url.pathname.startsWith("/api/tasks/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const taskId = parts[2];
      if (!taskId) {
        return Response.json({ error: "taskId is required" }, { status: 400 });
      }

      const id = env.TASK_COORDINATOR.idFromName(taskId);
      const stub = env.TASK_COORDINATOR.get(id) as any;

      if (request.method === "POST" && parts.length === 3) {
        const body = await request.json() as any;
        await stub.createTask({
          taskId,
          title: body.title || "Untitled Task",
          intent: body.intent || "",
          ownerEmail: body.ownerEmail || "human@example.com",
          budgetUsd: body.budgetUsd
        });
        return Response.json({ status: "created", taskId });
      }

      if (request.method === "GET" && parts.length === 3) {
        const task = await stub.getTask(taskId);
        if (!task) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(task);
      }

      if (request.method === "POST" && parts[3] === "claim") {
        const body = await request.json() as any;
        const result = await stub.claimAttempt(taskId, body.agentName || "agent");
        return Response.json(result);
      }
    }

    // Session context pack routing
    if (url.pathname.startsWith("/api/sessions/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      // /api/sessions/:taskId/:attemptId/:sessionId
      const taskId = parts[2];
      const attemptId = parts[3];
      const sessionId = parts[4];

      if (!taskId || !attemptId || !sessionId) {
        return Response.json({ error: "taskId, attemptId, and sessionId are required" }, { status: 400 });
      }

      const key = `berth-sessions/${taskId}/${attemptId}/${sessionId}.jsonl`;

      if (request.method === "PUT") {
        if (!env.SESSIONS_BUCKET) {
          return Response.json({ error: "SESSIONS_BUCKET not configured" }, { status: 500 });
        }
        const body = await request.text();
        await env.SESSIONS_BUCKET.put(key, body, {
          httpMetadata: { contentType: "application/x-ndjson" },
          customMetadata: {
            taskId,
            attemptId,
            sessionId,
            uploadedAt: new Date().toISOString()
          }
        });
        return Response.json({
          status: "uploaded",
          key,
          url: `${url.origin}/api/sessions/${taskId}/${attemptId}/${sessionId}`
        });
      }

      if (request.method === "GET") {
        if (!env.SESSIONS_BUCKET) {
          return Response.json({ error: "SESSIONS_BUCKET not configured" }, { status: 500 });
        }
        const obj = await env.SESSIONS_BUCKET.get(key);
        if (!obj) {
          return Response.json({ error: "Session not found" }, { status: 404 });
        }
        return new Response(obj.body, {
          headers: {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        });
      }
    }

    // Merge queue routing
    if (url.pathname === "/api/queue" && request.method === "GET") {
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const queue = await stub.listQueue();
      return Response.json({ queue });
    }

    return Response.json({ error: "Endpoint not found" }, { status: 404 });
  }
};
