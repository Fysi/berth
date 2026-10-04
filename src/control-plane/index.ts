import { TaskCoordinator } from "../durable-objects/TaskCoordinator.ts";
import { MergeQueue } from "../durable-objects/MergeQueue.ts";

export { TaskCoordinator, MergeQueue };

export interface Env {
  ARTIFACTS: any;
  TASK_COORDINATOR: DurableObjectNamespace;
  MERGE_QUEUE: DurableObjectNamespace;
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
