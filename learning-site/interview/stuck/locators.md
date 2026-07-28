## Strict mode violation: locator resolved to 2 elements

id: stuck-locators-strict-mode-two-matches
category: locators
severity: common

### Symptom
`Error: strict mode violation: locator('...') resolved to 2 elements` on a click/fill that used to work, often right after an unrelated UI change added a second, visually hidden or off-screen copy of the same element.

### Why it happens
Playwright's strict mode (on by default for locator actions) intentionally refuses to guess which of several matches you meant — a real ambiguity that a non-strict tool would silently resolve to "whichever was first," hiding a genuine test-authoring or DOM-duplication problem. Common causes: a duplicated component for mobile/desktop layouts both present in the DOM, a modal and its trigger sharing similar text, or a list item template rendering more rows than expected.

### How to debug it
1. Read the error message fully — Playwright lists both/all matched elements' outer HTML, which usually makes the duplication obvious immediately.
2. Open the DOM snapshot in the trace and search for the locator's selector to see both matches side by side.
3. Ask whether one match is actually meant to be hidden (`display:none`/off-screen) — if so, scope the locator to visible elements or a more specific container.

### Fix
```ts
// Before: ambiguous across desktop + mobile nav copies
await page.getByRole('link', { name: 'Settings' }).click();

// After: scope to the currently-visible nav
await page.locator('nav[aria-hidden="false"]').getByRole('link', { name: 'Settings' }).click();
// or, if truly duplicated content is a bug, fix the app instead of the locator
```

### Best practice
Treat a strict-mode violation as a signal worth investigating before reaching for `.first()` — sometimes the fix belongs in the app (remove genuine duplication), not the test. When duplication is intentional (responsive layouts), scope locators to the relevant container rather than relying on ordinal position.

### Common wrong fixes
1. Appending `.first()` reflexively without checking which element is actually first — silently locks the test to DOM order, which can flip with unrelated markup changes.
2. Wrapping the click in a try/catch that ignores the strict-mode error — hides a real ambiguity instead of resolving it.
3. Switching to an XPath that "just picks one" via `(//a[text()="Settings"])[1]` — same problem as `.first()`, just less visible in the diff.

### Interview angle
"Your locator suddenly throws a strict-mode error — how do you approach it?" — senior answer: read which two elements matched from the error/DOM snapshot first, decide whether the duplication is a real app bug or expected (responsive layout), and scope the locator to the right container — don't reach for `.first()` by reflex.

### Related
stuck-locators-dynamic-class-names, stuck-table-nth-child (see also code-review-lab CR3)

---

## Locator can't find an element with an auto-generated class name

id: stuck-locators-dynamic-class-names
category: locators
severity: common

### Symptom
A selector like `.css-1a2b3c4` works today and breaks on the next deploy with no visible UI change — the class name itself changed even though nothing about the element's appearance or behavior did.

### Why it happens
CSS-in-JS libraries (styled-components, Emotion, CSS Modules) commonly generate hashed class names at build time that are not guaranteed stable across builds — they're an implementation detail of the styling system, not a stable identifier, even though they look like one.

### How to debug it
1. Diff the class name between the failing build and the last passing one — if it's a hash-looking string that changed with no visual difference, that confirms the theory.
2. Check whether the element has any stable, semantic attribute available instead: role, accessible name, `data-testid`, or a stable non-generated class.
3. If nothing stable exists, that's a signal to request a `data-testid` from engineering rather than keep chasing the moving target.

### Fix
```ts
// Before: brittle, build-generated class name
await page.locator('.css-1a2b3c4').click();

// After: stable, semantic locator
await page.getByRole('button', { name: 'Add to cart' }).click();
// or, if no accessible role/name exists yet, request a data-testid:
await page.getByTestId('add-to-cart').click();
```

### Best practice
Default to Playwright's role/label/text-based locators, which target the *accessible* representation of the UI (a public contract) rather than implementation details; reserve `data-testid` for cases where no accessible name reasonably exists, and never depend on generated/hashed class names.

