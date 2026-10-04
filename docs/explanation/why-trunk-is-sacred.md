# Explanation: Why Trunk is Sacred

> *"Nobody, human or agent, pushes to trunk directly. Only the queue lands changes."* — [MANIFESTO.md](file:///C:/Users/richa/dev/berth/MANIFESTO.md)

---

## The Failure of PR Bureaucracy in the Age of Agents

In traditional software development, Git pull requests served as a human handoff protocol. Because writing code was expensive, humans batched hundreds of lines of code into large branches, opened PRs, and waited days for peer review.

In an agent-first world, that dynamic reverses:
- **Writing code is cheap:** An autonomous agent can produce hundreds of lines of code in seconds.
- **Reading code is scarce:** Human reviewers are flooded with AI-generated diffs, bloated descriptions, and conflicting branches.

When multiple autonomous agents push branches simultaneously to a shared repository, traditional PR workflows collapse under merge conflicts, stale rebases, and phantom regressions.

---

## The Principle of the Sacred Trunk

Berth adopts a strict architectural invariant: **Trunk is sacred.**

### 1. No Human or Agent Holds a Trunk Write Token
In Berth, write access to trunk (`main`) is not given to individual developers, team leads, or agents. The write token is held exclusively by a single entity: the **`MergeQueue` Durable Object**.

### 2. Zero Merge Commits
Merge commits (`git merge`) destroy history readability. They obscure when bugs were introduced, create duplicate diffs, and make `git bisect` difficult.
In Berth, every change lands as **clean linear history** via server-side flattening:
```sh
git replay --linearize --onto trunk_head attempt_head
```
A `git log --merges` on trunk returns **0**.

### 3. Vouching as the Sole Gateway
Because agents can generate infinite code, the platform requires a named human to vouch for every change. Vouching is not "rubber-stamping"; it is a human accepting personal responsibility for a verified 5-line summary.

### 4. Continuous Foresight Over Late Resolution
Traditional platforms wait until merge time to reveal conflicts. Berth computes a **real-time conflict matrix across all running attempts on every push**. If two attempts diverge, the coordinator detects it immediately, reassigning path leases or restacking in memory before human attention is ever requested.
