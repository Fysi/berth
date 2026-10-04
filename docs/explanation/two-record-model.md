# Explanation: The Two-Record Model

> **Diátaxis Mode:** Explanation (Understanding-oriented)  
> **Manifesto Alignment:** [MANIFESTO.md § Rule 3 & § Rule 7](file:///C:/Users/richa/dev/berth/MANIFESTO.md)

---

## 1. The Core Asymmetry

In an agent-first software engineering ecosystem, the bottleneck in software delivery is no longer typing speed or code production rate. The single scarce, rate-limiting resource is **human attention**.

When multiple autonomous agents explore solutions simultaneously, they generate millions of tokens: tool logs, terminal traces, intermediate drafts, and failed hypotheses. Asking a human engineer to read raw agent transcripts or standard 500-line git commit diffs destroys the developer experience.

Project Berth solves this by enforcing the **Two-Record Model**:

```
                       ┌──────────────────────────────┐
                       │     Agent Generates Code     │
                       └──────────────┬───────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌──────────────────────────────┐            ┌──────────────────────────────────────┐
│       THE HUMAN RECORD       │            │           THE AGENT RECORD           │
├──────────────────────────────┤            ├──────────────────────────────────────┤
│ • Strict 5-line summary      │            │ • Full reasoning & trajectory JSONL  │
│ • Maximum 80 words           │            │ • Stored in R2 (berth-sessions/)     │
│ • Mandatory "Not verified"   │            │ • Native git notes                   │
│ • Visual Kitesurf evidence   │            │ • Complete container execution logs  │
│ • Vouched by a named person  │            │ • Discarded attempt history          │
│ • Recorded directly on trunk │            │ • Zero clutter on git log            │
└──────────────────────────────┘            └──────────────────────────────────────┘
```

---

## 2. The Human Record: Respecting Attention

The human record is optimized for rapid, high-confidence decision-making (<2 minutes per change). It is enforced by code in [`src/summary/validator.ts`](file:///C:/Users/richa/dev/berth/src/summary/validator.ts).

### The Five Mandatory Lines
1. **Why:** The concrete intent or bug motivating the change.
2. **What changes:** Architectural summary of the modifications (never a file list).
3. **Look at:** The single most critical hunk or boundary requiring human scrutiny.
4. **Verified:** Evidence-backed verification (tests passed, benchmarks).
5. **Not verified:** An honest, explicit statement of what was NOT verified or tested.

### The Word Budget Invariant
The summary must not exceed **80 words**. If an automated summarizer produces 81 words, the control plane rejects the proposal. Concise summaries force agents to distill the essence of the work.

### The "Not Verified" Rule
AI models have a natural tendency to overstate confidence. Berth turns this upside down: every change proposal must declare what is *not* verified (e.g. `Not verified: High-concurrency socket failover`). If an agent attempts to submit `Not verified: None`, the validator fails fast.

---

## 3. The Agent Record: Infinite Provenance

The agent record preserves complete forensic reproducibility without polluting trunk:
- **R2 Storage:** Full trajectory packs uploaded to `berth-sessions/<task_id>/<attempt_id>/<session_id>.jsonl`.
- **Git Notes:** Git commit notes under `refs/notes/agent-session` reference the session ID and token spend.
- **Private Forks:** Discarded attempts remain in their ephemeral Artifacts forks (`berth-<task>-<att>.git`) until pruned, leaving trunk pristine.

By separating the human record from the agent record, human engineers stay 100% accountable for what lands without ever drowning in agent noise.
