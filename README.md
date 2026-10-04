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

For full principles, see [MANIFESTO.md](MANIFESTO.md).  
For delivery milestones and metrics, see [TARGETS.md](TARGETS.md).

---

## Architecture at a Glance

- **TaskCoordinator (Durable Object):** One DO per task. Manages leases, budgets, and attempt state.
- **MergeQueue (Durable Object):** Singleton DO holding exclusive write credentials to trunk.
- **Git Steward (Container):** Runs Git ≥ 2.56 inside Cloudflare Containers (`ctx.container`) for non-working-tree operations (`git merge-tree --write-tree`, `git replay --linearize`).
- **Artifacts:** Repositories and forks live in Cloudflare Artifacts. Real-time push events route through Cloudflare Queues.
- **Evidence Verification:** Passing test suites, reproductions, and Kitesurf screenshot captures via Browser Run.
- **Model Routing:** Exploration and human summaries run through Cloudflare AI Gateway (`cloudflare/auto`).

See [ARCHITECTURE.md](ARCHITECTURE.md) and [PLAN.md](PLAN.md) for full technical designs.

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
