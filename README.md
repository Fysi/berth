# Berth

> **Agents write the code. Humans decide what lands.**

Berth is an agent-first Git platform built natively on Cloudflare Workers, Artifacts, Containers, and Durable Objects. It replaces human-to-human PR queues with an attempt-racing engine backed by linear Git history and evidence-backed human vouching.

---

## The Philosophy

- **Trunk is sacred:** Nobody—human or agent—pushes directly to trunk. Only the `MergeQueue` lands changes.
- **Attempts are cheap; evidence decides:** Parallel agents race on tasks in isolated Artifacts forks and container sandboxes.
- **Human attention is the scarce resource:** Reviewers read a strict 5-line, ≤80-word summary with mandatory "Not verified" disclosure.
- **History is for reading:** Zero merge commits on trunk. Changes land linearized server-side via `git replay --linearize`.
- **Customer Zero:** Berth is built on itself from day one. Every platform change is an attempted task vouched by a human.

## Documentation (Diátaxis Framework)

Berth documentation is structured using the [Diátaxis framework](https://diataxis.fr/) across four quadrants:
- **[Tutorials](docs/tutorials/first-task.md):** [Your First Task](docs/tutorials/first-task.md) (from intent to landed change in 10 minutes).
- **[How-To Guides](docs/how-to/deploy-platform.md):** [Deploy Berth on Cloudflare](docs/how-to/deploy-platform.md).
- **[Reference](docs/reference/mcp-tools.md):** [MCP Tool Schemas](docs/reference/mcp-tools.md), [Data Model](docs/reference/data-model.md), and [Git Plumbing](docs/reference/git-plumbing.md).
- **[Explanation](docs/explanation/why-trunk-is-sacred.md):** [Why Trunk is Sacred](docs/explanation/why-trunk-is-sacred.md) and [The Two-Record Model](docs/explanation/two-record-model.md).

Full index: [**docs/README.md**](docs/README.md).

---

## Autonomous Agent Team (`.agents/`)

- [`architect`](.agents/agents/architect/agent.md): Guards the manifesto and writes decision records.
- [`attempt-worker`](.agents/agents/attempt-worker/agent.md): Isolated sandbox attempt executor.
- [`git-steward`](.agents/agents/git-steward/agent.md): Git 2.56 plumbing operator and merge queue custodian.
- [`reviewer`](.agents/agents/reviewer/agent.md): Evidence auditor rejecting unverified AI claims.
- [`summariser`](.agents/agents/summariser/agent.md): Authors strict 5-line human summaries (≤80 words).
- [`doc-auditor`](.agents/agents/doc-auditor/agent.md): Enforces Diátaxis structure and technical documentation correctness.

---

## Quickstart (Under 15 Minutes)

### Prerequisites
- Node.js ≥ 22
- pnpm ≥ 10
- Git ≥ 2.45
- Cloudflare account with Workers Paid, Artifacts, and Containers enabled

### Installation & Test
```bash
# Clone the repository
git clone https://github.com/richa/berth.git
cd berth

# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Type check
pnpm run check
```

---

## License

[MIT](LICENSE)
