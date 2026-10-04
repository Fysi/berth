# Berth Documentation (Diátaxis Framework)

Berth documentation is structured according to the [Diátaxis framework](https://diataxis.fr/), separating technical content into four distinct modes to serve different user needs:

```
                  PRACTICAL STEPS
                        ▲
                        │
       Tutorials        │       How-To Guides
   (Learning-oriented)  │     (Task-oriented)
                        │
LEARNING ───────────────┼─────────────── WORKING
                        │
       Explanation      │         Reference
 (Understanding-oriented)│   (Information-oriented)
                        │
                        ▼
                THEORETICAL KNOWLEDGE
```

---

## 1. [Tutorials (Learning)](tutorials/first-task.md)
*Guided learning for newcomers.*
- **[Your First Task](tutorials/first-task.md):** From intent to parallel attempts, review, vouching, and landed change in under 15 minutes.

## 2. [How-To Guides (Problem-Solving)](how-to/deploy-platform.md)
*Practical step-by-step recipes for real-world tasks.*
- **[Deploy Berth on Cloudflare](how-to/deploy-platform.md):** Stand up the Workers control plane, Artifacts repository, Queues, and Containers.
- **[Connect an Agent via MCP](how-to/connect-agent.md):** How to point agy, Claude Code, or custom harnesses to Berth.
- **[Handle an Emergency Break-Glass](how-to/break-glass.md):** The logged exception process for external emergency commits.

## 3. [Reference (Information)](reference/mcp-tools.md)
*Technical facts, schemas, APIs, and command catalogs.*
- **[MCP Tool Schemas](reference/mcp-tools.md):** Complete JSON-RPC schemas for all 7 Berth tools.
- **[SQLite Data Model](reference/data-model.md):** Full database tables and state machine transitions.
- **[Git 2.56 Plumbing Catalog](reference/git-plumbing.md):** Server-side non-working-tree command reference.

## 4. [Explanation (Understanding)](explanation/why-trunk-is-sacred.md)
*Architectural reasoning, principles, and design trade-offs.*
- **[Why Trunk is Sacred](explanation/why-trunk-is-sacred.md):** The rationale behind linear history and zero merge commits.
- **[The Two-Record Model](explanation/two-record-model.md):** Human records (≤80 words) vs. infinite agent session logs.
- **[Conflict Foresight & Attempt Racing](explanation/conflict-foresight.md):** How real-time `git merge-tree` matrices replace PR review bottlenecks.
