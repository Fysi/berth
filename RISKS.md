# Project Berth: Top Ten Architecture & Delivery Risks

> **Binding Reference:** [TARGETS.md](file:///C:/Users/richa/dev/berth/TARGETS.md) and [MANIFESTO.md](file:///C:/Users/richa/dev/berth/MANIFESTO.md).  
> **Status as of:** 4 October 2026

Every high-severity risk is paired with a concrete mitigation strategy and a time-boxed spike scheduled during the first half of the project.

---

## Risk Summary Matrix

| # | Risk Area | Likelihood | Impact | Mitigation Strategy | Spike Required |
|---|---|---|---|---|---|
| 1 | **Git 2.56 in Container Image** | High | High | Multi-stage Dockerfile compiling Git 2.56.0 from source; pre-warm image digest in Wrangler. | **Spike 1 (2.0 hrs, Sun 4 Oct)** |
| 2 | **Artifacts Event Latency & Ordering** | Medium | High | Idempotent queue consumers with sequence monotonic checks; fallback polling on push ack. | **Spike 2 (1.5 hrs, Mon 5 Oct)** |
| 3 | **Fork & Operation Costs at Demo Scale** | Low | Medium | Free tier until Oct 14; proactive fork deletion lifecycle after attempt resolution. | **Spike 3 (1.0 hr, Tue 6 Oct)** |
| 4 | **Snapshot & Restore Behavior** | Medium | High | Pre-warmed base container snapshot; graceful fallback to fresh container boot (`start({ image })`). | **Spike 4 (2.0 hrs, Sun 11 Oct)** |
| 5 | **CAS Retries Under Concurrent Landings** | Medium | High | Serialized execution via singleton `MergeQueue` DO; exponential backoff retry loop (max 3). | **Spike 5 (1.5 hrs, Wed 7 Oct)** |
| 6 | **Lock-out During Self-Hosting** | Low | Critical | Dual-deployment topology (Stable instance vs Dev instance); logged break-glass GitHub mirror. | **Spike 6 (1.5 hrs, Sun 4 Oct)** |
| 7 | **Workers Builds Previews for Forks** | High | High | Ephemeral branch mirroring (`preview/task-N-att-M`) to trunk repo; or `wrangler versions upload` alias. | **Spike 7 (2.0 hrs, Mon 5 Oct)** |
| 8 | **Secret Injection & HTTPS Egress Interception** | Medium | High | Install Cloudflare Container CA cert (`cloudflare-containers-ca.crt`); Worker egress proxy. | **Spike 8 (1.5 hrs, Tue 6 Oct)** |
| 9 | **Container Inactivity Timeout & DO Eviction** | Medium | Medium | Explicit `setInactivityTimeout(600_000)` on container start and constructor; DO alarm heartbeats. | **Spike 9 (1.0 hr, Tue 6 Oct)** |
| 10 | **AI Gateway Cost Attribution Latency** | Low | Medium | Client-side token estimation in MCP tool `report_cost` reconciled against AI Gateway metadata logs. | **Spike 10 (1.0 hr, Sun 11 Oct)** |

---

## Detailed Risk Assessments & Spikes

### 1. Git 2.56 Availability in Cloudflare Container Image
- **Risk:** Berth depends strictly on Git 2.56 features (`git replay --linearize`, `git add --resolved`, `git bisect --reset-when-found`, `git branch --delete-merged`). Debian Trixie packaged Git is 2.47.x. If the container lacks 2.56, linear landing and safe staging fail completely.
- **Mitigation:**
  - Create a custom `Dockerfile` based on `cloudflare/debian-trixie` that compiles Git 2.56.0 from the official release tarball (`git-2.56.0.tar.gz`) with build optimizations (`NO_TCLTK=1`, `NO_GETTEXT=1`).
  - Add an automated startup check in the Git Steward container: `git --version` must parse ≥ 2.56.0, failing fast if violated.
- **Time-Boxed Spike (2.0 hrs, Sun 4 Oct):** Build image locally via Docker, verify all four Git 2.56 flags in a container shell, declare image in `wrangler.jsonc`, and verify container boot via `ctx.container.start()`.

### 2. Artifacts Event Latency and Delivery Ordering
- **Risk:** Push events delivered via Cloudflare Queues (`cf.artifacts.repo.pushed`) are at-least-once and not guaranteed strictly FIFO. Out-of-order delivery could trigger outdated conflict matrix updates or stale human summaries.
- **Mitigation:**
  - Queue consumer in `TaskCoordinator` inspects `payload.after` commit SHA against the attempt fork's current ref state (`repo.log({ limit: 1 })`).
  - Stale events (where `payload.after` is an ancestor of the currently recorded head) are discarded as no-ops.
  - Set queue batch timeout to 5 seconds (`max_batch_timeout = 5`) to satisfy the median ≤60s conflict matrix update target.
- **Time-Boxed Spike (1.5 hrs, Mon 5 Oct):** Measure end-to-end push-to-queue consumer latency on a test Artifacts repo across 10 sequential pushes.

### 3. Fork and Operation Costs at Demo Scale
- **Risk:** Creating ~100 disposable forks and issuing thousands of Git smart HTTP fetches during testing and recording could exceed free usage limits or incur excessive cost.
- **Mitigation:**
  - Cloudflare official pricing documentation confirms: **Artifacts billing starts on October 14, 2026**. Operations are completely free during beta prior to the competition deadline.
  - Implement strict automated lifecycle management: `TaskCoordinator` immediately calls `repo.delete()` on any discarded attempt fork as soon as a winning change lands on trunk.
  - Retain only the winning change commit in trunk history; upload discarded session context to R2.
- **Time-Boxed Spike (1.0 hr, Tue 6 Oct):** Verify programmatic fork creation and immediate deletion rate limits (2,000 requests per 10 seconds per namespace).

### 4. Container Snapshot and Restore Behavior Across DOs
- **Risk:** While container filesystem snapshots capture the root filesystem, they do not capture memory or active background processes. If an attempt expects pre-started background daemons, restore will fail silently.
- **Mitigation:**
  - Restored snapshots explicitly execute their entrypoint again (`start({ containerSnapshot })`). Design attempt container entrypoint as an idempotent supervisor script that attaches to the filesystem state without assuming active daemon PIDs.
  - Verify snapshot IDs are persisted into Durable Object SQLite storage. Provide a fallback: if `containerSnapshot` fails to restore within 3 seconds, immediately fall back to cold boot `start({ image })`.
- **Time-Boxed Spike (2.0 hrs, Sun 11 Oct):** Measure cold boot vs snapshot restore latency on `berth-container`, verifying the target of ≤ 2.0s median boot.

### 5. Compare-and-Swap (CAS) Retries Under Concurrent Landings
- **Risk:** When multiple tasks land concurrently, two changes may pass testing against the same trunk `HEAD`. The second push will fail compare-and-swap (`--force-with-lease` rejected), causing landing delays.
- **Mitigation:**
  - The singleton `MergeQueue` Durable Object completely serializes the landing step: only ONE change is actively linearized, tested, and pushed at any single moment.
  - If trunk advances due to an external push or mirror reconciliation, the queue retries the landing loop (re-running `merge-tree` and `replay --linearize`) up to 3 times before requeuing.
- **Time-Boxed Spike (1.5 hrs, Wed 7 Oct):** Simulate concurrent landings by pushing 3 parallel linearized commits sequentially through `MergeQueue` and measuring CAS retry resilience.

### 6. Lock-out During Self-Hosting (Customer Zero)
- **Risk:** Because Berth is hosted on itself, a broken commit landed on `main` could deploy a faulty control plane Worker, breaking the merge queue and preventing further fixes from landing.
- **Mitigation:**
  - **Dual-Instance Topology:** Maintain a `berth-stable` Worker instance (pinned to last known-good Workers Version tag) alongside the development instance `berth-dev`.
  - **Workers Rollbacks:** Enable instant version rollbacks via `wrangler rollback` or the Cloudflare Dashboard.
  - **Break-Glass GitHub Mirror:** If the Artifacts control plane is unreachable, emergency fixes can be pushed to GitHub `main`. The sync Worker detects the push and logs an explicit `Exception` record in the permanent audit trail.
- **Time-Boxed Spike (1.5 hrs, Sun 4 Oct):** Test emergency rollback procedure using `wrangler rollback` and test GitHub mirror break-glass logging.

### 7. Workers Builds Previews for Attempt Forks
- **Risk:** Workers Builds natively triggers previews for non-production branches inside a single repository, but attempts live in separate **forks** (`berth-task-N-att-M`), which Workers Builds does not auto-build.
- **Mitigation:**
  - Primary path: When an attempt pushes, the coordinator pushes a temporary ref `refs/previews/task-N-att-M` directly into the main repository (or the attempt container runs `wrangler versions upload --preview-alias task-N-att-M` via egress proxy).
  - Browser Run Kitesurf targets this preview alias URL to capture evidence.
- **Time-Boxed Spike (2.0 hrs, Mon 5 Oct):** Evaluate `wrangler versions upload` vs pushing an ephemeral branch to trunk repo for preview URL generation.

### 8. Secret Injection & HTTPS Egress Interception in Containers
- **Risk:** Agents must use `secret://<name>` placeholders without seeing raw credentials. Intercepting outbound HTTPS requests from containers via `interceptOutboundHttps` requires trusting the Cloudflare container CA certificate.
- **Mitigation:**
  - Inject `/etc/cloudflare/certs/cloudflare-containers-ca.crt` into the system trust store of the container base image during Docker build (`update-ca-certificates`).
  - Worker egress handler intercepts outgoing requests to `api.openai.com` / `api.anthropic.com` / `ai-gateway`, replaces `Authorization: Bearer secret://openai` with actual keys stored in Worker secrets, and forwards requests.
- **Time-Boxed Spike (1.5 hrs, Tue 6 Oct):** Verify HTTPS interception and header rewriting from within a test DO container.

### 9. Container Inactivity Timeout & Durable Object Memory Limits
- **Risk:** Durable Objects running containers may be evicted from memory if inactive, or container output streams may exhaust DO memory limits (128 MB default).
- **Mitigation:**
  - Set explicit inactivity timeout: `await this.ctx.container.setInactivityTimeout(600_000)` (10 minutes) on container startup and re-assert in DO constructor.
  - Never buffer full process output into DO memory with unbounded `output()`. Stream stdout/stderr directly or redirect to local container disk `/tmp/output.log`.
- **Time-Boxed Spike (1.0 hr, Tue 6 Oct):** Verify container persistence across DO sleep/wake cycles with 10-minute inactivity timeout.

### 10. AI Gateway Cost Attribution Latency
- **Risk:** AI Gateway logs and cost figures may have aggregation latency (up to several minutes), delaying the cost display on the Change view.
- **Mitigation:**
  - Implement a dual-accounting model:
    1. Fast estimation: Attempt worker estimates token cost immediately via MCP tool `report_cost`.
    2. Authoritative reconciliation: Background Worker polls AI Gateway Logs API matching `metadata.taskId` and `metadata.attemptId` to lock in exact billed figures.
- **Time-Boxed Spike (1.0 hr, Sun 11 Oct):** Measure AI Gateway log availability latency when querying by custom metadata headers.
