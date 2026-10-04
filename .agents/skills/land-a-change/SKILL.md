---
name: land-a-change
description: Step-by-step procedure for executing the landing algorithm, linearization, pre-flight testing, SSH signing, and atomic CAS ref updates.
---

# Skill: Land a Change

Use this skill when processing a vouched change through the `MergeQueue`.

## Execution Steps

1. **Verify Vouch Record:**
   - Confirm a valid `Vouch` entity exists with human name, email, timestamp, and signature.
   - Confirm the change status is `Vouched`.

2. **Pre-flight Merge Check:**
   - Query current trunk `HEAD` SHA: `trunk_sha = repo.info().defaultBranchSha`.
   - Run in-memory conflict check in Git Steward container:
     ```sh
     git merge-tree --write-tree $trunk_sha $attempt_head
     ```
   - If return code != 0, fail fast, mark change as `Conflicted`, and notify coordinator.

3. **In-Memory Linearization:**
   - Replay attempt commits onto trunk `HEAD`:
     ```sh
     git replay --linearize --onto $trunk_sha $attempt_head
     ```
   - Capture the linearized commit SHA. Ensure merge commits are flattened.

4. **Containerized Pre-flight Verification:**
   - Boot ephemeral container sandbox targeting the linearized tree.
   - Execute verification suite (`pnpm test`).
   - If any test fails, abort landing immediately and return test output.

5. **Provenance Trailer & SSH Signing:**
   - Append trailer: `Vouched-by: <Voucher Name> <voucher@example.com>`.
   - Sign the commit using the `MergeQueue` Ed25519 private key.

6. **Compare-and-Swap (CAS) Ref Update:**
   - Execute atomic push to Artifacts trunk:
     ```sh
     git push --force-with-lease=refs/heads/main:$trunk_sha origin $linearized_head:refs/heads/main
     ```
   - If push succeeds:
     - Mark change status as `Landed`.
     - Trigger background restack of remaining open attempts.
   - If push fails (trunk moved):
     - Log CAS contention retry.
     - Retry from Step 2 (up to 3 attempts).

7. **Restack Open Attempts:**
   - For all active sibling attempts:
     ```sh
     git replay --onto $new_trunk_sha $old_trunk_sha $attempt_head
     ```
