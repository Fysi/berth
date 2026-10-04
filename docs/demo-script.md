# Berth: Competition Demo Video Script & Runbook

> **Target Duration:** 7:30 – 8:30 (Competition window: 5:00 – 10:00)  
> **Target Date:** Monday 12 October 2026  
> **Speaker:** Richard Ashton  
> **Live Control Plane:** `https://berth-control-plane.theashtons.workers.dev`  
> **GitHub Mirror:** `https://github.com/Fysi/berth`

---

## Timing & Demo Moments Breakdown

| Segment | Timing | Demo Moment | Visual Focus |
|---|---|---|---|
| **0:00 – 0:30** | 30s | **1. The Manifesto in Two Lines** | Title slide / Manifesto view: "Agents write the code. Humans decide what lands." |
| **0:30 – 1:45** | 75s | **2. Attempts Racing Live** | Task View: 3 parallel attempts claiming forks, leases, push conflict matrix lighting up. |
| **1:45 – 2:45** | 60s | **3. The Coordinator Deciding** | TaskCoordinator DO decision stream: Budget watchdog stops Attempt 3 over limit, arbitrates lease. |
| **2:45 – 4:00** | 75s | **4. The Change View** | Change View: Strict 5-line human summary (≤80 words), mandatory "Not verified", Kitesurf visual preview. |
| **4:00 – 5:15** | 75s | **5. Vouch → Land → Restack** | Human one-click vouch (`v`), MergeQueue DO linearizes, CAS pushes to trunk, attempt restacks. |
| **5:15 – 6:30** | 75s | **6. Platform Fixing Itself** | Trigger error webhook (`POST /api/webhooks/issues`), auto-creates task, parallel repro/fix, lands. |
| **6:30 – 7:15** | 45s | **7. Customer-Zero Numbers** | Dashboard Landed View + README telemetry: 30 tasks, 62 attempts, $18.42 spend, 1.2 min review. |
| **7:15 – 8:00** | 45s | **8. Nothing Locked In** | Terminal: `git clone`, `git log --oneline --graph` showing 0 merge commits and RFC trailers. |

---

## Detailed Rehearsal Script

### 0:00 – 0:30: Moment 1 — The Manifesto in Two Lines
- **Spoken Audio:**
  > "Welcome to Berth. Traditional Git platforms were built for humans who type code slowly and review PRs sequentially. When you throw twenty autonomous agents into that model, pull request queues disintegrate into merge conflicts and notification noise.
  > 
  > Berth flips this upside down with a simple philosophy: **Agents write the code. Humans decide what lands.**
  > 
  > Two inviolable rules make this work: First, **trunk is sacred**—nobody, human or AI, pushes directly to trunk. Second, **every change is vouched** by a named human holding personal accountability."

### 0:30 – 1:45: Moment 2 — Attempts Racing Live
- **Screen Action:** Open `https://berth-control-plane.theashtons.workers.dev/ui` in browser, press `2` to open Task View.
- **Spoken Audio:**
  > "Notice how work begins: not with branches, but with an **intent**. Here we see task `task-auth-exp-1`: 'Refresh OAuth JWT tokens 60 seconds before expiry'.
  > 
  > Rather than one agent plodding through a single branch, three parallel attempts race simultaneously in isolated Cloudflare Artifacts forks and container sandboxes.
  > 
  > Look at the real-time **Push Conflict Matrix**. As Attempt Alpha pushes, the Cloudflare Queue event triggers the `TaskCoordinator` Durable Object. Within milliseconds, it runs server-side `git merge-tree` checks across all racing attempts. We see instantaneous conflict foresight before any merge is ever attempted."

### 1:45 – 2:45: Moment 3 — The Coordinator Deciding
- **Screen Action:** Highlight the Decision Stream and Budget Gauge on the Task View.
- **Spoken Audio:**
  > "Here is the autonomous coordinator in action. Attempt 3 entered an exploratory loop and exceeded its $5.00 task budget.
  > 
  > The budget watchdog instantly terminated Attempt 3, revoked its leases, and logged the decision: *'Terminated attempt 3: budget exceeded ($5.12 >= $5.00)'*.
  > 
  > Meanwhile, Attempt 1 successfully completed with passing tests and cost only $0.42. The coordinator advances Attempt 1 to the candidate for review."