### Common wrong fixes
1. Pinning the exact current hash and re-updating it every time it changes — turns every unrelated deploy into a test-maintenance chore.
2. Matching with a partial-class regex like `[class*="css-"]` — often matches unrelated elements sharing the same CSS-in-JS prefix.
3. Falling back to absolute XPath position (`/html/body/div[3]/div[2]/button`) — even more brittle than the class name it replaced.

### Interview angle
"A CSS class-based locator breaks on every deploy — what's wrong and how do you fix it for good?" — senior answer: CSS-in-JS-generated class names are implementation details, not a stable contract; migrate to role/label/testid-based locators, which target the accessible UI instead.

### Related
stuck-locators-strict-mode-two-matches, stuck-locators-shadow-root

---

## "Element is not attached to the DOM" right after a click

id: stuck-locators-element-detached
category: locators
severity: common

### Symptom
`Error: element is not attached to the DOM` fires on the *second* action against a locator you already successfully interacted with once in the same test, usually right after a re-render.

### Why it happens
A `Locator` in Playwright is a lazy, re-resolving query — but if you captured a raw `ElementHandle` earlier (via `elementHandle()` or an older API pattern) and the framework re-rendered that DOM node (React/Vue re-mounting rather than mutating in place), the handle you're holding points at a node the browser already discarded. Locators re-query on every action specifically to avoid this; handles do not.

### How to debug it
1. Search the test for `.elementHandle()`, `$eval`, or any pattern that captures a handle once and reuses it across multiple awaits.
2. Check the trace's DOM snapshots immediately before and after the re-render to confirm the element was actually replaced, not just mutated.
3. Confirm whether the re-render is expected app behavior (e.g., a full list re-mount on filter change) versus an unnecessary re-render worth flagging separately.

### Fix
```ts
// Before: captures a handle once, reused after a re-render invalidates it
const el = await page.$('.item-row');
await el?.click();
// ...state changes, row re-renders...
await el?.click(); // stale handle — throws "not attached to the DOM"

// After: a Locator re-resolves on every action, surviving re-renders
const row = page.locator('.item-row');
await row.click();
// ...state changes...
await row.click(); // re-queries fresh, works
```

### Best practice
Avoid `ElementHandle`/`$`/`$$` entirely in new code — use `Locator` for everything, since it re-resolves lazily on each action and is immune to this whole class of bug by design.

### Common wrong fixes
1. Wrapping the second action in a retry loop that re-fetches the handle manually — reimplements what `Locator` already gives you for free, worse and by hand.
2. Adding a `waitForTimeout` before the second action hoping the re-render "settles" first — doesn't fix a stale-reference bug, which isn't a timing issue at all.
3. Wrapping in try/catch and ignoring the error — silently skips a real interaction the test was supposed to perform.

### Interview angle
"What's the difference between an ElementHandle and a Locator, and why does it matter for a re-rendering UI?" — senior answer: a Locator is a lazy query re-resolved on every action; a handle is a live reference to one specific DOM node that becomes stale the moment that node is replaced — always prefer Locator for anything that might re-render.

### Related
stuck-flaky-debug-race-assertion-rerender, stuck-locators-strict-mode-two-matches

---

## Locator times out because the element is "visible" but not really

id: stuck-locators-hidden-vs-visible
category: locators
severity: tricky

### Symptom
`toBeVisible()` (or an action requiring visibility) times out on an element that clearly appears on screen in a screenshot taken at the same moment.

### Why it happens
"Visible" in Playwright's actionability model means more than "has non-zero opacity" — it requires a non-empty bounding box, `visibility` not `hidden`, `display` not `none`, and — the part people miss — the element must not be covered by another element at the point Playwright would interact with it. An overlay, sticky header, or cookie-consent banner positioned above it (even semi-transparent) fails this even though your eyes read the underlying element as "visible."

