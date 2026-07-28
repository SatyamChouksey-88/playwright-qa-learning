# UI Practice Lab + solutions

Self-contained on this study site: `#playground` (challenge → Show solution), `#playground-qa` (interview Q&A).

## How to practise

1. Read the challenge.
2. Attempt the Playwright code yourself.
3. Click **Show solution** and compare.
4. Mark practiced.

## Challenges

### 1. Input Fields (Beginner)

**Challenge:** Type, clear, and assert input values with web-first assertions.

**Skills:** fill, clear, press, getByLabel

```ts
await page.getByLabel('Email').fill('ada@example.com');
await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');
await page.getByLabel('Email').clear();
```

**Trap:** Using CSS for unlabeled inputs; asserting with inputValue() without expect retry.

---

### 2. Buttons (Beginner)

**Challenge:** Click enabled buttons; handle disabled/loading states without force:true.

**Skills:** getByRole, click, dblclick, force smell

```ts
const save = page.getByRole('button', { name: 'Save' });
await expect(save).toBeEnabled();
await save.click();
```

**Trap:** Clicking while spinner overlays the button (fails receives-events).

---

### 3. Forms (Intermediate)

**Challenge:** Fill a multi-field form and assert validation + success paths.

**Skills:** multi-field fill, soft asserts, submit

```ts
await page.getByLabel('Name').fill('Ada');
await page.getByLabel('Email').fill('ada@example.com');
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toHaveText(/success/i);
```

**Trap:** Stopping at first validation error — use expect.soft for multi-field checks.

---

### 4. Dropdowns (Beginner)

**Challenge:** Native <select> vs custom div dropdowns need different APIs.

**Skills:** selectOption vs custom listbox

```ts
// native
await page.getByLabel('Country').selectOption({ label: 'India' });
// custom combobox
await page.getByRole('combobox', { name: 'Country' }).click();
await page.getByRole('option', { name: 'India' }).click();
```

**Trap:** Calling selectOption() on a non-<select> custom widget.

---

### 5. Data Table (Intermediate)

**Challenge:** Find a row by text and act inside it — never hardcode nth().

**Skills:** filter, row chaining, dynamic data

```ts
await page.getByRole('row').filter({ hasText: 'Ada Lovelace' })
  .getByRole('button', { name: 'Edit' }).click();
```

**Trap:** nth(3) on dynamic tables; reading all rows into arrays unnecessarily.

---

### 6. Alerts & Dialogs (Intermediate)

**Challenge:** Handle native alert/confirm/prompt before the triggering click.

**Skills:** page.on('dialog')

```ts
page.once('dialog', async d => {
  expect(d.type()).toBe('confirm');
  await d.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();
```

**Trap:** Registering the dialog handler after the click; treating in-page modals as native dialogs.

---

### 7. Radio & Checkbox (Beginner)

**Challenge:** Toggle checkboxes/radios and assert checked state.

**Skills:** check, setChecked, toBeChecked

```ts
await page.getByLabel('Subscribe').check();
await expect(page.getByLabel('Subscribe')).toBeChecked();
await page.getByLabel('Plan: Pro').check();
```

**Trap:** Clicking the label visually but asserting the wrong input.

---

### 8. Date Picker (Intermediate)

**Challenge:** Prefer filling a typed date when the control allows; otherwise drive the calendar grid.

**Skills:** fill ISO date or calendar UI

```ts
await page.getByLabel('Start date').fill('2026-07-28');
// or calendar grid
await page.getByRole('button', { name: '28' }).click();
```

**Trap:** Locale/timezone mismatches between local and CI calendars.

---

### 9. Links (Beginner)

**Challenge:** Navigate via accessible link names and assert URL/title.

**Skills:** getByRole('link'), navigation

```ts
await page.getByRole('link', { name: 'Docs' }).click();
await expect(page).toHaveURL(/docs/);
```

**Trap:** Matching substring link names that hit multiple links (strict mode).

---

### 10. Tabs & Windows (Intermediate)

**Challenge:** Capture popup/new tab before click; interact on the new Page.

**Skills:** waitForEvent('page'), context pages

```ts
const [tab] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open report' }).click(),
]);
await tab.waitForLoadState();
await expect(tab).toHaveTitle(/Report/);
```

**Trap:** Waiting after the click; using page instead of context for the event.

---

### 11. Dynamic Waits (Advanced)

**Challenge:** Replace sleeps with observable conditions.

**Skills:** web-first asserts, waitForResponse, expect.poll

```ts
const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/data') && r.ok()),
  page.getByRole('button', { name: 'Load' }).click(),
]);
await expect(page.getByTestId('spinner')).toBeHidden();
await expect(page.getByRole('listitem')).not.toHaveCount(0);
```

**Trap:** waitForTimeout; networkidle with open websockets/analytics.

