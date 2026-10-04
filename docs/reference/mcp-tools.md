# Reference: Model Context Protocol (MCP) Tools

This reference provides the technical specifications, parameter schemas, and response formats for the 7 standard MCP tools exposed by Berth at `/tools` and `/sse`.

---

## 1. `claim_task`
Provisions an isolated Artifacts fork and container sandbox for a new attempt.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `task_id` | `string` | **Yes** | Unique identifier of the task to claim. |
| `agent_name` | `string` | **Yes** | Identifier or name of the claiming agent. |

### Return Payload
```json
{
  "attempt_id": "att-1",
  "fork_repo_name": "berth-task-001-att-1",
  "fork_remote": "https://<acc>.artifacts.cloudflare.net/git/default/berth-task-001-att-1.git",
  "token": "art_v1_...<token-secret>?expires=...",
  "budget_remaining_usd": 4.58
}
```

---

## 2. `get_context_pack`
Fetches intent, current leases, trunk HEAD SHA, and prior attempt notes.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |

---

## 3. `request_lease`
Requests exclusive temporary lease on path patterns.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |
| `paths` | `string[]` | **Yes** | Array of file paths or glob patterns (e.g. `["src/auth/**"]`). |
| `duration_seconds` | `integer` | No | Lease duration in seconds (default: 1800). |

---

## 4. `propose`
Proposes an attempt's commit for human review with verified evidence.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |
| `commit_sha` | `string` | **Yes** | The commit SHA in the attempt's fork. |
| `evidence_ids` | `string[]` | **Yes** | List of evidence IDs proving claims. |

---

## 5. `escalate`
Blocks execution and escalates a single specific question to a human owner.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |
| `question` | `string` | **Yes** | Specific, unambiguous question for the human. |
| `options` | `string[]` | No | Optional array of alternative solutions considered. |

---

## 6. `report_cost`
Reports model token usage and estimated inference cost.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |
| `cost_usd` | `number` | **Yes** | Incremental dollar cost. |
| `tokens_in` | `integer` | No | Input tokens consumed. |
| `tokens_out` | `integer` | No | Output tokens generated. |
| `model` | `string` | No | Model identifier (e.g. `cloudflare/auto`). |

---

## 7. `report_friction`
Logs platform tooling friction or bugs directly to the friction backlog.

### Input Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | `string` | **Yes** | The active attempt identifier. |
| `obstacle` | `string` | **Yes** | Description of the friction or bug encountered. |
| `command_or_tool` | `string` | No | Tool or command that caused friction. |
| `suggested_fix` | `string` | No | Proposed platform improvement. |