### How to debug it
1. Read Playwright's own timeout error text closely — recent versions name the specific actionability check that's failing (e.g., "element is outside of the viewport" or "element is covered by another element").
2. Open the trace's DOM snapshot at the failure moment and check `elementFromPoint` at the target's center — is a different element actually on top there?
3. Check CSS: a `position: sticky` header, a toast, or a cookie banner are the most common real-world culprits.

### Fix
```ts
// Diagnose: is something else covering the target?
const box = await page.getByRole('button', { name: 'Continue' }).boundingBox();
console.log(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.outerHTML, {
  x: box!.x + box!.width / 2, y: box!.y + box!.height / 2,
}));

// Fix at the source — dismiss the real blocker, don't force through it
await page.getByRole('button', { name: 'Accept cookies' }).click();
await page.getByRole('button', { name: 'Continue' }).click();
```

### Best practice
Treat an actionability timeout as diagnostic information about a real interaction problem a user would also hit — dismiss the actual blocking element (banner, overlay) as part of the test flow, rather than bypassing the check that caught it.

### Common wrong fixes
1. Adding `{ force: true }` to punch through the check — a real user's click would also hit the cookie banner, so this hides an authentic UX bug (or a test that forgot a precondition) rather than fixing it.
2. Hiding the blocking element via `page.evaluate()` DOM surgery — diverges the tested DOM from what real users see.
3. Increasing the action timeout hoping the overlay disappears eventually — works only if the overlay is temporary, and hides the real cause even when it does.

### Interview angle
"toBeVisible() times out on an element you can see in a screenshot — what does that actually mean?" — senior answer: Playwright's visibility check includes 'not covered by another element at the click point,' so the real cause is almost always something layered on top (banner/overlay) — check `elementFromPoint`, don't reach for `force: true`.

### Related
stuck-waits-timing-animation-covered-click, stuck-locators-strict-mode-two-matches

---

## Locators go stale scrolling through a virtualized list

id: stuck-locators-virtual-scroll
category: locators
severity: tricky

### Symptom
A test that scrolls to "row 200" of a long list and clicks it fails intermittently, or clicks the wrong row — even though the same test reliably worked for "row 5."

### Why it happens
Virtualized lists (react-window, react-virtualized, similar) only render a window of DOM nodes near the current scroll position and recycle/reuse those DOM nodes for different data as you scroll — a `Locator` matched by visible text can point at a *different* logical row than intended if the recycled node hasn't updated yet, or the item you want simply isn't in the DOM at all until you scroll to it.

### How to debug it
1. Confirm the list is virtualized (inspect DOM child count vs. total data length — virtualized lists render far fewer nodes than total items).
2. Check whether the test located the target row by index/position rather than by its actual content, which is unreliable once recycling is involved.
3. Verify scroll-then-locate is happening in the right order — locating before scrolling into view will find nothing or the wrong recycled node.

### Fix
```ts
test('finds a specific row deep in a virtualized list', async ({ page }) => {
  await page.goto('/orders');
  const target = page.getByRole('row', { name: /ORD-10042/ });
  // Scroll incrementally until the target actually mounts, using the app's own
  // scroll container — not the window — since virtualization tracks that container.
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  await target.getByRole('button', { name: 'View' }).click();
});
```

### Best practice
Locate virtualized rows by their real content (an order ID, a name), never by numeric position, and prefer `scrollIntoViewIfNeeded()` (which Playwright retries) over manual `mouse.wheel` loops; if the app exposes a search/filter to jump directly to the row, prefer that over scrolling at all.

### Common wrong fixes
1. Scrolling by a fixed pixel amount in a loop with `waitForTimeout` between each step — slow, and fragile to row-height or viewport changes.
2. Locating by DOM index (`nth(37)`) assuming it maps to data index 37 — recycling breaks this assumption entirely.
3. Disabling virtualization "for tests only" via a special test-mode flag — tests a materially different DOM than what real users experience, undermining the point of the test.

