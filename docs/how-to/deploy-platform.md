# How-To: Deploy Berth on Cloudflare

This how-to guide walks through deploying the complete Berth platform on your own Cloudflare account.

---

## Prerequisites
- Node.js ≥ 22 and pnpm ≥ 10
- Docker installed and running locally
- Cloudflare account with **Workers Paid**, **Artifacts**, and **Containers** enabled
- GitHub personal access token with `repo` scope (for public mirror sync)

---

## Step 1: Authenticate Cloudflare
```bash
# Login with Wrangler
npx wrangler login

# Or export your Cloudflare API token
export CLOUDFLARE_API_TOKEN="<your-token>"
export CLOUDFLARE_ACCOUNT_ID="<your-account-id>"
```

---

## Step 2: Provision Infrastructure with One Command

Run the automated bootstrapper to create the Artifacts repository, configure Cloudflare Queues, and register event subscriptions:
```bash
pnpm run bootstrap
```
*Behind the scenes, this calls `scripts/bootstrap-infra.ts` using the `cf` CLI.*

---

## Step 3: Deploy the Edge Control Plane

Deploy the `TaskCoordinator` and `MergeQueue` Durable Objects and edge API:
```bash
npx wrangler deploy
```

---

## Step 4: Deploy the GitHub Mirror Worker

Deploy the queue consumer worker that mirrors Artifacts commits to GitHub:
```bash
npx wrangler deploy --config wrangler.mirror.jsonc
```

---

## Step 5: Verify the Deployment

1. Ping the health check endpoint:
   ```bash
   curl https://berth-control-plane.<your-subdomain>.workers.dev/health
   ```
   *Expected response:*
   ```json
   { "platform": "Berth", "status": "healthy", "version": "0.1.0" }
   ```

2. Verify Artifacts repository access:
   ```bash
   git -c http.extraHeader="Authorization: Bearer $BERTH_ARTIFACTS_TOKEN" ls-remote $BERTH_ARTIFACTS_REMOTE
   ```

Your Berth platform is now fully deployed and self-hosting.
