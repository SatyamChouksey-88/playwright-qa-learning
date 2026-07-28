---
id: FW-X-04
type: framework-exercise
topic: framework
stage: 2
difficulty: intermediate
lesson: FW-L-201
specFile: practice-suite/exercises/FW-X-04-make-pom-thin.spec.ts
runCommand: npm run exercise -- --grep FW-X-04
---

## Goal

Thin POM: page object methods must not contain expect() calls.

## Starter code

```ts
export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    this.hasAssertion = true; // TODO: thin POM has no assertions — should be false
  }

  /** Returns true if this class violates thin POM (contains assertions) */
  static violatesThinPom(source: string): boolean {
    return /expect\s*\(/.test(source);
  }
}

export function loginPageSource(): string {
  return `
    async signIn() {
      await this.email.fill('a@test.com');
      await expect(this.toast).toBeVisible();
    }
  `;
}
```

## Task

Fix `loginPageSource()` to remove expect(); set `hasAssertion` to false in constructor.

## Hints

<details>
<summary>Hint 1</summary>

Thin POM: actions only in methods.

</details>

<details>
<summary>Hint 2</summary>

Tests own expect().

</details>

<details>
<summary>Hint 3</summary>

violatesThinPom uses regex on source string.

</details>

## Solution

```ts
export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    this.hasAssertion = false;
  }

  static violatesThinPom(source: string): boolean {
    return /expect\s*\(/.test(source);
  }
}

export function loginPageSource(): string {
  return `
    async signIn() {
      await this.email.fill('a@test.com');
      await this.submit.click();
    }
  `;
}
```

## Solution walkthrough

Refactor moves assertion to spec — page method clicks submit instead.

## Self-check

Run `npm run exercise -- --grep FW-X-04`.
