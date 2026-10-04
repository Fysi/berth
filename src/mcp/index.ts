/**
 * Berth Model Context Protocol (MCP) Tool Definitions & JSON-RPC Router
 */

export const BERTH_MCP_TOOLS = [
  {
    name: "claim_task",
    description: "Claim an open task to work on. Provisions a dedicated Artifacts fork and sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The unique task identifier" },
        agent_name: { type: "string", description: "Name or identifier of the claiming agent" }
      },
      required: ["task_id", "agent_name"]
    }
  },
  {
    name: "get_context_pack",
    description: "Fetches task intent, active leases, trunk state, and prior attempt notes.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string", description: "The active attempt identifier" },
        task_id: { type: "string", description: "The task identifier" }
      },
      required: ["attempt_id"]
    }
  },
  {
    name: "request_lease",
    description: "Request a temporary exclusive lease on file path patterns.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string", description: "The active attempt identifier" },
        task_id: { type: "string", description: "The task identifier" },
        paths: {
          type: "array",
          items: { type: "string" },
          description: "File paths or glob patterns (e.g. 'src/auth/**')"
        },
        duration_seconds: { type: "integer", default: 1800 }
      },
      required: ["attempt_id", "paths"]
    }
  },
  {
    name: "propose",
    description: "Propose the current attempt as a candidate change to land on trunk.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        task_id: { type: "string" },
        commit_sha: { type: "string", description: "The commit SHA in the attempt's fork" },
        evidence_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of evidence IDs verifying this change"
        },
        summary: { type: "string" }
      },
      required: ["attempt_id", "commit_sha", "evidence_ids"]
    }
  },
  {
    name: "escalate",
    description: "Escalate to a human when blocked. Never guess on product or architectural decisions.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        task_id: { type: "string" },
        question: { type: "string", description: "Specific question for the human owner" },
        options: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of distinct alternatives considered"
        }
      },
      required: ["attempt_id", "question"]
    }
  },
  {
    name: "report_cost",
    description: "Report incremental token usage and inference cost.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        task_id: { type: "string" },
        tokens_in: { type: "integer" },
        tokens_out: { type: "integer" },
        cost_usd: { type: "number" },
        model: { type: "string" }
      },
      required: ["attempt_id", "cost_usd"]
    }
  },
  {
    name: "report_friction",
    description: "Report friction when the platform gets in the way. Never route around platform bugs silently.",
    inputSchema: {
      type: "object",
      properties: {
        attempt_id: { type: "string" },
        task_id: { type: "string" },
        obstacle: { type: "string", description: "What failed or caused friction" },
        command_or_tool: { type: "string" },
        suggested_fix: { type: "string" }
      },
      required: ["attempt_id", "obstacle"]
    }
  }
];

export interface McpEnv {
  TASK_COORDINATOR: any;
}

export async function handleMcpRequest(request: Request, env: McpEnv): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    return Response.json({
      service: "berth-mcp-server",
      status: "ready",
      tools_count: BERTH_MCP_TOOLS.length,
      tools: BERTH_MCP_TOOLS
    });
  }

  let rpc: any;
  try {
    rpc = await request.json();
  } catch {
    return Response.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: Invalid JSON" }
    }, { status: 400 });
  }

  const { method, params, id } = rpc;

  if (method === "initialize") {
    return Response.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "berth-mcp-server", version: "0.1.0" }
      }
    });
  }

  if (method === "tools/list") {
    return Response.json({
      jsonrpc: "2.0",
      id,
      result: { tools: BERTH_MCP_TOOLS }
    });
  }

  if (method === "tools/call") {
    if (!params?.name) {
      return Response.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: "Invalid params: Missing tool name" }
      }, { status: 400 });
    }

    const { name, arguments: args } = params;

    try {
      let resultData: any;

      if (name === "claim_task") {
        const taskId = args.task_id;
        const doId = env.TASK_COORDINATOR.idFromName(taskId);
        const stub = env.TASK_COORDINATOR.get(doId);
        resultData = await stub.claimAttempt(taskId, args.agent_name || "agent");
      } else {
        const taskId = args.task_id || "default";
        const doId = env.TASK_COORDINATOR.idFromName(taskId);
        const stub = env.TASK_COORDINATOR.get(doId);
        const attemptId = args.attempt_id;

        switch (name) {
          case "get_context_pack":
            resultData = await stub.getContextPack(attemptId);
            break;
          case "request_lease":
            resultData = await stub.requestLease(attemptId, args.paths, args.duration_seconds || 1800);
            break;
          case "propose":
            resultData = await stub.propose(attemptId, args.commit_sha, args.evidence_ids, args.summary);
            break;
          case "escalate":
            resultData = await stub.escalate(attemptId, args.question, args.options || []);
            break;
          case "report_cost":
            resultData = await stub.reportCost(attemptId, args.cost_usd, args.tokens_in || 0, args.tokens_out || 0);
            break;
          case "report_friction":
            resultData = await stub.reportFriction(attemptId, args.obstacle, args.command_or_tool, args.suggested_fix);
            break;
          default:
            return Response.json({
              jsonrpc: "2.0",
              id,
              error: { code: -32601, message: `Tool not found: ${name}` }
            }, { status: 404 });
        }
      }

      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(resultData, null, 2)
            }
          ]
        }
      });
    } catch (err: any) {
      return Response.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: err.message || "Tool execution failed" }
      }, { status: 500 });
    }
  }

  return Response.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  }, { status: 404 });
}

export default {
  async fetch(request: Request, env: McpEnv): Promise<Response> {
    return handleMcpRequest(request, env);
  }
};
