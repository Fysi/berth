---
name: git-plumbing
description: Operational runbook for Git 2.56 server-side commands without working trees (merge-tree, replay, add --resolved, patch-id, range-diff, bisect).
---

# Skill: Git 2.56 Server-Side Plumbing

Use this skill when executing in-memory, server-side Git commands in Berth containers.

## 1. In-Memory Conflict Checks (`git merge-tree`)
Checks whether two trees conflict without checking out a working tree:
```sh
git merge-tree --write-tree $base_sha $branch_sha
```
- Exit code `0`: Clean merge. Standard output contains the resulting merged tree SHA.
- Exit code `1`: Merge conflict. Standard output contains conflicting paths and conflict markers.

## 2. Server-Side Flattening & Linearization (`git replay`)
Flattens merge commits and rebases changes server-side in memory:
```sh
git replay --linearize --onto $trunk_sha $attempt_head
```
- Note: Do NOT use with `--contained`.
- Output: Stream of `git update-ref` commands ready for execution.

## 3. Safe Conflict Marker Staging (`git add --resolved`)
Guards against committing conflict markers:
```sh
git add --resolved <path>...
```
- Automatically scans files for `<<<<<<<`, `=======`, `>>>>>>>`.
- If markers are found, command aborts and leaves file unstaged.

## 4. Revision Comparison (`git range-diff`)
Computes semantic diff between revisions across rebases:
```sh
git range-diff $base_sha..$old_head $base_sha..$new_head
```

## 5. Review Cache Key Generation (`git patch-id`)
Generates stable content hash invariant to commit metadata:
```sh
git diff $base_sha..$head | git patch-id --stable
```

## 6. Autonomous Regression Hunting (`git bisect --reset-when-found`)
Bisects regressions and automatically resets cleanly upon finding the culprit:
```sh
git bisect start $bad_commit $good_commit
git bisect run --reset-when-found=original pnpm test
```
