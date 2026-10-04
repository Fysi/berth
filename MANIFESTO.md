# Manifesto

> **Agents write the code. Humans decide what lands.**

*Working title: "the platform". Swap in the real name once there is one.*

---

## Why this exists

Software used to move through handoffs. Someone scoped the work, someone else picked it up later, and tools filled the gap with process. Agents have removed most of the handoff, but the tools haven't caught up. They respond to more agents with more text: longer pull request descriptions, more AI review comments, more notifications. Each one is cheap to produce and expensive to read.

The bottleneck has moved. Writing code is no longer the scarce part. **Trusting it is.**

So we start from the other end. Human attention is the scarcest resource in the system. The platform's job is to spend as little of it as possible, while keeping a named human accountable for every change that reaches trunk.

---

## What we believe

An opinion only counts if the product refuses something because of it.

| # | We believe | So the platform never… |
|---|---|---|
| 1 | **Work starts from intent, not branches.** You describe a task; attempts appear. | …asks you to create, name or delete a branch. |
| 2 | **Trunk is sacred.** | …lets anyone push to trunk. Not humans, not agents, not us. Only the queue lands changes. |
| 3 | **Attempts are cheap. Evidence decides.** | …lands a change without evidence: a test, a preview or a reproduction. |
| 4 | **Every change has a human who vouched for it.** | …merges anonymously, or offers "auto-merge everything". |
| 5 | **Human attention is the scarce resource.** | …shows a human an unverified AI finding, or a summary over the word limit. |
| 6 | **History is for reading.** | …puts merge commits on trunk. A task lands as one clean commit or a short stack. |
| 7 | **Cost is visible.** | …hides what a change cost, including the attempts we threw away. |
| 8 | **Workflow is not configurable.** | …offers custom statuses or pipeline YAML for the core flow. |
| 9 | **Nothing is locked in.** | …stores code in anything but plain Git. `git clone` always works. |
| 10 | **Oversight is a skill worth protecting.** | …treats a reviewer who never disagrees as a success. We measure rubber-stamping, and route some work to humans on purpose. |

---

## The lifecycle

Fixed. Six states, plus one interrupt.

```
Intent → Exploring → Proposed → Vouched → Landing → Landed
                 ↘ Escalated (an agent needs a human; can happen at any point) ↙
```

| State | Meaning | Who moves it on |
|---|---|---|
| **Intent** | A task exists: what and why, not how | A human, or an automation (for example a production issue) |
| **Exploring** | One or more attempts are running in parallel | The coordinator |
| **Proposed** | An attempt has evidence and a human summary | The coordinator |
| **Vouched** | A named human has read the summary and accepted responsibility | A human |
| **Landing** | In the queue: conflict check, rebase onto trunk, final verification | The queue |
| **Landed** | On trunk; the other attempts are restacked or closed | The queue |
| **Escalated** | Blocked on a human decision or answer | An agent; resolved by a human |

---

## Words we use

People see these. They never see branches, SHAs, rebases or merges.

| Word | Meaning |
|---|---|
| **Task** | A unit of intent. Owns a budget and a named human owner. |
| **Attempt** | One agent's try at a task, in its own isolated fork and sandbox. Cheap and disposable. |
| **Change** | What an attempt proposes to land. Keeps its identity through every revision and rebase. |
| **Revision** | A new version of a change. Reviewers only see what changed since they last looked. |
| **Evidence** | Proof attached to a claim: a passing test, a preview screenshot, a reproduction, a graph-backed fact. |
| **Vouch** | A human accepting responsibility for a change. Required to land. |
| **Land** | The queue placing a vouched change on trunk. |
| **Escalation** | An agent asking a human a specific question instead of guessing. |
| **Exception** | Breaking a rule on purpose, with a written reason that stays on the record. |

---

## The human record

Every change carries two records. The **agent record** is complete and can be as long as it needs to be: sessions, tool calls, attempts, reasoning. Nobody is expected to read it. The **human record** is short and evidence-backed, and it is the only text a reviewer has to read.

```
Why:           <one sentence: the problem, in the user's terms>
What changes:  <one or two sentences about behaviour, not files>
Look at:       <the one to three hunks that matter; the rest is mechanical>
Verified:      <the evidence>   Not verified: <what wasn't checked>
Cost:          <total> across <n> attempts
```

- **80 words maximum.**
- Every claim is backed by evidence, or it is removed. Claims are never hedged into vagueness.
- **"Not verified" is mandatory.** It is the most useful line for a reviewer.
- It is generated from the diff and the evidence, not from the agent's account of what it meant to do.

---

## Rules for agents

*These rules go into `AGENTS.md`. They apply to every agent and every harness.*

1. **Never push to trunk.** Propose through the platform (MCP tool `propose`).
2. **Work only in your attempt's fork.** Stay inside the paths you have leased. Request a lease before touching anything else.
3. **Every commit carries trailers:** `Task:`, `Attempt:`, `Session:` and `Change-Id:`.
4. **Never commit conflict markers.** Stage resolutions with `git add --resolved`.
5. **Never handle raw secrets.** Use `secret://<name>` placeholders. The egress layer injects credentials.
6. **Don't guess when you're blocked.** Escalate with one specific question.
7. **Claims need evidence.** Anything you can't prove belongs in the agent record, not the human record.
8. **Keep your working context in the attempt's context file.** It is versioned with your work.
9. **Respect the budget.** Report cost. Stop when the coordinator tells you to.
10. **When the platform gets in your way, report it** (MCP tool `report_friction`). Don't route around it.

---

## Exceptions

Rules can be broken, but never quietly. Every exception needs a written reason, is visible on the change it affects, and is counted. A rising exception count means a rule is wrong or the platform is failing, and both are worth knowing.

---

## Customer zero

This platform is built on itself. Every change to it is a task, attempted by agents, vouched for by a human and landed by the queue.

When we reach for raw Git or another forge instead, that is a bug, and it goes in the friction log. The friction log is the backlog.
