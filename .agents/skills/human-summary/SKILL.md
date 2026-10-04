---
name: human-summary
description: Prompt templates, word-budget validators, and formatting rules for producing evidence-backed human records.
---

# Skill: Human Summary Generator

Use this skill to generate or validate the 5-line human summary for a proposed change.

## The 5-Line Manifesto Specification

Every human summary MUST conform exactly to this template:

```
Why:           <one sentence: the problem, in the user's terms>
What changes:  <one or two sentences about behaviour, not files>
Look at:       <the one to three hunks that matter; the rest is mechanical>
Verified:      <the evidence>   Not verified: <what wasn't checked>
Cost:          <total> across <n> attempts
```

## Validation Checklist

1. **Word Count:** Total words across all 5 lines MUST NOT exceed **80 words**.
2. **Behavioral Focus:** `What changes:` must explain behavioral differences, never a list of files or mechanical AST shifts.
3. **Mandatory "Not Verified":** `Not verified:` must clearly identify unexercised code paths, untested configurations, or pending edge cases. Never leave it blank or write "None".
4. **Hunk Guidance:** `Look at:` must point directly to the 1–3 critical semantic hunks (e.g. `src/auth.ts: handleToken()`).
5. **Cost Reckoning:** `Cost:` must calculate the cumulative cost across all attempts for this task, including failed or discarded runs.