### Interview angle
"How do you reliably click a specific row deep inside a virtualized/infinite-scroll list?" — senior answer: locate by real content (not index or position), use `scrollIntoViewIfNeeded()`, and understand that DOM nodes are recycled — position-based locators are fundamentally unreliable there.

### Related
stuck-locators-strict-mode-two-matches, stuck-files-data-dynamic-table-order

---

## Locator can't reach content inside a closed shadow root

id: stuck-locators-shadow-root
category: locators
severity: rare

### Symptom
A component clearly renders in the browser (visible in DevTools, visible on screen), but every Playwright locator targeting its internals returns zero matches, even simple ones like `text=Submit`.

### Why it happens
Playwright automatically pierces **open** shadow roots as if they were regular DOM — but it cannot pierce **closed** shadow roots at all, by browser design (that's the entire point of "closed" mode: even JavaScript running on the page can't reach in). Some third-party design-system web components default to closed mode.

### How to debug it
1. In DevTools, inspect the component and check whether its shadow root shows as `#shadow-root (open)` or `#shadow-root (closed)`.
2. If closed, confirm there's genuinely no other way in — no exposed slot, no light-DOM projection you could target instead.
3. Ask the component's maintainers (internal or third-party) whether an open-mode "test build" flag exists.

### Fix
```ts
// If the component is internal: request/ship open shadow mode for test builds
// customElements.define('my-widget', class extends HTMLElement {
//   constructor() { super(); this.attachShadow({ mode: 'open' }); } // was 'closed'
// });

// Once open, Playwright pierces it like normal DOM:
await page.locator('my-widget').getByRole('button', { name: 'Submit' }).click();
```

### Best practice
For internal components, standardize on `open` shadow mode (it doesn't meaningfully weaken encapsulation for typical apps and unlocks testability); for third-party closed-shadow components you don't control, ask for a host-level `data-testid` or an exposed public API/event to drive the interaction instead of trying to reach inside.

### Common wrong fixes
1. Trying browser-devtools-only tricks (`$0.shadowRoot`) inside `page.evaluate()` — closed shadow roots are inaccessible to page-context JavaScript too, this doesn't work.
2. Switching to a full CDP-level workaround to force access — fragile, version-specific, and fights the platform's explicit privacy boundary instead of working with the component's public surface.
3. Abandoning automated coverage of that component entirely with no escalation — silently drops real coverage instead of flagging a testability gap.

### Interview angle
"Playwright can't find anything inside a web component — why, and what do you do?" — senior answer: check whether it uses closed-mode shadow DOM, which Playwright (correctly) cannot pierce by design; the fix is requesting open mode or a host-level test hook, not a workaround that fights the browser's privacy boundary.

### Related
stuck-locators-dynamic-class-names, stuck-frames-windows-cross-origin-iframe

---

## Text locator accidentally matches a `<script>` tag's contents

id: stuck-locators-text-matches-script
category: locators
severity: rare

### Symptom
A broad text-based locator like `page.locator('text=userId')` matches more elements than expected, including one that turns out to be a `<script>` block containing inline JSON with that string inside it.

### Why it happens
A plain CSS/text selector without a role or tag constraint searches the rendered text content broadly; if the app inlines JSON state (`<script>window.__DATA__ = {...}</script>`) or analytics snippets containing your search string as a literal substring, a loose locator can't distinguish "text a user reads" from "text that happens to be inside script/style tags."

### How to debug it
1. Reproduce the match count issue and inspect exactly which elements matched — Playwright's strict-mode error (if triggered) will show you the offending `<script>` node directly.
2. Check the page source for inlined JSON/analytics blobs near the search string.
3. Confirm whether a role- or tag-scoped locator would have avoided the match entirely.

### Fix
```ts
// Before: too broad, can match inline <script> content
await expect(page.locator('text=userId')).toBeVisible();

// After: scope by role/tag so non-visual nodes are never candidates
await expect(page.getByRole('heading', { name: /userId/i })).toBeVisible();
// or, for prose content specifically:
await expect(page.locator('main').getByText('userId')).toBeVisible();
```

### Best practice
Default to role-based locators (`getByRole`, `getByLabel`, `getByText` scoped to a real container) instead of a bare `text=` selector with no structural constraint — role-based queries only ever match the accessibility tree, which never includes script/style content.

### Common wrong fixes
1. Adding `:not(script)` CSS exclusions ad hoc every time a new false match appears — a whack-a-mole approach instead of switching to a locator strategy immune to the whole class of bug.
2. Asserting `nth(1)` because "the real one is always second" — brittle to any future addition of more inlined blobs.
3. Suppressing the assertion failure with a broad try/catch — masks a real locator-quality issue instead of fixing it.

### Interview angle
"A text-based locator matched something inside a script tag — what locator strategy prevents this entirely?" — senior answer: role-based locators (`getByRole`, `getByLabel`) only query the accessibility tree, which never includes non-visual nodes like `<script>`/`<style>` — prefer them over bare text selectors.

### Related
stuck-locators-strict-mode-two-matches, stuck-locators-dynamic-class-names

---

## Locator works in DevTools console but fails in the actual test

id: stuck-locators-devtools-vs-test
category: locators
severity: common

### Symptom
`document.querySelector('.submit-btn')` finds the element instantly when pasted into the browser's DevTools console, but the equivalent Playwright locator in the test times out with zero matches.

### Why it happens
The most common cause: the element genuinely doesn't exist yet at the moment the test tries to locate it (DevTools is being run *after* the page has already fully loaded and possibly after the exact user action that created the element, while the test runs the check earlier in its own timeline). A second common cause: the element lives inside an `<iframe>` — DevTools' default console context is the top document, so a raw `querySelector` there silently returns null for cross-frame content unless you've switched context, while a Playwright `page.locator()` also only searches the top document (you'd need `frameLocator`).

