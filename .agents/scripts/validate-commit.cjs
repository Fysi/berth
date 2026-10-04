#!/usr/bin/env node
/**
 * Berth Commit Validation Hook
 * Reads PreToolUse JSON payload on stdin, checks if command is a git commit,
 * and verifies presence of mandatory RFC-2822 trailers (Task, Attempt, Session, Change-Id).
 */
const fs = require('fs');

function main() {
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

      // Only inspect git commit commands
      if (/\bgit\s+commit\b/i.test(cmd)) {
        const requiredTrailers = ['Task:', 'Attempt:', 'Session:', 'Change-Id:'];
        const missing = requiredTrailers.filter(t => !cmd.includes(t));

        if (missing.length > 0) {
          console.log(JSON.stringify({
            decision: "deny",
            reason: `Berth Policy Violation: Git commit is missing required trailers: ${missing.join(', ')}. See AGENTS.md rule 3.`
          }));
          return;
        }
      }

      console.log(JSON.stringify({ decision: "allow" }));
    } catch (err) {
      console.log(JSON.stringify({ decision: "allow" }));
    }
  });
}

main();
