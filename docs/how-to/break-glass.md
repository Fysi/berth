# How-To: Handle an Emergency Break-Glass Commit

> **Diátaxis Mode:** How-To Guide (Task-oriented)  
> **Source of Truth:** [`src/mirror/index.ts`](file:///C:/Users/richa/dev/berth/src/mirror/index.ts) and [`MANIFESTO.md § Rule 1`](file:///C:/Users/richa/dev/berth/MANIFESTO.md)

Under normal operating conditions, **nobody pushes directly to trunk**. All changes must land via the `MergeQueue` Durable Object.

However, in extreme production emergencies (e.g. control plane Worker crashed, edge DNS poisoned, credentials compromised), an engineer may need to execute a **Break-Glass Emergency Push** directly to the public GitHub mirror.

This guide outlines the protocol, audit logging, and post-incident reconciliation.

---

## 1. When Break-Glass is Permitted

Break-glass is authorized ONLY when:
1. The Berth control plane edge is completely unreachable and cannot process requests.
2. Immediate mitigation is required to protect user data or restore core availability.
3. The engineer understands that an unlogged push breaks the linear provenance chain.

---

## 2. Executing the Emergency Push

Push directly to the public GitHub repository:

```bash
# Push hotfix directly to github trunk
git push github main
```

---

## 3. Automated Reconciliation & Audit Ingestion

As soon as the GitHub mirror Worker (`wrangler.mirror.jsonc`) or the primary control plane detects an out-of-band commit on `main`:

1. **Audit Table Event:** A record is inserted into the `friction_logs` and `decision_logs` tables:
   ```json
   {
     "event": "BreakGlassDirectPushDetected",
     "sha": "9f8e7d6c",
     "committer": "oncall@theashtons.dev",
     "timestamp": 1791141200000
   }
   ```
2. **Mandatory Post-Mortem Reason:** The engineer must log into the Berth dashboard or run the CLI to attach an explicit exception reason:
   ```bash
   curl -X POST https://berth-control-plane.theashtons.workers.dev/api/audit/exception \
     -H "Content-Type: application/json" \
     -d '{"sha": "9f8e7d6c", "reason": "Edge DNS outage prevented control plane vouching"}'
   ```
3. **Artifacts Synchronization:** The mirror worker fast-forwards the primary Artifacts repository (`berth.git`) to incorporate the emergency commit, ensuring the two remain 100% synchronized.
4. **README Accounting:** The total number of break-glass exceptions is tracked publicly in the repository README.
