---
id: FW-L-202
type: framework-lesson
stage: 2
title: Component objects
objective: Model reusable UI widgets (nav, modal, datagrid) as component objects
  instead of mega page classes.
topic: framework
subtopics:
  - component-objects
  - spa
  - composition
diagram: null
mcqs:
  - FW-Q-019
  - FW-Q-020
exercise: null
related:
  - FW-L-201
  - FW-L-104
---

## Concept

Component objects wrap a root locator (e.g. page.getByRole("dialog")) and expose actions for that subtree. Pages compose components: `this.nav = new NavBar(page)`.

## Why it matters

SPAs reuse headers, modals, and tables across routes — duplicating locators in every page object rots quickly.

## Architecture decision

Extract a component when a third page copies the same locators. Keep components stateless aside from the root locator reference.

## TypeScript implementation

```ts
export class ConfirmModal {
  constructor(private readonly root: Locator) {}
  readonly confirm = this.root.getByRole('button', { name: 'Confirm' });
  async accept() {
    await this.confirm.click();
  }
}

export class CheckoutPage {
  readonly modal: ConfirmModal;
  constructor(page: Page) {
    this.modal = new ConfirmModal(page.getByRole('dialog', { name: 'Confirm order' }));
  }
}
```

## Trade-offs

Too many tiny components add indirection — start inline, extract on third duplication.

## What NOT to do

Do not create a component per CSS div. Do not pass entire Page into every component method — pass Locator root.

## Interview angle

"When component object vs page object?" — Page = route/screen; component = reusable widget appearing on multiple screens.

## Related

- FW-L-201
- FW-L-104
