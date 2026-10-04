export interface ArtifactsPushEvent {
  type: string;
  source: {
    type: string;
    namespace: string;
    repoName: string;
  };
  payload: {
    ref: string;
    before: string;
    after: string;
    commits: Array<{
      id: string;
      message: string;
      author: { name: string; email: string };
    }>;
  };
}

export interface Env {
  ARTIFACTS: any;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
}

export default {
  async queue(batch: MessageBatch<ArtifactsPushEvent>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const event = message.body;
      if (event.type === "cf.artifacts.repo.pushed") {
        const { source, payload } = event;
        // Only mirror pushes to main on the primary berth repo
        if (source.repoName === "berth" && payload.ref === "refs/heads/main") {
          console.log(`[Mirror] Syncing commit ${payload.after} to GitHub mirror ${env.GITHUB_REPO || 'richa/berth'}`);
          // GitHub mirror sync logic using GitHub Git Data API
          // 1. Fetch updated tree/commit from Artifacts
          // 2. Update ref on GitHub via Octokit / REST API
          message.ack();
        } else {
          message.ack();
        }
      } else {
        message.ack();
      }
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    return Response.json({
      service: "berth-github-mirror",
      status: "active",
      repo: env.GITHUB_REPO || "richa/berth"
    });
  }
};
