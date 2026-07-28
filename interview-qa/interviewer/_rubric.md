---
id: IV-RUBRIC
type: iv-rubric
dimensions: 5
---

# Interviewer scoring rubric

Score each dimension **1–4** using behavioral anchors. Do not use score 5. Cite evidence bullets in notes.

## Technical depth

| Score | Anchor |
|-------|--------|
| 1 | Cannot explain Playwright mechanisms; relies on buzzwords or outdated Selenium habits. |
| 2 | Partial accuracy — knows terms (fixtures, storageState) but cannot sketch usage or confuses scopes. |
| 3 | Solid explanations with minor gaps; can write basic TypeScript examples when prompted. |
| 4 | Deep, precise answers — auto-wait, scopes, network, CI — with correct APIs and trade-offs unprompted. |

## Problem-solving process

| Score | Anchor |
|-------|--------|
| 1 | Random guessing; jumps to fixes without reproduction. |
| 2 | Some structure but skips trace/evidence; reaches for sleeps or retries. |
| 3 | Systematic triage (reproduce → trace → categorize → fix) with one missed step. |
| 4 | Consistent structured approach; names verification step and prevention guard. |

## Communication

| Score | Anchor |
|-------|--------|
| 1 | Cannot articulate reasoning; needs constant rephrasing. |
| 2 | Understandable but disorganized; jargon without explanation. |
| 3 | Clear narrative; explains trade-offs when asked. |
| 4 | Teaches-back clearly; checks understanding; adapts to whiteboard or live code. |

## Code quality

| Score | Anchor |
|-------|--------|
| 1 | Writes banned anti-patterns; no TypeScript structure. |
| 2 | Working-ish code with locator or async mistakes. |
| 3 | Clean web-first locators, proper await, readable naming. |
| 4 | Idiomatic Playwright Test — fixtures, isolation, no anti-patterns — production-ready style. |

## Judgment / trade-offs

| Score | Anchor |
|-------|--------|
| 1 | One-size-fits-all answers; no awareness of cost or flake. |
| 2 | Mentions trade-offs superficially when prompted. |
| 3 | Reasonable boundaries (mock vs live, E2E vs API) with light quantification. |
| 4 | Explicit non-goals, metrics (flake rate, CI minutes), and context-aware decisions. |

## References

- Schmidt, F. L., & Hunter, J. E. (1998). The validity and utility of selection methods in personnel psychology.
- Huffcutt, A. I., & Arthur, W. Jr. (1994). Hunter and Hunter (1984) revisited: Interview validity for job performance.
- Sackett, P. R., et al. (2022). Revisiting meta-analytic estimates of validity in personnel selection.
- Google re:Work — Structured behavioral interviewing practices.
