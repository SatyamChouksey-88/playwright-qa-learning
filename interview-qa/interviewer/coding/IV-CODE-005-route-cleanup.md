---
id: IV-CODE-005
type: iv-coding
level: mid
round: coding
timebox: 12
difficulty: 3
topic: network
specFile: practice-suite/exercises/interviewer/IV-CODE-005-route-cleanup.spec.ts
---

## Interviewer script

Say: "Flag route mocks that leak between tests." Pure string analysis.

## Task statement

Implement `hasRouteCleanup(code: string): boolean` — true when code includes both `page.route` and `page.unroute` (or `await route.fallback()` with unroute in finally).

## Starter code

```ts
export function hasRouteCleanup(code: string): boolean {
  return code.includes('page.route');
}
```

## What to evaluate

- Requires both route and unroute
- False when only route
- True for unrouteAll pattern

## Exemplar solution

```ts
export function hasRouteCleanup(code: string): boolean {
  const hasRoute = code.includes('page.route');
  const hasUnroute = code.includes('page.unroute') || code.includes('unrouteAll');
  return hasRoute && hasUnroute;
}
```

## Common candidate mistakes

- Route alone passes
- Ignoring parallel leakage

## Hint ladder

<details>
<summary>Hint 1</summary>

Both route and unroute required.

</details>

<details>
<summary>Hint 2</summary>

unrouteAll counts.

</details>

<details>
<summary>Hint 3</summary>

Route without cleanup fails.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Detects cleanup |
| Judgment | Explains parallel pollution |
