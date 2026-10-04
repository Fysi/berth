/**
 * Human Summary Validator
 * Enforces the strict 5-line manifesto specification and <=80 words limit.
 */

export interface ValidationResult {
  valid: boolean;
  wordCount: number;
  errors: string[];
  lines: {
    why?: string;
    whatChanges?: string;
    lookAt?: string;
    verified?: string;
    notVerified?: string;
    cost?: string;
  };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateHumanSummary(summary: string): ValidationResult {
  const errors: string[] = [];
  const lines = summary.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const wordCount = countWords(summary);

  if (wordCount > 80) {
    errors.push(`Word count ${wordCount} exceeds maximum allowed budget of 80 words`);
  }

  const parsed: ValidationResult['lines'] = {};

  for (const line of lines) {
    if (line.startsWith("Why:")) {
      parsed.why = line.replace(/^Why:\s*/, "").trim();
    } else if (line.startsWith("What changes:")) {
      parsed.whatChanges = line.replace(/^What changes:\s*/, "").trim();
    } else if (line.startsWith("Look at:")) {
      parsed.lookAt = line.replace(/^Look at:\s*/, "").trim();
    } else if (line.startsWith("Verified:")) {
      const remaining = line.replace(/^Verified:\s*/, "");
      const notVerifiedIdx = remaining.indexOf("Not verified:");
      if (notVerifiedIdx !== -1) {
        parsed.verified = remaining.substring(0, notVerifiedIdx).trim();
        parsed.notVerified = remaining.substring(notVerifiedIdx + "Not verified:".length).trim();
      } else {
        parsed.verified = remaining.trim();
      }
    } else if (line.startsWith("Cost:")) {
      parsed.cost = line.replace(/^Cost:\s*/, "").trim();
    }
  }

  if (!parsed.why) {
    errors.push("Missing 'Why:' line");
  }
  if (!parsed.whatChanges) {
    errors.push("Missing 'What changes:' line");
  } else {
    // Check for behavioral focus vs mere file listing
    const isFileListOnly = /^(\s*(\+|\-|\w+[\/\w\.-]+\.(ts|js|json|md|py|go|rs|css|html)),?\s*)+$/i.test(parsed.whatChanges);
    if (isFileListOnly) {
      errors.push("'What changes:' must explain behavioral differences, not merely list modified files");
    }
  }

  if (!parsed.lookAt) {
    errors.push("Missing 'Look at:' line");
  }

  if (!parsed.verified) {
    errors.push("Missing 'Verified:' line");
  }

  if (!parsed.notVerified) {
    errors.push("Missing mandatory 'Not verified:' section");
  } else {
    const lower = parsed.notVerified.toLowerCase();
    if (lower === "none" || lower === "n/a" || lower === "nil" || lower === "nothing" || lower === "none.") {
      errors.push("'Not verified:' must state what wasn't checked (cannot be 'None' or 'N/A')");
    }
  }

  if (!parsed.cost) {
    errors.push("Missing 'Cost:' line");
  } else if (!parsed.cost.toLowerCase().includes("attempt")) {
    errors.push("'Cost:' must specify total cost across attempt(s)");
  }

  return {
    valid: errors.length === 0,
    wordCount,
    errors,
    lines: parsed
  };
}
