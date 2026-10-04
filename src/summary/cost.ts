/**
 * AI Gateway Cost Attribution & Budget Gauges
 * Injects cf-aig-metadata headers and calculates aggregate cost
 * across all racing attempts (including discarded runs).
 */

export interface ModelPricing {
  promptCostPer1k: number;
  completionCostPer1k: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "cloudflare/auto": { promptCostPer1k: 0.0015, completionCostPer1k: 0.002 },
  "anthropic/claude-3-5-sonnet": { promptCostPer1k: 0.003, completionCostPer1k: 0.015 },
  "openai/gpt-4o": { promptCostPer1k: 0.0025, completionCostPer1k: 0.01 },
  "meta/llama-3.3-70b-instruct": { promptCostPer1k: 0.0007, completionCostPer1k: 0.0009 },
  "default": { promptCostPer1k: 0.002, completionCostPer1k: 0.006 }
};

export interface AttemptCostRecord {
  attemptId: string;
  agentId?: string;
  status: string;
  spentUsd: number;
  tokensIn: number;
  tokensOut: number;
}

export interface TaskCostSummary {
  taskId: string;
  totalCostUsd: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalTokens: number;
  attemptsCount: number;
  activeAttemptsCost: number;
  discardedAttemptsCost: number;
  costPerAttemptAvg: number;
  attempts: AttemptCostRecord[];
}

export function formatAigMetadataHeader(metadata: {
  taskId: string;
  attemptId: string;
  model?: string;
  generator?: string;
}): Record<string, string> {
  return {
    "cf-aig-metadata": JSON.stringify({
      taskId: metadata.taskId,
      attemptId: metadata.attemptId,
      model: metadata.model || "cloudflare/auto",
      generator: metadata.generator || "berth-agent",
      timestamp: Date.now()
    })
  };
}

export function calculateInferenceCost(
  tokensIn: number, 
  tokensOut: number, 
  model: string = "cloudflare/auto"
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];
  const costIn = (tokensIn / 1000) * pricing.promptCostPer1k;
  const costOut = (tokensOut / 1000) * pricing.completionCostPer1k;
  return Number((costIn + costOut).toFixed(4));
}

export function aggregateTaskCost(taskId: string, attempts: AttemptCostRecord[]): TaskCostSummary {
  let totalCostUsd = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let activeAttemptsCost = 0;
  let discardedAttemptsCost = 0;

  for (const att of attempts) {
    const cost = Number(att.spentUsd || 0);
    totalCostUsd += cost;
    totalTokensIn += Number(att.tokensIn || 0);
    totalTokensOut += Number(att.tokensOut || 0);

    const isDiscarded = ["Halted", "Aborted", "Failed"].includes(att.status);
    if (isDiscarded) {
      discardedAttemptsCost += cost;
    } else {
      activeAttemptsCost += cost;
    }
  }

  const attemptsCount = attempts.length;
  const costPerAttemptAvg = attemptsCount > 0 ? totalCostUsd / attemptsCount : 0;

  return {
    taskId,
    totalCostUsd: Number(totalCostUsd.toFixed(4)),
    totalTokensIn,
    totalTokensOut,
    totalTokens: totalTokensIn + totalTokensOut,
    attemptsCount,
    activeAttemptsCost: Number(activeAttemptsCost.toFixed(4)),
    discardedAttemptsCost: Number(discardedAttemptsCost.toFixed(4)),
    costPerAttemptAvg: Number(costPerAttemptAvg.toFixed(4)),
    attempts
  };
}
