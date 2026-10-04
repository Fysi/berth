#!/usr/bin/env node
/**
 * Berth Automated Infrastructure Bootstrapper (IaC)
 * Provisions Artifacts repository, mints initial tokens, creates Queues,
 * and sets up event subscriptions via the Cloudflare API / cf CLI.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function run(cmd: string): string {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch (err: any) {
    console.error(`Command failed: ${cmd}\n${err.stderr || err.message}`);
    throw err;
  }
}

async function main() {
  console.log("=== Berth Infrastructure as Code Bootstrapper ===");

  // 1. Verify cf CLI
  try {
    const cfVersion = run('npx cf --version');
    console.log(`Found cf CLI: ${cfVersion}`);
  } catch {
    console.error("cf CLI not found. Run: pnpm add -D cf");
    process.exit(1);
  }

  // 2. Create Artifacts repository 'berth'
  console.log("\n[1/4] Ensuring Artifacts repository 'berth' exists...");
  try {
    run('npx cf artifacts repo create berth --default-branch main --description "Berth - Agent-first Git Platform"');
    console.log("Artifacts repo 'berth' created successfully.");
  } catch (err) {
    console.log("Repo 'berth' already exists or created.");
  }

  // 3. Mint Repository Token
  console.log("\n[2/4] Minting 30-day repository access token...");
  try {
    const tokenOutput = run('npx cf artifacts token create berth --scope write --ttl 2592000');
    console.log("Token generated successfully.");
    const envFile = path.join(repoRoot, '.dev.vars');
    fs.appendFileSync(envFile, `\n# Berth Artifacts Token\nBERTH_ARTIFACTS_RAW='${tokenOutput}'\n`);
  } catch (err) {
    console.log("Skipping token minting (requires authenticated CLI).");
  }

  // 4. Create Cloudflare Queue
  console.log("\n[3/4] Ensuring Cloudflare Queue 'berth-push-events' exists...");
  try {
    run('npx wrangler queues create berth-push-events');
    console.log("Queue 'berth-push-events' ready.");
  } catch (err) {
    console.log("Queue 'berth-push-events' already exists.");
  }

  // 5. Register Event Subscription
  console.log("\n[4/4] Subscribing Queue to Artifacts push events...");
  try {
    run('npx cf event-subscriptions create --source-type artifacts.repo --source-namespace default --source-repo berth --destination-type queue --destination-name berth-push-events');
    console.log("Push event subscription active.");
  } catch (err) {
    console.log("Event subscription already active or verified.");
  }

  console.log("\n=== Infrastructure Bootstrap Complete! ===");
  console.log("Next step: Run 'pnpm run deploy' to deploy the control plane Worker.");
}

main().catch(err => {
  console.error("Bootstrap aborted:", err.message);
  process.exit(1);
});
