/* UI Practice Lab — challenges + revealable Playwright solutions (this site) */
window.PLAYGROUND_DATA = {
  hub: {
    title: "UI Practice Lab",
    lead: "Practise one UI skill at a time on this site: use the live challenge UI, try the interaction, then reveal the Playwright solution. Covers inputs, tables, iframes, Shadow DOM, waits, uploads, and more.",
  },

  levels: {
    Beginner: "Learn locators + basic actions",
    Intermediate: "Forms, dialogs, frames, uploads",
    Advanced: "Waits, DnD, Shadow DOM, infinite scroll, mini apps",
  },

  elements: [
    {
      id: "pg-input",
      name: "Input Fields",
      level: "Beginner",
      skill: "fill, clear, press, getByLabel",
      goal: "Type, clear, and assert input values with web-first assertions.",
      recipe: `await page.getByLabel('Email').fill('ada@example.com');
await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');
await page.getByLabel('Email').clear();`,
      traps: "Using CSS for unlabeled inputs; asserting with inputValue() without expect retry.",
    },
    {
      id: "pg-buttons",
      name: "Buttons",
      level: "Beginner",
      skill: "getByRole, click, dblclick, force smell",
      goal: "Click enabled buttons; handle disabled/loading states without force:true.",
      recipe: `const save = page.getByRole('button', { name: 'Save' });
await expect(save).toBeEnabled();
await save.click();`,
      traps: "Clicking while spinner overlays the button (fails receives-events).",
    },
    {
      id: "pg-forms",
      name: "Forms",
      level: "Intermediate",
      skill: "multi-field fill, soft asserts, submit",
      goal: "Fill a multi-field form and assert validation + success paths.",
      recipe: `await page.getByLabel('Name').fill('Ada');
await page.getByLabel('Email').fill('ada@example.com');
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toHaveText(/success/i);`,
      traps: "Stopping at first validation error — use expect.soft for multi-field checks.",
    },
    {
      id: "pg-dropdowns",
      name: "Dropdowns",
      level: "Beginner",
      skill: "selectOption vs custom listbox",
      goal: "Native <select> vs custom div dropdowns need different APIs.",
      recipe: `// native
await page.getByLabel('Country').selectOption({ label: 'India' });
// custom combobox
await page.getByRole('combobox', { name: 'Country' }).click();
await page.getByRole('option', { name: 'India' }).click();`,
      traps: "Calling selectOption() on a non-<select> custom widget.",
    },
    {
      id: "pg-table",
      name: "Data Table",
      level: "Intermediate",
      skill: "filter, row chaining, dynamic data",
      goal: "Find a row by text and act inside it — never hardcode nth().",
      recipe: `await page.getByRole('row').filter({ hasText: 'Ada Lovelace' })
  .getByRole('button', { name: 'Edit' }).click();`,
      traps: "nth(3) on dynamic tables; reading all rows into arrays unnecessarily.",
    },
    {
      id: "pg-alerts",
      name: "Alerts & Dialogs",
      level: "Intermediate",
      skill: "page.on('dialog')",
      goal: "Handle native alert/confirm/prompt before the triggering click.",
      recipe: `page.once('dialog', async d => {
  expect(d.type()).toBe('confirm');
  await d.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();`,
      traps: "Registering the dialog handler after the click; treating in-page modals as native dialogs.",
    },
    {
      id: "pg-radio",
      name: "Radio & Checkbox",
      level: "Beginner",
      skill: "check, setChecked, toBeChecked",
      goal: "Toggle checkboxes/radios and assert checked state.",
      recipe: `await page.getByLabel('Subscribe').check();
await expect(page.getByLabel('Subscribe')).toBeChecked();
await page.getByLabel('Plan: Pro').check();`,
      traps: "Clicking the label visually but asserting the wrong input.",
    },
    {
      id: "pg-date",
      name: "Date Picker",
      level: "Intermediate",
      skill: "fill ISO date or calendar UI",
      goal: "Prefer filling a typed date when the control allows; otherwise drive the calendar grid.",
      recipe: `await page.getByLabel('Start date').fill('2026-07-28');
// or calendar grid
await page.getByRole('button', { name: '28' }).click();`,
      traps: "Locale/timezone mismatches between local and CI calendars.",
    },
    {
      id: "pg-links",
      name: "Links",
      level: "Beginner",
      skill: "getByRole('link'), navigation",
      goal: "Navigate via accessible link names and assert URL/title.",
      recipe: `await page.getByRole('link', { name: 'Docs' }).click();
await expect(page).toHaveURL(/docs/);`,
      traps: "Matching substring link names that hit multiple links (strict mode).",
    },
    {
      id: "pg-tabs",
      name: "Tabs & Windows",
      level: "Intermediate",
      skill: "waitForEvent('page'), context pages",
      goal: "Capture popup/new tab before click; interact on the new Page.",
      recipe: `const [tab] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open report' }).click(),
]);
await tab.waitForLoadState();
await expect(tab).toHaveTitle(/Report/);`,
      traps: "Waiting after the click; using page instead of context for the event.",
    },
    {
      id: "pg-waits",
      name: "Dynamic Waits",
      level: "Advanced",
      skill: "web-first asserts, waitForResponse, expect.poll",
      goal: "Replace sleeps with observable conditions.",
      recipe: `const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/data') && r.ok()),
  page.getByRole('button', { name: 'Load' }).click(),
]);
await expect(page.getByTestId('spinner')).toBeHidden();
await expect(page.getByRole('listitem')).not.toHaveCount(0);`,
      traps: "waitForTimeout; networkidle with open websockets/analytics.",
    },
    {
      id: "pg-multiselect",
      name: "Multi Select",
      level: "Intermediate",
      skill: "selectOption([...]) / multi options",
      goal: "Select multiple options and assert all selected values.",
      recipe: `await page.getByLabel('Tags').selectOption(['a', 'b']);
await expect(page.getByLabel('Tags')).toHaveValues(['a', 'b']);`,
      traps: "Assuming single-select API for multi-select widgets.",
    },
    {
      id: "pg-upload",
      name: "File Upload",
      level: "Intermediate",
      skill: "setInputFiles, filechooser",
      goal: "Upload via hidden input or filechooser event — never OS dialogs.",
      recipe: `await page.getByLabel('Upload').setInputFiles('tests/data/sample.pdf');
// styled button
const [chooser] = await Promise.all([
  page.waitForEvent('filechooser'),
  page.getByRole('button', { name: 'Choose file' }).click(),
]);
await chooser.setFiles('tests/data/sample.pdf');`,
      traps: "Trying to automate the native OS file picker.",
    },
    {
      id: "pg-dnd",
      name: "Drag & Drop",
      level: "Advanced",
      skill: "dragTo, manual mouse sequence",
      goal: "Prefer dragTo; fall back to mouse down/move/up for custom HTML5 DnD.",
      recipe: `await page.getByTestId('card-1').dragTo(page.getByTestId('column-done'));
// manual
await source.hover();
await page.mouse.down();
await target.hover();
await page.mouse.up();`,
      traps: "force:true that 'succeeds' without the app accepting the drop.",
    },
    {
      id: "pg-iframe",
      name: "iFrames",
      level: "Intermediate",
      skill: "frameLocator",
      goal: "Scope into the frame first — page locators do not pierce iframes.",
      recipe: `const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card number').fill('4111111111111111');
await frame.getByRole('button', { name: 'Pay' }).click();`,
      traps: "Using page.getByRole for controls inside an iframe (timeout).",
    },
    {
      id: "pg-shadow",
      name: "Shadow DOM",
      level: "Advanced",
      skill: "open shadow piercing",
      goal: "Open shadow roots are pierced by normal locators; closed roots need app help.",
      recipe: `// open shadow — no special API
await page.getByRole('button', { name: 'Start' }).click();
await expect(page.getByText('95%')).toBeVisible();`,
      traps: "Confusing Shadow DOM with iframes; using evaluate hacks for open roots.",
    },
    {
      id: "pg-modal",
      name: "Modal Windows",
      level: "Beginner",
      skill: "getByRole('dialog')",
      goal: "Scope actions to the dialog region; assert open/close.",
      recipe: `await page.getByRole('button', { name: 'Open' }).click();
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
await dialog.getByRole('button', { name: 'Close' }).click();
await expect(dialog).toBeHidden();`,
      traps: "Clicking background Save when a modal also has Save (strict mode).",
    },
    {
      id: "pg-scroll",
      name: "Infinite Scroll",
      level: "Advanced",
      skill: "scroll + wait for attach",
      goal: "Scroll until the target row attaches; virtual lists may not keep all rows in DOM.",
      recipe: `const target = page.getByText('Item #120');
for (let i = 0; i < 30 && !(await target.isVisible().catch(() => false)); i++) {
  await page.mouse.wheel(0, 1200);
  await expect.poll(async () => page.getByRole('listitem').count()).toBeGreaterThan(i);
}
await expect(target).toBeVisible();`,
      traps: "Assuming all rows exist in DOM; fixed sleeps without an end condition. Prefer waiting for count/network growth.",
    },
    {
      id: "pg-annotations",
      name: "Annotations",
      level: "Intermediate",
      skill: "tooltips, titles, hover",
      goal: "Hover to reveal tooltip/annotation and assert accessible name or text.",
      recipe: `await page.getByRole('button', { name: 'Info' }).hover();
await expect(page.getByRole('tooltip')).toContainText(/required/i);`,
      traps: "Asserting tooltip before hover completes.",
    },
    {
      id: "pg-bank",
      name: "Bank Demo App",
      level: "Advanced",
      skill: "E2E journey, POM, storageState",
      goal: "Build a mini portfolio suite: login → transfer → assert balance (API seed optional).",
      recipe: `test('transfer funds', async ({ page }) => {
  await page.goto('/bank');
  await page.getByLabel('User').fill(process.env.BANK_USER!);
  await page.getByLabel('Pass').fill(process.env.BANK_PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Transfer' }).click();
  await page.getByLabel('Amount').fill('10');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('alert')).toContainText(/success/i);
});`,
      traps: "One giant test asserting 20 things; logging in via UI in every test.",
    },
    {
      id: "pg-ui",
      name: "UI Practice (mixed)",
      level: "Beginner",
      skill: "locator priority workout",
      goal: "Warm-up: locate the same control five ways and prefer the resilient one.",
      recipe: `page.getByRole('button', { name: 'Continue' });
page.getByTestId('continue-btn');
page.locator('#continue'); // last resort`,
      traps: "Defaulting to the first CSS selector that 'works' in DevTools.",
    },
  ],

  questions: [
    {
      q: "Why practise isolated UI elements before full apps?",
      a: `Isolated elements let you master one interaction (iframe, Shadow DOM, DnD) without app noise. Then compose those skills into full E2E journeys. Interviews often ask element-level “how would you automate X?” before full flows.`,
    },
    {
      q: "Input Fields — how do you fill and assert reliably in Playwright?",
      a: `Prefer <code>getByLabel</code>/<code>getByRole('textbox')</code>, use <code>fill()</code>, assert with <code>await expect(locator).toHaveValue(...)</code> (retries). Avoid reading <code>inputValue()</code> once into a non-retrying expect.`,
    },
    {
      q: "Buttons — the button is visible but click times out. What do you check?",
      a: `Actionability: enabled, stable, receives events. Look for overlays/spinners. Assert the blocker is gone. Do not start with <code>waitForTimeout</code> or <code>force: true</code>.`,
    },
    {
      q: "Forms — how do you verify five validation messages on empty submit?",
      a: `Use <code>expect.soft</code> for each field so the test reports all failures in one run, then fails at the end.`,
    },
    {
      q: "Dropdowns — when is selectOption wrong?",
      a: `Only native <code>&lt;select&gt;</code> supports <code>selectOption</code>. Custom div/listbox widgets: open the combobox, click <code>getByRole('option')</code>, assert the displayed value.`,
    },
    {
      q: "Data Table — how do you click Edit on a dynamic row?",
      a: `<pre><code data-lang="ts">await page.getByRole('row').filter({ hasText: 'Ada' })
  .getByRole('button', { name: 'Edit' }).click();</code></pre>
Never hardcode <code>nth(n)</code> for business data that changes.`,
    },
    {
      q: "Alerts & Dialogs — native confirm vs in-page modal?",
      a: `Native <code>alert/confirm/prompt</code> → <code>page.on('dialog')</code> before the click. In-page modal → normal locators on <code>getByRole('dialog')</code>. Mixing them up is a common stuck point.`,
    },
    {
      q: "Radio & Checkbox — which APIs?",
      a: `<code>check()</code>, <code>uncheck()</code>, <code>setChecked(true)</code>, assert with <code>toBeChecked()</code>. Prefer labeling via accessible name.`,
    },
    {
      q: "Date Picker — flaky across locales/CI?",
      a: `Pin <code>locale</code> and <code>timezoneId</code> in config. Prefer typing an ISO value when the control allows. Calendar grids break when “today” differs by timezone.`,
    },
    {
      q: "Tabs & Windows — how do you handle target=_blank?",
      a: `Listen on the context before click: <code>Promise.all([context.waitForEvent('page'), click])</code>, then use the new <code>Page</code>. Same-context tabs share cookies.`,
    },
    {
      q: "Dynamic Waits — what replaces waitForTimeout?",
      a: `Web-first assertions, <code>waitForResponse</code> (registered before the action), <code>expect.poll</code> for non-DOM conditions. Avoid <code>networkidle</code> when analytics stay open.`,
    },
    {
      q: "File Upload — can Playwright click the OS file dialog?",
      a: `No. Use <code>setInputFiles</code> on the input, or the <code>filechooser</code> event for styled buttons. Buffers work for synthetic files.`,
    },
    {
      q: "Drag & Drop — dragTo failed. Next step?",
      a: `Manual sequence: hover → mouse.down → hover(target) → mouse.up, sometimes with intermediate moves. Avoid force clicks that fake success.`,
    },
    {
      q: "iFrames vs Shadow DOM — key difference for Playwright?",
      a: `<strong>iframe</strong> = separate document → must use <code>frameLocator</code>. <strong>Open Shadow DOM</strong> = same document → normal locators pierce automatically. Closed shadow roots are not reachable without app cooperation. Never treat them as the same problem.`,
    },
    {
      q: "How do you automate a control inside a nested iframe?",
      a: `Chain frameLocators: <code>page.frameLocator('#outer').frameLocator('#inner').getByRole('button', { name: 'OK' })</code>.`,
    },
    {
      q: "Shadow DOM practice — why might getByRole still fail?",
      a: `Closed shadow root; wrong accessible name; element inside an iframe (need frame first); or strict-mode duplicates. Confirm open vs closed in DevTools.`,
    },
    {
      q: "Modal Windows — how do you avoid clicking the wrong Save?",
      a: `Scope: <code>page.getByRole('dialog').getByRole('button', { name: 'Save' })</code>. Strict mode is telling you there are two Saves.`,
    },
    {
      q: "Infinite Scroll — how do you reach item #N?",
      a: `Loop: scroll/wheel → wait for new nodes or network → until target visible/attached. Virtualised lists may recycle DOM nodes — search/filter APIs are better when available.`,
    },
    {
      q: "Annotations / tooltips — how do you assert them?",
      a: `Hover (or focus) the trigger, then assert <code>getByRole('tooltip')</code> or the title/accessible description. Don’t assert before the hover settles.`,
    },
    {
      q: "Bank / money-transfer style app — what portfolio suite would you build?",
      a: `Login (one storageState setup) → account list → transfer → statement download → negative insufficient-funds. Use POM + API seed for accounts + HTML report in CI. Keep tests independent.`,
    },
    {
      q: "How should you structure practice time on this site?",
      a: `Day plan: (1) UI Practice Lab Beginner locators/forms, (2) Intermediate dialogs/tables/uploads/iframes, (3) Advanced waits/DnD/Shadow/infinite scroll, (4) Mini-app challenges for nested iframe / OTP / kanban. For each card: attempt the challenge, reveal solution, write 2 tests (happy + edge), explain out loud.`,
    },
    {
      q: "What Playwright config helps when practicing date/locale widgets?",
      a: `<pre><code data-lang="ts">use: {
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
  viewport: { width: 1280, height: 720 },
}</code></pre>
Keeps calendar/currency behaviour stable across machines.`,
    },
    {
      q: "Multi Select — how do you assert multiple selected values?",
      a: `Native: <code>selectOption(['a','b'])</code> then <code>toHaveValues(['a','b'])</code>. Custom widgets: select each option via role and assert chips/tags visible.`,
    },
    {
      q: "After practicing elements, what interview answer pattern works best?",
      a: `Name the element → choose the API (role/frameLocator/dialog/setInputFiles) → show a 4-line snippet → name the trap (“why people get stuck”). That matches how panels probe beyond syntax.`,
    },
  ],
};
