# Reference: Git 2.56 Server-Side Plumbing

> **Diátaxis Mode:** Reference (Information-oriented)  
> **Container Service:** [`docker/Dockerfile.git-steward`](file:///C:/Users/richa/dev/berth/docker/Dockerfile.git-steward)  
> **Architecture Reference:** [`ARCHITECTURE.md`](file:///C:/Users/richa/dev/berth/ARCHITECTURE.md#5-git-256-plumbing-reference)

All Git operations inside Project Berth execute server-side in pre-warmed container sandboxes running Git 2.56. Berth never operates a physical working directory on the server; all trees, linearization, and conflict evaluations happen in-memory through the object database.

---

## 1. Conflict Foresight: `git merge-tree`

Evaluates 3-way tree merges between attempts or against trunk without checking out files.

```bash
# Check if attempt branch can merge cleanly onto trunk
git merge-tree --write-tree --messages --no-commit-id <trunk-head> <attempt-head>
```

- **Exit code 0:** Clean merge. Outputs the tree OID.
- **Exit code 1:** Merge conflict. Outputs conflicting file paths and conflict markers in stdout.
- **Execution latency:** <200ms in sandbox.

---

## 2. Server-Side Linearization: `git replay`

Replays an attempt commit graph directly onto the latest trunk ref, stripping merge commits and linearizing history into standard linear commits.

```bash
# Linearize attempt onto trunk HEAD
git replay --onto <trunk-head> <attempt-base>..<attempt-head>
```

- **Output:** Formatted ref update instructions:
  ```
  update refs/heads/main <new-commit-oid> <old-trunk-oid>
  ```
- **Invariant:** Strips redundant merge commits (`--linearize`), ensuring strictly zero merge commits on trunk.

---

## 3. Safe Merge Staging: `git add --resolved`

Enforces the absolute manifesto invariant: *Never commit conflict markers*.

```bash
git add --resolved <path>
```

- If conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) exist anywhere within `<path>`, the command immediately aborts with exit code 1.
- Mandatory in attempt container hooks.

---

## 4. Commit Trapping & trailers: RFC-2822

Every attempt commit must carry the four platform trailers:

```
feat(auth): refresh OAuth JWT 60s prior to expiration

Task: task-auth-exp-1
Attempt: att-1
Session: sess-8849-01
Change-Id: I4a8f9c2d1b8e7a6c3f0e5d4b8a2c1f9e7d6b5a4c
```

### Trailers Catalog
| Trailer | Purpose | Required By |
|---|---|---|
| `Task:` | Points to `TaskCoordinator` task ID | PreToolUse Hook / CI |
| `Attempt:` | Specific racing attempt ID | PreToolUse Hook / CI |
| `Session:` | Trajectory log in R2 (`berth-sessions/`) | PreToolUse Hook / CI |
| `Change-Id:` | Gerrit-style persistent change hash | PreToolUse Hook / CI |
| `Vouched-by:` | Named human acceptant (`Name <email>`) | MergeQueue on Land |

---

## 5. Non-Clutter Session Logging: `refs/notes/agent-session`

Session context is stored out-of-band in Git notes so standard `git log` remains human-readable.

```bash
# Attach session metadata note
git notes --ref=refs/notes/agent-session add -m '{"sessionId":"...","tokens":5700,"costUsd":0.42}' <commit-sha>

# View session notes
git notes --ref=refs/notes/agent-session show <commit-sha>
```
