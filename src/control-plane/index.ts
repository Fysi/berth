import { TaskCoordinator } from "../durable-objects/TaskCoordinator.ts";
import { MergeQueue } from "../durable-objects/MergeQueue.ts";
import { handleMcpRequest, BERTH_MCP_TOOLS } from "../mcp/index.ts";
import { renderDashboardHtml, renderCandidatePreviewHtml } from "../ui/dashboard.ts";
import { generateHumanSummary } from "../summary/generator.ts";
import { validateHumanSummary } from "../summary/validator.ts";
import { parseProductionIssue, processIssueWebhook } from "../issues/triage.ts";
import { ContainerSnapshotManager } from "../containers/snapshot.ts";

export { TaskCoordinator, MergeQueue, handleMcpRequest, BERTH_MCP_TOOLS };

export interface Env {
  ARTIFACTS: any;
  TASK_COORDINATOR: DurableObjectNamespace;
  MERGE_QUEUE: DurableObjectNamespace;
  SESSIONS_BUCKET?: R2Bucket;
  AI_GATEWAY_TOKEN?: string;
  ACCOUNT_ID?: string;
}

const snapshotManager = new ContainerSnapshotManager();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const accessEmail = request.headers.get("Cf-Access-Authenticated-User-Email") || "reviewer@theashtons.dev";

    // 1. Interactive UI Dashboard (HTML)
    if (url.pathname === "/ui" || (url.pathname === "/" && request.headers.get("Accept")?.includes("text/html"))) {
      return new Response(renderDashboardHtml(accessEmail), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache"
        }
      });
    }

    // 1b. Candidate Preview Deployment Sandbox (/preview/:taskId or /preview/:taskId/:attemptId)
    if (url.pathname === "/preview" || url.pathname === "/preview/") {
      return Response.redirect(`${url.origin}/preview/M4-review`, 302);
    }
    if (url.pathname.startsWith("/preview/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const taskId = parts[1] || "M4-review";
      const attemptId = parts[2] || "att-2";

      if (parts[2] === "healthz" || url.pathname.endsWith("/healthz")) {
        return Response.json({
          status: "healthy",
          preview: true,
          taskId,
          attemptId,
          timestamp: new Date().toISOString()
        });
      }

      return new Response(renderCandidatePreviewHtml(taskId, attemptId, accessEmail), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Berth-Preview-Task": taskId,
          "X-Berth-Preview-Attempt": attemptId
        }
      });
    }

    // 2. Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return Response.json({
        platform: "Berth",
        status: "healthy",
        version: "0.1.0",
        mcp_tools_count: BERTH_MCP_TOOLS.length,
        timestamp: new Date().toISOString()
      });
    }

    // 3. MCP Server routing (JSON-RPC 2.0 and tool discovery)
    if (url.pathname === "/mcp" || url.pathname === "/api/mcp" || url.pathname === "/mcp/sse") {
      return handleMcpRequest(request, env);
    }

    // 4. Human Summary Generation & Validation
    if (url.pathname === "/api/summary/generate" && request.method === "POST") {
      const body = await request.json() as any;
      const result = await generateHumanSummary({
        ...body,
        aiGatewayToken: env.AI_GATEWAY_TOKEN,
        accountId: env.ACCOUNT_ID
      });
      return Response.json(result);
    }

    if (url.pathname === "/api/summary/validate" && request.method === "POST") {
      const body = await request.json() as any;
      const result = validateHumanSummary(body.summary || "");
      return Response.json(result);
    }

    // 5. Four UI Views Aggregation Endpoints
    if (url.pathname === "/api/inbox" && request.method === "GET") {
      const targetTaskId = url.searchParams.get("taskId") || "task-design-system-1";
      const id = env.TASK_COORDINATOR.idFromName(targetTaskId);
      const stub = env.TASK_COORDINATOR.get(id) as any;
      const inbox = await stub.getInbox();
      return Response.json(inbox);
    }

    if (url.pathname.startsWith("/api/views/task/") && request.method === "GET") {
      const taskId = url.pathname.split("/")[4];
      if (!taskId) return Response.json({ error: "taskId is required" }, { status: 400 });
      const id = env.TASK_COORDINATOR.idFromName(taskId);
      const stub = env.TASK_COORDINATOR.get(id) as any;
      const view = await stub.getTaskView(taskId);
      if (!view) return Response.json({ error: "Task view not found" }, { status: 404 });
      return Response.json(view);
    }

    if (url.pathname.startsWith("/api/views/change/") && request.method === "GET") {
      const taskId = url.pathname.split("/")[4];
      if (!taskId) return Response.json({ error: "taskId is required" }, { status: 400 });
      const id = env.TASK_COORDINATOR.idFromName(taskId);
      const stub = env.TASK_COORDINATOR.get(id) as any;
      const view = await stub.getChangeView(taskId);
      if (!view) return Response.json({ error: "Change view not found" }, { status: 404 });
      return Response.json(view);
    }

    if (url.pathname === "/api/views/landed" && request.method === "GET") {
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const history = await stub.listLandingLog();
      return Response.json({ history });
    }

    // 6. Production Issues Webhook (Observability Autotriage to Task Loop)
    if (url.pathname === "/api/webhooks/issues" && request.method === "POST") {
      const raw = await request.json() as any;
      const parsed = parseProductionIssue(raw);
      const result = await processIssueWebhook(parsed, env.TASK_COORDINATOR);
      return Response.json({
        triageStatus: "triaged",
        ...result,
        inboxUrl: "/ui#inbox"
      });
    }

    // 7. Container Snapshots & Rapid Boot Management
    if (url.pathname === "/api/snapshots" && request.method === "GET") {
      return Response.json({ snapshots: snapshotManager.listSnapshots() });
    }

    if (url.pathname === "/api/snapshots/create" && request.method === "POST") {
      const body = await request.json() as any;
      const snapshot = await snapshotManager.snapshotContainer(null, body.name || "berth-base-v1");
      return Response.json(snapshot);
    }

    if (url.pathname === "/api/snapshots/restore" && request.method === "POST") {
      const body = await request.json() as any;
      const restored = await snapshotManager.restoreContainerFromSnapshot(body.name || "berth-base-v1", body);
      return Response.json(restored);
    }

    // 8. Task coordinator routing
    if (url.pathname.startsWith("/api/tasks/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      // /api/tasks/:taskId
      const taskId = parts[2];
      if (!taskId) {
        return Response.json({ error: "taskId is required" }, { status: 400 });
      }

      const id = env.TASK_COORDINATOR.idFromName(taskId);
      const stub = env.TASK_COORDINATOR.get(id) as any;

      // WebSocket Upgrade: /api/tasks/:taskId/ws
      if (parts[3] === "ws") {
        return stub.fetch(request);
      }

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

      // /api/tasks/:taskId/claim
      if (request.method === "POST" && parts[3] === "claim") {
        const body = await request.json() as any;
        const result = await stub.claimAttempt(taskId, body.agentName || "agent");
        return Response.json(result);
      }

      // /api/tasks/:taskId/leases
      if (request.method === "POST" && parts[3] === "leases") {
        const body = await request.json() as any;
        const result = await stub.requestLease(body.attemptId, body.paths, body.durationSeconds);
        return Response.json(result);
      }

      // /api/tasks/:taskId/matrix
      if (request.method === "GET" && parts[3] === "matrix") {
        const matrix = await stub.getConflictMatrix(taskId);
        return Response.json({ taskId, matrix });
      }

      // /api/tasks/:taskId/push
      if (request.method === "POST" && parts[3] === "push") {
        const body = await request.json() as any;
        const result = await stub.handlePushEvent(body);
        return Response.json(result);
      }

      // /api/tasks/:taskId/propose
      if (request.method === "POST" && parts[3] === "propose") {
        const body = await request.json() as any;
        const result = await stub.propose(body.attemptId, body.commitSha, body.evidenceIds, body.summary);
        return Response.json(result);
      }

      // /api/tasks/:taskId/vouch
      if (request.method === "POST" && parts[3] === "vouch") {
        const body = await request.json() as any;
        const voucherEmail = body.voucherEmail || accessEmail;
        const voucherName = body.voucherName || voucherEmail.split("@")[0];
        const proposalId = body.proposalId;

        const result = await stub.recordVouch(taskId, voucherEmail, voucherName, proposalId);

        let queueResult: any = null;
        if (env.MERGE_QUEUE) {
          try {
            const proposal = proposalId
              ? ((stub.getProposal ? await stub.getProposal(proposalId) : null) || await stub.getLatestProposal(taskId))
              : await stub.getLatestProposal(taskId);
            if (proposal) {
              const queueId = env.MERGE_QUEUE.idFromName("global");
              const queueStub = env.MERGE_QUEUE.get(queueId) as any;
              queueResult = await queueStub.enqueueChange({
                taskId,
                attemptId: proposal.attempt_id,
                changeId: proposal.proposal_id,
                commitSha: proposal.commit_sha,
                vouchedBy: `${voucherName} <${voucherEmail}>`,
                autoProcess: true
              });
              await stub.recordLanding(taskId);
            }
          } catch (qErr: any) {
            console.warn("MergeQueue auto-enqueue note:", qErr.message);
          }
        }
        return Response.json({ ...result, queue: queueResult });
      }

      // /api/tasks/:taskId/escalate
      if (request.method === "POST" && parts[3] === "escalate") {
        const body = await request.json() as any;
        const result = await stub.escalate(body.attemptId, body.question, body.options);
        return Response.json(result);
      }

      // /api/tasks/:taskId/cost
      if (request.method === "POST" && parts[3] === "cost") {
        const body = await request.json() as any;
        const result = await stub.reportCost(body.attemptId, body.costUsd, body.tokensIn, body.tokensOut);
        return Response.json(result);
      }

      if (request.method === "GET" && parts[3] === "cost") {
        const cost = await stub.getCostSummary(taskId);
        return Response.json(cost);
      }

      // /api/tasks/:taskId/friction
      if (request.method === "POST" && parts[3] === "friction") {
        const body = await request.json() as any;
        const result = await stub.reportFriction(body.attemptId, body.obstacle, body.commandOrTool, body.suggestedFix);
        return Response.json(result);
      }

      // /api/tasks/:taskId/attempts/:attemptId/context
      if (request.method === "GET" && parts[3] === "attempts" && parts[5] === "context") {
        const attemptId = parts[4];
        const result = await stub.getContextPack(attemptId);
        return Response.json(result);
      }
    }

    // 9. Session context pack routing
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

    // 10. Merge queue routing
    if (url.pathname === "/api/queue" && request.method === "GET") {
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const queue = await stub.listQueue();
      return Response.json({ queue });
    }

    if (url.pathname === "/api/queue/history" && request.method === "GET") {
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const history = await stub.listLandingLog();
      return Response.json({ history });
    }

    if (url.pathname === "/api/queue/enqueue" && request.method === "POST") {
      const body = await request.json() as any;
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const result = await stub.enqueueChange(body);
      return Response.json(result);
    }

    if (url.pathname === "/api/queue/process" && request.method === "POST") {
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      await stub.processQueue();
      const queue = await stub.listQueue();
      return Response.json({ status: "processed", queue });
    }

    if (url.pathname.startsWith("/api/queue/") && url.pathname.endsWith("/retry") && request.method === "POST") {
      const parts = url.pathname.split("/").filter(Boolean);
      const entryId = parts[2];
      const id = env.MERGE_QUEUE.idFromName("global");
      const stub = env.MERGE_QUEUE.get(id) as any;
      const result = await stub.retryEntry(entryId);
      return Response.json(result);
    }

    return Response.json({ error: "Endpoint not found" }, { status: 404 });
  }
};
