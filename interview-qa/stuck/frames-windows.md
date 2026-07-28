## Element inside an iframe is never found

id: stuck-frames-windows-iframe-not-found
category: frames-windows
severity: common

### Symptom
`page.getByRole(...)` or `page.locator(...)` times out with zero matches for an element that's clearly visible inside an embedded widget (payment form, chat widget, video embed) on the page.

### Why it happens
`page` locators only ever search the top-level document. Anything inside an `<iframe>` lives in a separate document that has to be addressed explicitly — Playwright doesn't automatically reach into frames the way a human eye does when looking at the rendered page.

### How to debug it
1. View the page source or DevTools Elements panel and confirm the target element's closest ancestor is an `<iframe>`.
2. Check the trace's frame list (the trace viewer shows a frame tree) to find the iframe's name/URL.
3. Confirm you're not confusing this with a shadow-root case — iframes and shadow roots look similar in the DOM tree but need entirely different Playwright APIs.

### Fix
```ts
// Before: searches only the top document, never finds it
await page.getByLabel('Card number').fill('4242424242424242');

// After: explicitly address the frame
const cardFrame = page.frameLocator('iframe[title="Secure card payment frame"]');
await cardFrame.getByLabel('Card number').fill('4242424242424242');
```

### Best practice
Use `frameLocator()` with a stable selector (a `title`, `name`, or unique `src` fragment) rather than positional (`iframe >> nth=0`) — frame order can change if the page adds another embed later.

### Common wrong fixes
1. Calling `page.frame({ url: '...' })` and then using old-style `ElementHandle` APIs on it — works but loses Playwright's auto-retrying locator behavior that `frameLocator()` gives you.
2. Using `page.evaluate()` to reach into the iframe's `contentDocument` — bypasses actionability checks entirely and will throw on cross-origin iframes due to browser security.
3. Giving up and asserting only on the outer page state — silently drops real coverage of the embedded widget's behavior.

### Interview angle
"An element you can see on the page is never found by a locator — what's the first thing you check?" — senior answer: whether it's inside an iframe, since `page` locators never implicitly search into frames — use `frameLocator()` addressed by a stable attribute.

### Related
stuck-frames-windows-nested-iframes, stuck-frames-windows-cross-origin-iframe

---

## Nested iframes make the target unreachable

id: stuck-frames-windows-nested-iframes
category: frames-windows
severity: tricky

### Symptom
`frameLocator('iframe').getByRole(...)` finds nothing even though the element is visibly inside *an* iframe — because it's actually inside a second iframe nested within the first one.

### Why it happens
`frameLocator()` addresses exactly one level of frame; if the target markup is two (or more) levels deep — an outer widget iframe that itself embeds another iframe (common with third-party payment/ad widgets composing sub-widgets) — you need to chain `frameLocator()` calls, one per level, matching the actual nesting.

### How to debug it
1. In DevTools, use the frame-context dropdown in the console to walk down through each nested frame and confirm how many levels deep the target actually sits.
2. In the Playwright trace viewer, expand the frame tree fully — nested frames are shown as children of their parent frame.
3. Try locating just the outer frame's container first, then progressively add one more `.frameLocator()` level until the target resolves.

### Fix
```ts
// Two levels deep: outer widget iframe → inner payment iframe
const outer = page.frameLocator('iframe[name="widget-outer"]');
const inner = outer.frameLocator('iframe[name="widget-inner"]');
await inner.getByLabel('CVC').fill('123');
```

### Best practice
Chain `frameLocator()` calls to match the real nesting exactly rather than guessing at a single level; if the nesting is deep and fragile (third-party composing third-party), consider whether an API-level test of the underlying integration is more valuable than a brittle multi-level UI test.

### Common wrong fixes
1. Using `page.locator('iframe iframe').contentFrame()` chains — mixes an older, non-retrying pattern with the newer API and is easy to get subtly wrong about which level you're addressing.
2. Trying `page.frameLocator('iframe >> iframe')` string-chaining — not valid syntax for nested frame addressing and easy to misdiagnose as "iframes are broken."
3. Flattening the assertion to only check the outer frame loaded (`toBeVisible()` on the iframe element itself) — proves far less than actually verifying the inner widget's content.

### Interview angle
"How do you locate an element inside an iframe that's nested inside another iframe?" — senior answer: chain `frameLocator()` once per nesting level, matching the real DOM structure — there's no single call that reaches through multiple levels automatically.

### Related
stuck-frames-windows-iframe-not-found, stuck-frames-windows-cross-origin-iframe

---

## Cross-origin iframe blocks reading its content

id: stuck-frames-windows-cross-origin-iframe
category: frames-windows
severity: tricky

### Symptom
A `frameLocator()` targeting a third-party embed (payment provider, video player from another domain) can click visible buttons but any attempt to read certain content, or a `page.evaluate()` reaching into that frame's document, fails or returns limited data.

