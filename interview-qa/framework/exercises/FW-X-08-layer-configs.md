---
id: FW-X-08
type: framework-exercise
topic: framework
stage: 2
difficulty: intermediate
lesson: FW-L-209
specFile: practice-suite/exercises/FW-X-08-layer-configs.spec.ts
runCommand: npm run exercise -- --grep FW-X-08
---

## Goal

Merge base config with environment overlay (deep merge use object).

## Starter code

```ts
export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  return base;
}
```

## Task

Overlay wins on baseURL; merge extraHTTPHeaders from both layers.

## Hints

<details>
<summary>Hint 1</summary>

Spread use objects.

</details>

<details>
<summary>Hint 2</summary>

Headers need nested merge.

</details>

<details>
<summary>Hint 3</summary>

Return new object — do not mutate base.

</details>

## Solution

```ts
export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  return {
    use: {
      ...base.use,
      ...overlay.use,
      extraHTTPHeaders: {
        ...base.use.extraHTTPHeaders,
        ...overlay.use.extraHTTPHeaders,
      },
    },
  };
}
```

## Solution walkthrough

Config layering pattern from FW-L-209 without multiple files.

## Self-check

Run `npm run exercise -- --grep FW-X-08`.
