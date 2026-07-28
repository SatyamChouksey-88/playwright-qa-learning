# Mini-app challenges + solutions

Self-contained on this study site: `#miniapps` (challenge → Show solution), `#miniapps-qa` (interview Q&A).

## Challenges

### 1. Dynamic Table

**Challenge:** Find Spider-Man in a table whose row order changes, then assert his real name.

**Skills:** filter, getByRole('row'), dynamic data

```ts
// Don't use nth() — filter by visible text
const row = page.getByRole('row').filter({ hasText: 'Spider-Man' });
await expect(row.getByRole('cell').nth(1)).toHaveText(/Peter Parker/i);
// or:
await expect(page.getByRole('row').filter({ hasText: 'Spider-Man' }))
  .toContainText('Peter Parker');
```

**Why:** Row indexes shuffle; text filter is order-independent.

---

### 2. Verify Your Account (OTP)

**Challenge:** Enter a valid code via key-up buttons or typing, then assert success.

**Skills:** pressSequentially, getByRole, OTP UI

```ts
const code = '123456'; // or read from test env / test OTP
const inputs = page.locator('input[maxlength="1"]');
if (await inputs.count()) {
  for (let i = 0; i < code.length; i++) await inputs.nth(i).fill(code[i]);
} else {
  await page.getByLabel(/code/i).pressSequentially(code);
}
await expect(page.getByText(/success|verified/i)).toBeVisible();
```

**Why:** OTP boxes often need per-digit fill or pressSequentially, not one fill().

---

### 3. Tags Input Box

**Challenge:** Add and remove tags; assert presence and count.

**Skills:** fill, press Enter, toHaveCount

```ts
const input = page.getByPlaceholder(/tag|add/i);
await input.fill('playwright');
await input.press('Enter');
await input.fill('typescript');
await input.press('Enter');
await expect(page.getByText('playwright')).toBeVisible();
await expect(page.locator('.tag, [data-tag]')).toHaveCount(2);
await page.getByText('playwright').locator('..').getByRole('button').click();
await expect(page.getByText('playwright')).toHaveCount(0);
```

**Why:** Assert both text presence and count after add/remove.

---

### 4. Multi Level Dropdown

**Challenge:** Navigate sub-menus; assert menu item text and link.

**Skills:** hover, getByRole, nested menus

```ts
await page.getByRole('button', { name: /menu|products/i }).hover();
await page.getByRole('menuitem', { name: /category/i }).hover();
const item = page.getByRole('menuitem', { name: /item/i });
await expect(item).toBeVisible();
await expect(item).toHaveAttribute('href', /.+/);
await item.click();
```

**Why:** Hover parent before asserting child; don't click too early.

---

### 5. Sortable List

**Challenge:** Drag items into correct order, click verify, assert all green.

**Skills:** dragTo, DnD

```ts
const items = page.locator('[draggable="true"], .sortable-item');
// Example: move first item onto third slot — adjust to app's expected order
await items.nth(0).dragTo(items.nth(2));
await page.getByRole('button', { name: /check|verify|submit/i }).click();
await expect(page.locator('.text-green, .success, [data-ok="true"]')).toHaveCount(await items.count());
```

**Why:** Prefer dragTo; fall back to mouse down/move/up if custom DnD.

---

### 6. New Tab

**Challenge:** Click to open a new tab; assert text on the new page.

**Skills:** waitForEvent('page')

```ts
const [tab] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('button', { name: /new tab|open/i }).click(),
]);
await tab.waitForLoadState();
await expect(tab.getByText(/.+/)).toBeVisible();
await expect(tab.locator('body')).not.toBeEmpty();
```

**Why:** Register the page event before the click.

---

### 7. Pop-Up Window

**Challenge:** Open popup, click inside it, assert text back on the main window.

**Skills:** popup page, cross-window

```ts
const [popup] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('button', { name: /pop-?up|open/i }).click(),
]);
await popup.waitForLoadState();
await popup.getByRole('button', { name: /submit|ok|click/i }).click();
await expect(page.getByText(/success|done|received/i)).toBeVisible();
```

**Why:** Popup is another Page in the same context; assert on the original page afterward.

---

### 8. Nested Iframe

**Challenge:** Click a button inside an iframe nested in another iframe; assert success.

**Skills:** frameLocator chaining

```ts
const inner = page.frameLocator('iframe').frameLocator('iframe');
await inner.getByRole('button').click();
await expect(page.getByText(/success/i)).toBeVisible();
// Prefer stable iframe name/title when available:
// page.frameLocator('iframe[name="outer"]').frameLocator('iframe[name="inner"]')
```

