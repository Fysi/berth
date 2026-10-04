# Targets

*What "done" means, and by when. Read with `MANIFESTO.md`.*

## North star

**Show that a team can let many agents work on one codebase at once, while humans read less, decide better, and stay accountable for everything that lands.**

The competition entry has to make that obvious within the first two minutes of the video.

---

## Competition targets

| Target | Detail |
|---|---|
| Submit by | **Tuesday 13 October 2026** (deadline is Wednesday 14 October) |
| Video | 7–9 minutes (the limit is 5–10) |
| Licence | MIT |
| Source | Public GitHub mirror of the Artifacts repo |
| Setup | From clone to first running task in **under 15 minutes**, following the README |
| Judging bar | Several agents visibly working on changes **concurrently** |

---

## Milestones

| Milestone | Done by | Exit criteria | Dogfooding rule that turns on |
|---|---|---|---|
| **M0 Home** | Fri 2 Oct | Platform repo lives in Artifacts; GitHub mirror updates on push; Workers Builds deploys trunk and gives other branches Previews | All code lives in Artifacts |
| **M1 Record** | Sat 3 Oct | An agy hook adds `Task:`, `Attempt:`, `Session:` and `Change-Id:` trailers and uploads session context | Every commit names its session |
| **M3 Attempts** | Sun 4 Oct | Coordinator Durable Object per task; at least 3 concurrent attempts in separate forks; MCP tools working from agy | All work starts as a task |
| **M2 Land** | Tue 6 Oct | Merge queue lands with merge-tree → `replay --linearize` → tests → compare-and-swap; restacks other attempts; only the queue can write to trunk | Nobody pushes to trunk |
| **M4 Review** | Thu 8 Oct | Conflict matrix updates on push; human summaries in manifesto format; Inbox, Task, Change and Landed views; vouching required to land | Every platform change is vouched |
| **M5 Close the loop** | Fri 9 Oct | Attempts start from snapshots; cost shown per change; a production Issue on the platform becomes a task automatically | The platform fixes its own production bugs |
| **Polish** | Sun 11 Oct | Kitesurf evidence, README, customer-zero stats, demo task rehearsed | — |
| **Video** | Mon 12 Oct | Recorded and edited | — |
| **Submit** | Tue 13 Oct | Submitted; Wednesday is buffer | — |

M3 comes before M2 deliberately: the queue needs real attempts to test against. Until M2 is done, trunk is protected by convention, and every direct push goes in the friction log.

---

## Product targets

These are targets to measure ourselves against, not promises. Record the real numbers. They go in the README and the video.

| Area | Target | How we measure it |
|---|---|---|
| Concurrency | ≥ 3 attempts running at once on one task in the demo | Coordinator state |
| Conflict foresight | Conflict matrix updated ≤ 60 s (median) after a push | Push event time vs matrix update time |
| Summary latency | Human summary ready ≤ 3 min after a push | Push event time vs summary time |
| Sandbox start | Attempt sandbox ready ≤ 2 s (median) from snapshot | Container start timings |
| Summary length | 100% of human summaries ≤ 80 words, with a "Not verified" line | Validated when the summary is written |
| Signal over noise | 0 unverified AI findings in any human view | Findings without evidence are rejected by the data model |
| Trunk integrity | 0 unlogged direct pushes to trunk after M2 | Ref update audit vs queue log |
| Provenance | 100% of commits landed after M4 carry trailers and a `Vouched-by` | `git log` check in CI |
| Cost | 100% of changes show their cost after M5 | Change view |
| Review effort | Median human review ≤ 5 min per change | Time from opening a change to vouching |
| History | 0 merge commits on trunk | `git log --merges` on trunk |

---

## Customer-zero targets

| Target | Detail |
|---|---|
| Built on itself | ≥ 90% of platform changes land through the platform from Wed 7 Oct |
| Volume | ≥ 30 tasks and ≥ 60 attempts through the platform before recording |
| Friction | Every friction-log entry is triaged into a task, or closed with a reason |
| Exceptions | Every break-glass use has a written reason; the total is shown in the README |
| Stats for the video | Tasks, attempts, landed changes, total cost, cost per landed change, median human minutes per change, exception count |

---

## Demo moments

The video should hit these in order:

1. **The manifesto in two lines** (≤ 30 s): "Agents write the code. Humans decide what lands." Then the two rules that make it true: nobody pushes to trunk, and every change has a human who vouched for it.
2. **Attempts racing:** one task, three agents working at once, with the conflict matrix lighting up as they push.
3. **The coordinator deciding:** for example, "Stopped attempt 3: over budget. Building on attempt 2."
4. **The Change view:** the five-line human summary (including cost), risk-ordered hunks, a Kitesurf screenshot as evidence.
5. **Vouch → land:** the change lands, the other attempts restack themselves, and the Landed view updates.
6. **The platform fixing itself:** a real production error on the platform becomes a task, then a landed fix.
7. **Customer-zero numbers:** "Built on itself: N tasks, M attempts, £X, Y human minutes per change."
8. **Nothing locked in:** `git clone` and `git log` show clean linear history with trailers.

---

## Stretch (only if the milestones are done early)

- Semantic conflict warnings from a lightweight tree-sitter symbol overlay
- Review caching by `git patch-id` shown in the demo (restacked change skips re-review)
- Rubber-stamp detection in the Inbox
- `--bundle-uri` clones from R2
- Human summaries in the reviewer's language

## Not this round

Ory or another identity server · sovereign mode · Basin analytics · K2 · Forge · a full code graph · custom workflow states · GitHub feature parity.
