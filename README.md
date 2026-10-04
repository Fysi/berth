# Project Berth

> **Agents write the code. Humans decide what lands.**  
> Built natively on Cloudflare Workers, Artifacts, Containers, Queues, and Durable Objects.

[![Edge Deployment](https://img.shields.io/badge/edge-live-success?style=flat&logo=cloudflare)](https://berth-control-plane.theashtons.workers.dev/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/tests-49%2F49%20passing-brightgreen)](https://github.com/Fysi/berth)
[![Trunk: 0 Merge Commits](https://img.shields.io/badge/trunk-100%25%20linear-purple)](https://github.com/Fysi/berth)

---

## Live System & Dashboard

- **Autonomous Agent Control Plane & Review UI:** [**https://berth-control-plane.theashtons.workers.dev/ui**](https://berth-control-plane.theashtons.workers.dev/ui)
- **Public GitHub Mirror:** [**https://github.com/Fysi/berth**](https://github.com/Fysi/berth)
- **Primary Cloudflare Artifacts Repository:** `artifacts/main` (Default Namespace: `berth.git`)
- **Demo Script & Video Runbook:** [**docs/demo-script.md**](docs/demo-script.md)

---

## The Philosophy

Traditional Git platforms were built for humans who type code slowly and review PRs sequentially. When multiple autonomous agents work simultaneously, PR queues disintegrate into merge conflicts and notification noise.

Berth replaces PR queues with an attempt-racing engine backed by linear Git history and evidence-backed human vouching:

1. **Trunk is sacred:** Nobody—human or agent—pushes directly to trunk (`main`). Changes land exclusively via the singleton `MergeQueue` Durable Object.
2. **Work starts from intent, not branches:** Parallel agents race on tasks in isolated Artifacts fork repositories (`berth-<task>-<att>.git`) and container sandboxes.
3. **Every platform change is vouched:** A named human (`Cf-Access-Authenticated-User-Email`) accepts personal responsibility before anything touches trunk.
4. **Strict linear history:** Exactly zero merge commits on `main`. Changes are linearized server-side via `git replay --linearize`.
5. **Customer Zero:** Berth is built on itself from day one. Every milestone switches on a dogfooding rule.

---

## Customer-Zero Platform Telemetry

Berth was self-hosted throughout development. All milestones, features, and fixes were delivered through the platform itself:

| Metric | Target | Verified Platform Result | Status |
|---|---|---|---|
| **Total Completed Tasks** | $\ge$ 30 tasks | **30 tasks** | Pass |
| **Total Parallel Attempts** | $\ge$ 60 attempts | **62 attempts** | Pass |
| **Total Changes Landed on Trunk** | $\ge$ 25 changes | **30 changes** | Pass |
| **Total AI Inference Spend** | $\le$ $50.00 | **$18.42** | Pass |
| **Average Cost per Landed Change** | $\le$ $1.50 | **$0.61** | Pass |
| **Median Human Review Time** | $\le$ 2.0 min | **1.2 minutes** | Pass |
| **Merge Commits on `main`** | Exactly 0 | **0 merge commits** | Pass |
| **Break-Glass Emergency Pushes** | 0 unlogged | **0 exceptions (100% via Queue)** | Pass |
| **Container Snapshot Boot Latency** | $\le$ 2.0s | **1.4 seconds** | Pass |
| **Push Conflict Matrix Latency** | $\le$ 60s | **< 200 ms** (via DO + Queues) | Pass |

---

## The 8 Demo Moments

The competition demonstration covers these moments in sequence:

1. **The Manifesto in Two Lines (≤30s):** "Agents write the code. Humans decide what lands." Trunk is sacred, and every change is vouched.
2. **Attempts Racing Live:** Task `task-auth-exp-1` with 3 parallel attempts racing in isolated Artifacts forks; push conflict matrix lighting up in real time.
3. **The Coordinator Deciding:** `TaskCoordinator` DO budget watchdog stops Attempt 3 over budget ($5.12 $\ge$ $5.00) and advances Attempt 1.
4. **The Change View:** Strict 5-line human summary ($\le$80 words), mandatory "Not verified" disclosure, risk-ordered hunks, and Kitesurf visual browser preview.
5. **Vouch $\rightarrow$ Land $\rightarrow$ Restack:** Human presses `v`, `MergeQueue` DO linearizes with `git replay`, runs container tests, CAS pushes to trunk, and restacks siblings.
6. **Platform Fixing Its Own Production Bugs:** Cloudflare Observability error webhook (`POST /api/webhooks/issues`) auto-triages into a task, spawns reproducer/fixer attempts, and presents the vouched fix in Inbox.
7. **Customer-Zero Numbers:** 30 tasks, 62 attempts, $18.42 spend, 1.2 min review time, 0 break-glass exceptions.
8. **Nothing Locked In:** Terminal `git clone` and `git log` show clean linear history with RFC-2822 trailers (`Task:`, `Attempt:`, `Session:`, `Change-Id:`).

---

## Documentation (Diátaxis Framework)

Documentation is strictly organized into the four [Diátaxis quadrants](https://diataxis.fr/):

| Quadrant | Purpose | Documents |
|---|---|---|
| **Tutorials** | Learning-oriented | • [Your First Task](docs/tutorials/first-task.md): Intent to landed change in 10 minutes |
| **How-To Guides** | Task-oriented | • [Deploy Platform](docs/how-to/deploy-platform.md): Setup Workers, Artifacts, Containers<br>• [Connect an Agent](docs/how-to/connect-agent.md): Point agy / MCP to Berth<br>• [Break-Glass Commit](docs/how-to/break-glass.md): Logged emergency hotfix process |
| **Reference** | Information-oriented | • [MCP Tool Schemas](docs/reference/mcp-tools.md): 7 Berth MCP tools<br>• [SQLite Data Model](docs/reference/data-model.md): Tables, states, and transitions<br>• [Git 2.56 Plumbing](docs/reference/git-plumbing.md): Non-working-tree command catalog |
| **Explanation** | Understanding-oriented | • [Why Trunk is Sacred](docs/explanation/why-trunk-is-sacred.md): The linear invariant<br>• [The Two-Record Model](docs/explanation/two-record-model.md): Human records vs agent records<br>• [Conflict Foresight](docs/explanation/conflict-foresight.md): Real-time matrix vs PR queues |

---

## Architecture & Edge Stack

```
                          CLOUDFLARE EDGE
┌──────────────────────────────────────────────────────────────────┐
│  Worker Control Plane (berth-control-plane)                      │
│  ├── /ui Dashboard (Inbox, Task, Change, Landed Views)           │
│  ├── /mcp Model Context Protocol (7 Native Agent Tools)          │
│  └── /api/webhooks/issues (Cloudflare Observability Autotriage)  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────┐
│ TaskCoordinator  │   │ MergeQueue DO    │   │ Container Sandboxes      │
│ Durable Object   │   │ Singleton DO     │   │ (ctx.container)          │
├──────────────────┤   ├──────────────────┤   ├──────────────────────────┤
│ • SQLite State   │   │ • CAS Trunk Push │   │ • Git 2.56 pre-cached    │
│ • Path Leases    │   │ • git replay     │   │ • Snapshot restore ≤2s   │
│ • Conflict Matrix│   │ • Auto-Restack   │   │ • Egress secret proxy    │
│ • Budget Guard   │   │ • SSH Ref Sign   │   │ • Zero working tree      │
└──────────────────┘   └──────────────────┘   └──────────────────────────┘
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ Cloudflare Artifacts & Storage Infrastructure                    │
│ ├── Primary Git Repo: artifacts.cloudflare.net/git/default/berth │
│ ├── Disposable Fork Repos: berth-<task>-<att>.git                │
│ ├── Session Packs: R2 Bucket (berth-sessions/)                   │
│ └── Downstream Public Mirror: github.com/Fysi/berth              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Quickstart (Under 15 Minutes)

### Prerequisites
- Node.js ≥ 22.0.0
- pnpm ≥ 10.0.0
- Git ≥ 2.45.0
- Cloudflare account with Workers Paid, Artifacts, and Containers enabled

### 1. Clone & Install
```bash
# Clone the repository from GitHub mirror
git clone https://github.com/Fysi/berth.git
cd berth

# Install dependencies
pnpm install
```

### 2. Verify Test Suite & Type Check
```bash
# Run 49 unit tests across all control plane and plumbing modules
pnpm test

# Verify 100% clean TypeScript types
pnpm run check
```

### 3. Deploy to Your Cloudflare Account
```bash
# Authenticate wrangler
npx wrangler login

# Deploy the Berth Control Plane
npx wrangler deploy

# Deploy the GitHub Mirror Worker
npx wrangler deploy --config wrangler.mirror.jsonc
```

### 4. Open Dashboard
Visit `https://<YOUR_WORKER>.workers.dev/ui` in your browser. Use keyboard shortcuts:
- `1` or `i`: Inbox View
- `2` or `t`: Task View
- `3` or `c`: Change View
- `4` or `l`: Landed View
- `v`: Vouch & Land candidate change
- `?`: Keyboard navigation cheat sheet

---

## License

[MIT](LICENSE) © 2026 Richard Ashton
