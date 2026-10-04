#!/usr/bin/env node
/**
 * Berth Session Context Pack Capture & Object Storage
 * Uploads session trajectory to R2 via Control Plane and attaches
 * native git notes to refs/notes/agent-session.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CONTROL_PLANE_URL = process.env.BERTH_CONTROL_PLANE_URL || 'https://berth-control-plane.theashtons.workers.dev';

async function main() {
  console.log("=== Berth Session Capture & Context Pack Packager ===");

  // 1. Read attempt context
  const contextPath = path.join(repoRoot, '.berth', 'attempt_context.json');
  if (!fs.existsSync(contextPath)) {
    console.error("No attempt_context.json found in .berth/");
    process.exit(1);
  }
  const attemptCtx = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  const { taskId, attemptId, sessionId } = attemptCtx;

  console.log(`Task: ${taskId} | Attempt: ${attemptId} | Session: ${sessionId}`);

  // 2. Locate transcript JSONL
  let transcriptData = '';
  const candidateTranscriptPaths = [
    path.join(process.env.APPDATA || '', '..', '.gemini', 'antigravity-cli', 'brain', sessionId, '.system_generated', 'logs', 'transcript.jsonl'),
    path.join('C:', 'Users', 'richa', '.gemini', 'antigravity-cli', 'brain', sessionId, '.system_generated', 'logs', 'transcript.jsonl')
  ];

  for (const p of candidateTranscriptPaths) {
    if (fs.existsSync(p)) {
      console.log(`Found transcript at: ${p}`);
      transcriptData = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  if (!transcriptData.trim()) {
    console.log("No live transcript found; synthesizing session context pack...");
    const headCommit = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const sessionRecord = {
      sessionId,
      taskId,
      attemptId,
      headCommit,
      timestamp: new Date().toISOString(),
      attemptContext: attemptCtx
    };
    transcriptData = JSON.stringify(sessionRecord) + '\n';
  }

  // 3. Upload to Control Plane / R2
  console.log(`Uploading session context pack to ${CONTROL_PLANE_URL}/api/sessions/${taskId}/${attemptId}/${sessionId}...`);
  const uploadUrl = `${CONTROL_PLANE_URL}/api/sessions/${taskId}/${attemptId}/${sessionId}`;
  
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-ndjson'
    },
    body: transcriptData
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error(`Upload failed (${uploadRes.status}): ${errorText}`);
    process.exit(1);
  }

  const uploadResult = await uploadRes.json() as any;
  console.log("Context pack uploaded successfully:", uploadResult);

  // 4. Attach Git Note under refs/notes/agent-session
  const headSha = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
  const notePayload = JSON.stringify({
    task: taskId,
    attempt: attemptId,
    session: sessionId,
    session_pack_url: uploadResult.url || uploadUrl,
    r2_key: uploadResult.key,
    captured_at: new Date().toISOString(),
    commit: headSha
  }, null, 2);

  console.log(`Attaching git note to HEAD (${headSha.slice(0, 7)}) under refs/notes/agent-session...`);
  execSync(`git notes --ref=refs/notes/agent-session add -f -m ${JSON.stringify(notePayload)} HEAD`, {
    cwd: repoRoot
  });

  const noteShow = execSync('git notes --ref=refs/notes/agent-session show HEAD', {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  console.log("\nVerified Git Note:");
  console.log(noteShow);

  // 5. Push git note to remotes
  console.log("Pushing refs/notes/agent-session to remotes...");
  try {
    const devVarsPath = path.join(repoRoot, '.dev.vars');
    let token = '';
    if (fs.existsSync(devVarsPath)) {
      const match = fs.readFileSync(devVarsPath, 'utf8').match(/BERTH_ARTIFACTS_TOKEN=(.+)/);
      if (match) token = match[1].trim();
    }

    if (token) {
      execSync(`git -c http.extraHeader="Authorization: Bearer ${token}" push artifacts refs/notes/agent-session`, {
        cwd: repoRoot
      });
      console.log("Pushed notes to Artifacts remote.");
    }
  } catch (err: any) {
    console.warn("Could not push notes to Artifacts remote:", err.message);
  }

  try {
    execSync('git push github refs/notes/agent-session', { cwd: repoRoot });
    console.log("Pushed notes to GitHub mirror.");
  } catch (err: any) {
    console.warn("Could not push notes to GitHub mirror:", err.message);
  }

  console.log("\n=== Session Capture Complete ===");
}

main().catch(err => {
  console.error("Session capture error:", err);
  process.exit(1);
});
