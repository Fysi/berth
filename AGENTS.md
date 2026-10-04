# AGENTS.md — Rules for Autonomous Agents in Project Berth

> **Binding Authority:** Derived from [MANIFESTO.md](file:///C:/Users/richa/dev/berth/MANIFESTO.md).  
> These rules apply to every agent, subagent, and execution harness operating on this repository.

---

## The 10 Binding Rules for Agents

1. **Never push to trunk.**  
   Do not attempt to push directly to `main` or any trunk ref. Propose your changes through the platform using the Berth MCP tool `propose`. Only the `MergeQueue` lands changes on trunk.

2. **Work only in your attempt's fork.**  
   Stay strictly inside the repository fork and container sandbox assigned to your attempt ID. Stay inside the file paths you have leased. If you need to modify paths outside your lease, request a lease extension using `request_lease`.

3. **Every commit carries trailers.**  
   Every commit must include the four RFC-2822 trailers:
   - `Task: <task-id>`
   - `Attempt: <attempt-id>`
   - `Session: <session-id>`
   - `Change-Id: <change-id>`  
   Use standard commit formatting. Never commit without these trailers.

4. **Never commit conflict markers.**  
   Never commit unresolved merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). Always stage resolved paths using `git add --resolved`. If leftover markers exist, `git add --resolved` will fail fast.

5. **Never handle raw secrets.**  
   Never hardcode, log, or accept raw API keys, tokens, or private keys. Use `secret://<name>` placeholders (e.g. `secret://openai`, `secret://anthropic`, `secret://github`). The container egress interception proxy will automatically inject actual credentials on outbound requests.

6. **Don't guess when you're blocked.**  
   If you hit ambiguous requirements, architectural uncertainty, or contradictory specs, do not guess. Escalate immediately using the Berth MCP tool `escalate` with one specific, well-formulated question and optional alternatives.

7. **Claims need evidence.**  
   Every claim of functionality, bug fix, or performance improvement must be supported by attached evidence: a passing test suite run, a Kitesurf screenshot, or a reproduction test. Anything that cannot be proven belongs in the agent record, never in the human record.

8. **Keep your working context in the attempt's context file.**  
   Maintain your active thoughts, plan, and progress notes in `.berth/attempt_context.json`. This file is versioned with your work and uploaded to R2 as part of the session context pack.

9. **Respect the budget.**  
   Always report token usage and estimated inference spend via `report_cost`. Monitor remaining task budget. When the coordinator signals budget exhaustion or orders a stop, finish cleanly and exit immediately.

10. **When the platform gets in your way, report it.**  
    If you encounter platform bugs, tooling friction, or confusing APIs, report it immediately using `report_friction`. Never route around platform bugs quietly or create silent workarounds.

---

## Build, Test & Verification Commands

- **Install dependencies:** `pnpm install`
- **Build TypeScript:** `pnpm run build`
- **Run Unit Tests:** `pnpm test`
- **Lint & Type Check:** `pnpm run check`
- **Deploy Control Plane (Dev):** `npx wrangler deploy`
- **Deploy GitHub Mirror (Dev):** `npx wrangler deploy --config wrangler.mirror.jsonc`
