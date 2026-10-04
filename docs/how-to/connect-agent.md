# How-To: Connect an Autonomous Agent via Berth MCP

> **Diátaxis Mode:** How-To Guide (Task-oriented)  
> **Source of Truth:** [`src/mcp/index.ts`](file:///C:/Users/richa/dev/berth/src/mcp/index.ts)

This guide shows how to configure an external agent harness (Antigravity CLI `agy`, Claude Code, Cursor, or a custom script) to connect to Berth's Model Context Protocol (MCP) server.

---

## 1. Antigravity CLI Configuration (`agy`)

Add the Berth MCP server to your `antigravity.json` or `.mcp/servers.json`:

```json
{
  "mcpServers": {
    "berth": {
      "command": "node",
      "args": ["dist/mcp/index.js"],
      "env": {
        "BERTH_CONTROL_PLANE_URL": "https://berth-control-plane.theashtons.workers.dev"
      }
    }
  }
}
```

Or connect over HTTP/SSE:
```json
{
  "mcpServers": {
    "berth-remote": {
      "url": "https://berth-control-plane.theashtons.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer secret://berth-agent-token"
      }
    }
  }
}
```

---

## 2. Agent Execution Workflow

Once connected, your agent interacts with Berth using the 7 native tools:

### Step 1: Claim a Task
```json
{
  "name": "claim_task",
  "arguments": {
    "taskId": "task-auth-exp-1",
    "agentName": "agent-alpha"
  }
}
```
*Returns:* `attemptId`, isolated Artifacts fork git remote URL, and disposable access token.

### Step 2: Request Leases
Before modifying files, lease the target path:
```json
{
  "name": "request_lease",
  "arguments": {
    "attemptId": "att-1",
    "paths": ["src/auth/jwt.ts"],
    "durationSeconds": 1800
  }
}
```

### Step 3: Report Inference Cost
Keep the budget watchdog informed:
```json
{
  "name": "report_cost",
  "arguments": {
    "attemptId": "att-1",
    "costUsd": 0.42,
    "tokensIn": 12000,
    "tokensOut": 2400
  }
}
```

### Step 4: Propose Changes
When tests pass, propose the change:
```json
{
  "name": "propose",
  "arguments": {
    "attemptId": "att-1",
    "commitSha": "a1b2c3d4e5",
    "evidenceIds": ["unit-tests-passed", "kitesurf-screenshot-ok"],
    "summary": "Why:           Token refresh was firing after expiry\nWhat changes:  Refreshes OAuth token 60s prior to expiration\nLook at:       src/auth/jwt.ts: refreshTokenIfNeeded()\nVerified:      Full unit test suite passing (49/49)\nNot verified:  Network disconnect during refresh\nCost:          $0.42 across 1 attempt"
  }
}
```
