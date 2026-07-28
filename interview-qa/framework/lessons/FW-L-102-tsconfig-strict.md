---
id: FW-L-102
type: framework-lesson
stage: 1
title: TypeScript strict mode
objective: Configure tsconfig so tests and page objects catch null/any bugs at
  compile time.
topic: framework
subtopics:
  - tsconfig
  - strict
  - types
diagram: null
mcqs:
  - FW-Q-004
  - FW-Q-005
exercise: null
related:
  - FW-L-101
  - FW-L-106
---

## Concept

`strict: true` plus `noUncheckedIndexedAccess` makes Playwright fixtures and API responses safer. Include test files in `include` and add `"types": ["node"]` for process.env.

## Why it matters

Senior reviewers treat `any` in page objects as a smell — it hides wrong locator types and async mistakes that become flaky tests.

## Architecture decision

One tsconfig for the suite; extend from a base if monorepo later. Run `tsc --noEmit` in CI before Playwright — cheap gate, high value.

## TypeScript implementation

```ts
// tsconfig.json excerpt — compilerOptions
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["tests/**/*.ts", "pages/**/*.ts", "fixtures/**/*.ts", "playwright.config.ts"]
}
```

## Trade-offs

Strict mode slows onboarding slightly; loosening it later never happens. `skipLibCheck: true` is acceptable — do not use it to silence errors in your own code.

## What NOT to do

Do not `@ts-ignore` missing awaits on locators. Do not type locators as `any`. Do not maintain parallel JS and TS test folders.

## Interview angle

"Why strict TypeScript for tests?" — Tests are production code with the same maintenance cost; strict catches async/locator mistakes before CI.

## Related

- FW-L-101
- FW-L-106
