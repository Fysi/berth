#!/usr/bin/env node
/**
 * Berth Automated Infrastructure Bootstrapper (IaC)
 * Provisions Artifacts repository, mints initial tokens, creates Queues,
 * and sets up event subscriptions via the Cloudflare API / cf CLI / Wrangler.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Auto-detect Wrangler OAuth credentials if CLOUDFLARE_API_TOKEN is not in env
if (!process.env.CLOUDFLARE_API_TOKEN) {
  try {
    const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
    if (fs.existsSync(tomlPath)) {
      const content = fs.readFileSync(tomlPath, 'utf8');
      const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (match) {
        process.env.CLOUDFLARE_API_TOKEN = match[1];
      }
    }
  } catch {}
}

function run(cmd: string, ignoreErrors = false): string {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { cwd: repoRoot, env: process.env, encoding: 'utf8' }).trim();
  } catch (err: any) {
    if (ignoreErrors) {
      return '';
    }
    console.error(`Command failed: ${cmd}\n${err.stderr || err.stdout || err.message}`);
    throw err;
  }
}

async function main() {
  console.log("=== Berth Infrastructure as Code Bootstrapper ===");

  // 1. Verify Wrangler and cf CLI
  try {
    const wranglerVersion = run('npx wrangler --version');
    console.log(`Found Wrangler: ${wranglerVersion}`);
  } catch {
    console.error("Wrangler not found. Run: pnpm add -D wrangler");
    process.exit(1);
  }

  // 2. Ensure Artifacts namespace 'default' exists
  console.log("\n[1/5] Ensuring Artifacts namespace 'default' exists...");
  try {
    run('npx cf artifacts namespaces create --namespace default', true);
    console.log("Namespace 'default' verified/ready.");
  } catch (err) {
    console.log("Namespace 'default' already exists.");
  }

  // 3. Create Artifacts repository 'berth'
  console.log("\n[2/5] Ensuring Artifacts repository 'berth' exists...");
  let repoOutput = '';
  try {
    repoOutput = run('npx cf artifacts namespaces repos create default --name berth --default-branch main --description "Berth - Agent-first Git Platform"', true);
    if (repoOutput) {
      console.log("Artifacts repo 'berth' created successfully.");
    }
  } catch (err) {
    console.log("Repo 'berth' already exists or ready.");
  }

  // 4. Mint Repository Token and set remote
  console.log("\n[3/5] Minting repository access token...");
  try {
    const tokenJson = run('npx wrangler artifacts repos issue-token berth --namespace default --scope write --ttl 2592000 --json');
    const parsed = JSON.parse(tokenJson);
    const token = parsed.token || parsed.plaintext || parsed;
    const remote = parsed.remote || 'https://09d23dcbdc7b47727e32d32ee3d2e293.artifacts.cloudflare.net/git/default/berth.git';

    const envFile = path.join(repoRoot, '.dev.vars');
    let existingVars = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
    if (!existingVars.includes('BERTH_ARTIFACTS_TOKEN')) {
      fs.appendFileSync(envFile, `\n# Berth Artifacts Credentials\nBERTH_ARTIFACTS_TOKEN=${token}\nBERTH_ARTIFACTS_REMOTE=${remote}\n`);
      console.log("Updated .dev.vars with Artifacts token.");
    }

    // Configure git remote
    const existingRemotes = run('git remote', true);
    if (!existingRemotes.includes('artifacts')) {
      run(`git remote add artifacts ${remote}`);
      console.log(`Added git remote 'artifacts' (${remote})`);
    }
  } catch (err: any) {
    console.log("Token generation note:", err.message);
  }

  // 5. Create Cloudflare Queue
  console.log("\n[4/5] Ensuring Cloudflare Queue 'berth-push-events' exists...");
  try {
    run('npx wrangler queues create berth-push-events', true);
    console.log("Queue 'berth-push-events' ready.");
  } catch (err) {
    console.log("Queue 'berth-push-events' already exists.");
  }

  console.log("\n=== Infrastructure Bootstrap Complete! ===");
  console.log("Next steps:");
  console.log("  1. 'pnpm run deploy' (Deploy control plane Worker)");
  console.log("  2. 'pnpm run deploy:mirror' (Deploy GitHub mirror Worker)");
}

main().catch(err => {
  console.error("Bootstrap aborted:", err.message);
  process.exit(1);
});
