---
id: IV-CODE-001
type: iv-coding
level: junior
round: coding
timebox: 18
difficulty: 2
topic: locators
specFile: practice-suite/exercises/interviewer/IV-CODE-001-locator-strategy.spec.ts
---

## Interviewer script

Say: "Implement `pickBestLocator` for our stub page interface. Prefer role+name, then label, then test id — never CSS xpath or banned patterns." Allow 15 minutes coding, 3 minutes walkthrough.

## Task statement

Implement `pickBestLocator(candidates: LocatorCandidate[]): string` returning the highest-priority valid locator. Invalid candidates (css, xpath, banned substrings) are skipped. Tie-break by array order.

## Starter code

```ts
export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

/** TODO: return best candidate's value; throw if none valid */
export function pickBestLocator(candidates: LocatorCandidate[]): string {
  return candidates[0]?.value ?? '';
}

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}
```

## What to evaluate

- Correct priority order (role before label before testid)
- Rejects css/xpath strategies
- Rejects banned substrings in values
- Throws when no valid candidate

## Exemplar solution

```ts
export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

const PRIORITY: LocatorCandidate['strategy'][] = ['role', 'label', 'testid', 'text'];

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}

export function pickBestLocator(candidates: LocatorCandidate[]): string {
  for (const strategy of PRIORITY) {
    const match = candidates.find(
      (c) => c.strategy === strategy && !isBanned(c.value) && c.value.length > 0,
    );
    if (match) return match.value;
  }
  throw new Error('No valid locator candidate');
}
```

## Common candidate mistakes

- Picking first array element regardless of strategy
- Allowing css when role exists
- Returning empty string instead of throwing

## Hint ladder

<details>
<summary>Hint 1</summary>

Iterate PRIORITY array outer loop, candidates inner.

</details>

<details>
<summary>Hint 2</summary>

Skip strategies css and xpath entirely.

</details>

<details>
<summary>Hint 3</summary>

Use isBanned on each candidate value.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Implements priority walk and validation |
| Code quality | Clear types, no side effects |
| Process | Explains why role beats test id |
