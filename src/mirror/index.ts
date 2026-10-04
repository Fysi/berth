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
      files?: string[];
    }>;
  };
}

export interface Env {
  ARTIFACTS: any;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  TASK_COORDINATOR?: any;
  CONTROL_PLANE_URL?: string;
}

export default {
  async queue(batch: MessageBatch<ArtifactsPushEvent>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const event = message.body;
      if (event.type === "cf.artifacts.repo.pushed") {
        const { source, payload } = event;

        // 1. Trunk push to main on primary repo -> Mirror to GitHub
        if (source.repoName === "berth" && payload.ref === "refs/heads/main") {
          console.log(`[Mirror] Syncing commit ${payload.after} to GitHub mirror ${env.GITHUB_REPO || 'richa/berth'}`);
          message.ack();
        } 
        // 2. Attempt fork push -> Notify TaskCoordinator & recalculate push conflict matrix
        else if (source.repoName.startsWith("berth-")) {
          const match = source.repoName.match(/^berth-(.+)-(att-\w+)$/);
          if (match) {
            const taskId = match[1];
            const attemptId = match[2];

            if (env.TASK_COORDINATOR) {
              try {
                const id = env.TASK_COORDINATOR.idFromName(taskId);
                const stub = env.TASK_COORDINATOR.get(id);
                await stub.handlePushEvent({
                  attemptId,
                  ref: payload.ref,
                  before: payload.before,
                  after: payload.after,
                  commits: payload.commits
                });
              } catch (err: any) {
                console.warn(`[Queue Push Error] Could not notify TaskCoordinator for ${taskId}:`, err.message);
              }
            } else if (env.CONTROL_PLANE_URL) {
              try {
                await fetch(`${env.CONTROL_PLANE_URL}/api/tasks/${taskId}/push`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    attemptId,
                    ref: payload.ref,
                    before: payload.before,
                    after: payload.after,
                    commits: payload.commits
                  })
                });
              } catch (err: any) {
                console.warn(`[Webhook Push Error] Could not post push event to control plane:`, err.message);
              }
            }
          }
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
