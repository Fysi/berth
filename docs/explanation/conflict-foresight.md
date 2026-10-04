# Explanation: Conflict Foresight & Attempt Racing

> **Diátaxis Mode:** Explanation (Understanding-oriented)  
> **Source of Truth:** [`src/durable-objects/TaskCoordinator.ts`](file:///C:/Users/richa/dev/berth/src/durable-objects/TaskCoordinator.ts)

---

## 1. Why Pull Requests Fail Autonomous Agents

Traditional Git platforms rely on **Pull Requests** (PRs). A developer (or agent) creates a branch, makes changes over hours or days, and opens a PR. The mergeability of that branch is checked only at the moment of PR creation or review.

When multiple autonomous agents work concurrently, this model breaks down completely:
1. **Late Conflict Discovery:** Agent B discovers after 30 minutes of inference and $5 in tokens that Agent A modified the same utility function 20 minutes ago.
2. **Review Bottlenecks:** Human reviewers are flooded with 10 PRs competing for the same trunk state.
3. **Merge Queue Collisions:** Changes land sequentially, causing later PRs to constantly rebase and re-trigger flaky CI.

---

## 2. Real-Time Conflict Foresight

Berth replaces pull requests with **Attempt Racing** and **Real-Time Conflict Foresight**.

### How It Works:
```
           Push to Attempt Fork
                    │
                    ▼
      Cloudflare Queues Event
   (cf.artifacts.repo.pushed)
                    │
                    ▼
          TaskCoordinator DO
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
3-Way Tree Check vs Trunk     Pairwise Check vs Sibling Attempts
(git merge-tree --write-tree) (Path Leases + Tree Comparison)
       │                         │
       └────────────┬────────────┘
                    ▼
        Push Conflict Matrix
    (Clean | File Conflict | Hunk Conflict)
                    │
                    ▼
    Instant WebSocket Broadcast (<60s)
```

1. **Path Leases:** Before touching files, an attempt requests an advisory path lease (e.g. `src/auth/*`). If another attempt holds that lease, the coordinator warns or redirects the agent.
2. **Push Event Ingestion:** As soon as an attempt pushes a commit to its Artifacts fork, Cloudflare Queues notifies the `TaskCoordinator`.
3. **Instant Matrix Computation:** The coordinator runs `git merge-tree` against current trunk `HEAD` and pairwise across all active attempts for the task.
4. **Broadcast to Reviewers:** Connected web dashboards and agent harnesses receive live WebSocket events lighting up the conflict matrix in real time.

If two attempts collide, the coordinator or reviewer intervenes *immediately*—stopping the redundant attempt before budget is wasted, rather than discovering the collision at review time.