---

### 12. Multi Select (Intermediate)

**Challenge:** Select multiple options and assert all selected values.

**Skills:** selectOption([...]) / multi options

```ts
await page.getByLabel('Tags').selectOption(['a', 'b']);
await expect(page.getByLabel('Tags')).toHaveValues(['a', 'b']);
```

**Trap:** Assuming single-select API for multi-select widgets.

---

### 13. File Upload (Intermediate)

**Challenge:** Upload via hidden input or filechooser event — never OS dialogs.

**Skills:** setInputFiles, filechooser

```ts
await page.getByLabel('Upload').setInputFiles('tests/data/sample.pdf');
// styled button
const [chooser] = await Promise.all([
  page.waitForEvent('filechooser'),
  page.getByRole('button', { name: 'Choose file' }).click(),
]);
await chooser.setFiles('tests/data/sample.pdf');
```

**Trap:** Trying to automate the native OS file picker.

---

### 14. Drag & Drop (Advanced)

**Challenge:** Prefer dragTo; fall back to mouse down/move/up for custom HTML5 DnD.

**Skills:** dragTo, manual mouse sequence

```ts
await page.getByTestId('card-1').dragTo(page.getByTestId('column-done'));
// manual
await source.hover();
await page.mouse.down();
await target.hover();
await page.mouse.up();
```

**Trap:** force:true that 'succeeds' without the app accepting the drop.

---

### 15. iFrames (Intermediate)

**Challenge:** Scope into the frame first — page locators do not pierce iframes.

**Skills:** frameLocator

```ts
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card number').fill('4111111111111111');
await frame.getByRole('button', { name: 'Pay' }).click();
```

**Trap:** Using page.getByRole for controls inside an iframe (timeout).

---

### 16. Shadow DOM (Advanced)

**Challenge:** Open shadow roots are pierced by normal locators; closed roots need app help.

**Skills:** open shadow piercing

```ts
// open shadow — no special API
await page.getByRole('button', { name: 'Start' }).click();
await expect(page.getByText('95%')).toBeVisible();
```

**Trap:** Confusing Shadow DOM with iframes; using evaluate hacks for open roots.

---

### 17. Modal Windows (Beginner)

**Challenge:** Scope actions to the dialog region; assert open/close.

**Skills:** getByRole('dialog')

```ts
await page.getByRole('button', { name: 'Open' }).click();
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
await dialog.getByRole('button', { name: 'Close' }).click();
await expect(dialog).toBeHidden();
```

**Trap:** Clicking background Save when a modal also has Save (strict mode).

---

### 18. Infinite Scroll (Advanced)

**Challenge:** Scroll until the target row attaches; virtual lists may not keep all rows in DOM.

**Skills:** scroll + wait for attach

```ts
const target = page.getByText('Item #120');
for (let i = 0; i < 30 && !(await target.isVisible().catch(() => false)); i++) {
  await page.mouse.wheel(0, 1200);
  await expect.poll(async () => page.getByRole('listitem').count()).toBeGreaterThan(i);
}
await expect(target).toBeVisible();
```

**Trap:** Assuming all rows exist in DOM; fixed sleeps without an end condition. Prefer waiting for count/network growth.

---

### 19. Annotations (Intermediate)

**Challenge:** Hover to reveal tooltip/annotation and assert accessible name or text.

**Skills:** tooltips, titles, hover

```ts
await page.getByRole('button', { name: 'Info' }).hover();
await expect(page.getByRole('tooltip')).toContainText(/required/i);
```

**Trap:** Asserting tooltip before hover completes.

---

### 20. Bank Demo App (Advanced)

**Challenge:** Build a mini portfolio suite: login → transfer → assert balance (API seed optional).

**Skills:** E2E journey, POM, storageState

```ts
test('transfer funds', async ({ page }) => {
  await page.goto('/bank');
  await page.getByLabel('User').fill(process.env.BANK_USER!);
  await page.getByLabel('Pass').fill(process.env.BANK_PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Transfer' }).click();
  await page.getByLabel('Amount').fill('10');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('alert')).toContainText(/success/i);
});
```

**Trap:** One giant test asserting 20 things; logging in via UI in every test.

---

### 21. UI Practice (mixed) (Beginner)

**Challenge:** Warm-up: locate the same control five ways and prefer the resilient one.

**Skills:** locator priority workout

```ts
page.getByRole('button', { name: 'Continue' });
page.getByTestId('continue-btn');
page.locator('#continue'); // last resort
```

**Trap:** Defaulting to the first CSS selector that 'works' in DevTools.

---

## Interview Q&A

### 1. Why practise isolated UI elements before full apps?

Isolated elements let you master one interaction (iframe, Shadow DOM, DnD) without app noise. Then compose those skills into full E2E journeys. Interviews often ask element-level “how would you automate X?” before full flows.

