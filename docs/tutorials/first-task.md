# Tutorial: Your First Task in Berth

In this tutorial, you will state an intent, watch parallel agents race on isolated attempts, inspect an evidence-backed human summary, and vouch to land the change on trunk.

**Time required:** ~10 minutes.

---

## 1. State Your Intent

In Berth, you never create or name a branch. You state a task.

Run the following command to submit a task to the coordinator:
```bash
curl -X POST https://berth-control-plane.workers.dev/api/tasks/task-001 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add health check endpoint",
    "intent": "We need a /healthz endpoint returning status 200 and version",
    "ownerEmail": "you@example.com",
    "budgetUsd": 3.00
  }'
```

The `TaskCoordinator` Durable Object initializes the task state to `Intent`.

---

## 2. Watch Attempts Race

Once the task is submitted, 3 attempt workers claim the task concurrently via the MCP tool `claim_task`:
- **Attempt 1:** Provisions fork `berth-task-001-att-1` and sandbox.
- **Attempt 2:** Provisions fork `berth-task-001-att-2` and sandbox.
- **Attempt 3:** Provisions fork `berth-task-001-att-3` and sandbox.

Each attempt works in isolation and pushes to its own fork.

---

## 3. Real-Time Conflict Foresight

As Attempt 1 and Attempt 2 push their candidate commits:
1. Cloudflare Queues receives `cf.artifacts.repo.pushed`.
2. The `TaskCoordinator` runs `git merge-tree --write-tree` in the background.
3. The live conflict matrix in the Task view updates in **≤ 60 seconds**, showing whether the attempts diverge cleanly or collide on file hunks.

---

## 4. Review the 5-Line Human Record

When Attempt 2 passes its test suite and attaches proof, the coordinator transitions the task to `Proposed`.

Open the **Change View** in the UI. You will see the strict 5-line manifesto summary:
```
Why:           Production monitoring lacks a fast health check ping endpoint.
What changes:  Exposes /healthz returning HTTP 200 with system uptime and version.
Look at:       src/control-plane/index.ts: handleHealth() route.
Verified:      Unit test suite (5 passing), Kitesurf screenshot of /healthz response.
Not verified:  Underlying database failover behavior during health probe.
Cost:          $0.42 across 3 attempts
```

Notice:
- Total length is under **80 words**.
- "Not verified" clearly states what wasn't checked.
- Total cost includes the 2 discarded attempts.

---

## 5. Vouch and Land

1. Press **`v`** or click **Vouch**.
2. The `MergeQueue` DO takes the change, executes `git replay --linearize` onto trunk, re-verifies in a container, appends `Vouched-by: You <you@example.com>`, and performs an atomic compare-and-swap ref update to `main`.
3. Open `git log --oneline` on trunk:
   - Your change is now on `main` as a clean linear commit.
   - Zero merge commits exist on trunk.
   - Sibling attempts are automatically restacked or cleanly closed.

**Congratulations! You have completed your first lifecycle loop on Berth.**
