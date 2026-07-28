/* Mini-app challenges + Playwright solutions + interview Q&A (this site) */
window.MINIAPPS_DATA = {
  hub: {
    title: "Mini-app challenges",
    lead: "Each card is a live mini-app challenge. Complete the task in the practice UI, then reveal the Playwright solution. Built for interview prep — all on this site.",
  },

  challenges: [
    {
      id: "ma-dynamic-table",
      name: "Dynamic Table",
      challenge: "Find Spider-Man in a table whose row order changes, then assert his real name.",
      skills: ["filter", "getByRole('row')", "dynamic data"],
      tags: ["table", "locator"],
      solution: `// Don't use nth() — filter by visible text
const row = page.getByRole('row').filter({ hasText: 'Spider-Man' });
await expect(row.getByRole('cell').nth(1)).toHaveText(/Peter Parker/i);
// or:
await expect(page.getByRole('row').filter({ hasText: 'Spider-Man' }))
  .toContainText('Peter Parker');`,
      why: "Row indexes shuffle; text filter is order-independent.",
    },
    {
      id: "ma-otp",
      name: "Verify Your Account (OTP)",
      challenge: "Enter a valid code via key-up buttons or typing, then assert success.",
      skills: ["pressSequentially", "getByRole", "OTP UI"],
      tags: ["otp", "keyboard"],
      solution: `const code = '123456'; // or read from test env / test OTP
const inputs = page.locator('input[maxlength=\"1\"]');
if (await inputs.count()) {
  for (let i = 0; i < code.length; i++) await inputs.nth(i).fill(code[i]);
} else {
  await page.getByLabel(/code/i).pressSequentially(code);
}
await expect(page.getByText(/success|verified/i)).toBeVisible();`,
      why: "OTP boxes often need per-digit fill or pressSequentially, not one fill().",
    },
    {
      id: "ma-tags",
      name: "Tags Input Box",
      challenge: "Add and remove tags; assert presence and count.",
      skills: ["fill", "press Enter", "toHaveCount"],
      tags: ["tags", "list"],
      solution: `const input = page.getByPlaceholder(/tag|add/i);
await input.fill('playwright');
await input.press('Enter');
await input.fill('typescript');
await input.press('Enter');
await expect(page.getByText('playwright')).toBeVisible();
await expect(page.locator('.tag, [data-tag]')).toHaveCount(2);
await page.getByText('playwright').locator('..').getByRole('button').click();
await expect(page.getByText('playwright')).toHaveCount(0);`,
      why: "Assert both text presence and count after add/remove.",
    },
    {
      id: "ma-multilevel",
      name: "Multi Level Dropdown",
      challenge: "Navigate sub-menus; assert menu item text and link.",
      skills: ["hover", "getByRole", "nested menus"],
      tags: ["menu", "hover"],
      solution: `await page.getByRole('button', { name: /menu|products/i }).hover();
await page.getByRole('menuitem', { name: /category/i }).hover();
const item = page.getByRole('menuitem', { name: /item/i });
await expect(item).toBeVisible();
await expect(item).toHaveAttribute('href', /.+/);
await item.click();`,
      why: "Hover parent before asserting child; don't click too early.",
    },
    {
      id: "ma-sortable",
      name: "Sortable List",
      challenge: "Drag items into correct order, click verify, assert all green.",
      skills: ["dragTo", "DnD"],
      tags: ["dnd", "list"],
      solution: `const items = page.locator('[draggable=\"true\"], .sortable-item');
// Example: move first item onto third slot — adjust to app's expected order
await items.nth(0).dragTo(items.nth(2));
await page.getByRole('button', { name: /check|verify|submit/i }).click();
await expect(page.locator('.text-green, .success, [data-ok=\"true\"]')).toHaveCount(await items.count());`,
      why: "Prefer dragTo; fall back to mouse down/move/up if custom DnD.",
    },
    {
      id: "ma-new-tab",
      name: "New Tab",
      challenge: "Click to open a new tab; assert text on the new page.",
      skills: ["waitForEvent('page')"],
      tags: ["tabs"],
      solution: `const [tab] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('button', { name: /new tab|open/i }).click(),
]);
await tab.waitForLoadState();
await expect(tab.getByText(/.+/)).toBeVisible();
await expect(tab.locator('body')).not.toBeEmpty();`,
      why: "Register the page event before the click.",
    },
    {
      id: "ma-popup",
      name: "Pop-Up Window",
      challenge: "Open popup, click inside it, assert text back on the main window.",
      skills: ["popup page", "cross-window"],
      tags: ["popup"],
      solution: `const [popup] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('button', { name: /pop-?up|open/i }).click(),
]);
await popup.waitForLoadState();
await popup.getByRole('button', { name: /submit|ok|click/i }).click();
await expect(page.getByText(/success|done|received/i)).toBeVisible();`,
      why: "Popup is another Page in the same context; assert on the original page afterward.",
    },
    {
      id: "ma-nested-iframe",
      name: "Nested Iframe",
      challenge: "Click a button inside an iframe nested in another iframe; assert success.",
      skills: ["frameLocator chaining"],
      tags: ["iframe"],
      solution: `const inner = page.frameLocator('iframe').frameLocator('iframe');
await inner.getByRole('button').click();
await expect(page.getByText(/success/i)).toBeVisible();
// Prefer stable iframe name/title when available:
// page.frameLocator('iframe[name=\"outer\"]').frameLocator('iframe[name=\"inner\"]')`,
      why: "Page locators never pierce frames — chain frameLocator.",
    },
    {
      id: "ma-shadow",
      name: "Shadow DOM",
      challenge: "Click the button; assert progress is at 95%.",
      skills: ["open shadow piercing"],
      tags: ["shadow"],
      solution: `// Open shadow roots: normal locators pierce automatically
await page.getByRole('button', { name: /boost|start|progress/i }).click();
await expect(page.getByText(/95\\s*%/)).toBeVisible();`,
      why: "Don't confuse with iframes; closed shadow needs app cooperation.",
    },
    {
      id: "ma-stars",
      name: "Stars Rating Widget",
      challenge: "Set each rate value; assert by image, text, and number.",
      skills: ["click star", "multi assert"],
      tags: ["rating"],
      solution: `for (const n of [1, 2, 3, 4, 5]) {
  await page.getByRole('radio', { name: new RegExp(String(n)) })
    .or(page.locator(\`[data-value=\"\${n}\"]\`)).first().click();
  await expect(page.getByText(new RegExp(String(n)))).toBeVisible();
}`,
      why: "Assert multiple representations (value, label, icon state).",
    },
    {
      id: "ma-covered",
      name: "Covered Elements",
      challenge: "Click a covered/hidden button and assert the hidden message.",
      skills: ["actionability", "force sparingly"],
      tags: ["overlay"],
      solution: `// Prefer removing/closing the cover first
const cover = page.locator('.overlay, .cover');
if (await cover.isVisible().catch(() => false)) {
  await cover.getByRole('button', { name: /close|x/i }).click().catch(async () => {
    await cover.evaluate(el => el.remove());
  });
}
await page.getByRole('button', { name: /hidden|secret|click/i }).click();
await expect(page.getByText(/hidden message|success/i)).toBeVisible();
// force:true only if the exercise requires clicking through a cover`,
      why: "Interviews care that you know force skips actionability — explain when it's intentional.",
    },
    {
      id: "ma-upload",
      name: "Upload File",
      challenge: "Upload an image; assert the file name.",
      skills: ["setInputFiles"],
      tags: ["upload"],
      solution: `await page.getByLabel(/upload|file/i)
  .or(page.locator('input[type=\"file\"]'))
  .setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgo=', 'base64'),
  });
await expect(page.getByText(/avatar\\.png/i)).toBeVisible();`,
      why: "Never automate the OS file dialog.",
    },
    {
      id: "ma-download",
      name: "Download File",
      challenge: "Download a file; assert name and size.",
      skills: ["waitForEvent('download')"],
      tags: ["download"],
      solution: `const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('link', { name: /download/i })
    .or(page.getByRole('button', { name: /download/i })).click(),
]);
expect(download.suggestedFilename()).toMatch(/\\.(txt|pdf|png|csv)$/i);
const path = await download.path();
if (path) {
  const fs = require('fs');
  expect(fs.statSync(path).size).toBeGreaterThan(0);
}`,
      why: "Start waiting before the click.",
    },
    {
      id: "ma-onboarding",
      name: "Onboarding Modal Popup",
      challenge: "Close the modal if displayed; assert the message.",
      skills: ["conditional dialog", "getByRole('dialog')"],
      tags: ["modal"],
      solution: `const dialog = page.getByRole('dialog');
if (await dialog.isVisible().catch(() => false)) {
  await dialog.getByRole('button', { name: /close|got it|skip|x/i }).click();
}
await expect(dialog).toBeHidden();
await expect(page.getByText(/.+/).first()).toBeVisible();`,
      why: "Don't fail if modal already dismissed — handle conditionally.",
    },
    {
      id: "ma-budget",
      name: "Budget Tracker",
      challenge: "Add/modify/remove income & expenses; assert list + total persistence.",
      skills: ["CRUD UI", "reload persistence"],
      tags: ["crud", "state"],
      solution: `await page.getByLabel(/description|name/i).fill('Salary');
await page.getByLabel(/amount/i).fill('1000');
await page.getByRole('button', { name: /add|income/i }).click();
await expect(page.getByText('Salary')).toBeVisible();
await page.reload();
await expect(page.getByText('Salary')).toBeVisible();
await expect(page.getByText(/1000|1,?000/)).toBeVisible();`,
      why: "Reload to prove persistence (localStorage), not only in-memory UI.",
    },
    {
      id: "ma-context-menu",
      name: "Right-Click Context Menu",
      challenge: "Open context menu; click each item/sub-item; assert message.",
      skills: ["click({ button: 'right' })"],
      tags: ["contextmenu"],
      solution: `await page.getByText(/right click|context/i).click({ button: 'right' });
await page.getByRole('menuitem', { name: /share/i }).hover();
await page.getByRole('menuitem', { name: /twitter|email/i }).click();
await expect(page.getByText(/clicked|selected|message/i)).toBeVisible();`,
      why: "Use button:'right'; then treat the menu like normal role locators.",
    },
    {
      id: "ma-hover",
      name: "Mouse Hover",
      challenge: "Hover an image; assert movie price.",
      skills: ["hover"],
      tags: ["hover"],
      solution: `await page.getByRole('img', { name: /movie|poster/i }).hover();
await expect(page.getByText(/\\$|₹|price/i)).toBeVisible();`,
      why: "Assert after hover; price often appears only on :hover.",
    },
    {
      id: "ma-geo",
      name: "Geolocation",
      challenge: "Set lon -122.03118, lat 37.33182; assert Cupertino.",
      skills: ["geolocation", "permissions"],
      tags: ["geo"],
      solution: `// in test or fixture
await context.grantPermissions(['geolocation']);
await context.setGeolocation({ longitude: -122.03118, latitude: 37.33182 });
await page.goto(/* app url */);
await page.getByRole('button', { name: /location|get|detect/i }).click();
await expect(page.getByText(/Cupertino/i)).toBeVisible();`,
      why: "Permission and coordinates are separate settings.",
    },
    {
      id: "ma-nav-menu",
      name: "Navigation Menu",
      challenge: "Open each link in a new window; assert page content.",
      skills: ["multi popup", "loop"],
      tags: ["tabs", "nav"],
      solution: `const links = page.getByRole('navigation').getByRole('link');
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
}`,
      why: "Capture each new page; close to avoid leaking windows.",
    },
    {
      id: "ma-redirect",
      name: "Redirect Chain",
      challenge: "Click and assert each redirected page in the chain.",
      skills: ["waitForURL", "response chain"],
      tags: ["navigation"],
      solution: `await page.getByRole('button', { name: /redirect|start/i }).click();
await expect(page).toHaveURL(/second|2|redirect/i);
await expect(page).toHaveURL(/third|3|final/i, { timeout: 15_000 });
// Optional: listen to responses
// page.on('response', r => console.log(r.status(), r.url()));`,
      why: "Assert intermediate URLs, not only the final one.",
    },
    {
      id: "ma-fetch",
      name: "Fetching Data",
      challenge: "Wait until API data is fetched; assert loaded posts.",
      skills: ["waitForResponse", "web-first"],
      tags: ["api", "wait"],
      solution: `const [res] = await Promise.all([
  page.waitForResponse(r => /posts|api/i.test(r.url()) && r.ok()),
  page.getByRole('button', { name: /load|fetch|get/i }).click(),
]);
await expect(page.getByRole('article').or(page.getByRole('listitem'))).not.toHaveCount(0);
expect(res.ok()).toBeTruthy();`,
      why: "Wait for the response before asserting UI — no sleep.",
    },
    {
      id: "ma-qr",
      name: "QR Code Generator",
      challenge: "Generate QR from text; visually assert the image.",
      skills: ["toHaveScreenshot", "mask"],
      tags: ["visual"],
      solution: `await page.getByLabel(/text|message/i).fill('Playwright rocks');
await page.getByRole('button', { name: /generate|create/i }).click();
const qr = page.getByRole('img', { name: /qr/i }).or(page.locator('canvas, img').last());
await expect(qr).toBeVisible();
await expect(qr).toHaveScreenshot('qr.png', { maxDiffPixelRatio: 0.05 });`,
      why: "Generate baselines in the same Docker image as CI.",
    },
    {
      id: "ma-changeable-iframe",
      name: "Changeable Iframe",
      challenge: "Assert ~53s remain on countdown and final 'journey is over' message.",
      skills: ["frameLocator", "expect.poll"],
      tags: ["iframe", "timer"],
      solution: `const frame = page.frameLocator('iframe');
await expect.poll(async () => {
  const t = await frame.getByText(/\\d+/).first().textContent();
  return Number((t || '').match(/\\d+/)?.[0] || 0);
}).toBeGreaterThan(50);
// Later / after wait:
await expect(frame.getByText(/journey is over|finished|done/i)).toBeVisible({ timeout: 70_000 });`,
      why: "Timers need poll/timeout budgets; don't hard-assert exact seconds only once.",
    },
    {
      id: "ma-slider",
      name: "Rating Range Slider",
      challenge: "Set slider to 50; submit feedback.",
      skills: ["fill range", "drag slider"],
      tags: ["slider"],
      solution: `const slider = page.getByRole('slider').or(page.locator('input[type=\"range\"]'));
await slider.fill('50'); // works for many range inputs
await expect(slider).toHaveValue('50');
await page.getByRole('button', { name: /submit|send|feedback/i }).click();
await expect(page.getByText(/thank|success|submitted/i)).toBeVisible();`,
      why: "fill() on range is often enough; otherwise mouse drag by bounding box.",
    },
    {
      id: "ma-auth",
      name: "Register & Login",
      challenge: "Register, then log in with created credentials; assert auth success.",
      skills: ["unique data", "auth flow"],
      tags: ["auth"],
      solution: `const user = \`user_\${Date.now()}@test.com\`;
const pass = 'Secret123!';
await page.getByRole('link', { name: /register|sign up/i }).click();
await page.getByLabel(/email/i).fill(user);
await page.getByLabel(/password/i).fill(pass);
await page.getByRole('button', { name: /register|create/i }).click();
await page.getByLabel(/email/i).fill(user);
await page.getByLabel(/password/i).fill(pass);
await page.getByRole('button', { name: /log ?in|sign in/i }).click();
await expect(page.getByText(/welcome|dashboard|logout/i)).toBeVisible();`,
      why: "Unique email per run so parallel workers don't collide.",
    },
    {
      id: "ma-jira",
      name: "JIRA-like Board",
      challenge: "Create, drag/drop, filter, delete issues; assert column state.",
      skills: ["kanban", "dragTo", "filter"],
      tags: ["dnd", "crud"],
      solution: `const title = \`Bug \${Date.now()}\`;
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
await expect(page.getByText(title)).toHaveCount(0);`,
      why: "Unique titles + assert across columns after DnD.",
    },
  ],

  questions: [
    {
      q: "Why use mini-app challenges instead of one big demo app?",
      a: `Each challenge isolates one automation problem (nested iframe, Shadow DOM, OTP, DnD). That matches how interviews ask “how would you automate X?” and how you learn framework features quickly without app noise.`,
    },
    {
      q: "Dynamic Table — Spider-Man row order changes. How do you assert his real name?",
      a: `Filter the row by text, then assert the name cell. Never use a fixed <code>nth()</code> index.`,
    },
    {
      q: "OTP / Verify Account — fill() on the whole code fails. Why?",
      a: `Many OTP UIs are N single-character inputs or listen to key events. Use per-box <code>fill</code> or <code>pressSequentially</code>.`,
    },
    {
      q: "Nested Iframe — page.getByRole cannot find the button. Fix?",
      a: `Chain <code>frameLocator</code>: <code>page.frameLocator(...).frameLocator(...).getByRole('button')</code>.`,
    },
    {
      q: "Shadow DOM challenge — do you need a special pierce API?",
      a: `For <strong>open</strong> shadow roots, no — Playwright locators pierce automatically. Closed roots cannot be automated without app support. Don't confuse with iframes.`,
    },
    {
      q: "New Tab vs Pop-Up — same Playwright API?",
      a: `Yes conceptually — both create a new <code>Page</code>. Use <code>context.waitForEvent('page')</code> before the click. Pop-up exercises often require acting on the popup then asserting on the original page.`,
    },
    {
      q: "Covered Elements — is force:true the right answer in an interview?",
      a: `Explain it skips actionability. Prefer closing/removing the overlay. Use <code>force</code> only if the challenge explicitly requires clicking a covered control — and say so.`,
    },
    {
      q: "Geolocation — set Cupertino coords but UI still denies location?",
      a: `Grant <code>geolocation</code> permission <em>and</em> <code>setGeolocation</code>. They are independent.`,
    },
    {
      q: "Fetching Data — how do you wait without sleep?",
      a: `<code>Promise.all([waitForResponse(...), click()])</code> then assert posts with web-first expectations.`,
    },
    {
      q: "Download File — assert name and size?",
      a: `Await <code>download</code> event, check <code>suggestedFilename()</code>, save/path, then filesystem size &gt; 0.`,
    },
    {
      q: "Redirect Chain — what should you assert?",
      a: `Each intermediate URL (or title) in order, not only the final destination — proves the chain works.`,
    },
    {
      q: "Budget Tracker — how do you prove persistence?",
      a: `Create a record, <code>page.reload()</code>, assert it still appears and totals match (localStorage/session).`,
    },
    {
      q: "Sortable List / JIRA board — DnD tips?",
      a: `Try <code>dragTo</code> first; for custom HTML5 DnD use hover → mouse.down → hover → mouse.up. Assert column/order afterward.`,
    },
    {
      q: "QR Code — visual assert pitfalls?",
      a: `Use <code>toHaveScreenshot</code> with tolerance; generate baselines in the same OS/Docker as CI; wait until canvas/img is stable.`,
    },
    {
      q: "Changeable Iframe countdown — flaky exact second asserts?",
      a: `Use <code>expect.poll</code> for a range (e.g. &gt; 50s) and a generous timeout for the final message.`,
    },
    {
      q: "Register & Login — parallel-safe approach?",
      a: `Unique email per test (<code>Date.now()</code>/faker). Optionally API-register then UI-login. Never share one static user across workers.`,
    },
    {
      q: "Right-click context menu — Playwright API?",
      a: `<code>locator.click({ button: 'right' })</code>, then interact with <code>menuitem</code> roles.`,
    },
    {
      q: "Rating slider — set value to 50?",
      a: `Often <code>locator.fill('50')</code> on <code>input[type=range]</code> / role slider, then assert value and submit.`,
    },
    {
      q: "How would you organise a repo of solutions for these mini-app challenges?",
      a: `One spec file per challenge under <code>tests/miniapps/</code>, shared fixtures, tags <code>@miniapp</code>, and a README linking challenge → solution. Keep each challenge focused on one skill.`,
    },
    {
      q: "Interview: pick three mini-app challenges that prove different skills.",
      a: `Example set: Nested Iframe (frameLocator), Shadow DOM (pierce vs closed), Dynamic Table (filter) — or Geolocation + Download + Fetching Data for permissions/events/network.`,
    },
  ],
};