**Why:** Page locators never pierce frames — chain frameLocator.

---

### 9. Shadow DOM

**Challenge:** Click the button; assert progress is at 95%.

**Skills:** open shadow piercing

```ts
// Open shadow roots: normal locators pierce automatically
await page.getByRole('button', { name: /boost|start|progress/i }).click();
await expect(page.getByText(/95\s*%/)).toBeVisible();
```

**Why:** Don't confuse with iframes; closed shadow needs app cooperation.

---

### 10. Stars Rating Widget

**Challenge:** Set each rate value; assert by image, text, and number.

**Skills:** click star, multi assert

```ts
for (const n of [1, 2, 3, 4, 5]) {
  await page.getByRole('radio', { name: new RegExp(String(n)) })
    .or(page.locator(`[data-value="${n}"]`)).first().click();
  await expect(page.getByText(new RegExp(String(n)))).toBeVisible();
}
```

**Why:** Assert multiple representations (value, label, icon state).

---

### 11. Covered Elements

**Challenge:** Click a covered/hidden button and assert the hidden message.

**Skills:** actionability, force sparingly

```ts
// Prefer removing/closing the cover first
const cover = page.locator('.overlay, .cover');
if (await cover.isVisible().catch(() => false)) {
  await cover.getByRole('button', { name: /close|x/i }).click().catch(async () => {
    await cover.evaluate(el => el.remove());
  });
}
await page.getByRole('button', { name: /hidden|secret|click/i }).click();
await expect(page.getByText(/hidden message|success/i)).toBeVisible();
// force:true only if the exercise requires clicking through a cover
```

**Why:** Interviews care that you know force skips actionability — explain when it's intentional.

---

### 12. Upload File

**Challenge:** Upload an image; assert the file name.

**Skills:** setInputFiles

```ts
await page.getByLabel(/upload|file/i)
  .or(page.locator('input[type="file"]'))
  .setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgo=', 'base64'),
  });
await expect(page.getByText(/avatar\.png/i)).toBeVisible();
```

**Why:** Never automate the OS file dialog.

---

### 13. Download File

**Challenge:** Download a file; assert name and size.

**Skills:** waitForEvent('download')

```ts
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('link', { name: /download/i })
    .or(page.getByRole('button', { name: /download/i })).click(),
]);
expect(download.suggestedFilename()).toMatch(/\.(txt|pdf|png|csv)$/i);
const path = await download.path();
if (path) {
  const fs = require('fs');
  expect(fs.statSync(path).size).toBeGreaterThan(0);
}
```

**Why:** Start waiting before the click.

---

### 14. Onboarding Modal Popup

**Challenge:** Close the modal if displayed; assert the message.

**Skills:** conditional dialog, getByRole('dialog')

```ts
const dialog = page.getByRole('dialog');
if (await dialog.isVisible().catch(() => false)) {
  await dialog.getByRole('button', { name: /close|got it|skip|x/i }).click();
}
await expect(dialog).toBeHidden();
await expect(page.getByText(/.+/).first()).toBeVisible();
```

**Why:** Don't fail if modal already dismissed — handle conditionally.

---

### 15. Budget Tracker

**Challenge:** Add/modify/remove income & expenses; assert list + total persistence.

**Skills:** CRUD UI, reload persistence

```ts
await page.getByLabel(/description|name/i).fill('Salary');
await page.getByLabel(/amount/i).fill('1000');
await page.getByRole('button', { name: /add|income/i }).click();
await expect(page.getByText('Salary')).toBeVisible();
await page.reload();
await expect(page.getByText('Salary')).toBeVisible();
await expect(page.getByText(/1000|1,?000/)).toBeVisible();
```

**Why:** Reload to prove persistence (localStorage), not only in-memory UI.

---

### 16. Right-Click Context Menu

**Challenge:** Open context menu; click each item/sub-item; assert message.

**Skills:** click({ button: 'right' })

```ts
await page.getByText(/right click|context/i).click({ button: 'right' });
await page.getByRole('menuitem', { name: /share/i }).hover();
await page.getByRole('menuitem', { name: /twitter|email/i }).click();
await expect(page.getByText(/clicked|selected|message/i)).toBeVisible();
```

**Why:** Use button:'right'; then treat the menu like normal role locators.

---

### 17. Mouse Hover

**Challenge:** Hover an image; assert movie price.

**Skills:** hover

```ts
await page.getByRole('img', { name: /movie|poster/i }).hover();
await expect(page.getByText(/\$|₹|price/i)).toBeVisible();
```

