---
id: IV-CODE-010
type: iv-coding
level: senior
round: coding
timebox: 10
difficulty: 2
topic: hiring
specFile: practice-suite/exercises/interviewer/IV-CODE-010-rubric-score.spec.ts
---

## Interviewer script

Say: "Given rubric dimension scores, compute weighted total and recommendation." Connects to IV-RUBRIC.

## Task statement

Implement `hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string }` with weights: technical 0.3, process 0.25, communication 0.15, codeQuality 0.2, judgment 0.1. Tier: ≥3.2 Strong hire, ≥2.6 Hire, ≥2.0 No hire, else Strong no hire.

## Starter code

```ts
export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};

export function hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string } {
  return { total: 0, tier: 'No hire' };
}
```

## What to evaluate

- Weighted sum correct
- Tier thresholds
- Rounding total

## Exemplar solution

```ts
export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};

export function hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string } {
  const total = (Object.keys(WEIGHTS) as Dimension[]).reduce(
    (sum, key) => sum + (scores[key] ?? 0) * WEIGHTS[key],
    0,
  );
  let tier = 'Strong no hire';
  if (total >= 3.2) tier = 'Strong hire';
  else if (total >= 2.6) tier = 'Hire';
  else if (total >= 2.0) tier = 'No hire';
  return { total: Math.round(total * 100) / 100, tier };
}
```

## Common candidate mistakes

- Simple average ignoring weights
- Wrong tier boundaries

## Hint ladder

<details>
<summary>Hint 1</summary>

Multiply each score by WEIGHTS.

</details>

<details>
<summary>Hint 2</summary>

Sum all five.

</details>

<details>
<summary>Hint 3</summary>

Check thresholds top-down.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Correct computation |
| Judgment | Interprets tier for debrief |
