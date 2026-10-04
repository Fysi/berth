# Day 1 Execution Runbook: Milestone M0 Completion

> **Target Date:** Sunday 4 October 2026  
> **Goal:** Complete Milestone M0 (**Home**).  
> **Rule Switched On:** *All code lives in Artifacts.* Nobody works in uncommitted local code or external repos without syncing.

---

## Pre-Flight Status Checklist

- [x] Node.js `v26.1.0` installed locally
- [x] pnpm `11.1.2` installed locally
- [x] Git `2.51.2` installed locally
- [x] Docker `29.1.3` installed locally
- [x] GitHub CLI `gh 2.100.0` installed locally
- [x] Antigravity CLI `agy 1.2.16` installed locally
- [ ] Cloudflare CLI `cf` installed (`npm install -g cf`)
- [ ] Cloudflare Wrangler `wrangler` installed (`pnpm add -D wrangler@latest`)
- [ ] Cloudflare Authentication configured (`cf auth login` / API token)

---

## Step-by-Step Execution Plan for Today

### Phase 1: Local Toolchain & Project Initialization (09:00 - 10:30)

#### Task 1.1: Install Cloudflare CLI & Wrangler
Run the following PowerShell commands:
```powershell
# Install cf CLI globally
npm install -g cf

# Initialize local git repository in berth root
git init -b main

# Initialize package.json and pnpm workspace
pnpm init
pnpm add -D wrangler@latest typescript @cloudflare/workers-types @types/node

# Verify installation
cf --version
npx wrangler --version
```

#### Task 1.2: Authenticate Cloudflare Environment
Authenticate both Wrangler and the `cf` CLI:
```powershell
# Authenticate Wrangler
npx wrangler login

# Authenticate cf CLI
cf auth login
```
*Note: Verify that the authenticated account has access to Artifacts, Workers Paid, and Containers.*

#### Task 1.3: Generate Project Scaffolding
Create the directory structure:
```powershell
New-Item -ItemType Directory -Force -Path `
  "src\control-plane", `
  "src\mirror", `
  "src\durable-objects", `
  "src\mcp", `
  "docker\git-steward", `
  ".agents\agents\architect", `
  ".agents\agents\attempt-worker", `
  ".agents\agents\git-steward", `
  ".agents\agents\reviewer", `
  ".agents\agents\summariser", `
  ".agents\skills\land-a-change", `
  ".agents\skills\human-summary", `
  ".agents\skills\git-plumbing", `
  ".agents\skills\cloudflare-primitives"
```

Create base `wrangler.jsonc`:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "berth-control-plane",
  "main": "src/control-plane/index.ts",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "artifacts": [
    {
      "binding": "ARTIFACTS",
      "namespace": "default"
    }
  ],
  "observability": {
    "enabled": true,
    "issues": {
      "enabled": true
    }
  }
}
```

---

### Phase 2: Artifacts Repository Creation & Seeding (10:30 - 12:30)

#### Task 2.1: Provision the `berth` Artifacts Repository
Use `cf` CLI or a lightweight bootstrapping Worker to create the repo:
```powershell
# Create repository in Artifacts default namespace
cf artifacts repo create berth --default-branch main --description "Berth - Agent-first Git Platform"
```
Or verify via control-plane script calling `env.ARTIFACTS.create("berth")`.

#### Task 2.2: Mint First Repository Token
```powershell
# Create write-scoped repository token with 30-day validity
$tokenJson = cf artifacts token create berth --scope write --ttl 2592000
$env:BERTH_ARTIFACTS_TOKEN = ($tokenJson | ConvertFrom-Json).plaintext
$env:BERTH_ARTIFACTS_REMOTE = ($tokenJson | ConvertFrom-Json).remote
```

#### Task 2.3: Initial Push to Artifacts Remote
Set up Git remote and push initial documents:
```powershell
# Configure remote with token auth
git add MANIFESTO.md TARGETS.md PLAN.md ARCHITECTURE.md RISKS.md DAY1.md package.json wrangler.jsonc
git commit -m "feat(init): seed Project Berth repository with core manifesto, targets, and architectural plan"