### How to debug it
1. Confirm you're comparing like-for-like: reproduce the DevTools check at the *exact same point in the flow* the test is at (before any subsequent user action), not after manually finishing the flow by hand.
2. Check whether the element is inside an iframe — DevTools' context selector dropdown will reveal this immediately.
3. Add a screenshot immediately before the failing locate to see the actual page state at that moment.

### Fix
```ts
// If it's an iframe issue:
const frame = page.frameLocator('#payment-iframe');
await frame.getByRole('button', { name: 'Submit' }).click();

// If it's a timing issue, wait for the real precondition, not a sleep:
await expect(page.getByRole('status')).toHaveText('Ready');
await page.getByRole('button', { name: 'Submit' }).click();
```

### Best practice
Always reproduce a "works in DevTools" claim at the exact point in the flow the automated test is at — pasting a selector into a fully-loaded page after manually finishing the flow is not the same test as the one that's failing, and iframe context is the single most common gap between the two.

### Common wrong fixes
1. Adding a long fixed sleep before the locate "to match how long it took to check manually" — an unreliable proxy for the actual readiness condition.
2. Switching to `page.evaluate(() => document.querySelector(...))` because "it worked in the console" — reimplements a non-retrying, non-actionability-checked lookup and reintroduces exactly the flakiness Playwright locators exist to prevent.
3. Assuming Playwright is "buggy" and adding a global retry wrapper around all locate calls — treats a reproducible logic bug (iframe/timing) as random flakiness.

### Interview angle
"A selector works instantly in the DevTools console but times out in Playwright — what are your first two hypotheses?" — senior answer: either the element genuinely doesn't exist yet at that point in the test's timeline (a timing/precondition gap vs. the manual check), or it's inside an iframe that a plain `querySelector` in the top-frame console context wouldn't have reached either.

### Related
stuck-frames-windows-iframe-not-found, stuck-waits-timing-timeout-30000-triage