### 2:45 – 4:00: Moment 4 — The Change View
- **Screen Action:** Press `3` or click Change view. Highlight the 5-line summary card, evidence badges, and Kitesurf preview browser frame.
- **Spoken Audio:**
  > "Now we enter the **Change View**. Remember rule number three: Human attention is the scarce resource.
  > 
  > Notice what the human reviewer sees: **Zero git noise.** No 500-line diffs to decipher. Instead, an evidence-backed **Five-Line Human Summary** guaranteed under 80 words:
  > Why, What changes, Look at, Verified, and the mandatory **Not verified** disclosure. If an AI claims 'Not verified: None', our validator rejects it immediately.
  > 
  > On the right, look at the **Kitesurf Visual Preview**: automated browser screenshot, HTTP 200 verification, sub-150ms latency badge, and zero console errors. We review proof, not promises."

### 4:00 – 5:15: Moment 5 — Vouch → Land → Restack
- **Screen Action:** Press keyboard shortcut `v` or click 'Vouch & Land'. Switch to Landed View (`4`).
- **Spoken Audio:**
  > "I press `v` on my keyboard to vouch. The platform captures my Cloudflare Access identity: `Richard Ashton <richard1.ashton@gmail.com>`.
  > 
  > Instantly, the change is handed to the `MergeQueue` Durable Object. The queue verifies linearizability with `git replay --linearize`, executes preflight container tests, signs the commit with its SSH key, and executes an atomic Compare-And-Swap ref update.
  > 
  > Look at the Landed View: the change is on trunk in 116 milliseconds, and any competing sibling attempts are automatically restacked."

### 5:15 – 6:30: Moment 6 — The Platform Fixing Itself
- **Screen Action:** Open terminal, trigger production issue webhook (`POST /api/webhooks/issues`). Watch Inbox badge increment and new task appear.
- **Spoken Audio:**
  > "Now, Milestone M5: Close the Loop. Let's see the platform fix its own production bug.
  > 
  > A 500 error occurs in production. Cloudflare Observability posts a webhook to `/api/webhooks/issues`.
  > 
  > Watch the Inbox counter: within seconds, Berth parses the stack trace, spawns Task `task-fix-prod-404-1`, launches parallel reproducer and fixer attempts from snapshot containers in under two seconds, writes a regression test, and presents the vouched fix directly in my Inbox. One click, and the production fix lands."

### 6:30 – 7:15: Moment 7 — Customer-Zero Numbers
- **Screen Action:** Scroll through the Landed history log showing 30 landed tasks.
- **Spoken Audio:**
  > "Berth is not a prototype; it is built on itself as Customer Zero.
  > 
  > From day one, every single platform capability landed through this exact pipeline:
  > - **30 total tasks** completed
  > - **62 parallel attempts** executed
  > - **30 landed changes** on trunk
  > - **$18.42 total inference spend**, or just 61 cents per landed change
  > - **1.2 minutes median human review time**
  > - And **zero break-glass exceptions**—100% of code landed through the Merge Queue."

### 7:15 – 8:00: Moment 8 — Nothing Locked In
- **Screen Action:** Terminal view. Run `git clone`, `git log --graph --oneline -n 10`, `git log --merges`.
- **Spoken Audio:**
  > "Finally: nothing is locked in. Let's inspect the repository directly with standard Git.
  > 
  > Running `git log --merges`: **Zero merge commits.** The history is strictly linear.
  > 
  > Running `git log -n 5`: Every commit carries RFC-2822 trailers for Task, Attempt, Session, Change-Id, and Vouched-by attribution.
  > 
  > Berth proves that when agents write the code, human engineering doesn't get slower—it gets sharper, faster, and more accountable.
  > 
  > Thank you."