**Why:** Assert after hover; price often appears only on :hover.

---

### 18. Geolocation

**Challenge:** Set lon -122.03118, lat 37.33182; assert Cupertino.

**Skills:** geolocation, permissions

```ts
// in test or fixture
await context.grantPermissions(['geolocation']);
await context.setGeolocation({ longitude: -122.03118, latitude: 37.33182 });
await page.goto(/* app url */);
await page.getByRole('button', { name: /location|get|detect/i }).click();
await expect(page.getByText(/Cupertino/i)).toBeVisible();
```

**Why:** Permission and coordinates are separate settings.

---

### 19. Navigation Menu

**Challenge:** Open each link in a new window; assert page content.

**Skills:** multi popup, loop

```ts
const links = page.getByRole('navigation').getByRole('link');
const n = await links.count();
for (let i = 0; i < n; i++) {
  const [win] = await Promise.all([
    context.waitForEvent('page'),
    links.nth(i).click({ modifiers: ['Control'] }).catch(() =>
      links.nth(i).evaluate(a => { a.target = '_blank'; (a as HTMLAnchorElement).click(); })
    ),
  ]);
  await win.waitForLoadState();
  await expect(win.locator('body')).not.toBeEmpty();
  await win.close();
}
```

**Why:** Capture each new page; close to avoid leaking windows.

---

### 20. Redirect Chain

**Challenge:** Click and assert each redirected page in the chain.

**Skills:** waitForURL, response chain

```ts
await page.getByRole('button', { name: /redirect|start/i }).click();
await expect(page).toHaveURL(/second|2|redirect/i);
await expect(page).toHaveURL(/third|3|final/i, { timeout: 15_000 });
// Optional: listen to responses
// page.on('response', r => console.log(r.status(), r.url()));
```

**Why:** Assert intermediate URLs, not only the final one.

---

### 21. Fetching Data

**Challenge:** Wait until API data is fetched; assert loaded posts.

**Skills:** waitForResponse, web-first

```ts
const [res] = await Promise.all([
  page.waitForResponse(r => /posts|api/i.test(r.url()) && r.ok()),
  page.getByRole('button', { name: /load|fetch|get/i }).click(),
]);
await expect(page.getByRole('article').or(page.getByRole('listitem'))).not.toHaveCount(0);
expect(res.ok()).toBeTruthy();
```

**Why:** Wait for the response before asserting UI — no sleep.

---

### 22. QR Code Generator

**Challenge:** Generate QR from text; visually assert the image.

**Skills:** toHaveScreenshot, mask

```ts
await page.getByLabel(/text|message/i).fill('Playwright rocks');
await page.getByRole('button', { name: /generate|create/i }).click();
const qr = page.getByRole('img', { name: /qr/i }).or(page.locator('canvas, img').last());
await expect(qr).toBeVisible();
await expect(qr).toHaveScreenshot('qr.png', { maxDiffPixelRatio: 0.05 });
```

**Why:** Generate baselines in the same Docker image as CI.

---

### 23. Changeable Iframe

**Challenge:** Assert ~53s remain on countdown and final 'journey is over' message.

**Skills:** frameLocator, expect.poll

```ts
const frame = page.frameLocator('iframe');
await expect.poll(async () => {
  const t = await frame.getByText(/\d+/).first().textContent();
  return Number((t || '').match(/\d+/)?.[0] || 0);
}).toBeGreaterThan(50);
// Later / after wait:
await expect(frame.getByText(/journey is over|finished|done/i)).toBeVisible({ timeout: 70_000 });
```

**Why:** Timers need poll/timeout budgets; don't hard-assert exact seconds only once.

---

### 24. Rating Range Slider

**Challenge:** Set slider to 50; submit feedback.

**Skills:** fill range, drag slider

```ts
const slider = page.getByRole('slider').or(page.locator('input[type="range"]'));
await slider.fill('50'); // works for many range inputs
await expect(slider).toHaveValue('50');
await page.getByRole('button', { name: /submit|send|feedback/i }).click();
await expect(page.getByText(/thank|success|submitted/i)).toBeVisible();
```

**Why:** fill() on range is often enough; otherwise mouse drag by bounding box.

---

### 25. Register & Login

**Challenge:** Register, then log in with created credentials; assert auth success.

**Skills:** unique data, auth flow

