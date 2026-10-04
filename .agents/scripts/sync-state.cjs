#!/usr/bin/env node
/**
 * Berth Automatic State Preserver Hook
 * - Mode 'save' (Stop event): Captures git HEAD, commit message, and updates .berth/state.json
 * - Mode 'inject' (PreInvocation event): Injects a lightweight 2-line state reminder on turn 1
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(repoRoot, '.berth', 'state.json');

function getGitSummary() {
  try {
    const sha = execSync('git rev-parse --short HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const msg = execSync('git log -1 --pretty=%s', { cwd: repoRoot, encoding: 'utf8' }).trim();
    return { sha, msg };
  } catch {
    return { sha: 'none', msg: 'uninitialized' };
  }
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let payload = {};
    try {
      if (input.trim()) payload = JSON.parse(input);
    } catch {}

    const mode = process.argv[2] || 'save';

    if (mode === 'save') {
      try {
        const git = getGitSummary();
        let currentState = {};
        if (fs.existsSync(STATE_FILE)) {
          try {
            currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
          } catch {}
        }

        currentState.lastUpdated = new Date().toISOString();
        currentState.headSha = git.sha;
        currentState.lastCommit = git.msg;

        fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
      } catch (err) {}

      // Allow the agent loop to stop normally
      console.log(JSON.stringify({ decision: "stop" }));
    } 
    else if (mode === 'inject') {
      try {
        const invocationNum = payload.invocationNum ?? 1;
        // Inject state on turn 1 of a conversation session
        if (invocationNum === 1 && fs.existsSync(STATE_FILE)) {
          const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
          const msg = `[Auto-State] Active Milestone: ${state.activeMilestone || 'M0'} (${state.milestoneTitle || ''}) | HEAD: ${state.headSha} | Task: ${state.currentTask || 'None'} | Next: ${state.nextStep || 'Check state'} | State file: .berth/state.json`;
          
          console.log(JSON.stringify({
            injectSteps: [
              {
                ephemeralMessage: msg
              }
            ]
          }));
          return;
        }
      } catch (err) {}

      console.log(JSON.stringify({ injectSteps: [] }));
    }
  });
}

main();
