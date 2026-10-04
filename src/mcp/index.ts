/**
 * Berth Model Context Protocol (MCP) Tool Definitions & Router
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
        attempt_id: { type: "string", description: "The active attempt identifier" }
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
        commit_sha: { type: "string", description: "The commit SHA in the attempt's fork" },
        evidence_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of evidence IDs verifying this change"
        }
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
        obstacle: { type: "string", description: "What failed or caused friction" },
        command_or_tool: { type: "string" },
        suggested_fix: { type: "string" }
      },
      required: ["attempt_id", "obstacle"]
    }
  }
];

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/tools" || url.pathname === "/sse") {
      return Response.json({
        tools: BERTH_MCP_TOOLS
      });
    }

    return Response.json({
      service: "berth-mcp-server",
      status: "ready",
      tools_count: BERTH_MCP_TOOLS.length
    });
  }
};