### 2. Input Fields — how do you fill and assert reliably in Playwright?

Prefer getByLabel/getByRole('textbox'), use fill(), assert with await expect(locator).toHaveValue(...) (retries). Avoid reading inputValue() once into a non-retrying expect.

### 3. Buttons — the button is visible but click times out. What do you check?

Actionability: enabled, stable, receives events. Look for overlays/spinners. Assert the blocker is gone. Do not start with waitForTimeout or force: true.

### 4. Forms — how do you verify five validation messages on empty submit?

Use expect.soft for each field so the test reports all failures in one run, then fails at the end.

### 5. Dropdowns — when is selectOption wrong?

Only native <select> supports selectOption. Custom div/listbox widgets: open the combobox, click getByRole('option'), assert the displayed value.

### 6. Data Table — how do you click Edit on a dynamic row?

await page.getByRole('row').filter({ hasText: 'Ada' })
  .getByRole('button', { name: 'Edit' }).click();
Never hardcode nth(n) for business data that changes.

### 7. Alerts & Dialogs — native confirm vs in-page modal?

Native alert/confirm/prompt → page.on('dialog') before the click. In-page modal → normal locators on getByRole('dialog'). Mixing them up is a common stuck point.

### 8. Radio & Checkbox — which APIs?

check(), uncheck(), setChecked(true), assert with toBeChecked(). Prefer labeling via accessible name.

### 9. Date Picker — flaky across locales/CI?

Pin locale and timezoneId in config. Prefer typing an ISO value when the control allows. Calendar grids break when “today” differs by timezone.

### 10. Tabs & Windows — how do you handle target=_blank?

Listen on the context before click: Promise.all([context.waitForEvent('page'), click]), then use the new Page. Same-context tabs share cookies.

### 11. Dynamic Waits — what replaces waitForTimeout?

Web-first assertions, waitForResponse (registered before the action), expect.poll for non-DOM conditions. Avoid networkidle when analytics stay open.

### 12. File Upload — can Playwright click the OS file dialog?

No. Use setInputFiles on the input, or the filechooser event for styled buttons. Buffers work for synthetic files.

### 13. Drag & Drop — dragTo failed. Next step?

Manual sequence: hover → mouse.down → hover(target) → mouse.up, sometimes with intermediate moves. Avoid force clicks that fake success.

### 14. iFrames vs Shadow DOM — key difference for Playwright?

iframe = separate document → must use frameLocator. Open Shadow DOM = same document → normal locators pierce automatically. Closed shadow roots are not reachable without app cooperation. Never treat them as the same problem.

### 15. How do you automate a control inside a nested iframe?

Chain frameLocators: page.frameLocator('#outer').frameLocator('#inner').getByRole('button', { name: 'OK' }).

### 16. Shadow DOM practice — why might getByRole still fail?

Closed shadow root; wrong accessible name; element inside an iframe (need frame first); or strict-mode duplicates. Confirm open vs closed in DevTools.

### 17. Modal Windows — how do you avoid clicking the wrong Save?

Scope: page.getByRole('dialog').getByRole('button', { name: 'Save' }). Strict mode is telling you there are two Saves.

### 18. Infinite Scroll — how do you reach item #N?

Loop: scroll/wheel → wait for new nodes or network → until target visible/attached. Virtualised lists may recycle DOM nodes — search/filter APIs are better when available.

### 19. Annotations / tooltips — how do you assert them?

Hover (or focus) the trigger, then assert getByRole('tooltip') or the title/accessible description. Don’t assert before the hover settles.

### 20. Bank / money-transfer style app — what portfolio suite would you build?

Login (one storageState setup) → account list → transfer → statement download → negative insufficient-funds. Use POM + API seed for accounts + HTML report in CI. Keep tests independent.

### 21. How should you structure practice time on this site?

Day plan: (1) UI Practice Lab Beginner locators/forms, (2) Intermediate dialogs/tables/uploads/iframes, (3) Advanced waits/DnD/Shadow/infinite scroll, (4) Mini-app challenges for nested iframe / OTP / kanban. For each card: attempt the challenge, reveal solution, write 2 tests (happy + edge), explain out loud.

### 22. What Playwright config helps when practicing date/locale widgets?

use: {
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
  viewport: { width: 1280, height: 720 },
}
Keeps calendar/currency behaviour stable across machines.

### 23. Multi Select — how do you assert multiple selected values?

Native: selectOption(['a','b']) then toHaveValues(['a','b']). Custom widgets: select each option via role and assert chips/tags visible.

### 24. After practicing elements, what interview answer pattern works best?

Name the element → choose the API (role/frameLocator/dialog/setInputFiles) → show a 4-line snippet → name the trap (“why people get stuck”). That matches how panels probe beyond syntax.

