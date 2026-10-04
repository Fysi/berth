---
name: cloudflare-primitives
description: Operational reference and code patterns for Cloudflare Artifacts bindings, Containers in Durable Objects, Queues, and AI Gateway Auto Router.
---

# Skill: Cloudflare Platform Primitives for Berth

Use this skill when interacting with Cloudflare APIs and bindings.

## 1. Artifacts Workers Binding
```ts
// Get disposable repository capability (must use 'using')
using repo = await env.ARTIFACTS.get("berth");

// Inspect repository info
const info = await repo.info(); // { defaultBranch: "main", ... }

// Mint disposable token (read or write, TTL in seconds)
const tokenResult = await repo.createToken("write", 7200);
// tokenResult: { plaintext: "art_v1_...", expiresAt: "..." }

// Fork repository for an attempt
const forkResult = await repo.fork("berth-task-123-att-1", {
  defaultBranchOnly: true,
  readOnly: false
});
// forkResult: { name, remote, token, defaultBranch }
```

## 2. Containers in Durable Objects (`ctx.container`)
```ts
// Scheduling policy MUST be durable_object in wrangler.jsonc
const container = this.ctx.container;

// Boot container with image or snapshot
container.start({
  image: "berth-container", // or containerSnapshot: { id: "..." }
  instance: "standard-1",   // or "lite", "standard-2"
  enableInternet: false,    // Egress strictly mediated
  entrypoint: ["/usr/local/bin/supervisor"]
});

// Set inactivity timeout (prevent premature DO eviction)
await container.setInactivityTimeout(10 * 60 * 1000); // 10 minutes

// Intercept outbound HTTPS for credential injection
await container.interceptOutboundHttps("*", egressWorker);

// Execute command inside running container
const proc = await container.exec(["git", "--version"]);
const out = await proc.output();
console.log(new TextDecoder().decode(out.stdout));
```

## 3. Cloudflare Queues Push Event Consumer
```ts
export default {
  async queue(batch: MessageBatch<ArtifactsEvent>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      if (msg.body.type === "cf.artifacts.repo.pushed") {
        const { ref, before, after } = msg.body.payload;
        const repoName = msg.body.source.repoName;
        // Notify TaskCoordinator DO
      }
    }
  }
}
```

## 4. AI Gateway Auto Router
```ts
// Call Auto Router via OpenAI-compatible endpoint
const res = await fetch("https://gateway.ai.cloudflare.com/v1/{account_id}/berth-gateway/compat/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.AI_GATEWAY_TOKEN}`,
    "Content-Type": "application/json",
    "cf-aig-metadata": JSON.stringify({
      taskId: "task-123",
      attemptId: "att-1"
    })
  },
  body: JSON.stringify({
    model: "cloudflare/auto",
    messages: [...]
  })
});
```