# Add Artifacts remote
git remote add artifacts $env:BERTH_ARTIFACTS_REMOTE

# Push initial commit to main
git -c http.extraHeader="Authorization: Bearer $env:BERTH_ARTIFACTS_TOKEN" push -u artifacts main
```

#### Verification:
```powershell
# Verify clone works over plain git
git -c http.extraHeader="Authorization: Bearer $env:BERTH_ARTIFACTS_TOKEN" ls-remote artifacts
```

---

### Phase 3: Bidirectional GitHub Mirror Worker (13:30 - 16:00)

#### Task 3.1: Create GitHub Mirror Repository
```powershell
# Create public GitHub repository under user profile
gh repo create berth --public --description "Mirror of Project Berth - Agent-first Git Platform on Cloudflare" --source=. --remote=github
```

#### Task 3.2: Configure Cloudflare Queue for Push Events
Create the push event queue and subscription:
```powershell
# Create Queue for Artifacts push events
npx wrangler queues create berth-push-events

# Subscribe Queue to Artifacts repository events
cf event-subscriptions create `
  --source-type "artifacts.repo" `
  --source-namespace "default" `
  --source-repo "berth" `
  --destination-type "queue" `
  --destination-name "berth-push-events"
```

#### Task 3.3: Implement GitHub Mirror Queue Consumer Worker
Create `src/mirror/index.ts`:
- Listens to `cf.artifacts.repo.pushed` on `berth-push-events`.
- When `payload.ref == "refs/heads/main"`, fetches updated commits from Artifacts and pushes to GitHub `main` via Octokit/Git client using GitHub secret `GITHUB_PAT`.
- Detects break-glass direct pushes on GitHub and logs audit exceptions.

Deploy mirror worker:
```powershell
npx wrangler deploy --config wrangler.mirror.jsonc
```

#### Verification:
1. Make a small edit in Artifacts repo.
2. Push to Artifacts `main`.
3. Check GitHub repository: commit should appear on GitHub within 30 seconds.

---

### Phase 4: Workers Builds Setup & Deployment (16:00 - 17:30)

#### Task 4.1: Connect Artifacts to Workers Builds
In Cloudflare Dashboard or via `cf` CLI:
1. Navigate to **Workers & Pages** > **Create application** > **Continue with Artifacts**.
2. Select namespace `default` and repository `berth`.
3. Set Production branch to `main`.
4. Deploy command: `npx wrangler deploy`.
5. Previews command: `npx wrangler preview`.

#### Task 4.2: Trigger First Automated Build
Push a trigger commit to Artifacts `main`:
```powershell
git commit --allow-empty -m "ci: trigger first Workers Builds deployment from Artifacts"
git -c http.extraHeader="Authorization: Bearer $env:BERTH_ARTIFACTS_TOKEN" push artifacts main
```

#### Verification:
- Workers Builds dashboard shows successful build.
- `berth-control-plane` is live at `https://berth-control-plane.<subdomain>.workers.dev`.

---

### Phase 5: Day 1 Exit Gate Review (17:30 - 18:30)

Verify all M0 Exit Criteria from [TARGETS.md](file:///C:/Users/richa/dev/berth/TARGETS.md):
1. **Repository:** Berth lives in Artifacts namespace `default`. Plain `git clone` works.
2. **Mirror:** Public GitHub mirror `github.com/richa/berth` is synced and updating on push.
3. **Builds:** Workers Builds builds and deploys trunk on every commit.
4. **Dogfooding Rule Active:** *All code lives in Artifacts.* Local edits must be pushed to Artifacts.

**M0 Complete. Ready to execute Day 2 (Milestone M1: Record).**