### Why it happens
Cross-origin iframes are subject to the browser's same-origin policy, same as any other cross-origin access — Playwright's `frameLocator` still works for interacting with the frame's *rendered* elements (it operates at the automation-protocol level, not through JS `document.getElementById`), but page-context JavaScript (`page.evaluate`) genuinely cannot read across origins, and some providers deliberately restrict what's exposed inside their iframe for security (e.g., masking card numbers).

### How to debug it
1. Confirm whether the operation that's failing is a Playwright locator action (should work fine cross-origin) versus a `page.evaluate()`/JS-based reach into the frame (subject to same-origin policy).
2. Check the provider's documentation — many payment/embed providers intentionally limit what's readable from their iframe as a security feature, not a bug.
3. Test with a best-effort try/catch fallback if partial verification is acceptable (e.g., can't read card digits, but can confirm a success postMessage fired).

### Fix
```ts
test('cross-origin iframe is reachable for interaction', async ({ page }) => {
  const frame = page.frameLocator('iframe[title="Payment"]');
  await frame.getByLabel('Card number').fill('4242424242424242'); // interaction: fine
  // Reading is fine when it's Playwright locating rendered elements...
  await expect(frame.getByText('Card accepted')).toBeVisible();
  // ...but reaching in via page.evaluate() across origins will not work — don't rely on it.
});
```

### Best practice
Rely on `frameLocator()` for interaction and on visible UI state (success/error text rendered inside the frame) for verification, rather than trying to read internal frame data via `page.evaluate()`; if the provider offers a `postMessage`-based event on success/failure, listen for that on the parent page instead.

### Common wrong fixes
1. Launching the browser with disabled web security flags to "unblock" cross-origin access — changes browser behavior in a way that doesn't match real users and can hide genuine cross-origin bugs.
2. Trying to proxy/inline the iframe's content same-origin just for testing — tests a materially different setup than production.
3. Giving up on any verification of the embedded frame's outcome — silently drops coverage of a critical payment/checkout step.

### Interview angle
"You can interact with a cross-origin iframe but can't read its internals via page.evaluate() — is that a Playwright bug?" — senior answer: no, it's the browser's same-origin policy, which Playwright correctly respects; verify via the frame's own rendered UI state (`frameLocator` + visible text) or a `postMessage` event instead.

### Related
stuck-frames-windows-nested-iframes, stuck-locators-shadow-root

---

## Popup window handling breaks the rest of the test

id: stuck-frames-windows-popup-handling
category: frames-windows
severity: common

### Symptom
A flow that opens a popup (share dialog, print preview, third-party embed) either hangs waiting for the popup, or continues driving actions against the *original* page while the user's real next action needed to happen in the popup.

### Why it happens
A popup is a distinct `Page` object that must be captured explicitly the moment it's about to open — if the listener is registered *after* the triggering click (a common ordering mistake), there's a race where the popup may already exist and the event was missed, or the code proceeds against the wrong page entirely.

### How to debug it
1. Check the code order: is `context.waitForEvent('page')` (or `page.waitForEvent('popup')`) started *before* the action that triggers the popup, inside the same `Promise.all`?
2. In the trace, confirm how many pages exist in the trace's page list and at what timestamp the second one appears relative to the triggering click.
3. If the popup is expected to close itself, confirm the test isn't still trying to interact with it after that.

### Fix
```ts
test('share dialog opens in a popup and completes', async ({ page }) => {
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Share' }).click(),
  ]);
  await popup.waitForLoadState();
  await popup.getByRole('button', { name: 'Post' }).click();
  await popup.waitForEvent('close').catch(() => {}); // some providers auto-close
  await expect(page.getByText('Shared successfully')).toBeVisible();
});
```

### Best practice
Always register the popup-wait *before* triggering the action that opens it (`Promise.all` pattern), never after; treat the popup as its own page object with its own lifecycle, and explicitly decide (and assert) whether it's expected to close itself or needs to be closed by the test.

### Common wrong fixes
1. Polling `context.pages().length` in a loop with sleeps to "wait for the popup to appear" — reimplements what `waitForEvent('page')` already does, with worse timing precision.
2. Ignoring the popup entirely and asserting success based only on the opener page's state — may pass even if the popup flow itself silently failed.
3. Using `page.on('popup', ...)` as a global listener registered once at test-file scope shared across tests — can leak popup pages between tests if not closed, polluting later tests' `context.pages()`.

### Interview angle
"A test triggers a popup — what's the pattern to reliably capture and drive it?" — senior answer: `Promise.all([page.waitForEvent('popup'), triggerAction()])` so the listener is registered before the race can be lost, then treat the popup as its own `Page` with its own waits and assertions.

### Related
stuck-login-auth-oauth-popup, stuck-frames-windows-new-tab-reload

---

## New tab loses previously-found locators after a reload

id: stuck-frames-windows-new-tab-reload
category: frames-windows
severity: tricky

### Symptom
A test opens content in a new tab, successfully interacts with it, the tab reloads (or navigates) as part of the flow, and every subsequent locator captured *before* the reload now times out — even ones that look identical to before.

### Why it happens
This is the same root cause as a stale `ElementHandle` (see the locators category) but shows up specifically around navigation: any handle-based reference (or, less commonly, a `Locator` bound to a frame object that itself got replaced by the navigation) can no longer resolve against the new document. `Locator` objects bound to `page` re-resolve fine across reloads; the issue is almost always a captured `Frame`/`ElementHandle` reference or a `frameLocator` built from a frame handle that no longer exists.

### How to debug it
1. Check whether the code captured a `Frame` object (e.g., via `page.frame({ name: ... })`) before the reload and kept using that same reference afterward.
2. Confirm in the trace whether a full navigation (not just a re-render) actually occurred at the failure point.
3. Re-derive any frame/locator references *after* the reload rather than reusing pre-reload ones.

### Fix
```ts
test('new tab survives an internal reload', async ({ page, context }) => {
  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Open report' }).click(),
  ]);
  await tab.waitForLoadState();
  await tab.getByRole('button', { name: 'Refresh data' }).click();
  await tab.waitForLoadState(); // re-navigation happened — re-derive locators after this
  await expect(tab.getByTestId('report-updated-at')).toBeVisible();
});
```

### Best practice
Re-derive locators (call `page.locator(...)`/`getByRole(...)` again) after any navigation rather than holding onto references captured beforehand; `Locator` objects themselves are cheap and safe to recreate — there's no need to cache them across a reload.

### Common wrong fixes
1. Wrapping the post-reload action in a retry loop hoping the stale reference "catches up" — a stale frame/handle reference never becomes valid again, no amount of retrying helps.
2. Adding `page.waitForTimeout()` after the reload before continuing — doesn't address a stale-reference bug, which isn't a timing issue.
3. Closing and reopening the tab entirely to "reset" — works around the symptom but doesn't test the actual reload behavior the scenario was meant to cover.

### Interview angle
"Locators that worked before a reload suddenly fail after it — what's the likely cause?" — senior answer: a captured `Frame`/`ElementHandle` reference from before the navigation is now stale; re-derive locators fresh after any reload rather than reusing pre-navigation references.

### Related
stuck-locators-element-detached, stuck-frames-windows-popup-handling

---

## A native dialog gets auto-dismissed before the test can assert on it

id: stuck-frames-windows-dialog-auto-dismissed
category: frames-windows
severity: common

### Symptom
An action that should trigger a native `confirm()`/`alert()`/`prompt()` dialog seems to just... proceed, with the test never seeing the dialog it expected to assert on or respond to.

### Why it happens
Playwright auto-dismisses native JavaScript dialogs by default (`confirm()` returns `false`, `alert()` is dismissed) unless you register a `page.on('dialog', ...)` handler *before* the triggering action — without a handler, the dialog is gone before your test code gets a chance to look at it, which explains why a "confirm before deleting" flow silently behaves as if the user clicked "Cancel."

### How to debug it
1. Check whether a `page.on('dialog', ...)` listener exists anywhere in the test, and — critically — whether it was registered before the action that triggers the dialog.
2. Confirm the behavior matches "as if Cancel was clicked" (e.g., a delete that should have happened didn't) — that's the signature of the default auto-dismiss.
3. If the app is moving to a custom (non-native) confirm dialog instead of `window.confirm()`, verify which one it actually uses now — the fix is different for a real DOM modal.

### Fix
```ts
test('confirm dialog is accepted before delete proceeds', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.accept()); // register BEFORE the click
  await page.getByRole('button', { name: 'Delete item' }).click();
  await expect(page.getByText('Item deleted')).toBeVisible();
});

test('confirm dialog cancel path leaves item intact', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete item' }).click();
  await expect(page.getByText('Item deleted')).toHaveCount(0);
});
```

### Best practice
Always register the `page.on('dialog', ...)` handler before triggering the action, and explicitly test both the accept and dismiss paths for anything destructive gated by a confirm dialog — don't rely on the default auto-dismiss behavior implicitly.

### Common wrong fixes
1. Assuming the dialog "just works" and never registering a handler — silently gets the default-dismiss behavior, which for a delete-confirmation flow means the delete never actually gets tested.
2. Registering the handler with `page.on()` (not `.once()`) at file scope and never removing it — can leak into unrelated tests in the same file if dialogs appear unexpectedly elsewhere.
3. Trying to interact with the dialog as if it were a DOM element (`page.getByRole('alertdialog')`) — native `window.confirm()`/`alert()` dialogs are OS-level chrome, not part of the page's DOM, and require the `dialog` event API specifically.

### Interview angle
"A delete action with a confirm() dialog seems to silently do nothing in your test — why?" — senior answer: Playwright auto-dismisses native dialogs by default; without a `page.on('dialog', ...)` handler registered before the triggering action, the confirm is effectively always 'Cancel.'

### Related
stuck-frames-windows-popup-handling, stuck-waits-timing-animation-covered-click