```ts
const user = `user_${Date.now()}@test.com`;
const pass = 'Secret123!';
await page.getByRole('link', { name: /register|sign up/i }).click();
await page.getByLabel(/email/i).fill(user);
await page.getByLabel(/password/i).fill(pass);
await page.getByRole('button', { name: /register|create/i }).click();
await page.getByLabel(/email/i).fill(user);
await page.getByLabel(/password/i).fill(pass);
await page.getByRole('button', { name: /log ?in|sign in/i }).click();
await expect(page.getByText(/welcome|dashboard|logout/i)).toBeVisible();
```

**Why:** Unique email per run so parallel workers don't collide.

---

### 26. JIRA-like Board

**Challenge:** Create, drag/drop, filter, delete issues; assert column state.

**Skills:** kanban, dragTo, filter

```ts
const title = `Bug ${Date.now()}`;
await page.getByRole('button', { name: /new|create|add/i }).click();
await page.getByLabel(/title|summary/i).fill(title);
await page.getByRole('button', { name: /save|create/i }).click();
const card = page.getByText(title);
await expect(card).toBeVisible();
await card.dragTo(page.getByText(/in progress|doing/i));
await page.getByPlaceholder(/filter|search/i).fill(title);
await expect(page.getByText(title)).toBeVisible();
await page.getByText(title).click();
await page.getByRole('button', { name: /delete|remove/i }).click();
await expect(page.getByText(title)).toHaveCount(0);
```

**Why:** Unique titles + assert across columns after DnD.

---

## Interview Q&A

### 1. Why use mini-app challenges instead of one big demo app?

Each challenge isolates one automation problem (nested iframe, Shadow DOM, OTP, DnD). That matches how interviews ask “how would you automate X?” and how you learn framework features quickly without app noise.

### 2. Dynamic Table — Spider-Man row order changes. How do you assert his real name?

Filter the row by text, then assert the name cell. Never use a fixed nth() index.

### 3. OTP / Verify Account — fill() on the whole code fails. Why?

Many OTP UIs are N single-character inputs or listen to key events. Use per-box fill or pressSequentially.

### 4. Nested Iframe — page.getByRole cannot find the button. Fix?

Chain frameLocator: page.frameLocator(...).frameLocator(...).getByRole('button').

### 5. Shadow DOM challenge — do you need a special pierce API?

For open shadow roots, no — Playwright locators pierce automatically. Closed roots cannot be automated without app support. Don't confuse with iframes.

### 6. New Tab vs Pop-Up — same Playwright API?

Yes conceptually — both create a new Page. Use context.waitForEvent('page') before the click. Pop-up exercises often require acting on the popup then asserting on the original page.

### 7. Covered Elements — is force:true the right answer in an interview?

Explain it skips actionability. Prefer closing/removing the overlay. Use force only if the challenge explicitly requires clicking a covered control — and say so.

### 8. Geolocation — set Cupertino coords but UI still denies location?

Grant geolocation permission and setGeolocation. They are independent.

### 9. Fetching Data — how do you wait without sleep?

Promise.all([waitForResponse(...), click()]) then assert posts with web-first expectations.

### 10. Download File — assert name and size?

Await download event, check suggestedFilename(), save/path, then filesystem size > 0.

### 11. Redirect Chain — what should you assert?

Each intermediate URL (or title) in order, not only the final destination — proves the chain works.

### 12. Budget Tracker — how do you prove persistence?

Create a record, page.reload(), assert it still appears and totals match (localStorage/session).

### 13. Sortable List / JIRA board — DnD tips?

Try dragTo first; for custom HTML5 DnD use hover → mouse.down → hover → mouse.up. Assert column/order afterward.

### 14. QR Code — visual assert pitfalls?

Use toHaveScreenshot with tolerance; generate baselines in the same OS/Docker as CI; wait until canvas/img is stable.

### 15. Changeable Iframe countdown — flaky exact second asserts?

Use expect.poll for a range (e.g. > 50s) and a generous timeout for the final message.

### 16. Register & Login — parallel-safe approach?

Unique email per test (Date.now()/faker). Optionally API-register then UI-login. Never share one static user across workers.

### 17. Right-click context menu — Playwright API?

locator.click({ button: 'right' }), then interact with menuitem roles.

### 18. Rating slider — set value to 50?

Often locator.fill('50') on input[type=range] / role slider, then assert value and submit.

### 19. How would you organise a repo of solutions for these mini-app challenges?

One spec file per challenge under tests/miniapps/, shared fixtures, tags @miniapp, and a README linking challenge → solution. Keep each challenge focused on one skill.

### 20. Interview: pick three mini-app challenges that prove different skills.

Example set: Nested Iframe (frameLocator), Shadow DOM (pierce vs closed), Dynamic Table (filter) — or Geolocation + Download + Fetching Data for permissions/events/network.

