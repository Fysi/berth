#!/usr/bin/env node
/**
 * Berth Commit Validation Hook & Git Hook
 * Enforces RFC-2822 commit trailers and blocks unresolved conflict markers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { 
  validateCommitMessage, 
  containsConflictMarkers, 
  decorateCommitMessage 
} from '../src/control-plane/trailers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function getAttemptContext() {
  const contextFile = path.join(repoRoot, '.berth', 'attempt_context.json');
  if (fs.existsSync(contextFile)) {
    try {
      return JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    } catch {}
  }
  return {
    taskId: 'unassigned',
    attemptId: 'att-1',
    sessionId: 'session-unknown'
  };
}

function checkStagedConflictMarkers() {
  try {
    const diff = execSync('git diff --cached', { cwd: repoRoot, encoding: 'utf8' });
    if (containsConflictMarkers(diff)) {
      return {
        hasConflict: true,
        details: "Staged diff contains unresolved merge conflict markers (<<<<<<<, =======, >>>>>>>)."
      };
    }
  } catch (err) {
    // If git diff fails (e.g., outside repo), ignore
  }
  return { hasConflict: false };
}

// 1. Native Git commit-msg hook mode (invoked with commit message file path)
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  const commitMsgPath = process.argv[2];
  const originalMsg = fs.readFileSync(commitMsgPath, 'utf8');

  // Check conflict markers
  const conflictCheck = checkStagedConflictMarkers();
  if (conflictCheck.hasConflict) {
    console.error(`\n[BERTH ERROR] ${conflictCheck.details}`);
    console.error("Resolve markers and restage with 'git add --resolved'. See AGENTS.md rule 4.\n");
    process.exit(1);
  }

  // Auto-decorate commit message with attempt trailers if missing
  const ctx = getAttemptContext();
  const decorated = decorateCommitMessage(originalMsg, {
    taskId: ctx.taskId,
    attemptId: ctx.attemptId,
    sessionId: ctx.sessionId
  });

  fs.writeFileSync(commitMsgPath, decorated, 'utf8');
  process.exit(0);
}

// 2. Antigravity PreToolUse hook mode (reads JSON payload on stdin)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    if (!input.trim()) {
      console.log(JSON.stringify({ decision: "allow" }));
      return;
    }

    const payload = JSON.parse(input);
    const cmd = payload?.toolCall?.args?.CommandLine || '';

    const isDirectCommit = /(?:^|[;&|]\s*)git\s+commit\b/i.test(cmd) && !/\bgit\s+rebase\b/i.test(cmd);
    const isAmendingWithoutEdit = /--no-edit\b/i.test(cmd);

    if (isDirectCommit && !isAmendingWithoutEdit) {
      // 1. Check for conflict markers in staged files
      const conflictCheck = checkStagedConflictMarkers();
      if (conflictCheck.hasConflict) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: `Berth Policy Violation: Staged changes contain unresolved merge conflict markers (<<<<<<<, =======, >>>>>>>). Resolve them before committing. See AGENTS.md rule 4.`
        }));
        return;
      }

      // 2. Validate trailers
      const validation = validateCommitMessage(cmd);
      if (!validation.valid) {
        const ctx = getAttemptContext();
        console.log(JSON.stringify({
          decision: "deny",
          reason: `Berth Policy Violation: Git commit is missing required trailers: ${validation.missingTrailers.join(', ')}. Context: Task: ${ctx.taskId}, Attempt: ${ctx.attemptId}, Session: ${ctx.sessionId}. See AGENTS.md rule 3.`
        }));
        return;
      }
    }

    console.log(JSON.stringify({ decision: "allow" }));
  } catch (err) {
    console.log(JSON.stringify({ decision: "allow" }));
  }
});
