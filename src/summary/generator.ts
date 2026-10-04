import { validateHumanSummary, countWords } from "./validator.ts";
import type { ValidationResult } from "./validator.ts";

export interface SummaryInput {
  intent: string;
  behaviorChange: string;
  criticalHunks: string[];
  evidence: string[];
  notVerified: string;
  costUsd: number;
  attemptsCount: number;
  aiGatewayToken?: string;
  accountId?: string;
  gatewayName?: string;
}

export const MANIFESTO_SUMMARY_PROMPT = `
You are the Berth Summariser agent. Produce a strictly manifesto-compliant 5-line human summary for a proposed change.

FORMAT RULES:
Line 1: Why: <one sentence: the problem in the user's terms>
Line 2: What changes: <one or two sentences about behaviour, NOT files>
Line 3: Look at: <the 1-3 hunks that matter>
Line 4: Verified: <evidence>   Not verified: <what wasn't checked>
Line 5: Cost: $<amount> across <n> attempts

STRICT REQUIREMENTS:
- TOTAL words across ALL lines MUST be <= 80 words.
- 'Not verified:' is MANDATORY and must specify unexercised code paths or pending edge cases (never write 'None').
- Output ONLY the 5 lines. No commentary, no backticks, no extra lines.
`;

export async function generateHumanSummary(input: SummaryInput): Promise<{ summary: string; validation: ValidationResult }> {
  let summary = "";

  // If AI Gateway is configured, attempt call via AI Gateway Auto Router
  if (input.aiGatewayToken && input.accountId) {
    try {
      const gatewayName = input.gatewayName || "berth-gateway";
      const url = `https://gateway.ai.cloudflare.com/v1/${input.accountId}/${gatewayName}/compat/v1/chat/completions`;
      
      const promptContext = `
Task Intent: ${input.intent}
Behavioral change: ${input.behaviorChange}
Critical hunks: ${input.criticalHunks.join(", ")}
Verified evidence: ${input.evidence.join(", ")}
Not verified: ${input.notVerified}
Total cost: $${input.costUsd.toFixed(2)} across ${input.attemptsCount} attempts
      `;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${input.aiGatewayToken}`,
          "Content-Type": "application/json",
          "cf-aig-metadata": JSON.stringify({
            generator: "berth-human-summary",
            attemptsCount: input.attemptsCount
          })
        },
        body: JSON.stringify({
          model: "cloudflare/auto",
          temperature: 0.1,
          messages: [
            { role: "system", content: MANIFESTO_SUMMARY_PROMPT },
            { role: "user", content: promptContext }
          ]
        })
      });

      if (resp.ok) {
        const data = await resp.json() as any;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          const check = validateHumanSummary(text);
          if (check.valid) {
            return { summary: text, validation: check };
          }
        }
      }
    } catch {
      // Fall through to deterministic template generation
    }
  }

  // Deterministic manifesto-compliant generator & compactor
  const whyLine = `Why:           ${input.intent.trim()}`;
  const whatLine = `What changes:  ${input.behaviorChange.trim()}`;
  const lookLine = `Look at:       ${input.criticalHunks.slice(0, 3).join(", ")}`;
  const verifiedLine = `Verified:      ${input.evidence.slice(0, 2).join(", ")}   Not verified: ${input.notVerified.trim()}`;
  const costLine = `Cost:          $${input.costUsd.toFixed(2)} across ${input.attemptsCount} attempt${input.attemptsCount === 1 ? '' : 's'}`;

  summary = [whyLine, whatLine, lookLine, verifiedLine, costLine].join("\n");
  let validation = validateHumanSummary(summary);

  // If word count exceeds 80 words, compact lines
  if (!validation.valid && validation.wordCount > 80) {
    const compactWhy = whyLine.split(" ").slice(0, 12).join(" ");
    const compactWhat = whatLine.split(" ").slice(0, 16).join(" ");
    summary = [compactWhy, compactWhat, lookLine, verifiedLine, costLine].join("\n");
    validation = validateHumanSummary(summary);
  }

  return { summary, validation };
}
