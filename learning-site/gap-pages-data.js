/**
 * Curated SDET guide & labs — clarity-templated teaching pages (file:// safe).
 * One concept → one home. Awareness topics stay short on purpose.
 */
window.GAP_PAGES = [
  {
    id: 'test-design',
    nav: 'Test design techniques',
    title: 'Test design techniques',
    html: `
      <h2 class="sec">Test design techniques</h2>
      <p class="lead"><strong>After this section you can</strong> pick a small set of strong test cases for a form field — instead of guessing random values.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Junior and mid loops almost always ask how you choose cases. Naming the technique (EP / BVA) shows you design tests, not only click through the UI.</div>

      <h3 class="sub">Equivalence partitioning (EP)</h3>
      <p class="lead"><strong>EP</strong> means: put inputs into groups that should behave the same, then test <em>one</em> value from each group.</p>
      <p class="lead">Example — age must be 18–65:</p>
      <ul class="tight">
        <li>Invalid below: try <code class="inline">17</code></li>
        <li>Valid: try <code class="inline">30</code></li>
        <li>Invalid above: try <code class="inline">66</code></li>
      </ul>

      <h3 class="sub">Boundary-value analysis (BVA)</h3>
      <p class="lead"><strong>BVA</strong> means: bugs often sit on the edge of a range. For [18, 65] also try 17, 18, 19 and 64, 65, 66.</p>
      <div class="card note"><strong>Micro-tool:</strong> generate EP + BVA for any min/max</div>
      <div data-gap-widget="bva"></div>

      <h3 class="sub">Other names you should recognise</h3>
      <ul class="tight">
        <li><strong>Decision table</strong> — when several yes/no rules combine (role × amount × KYC).</li>
        <li><strong>State-transition</strong> — allowed status changes (draft → submitted → approved).</li>
        <li><strong>Pairwise</strong> — when full combinations explode; cover pairs of factors instead of every trio.</li>
      </ul>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Only testing the happy mid-value (e.g. age 30).</li>
          <li>Automating 40 UI paths instead of a few boundary cases at API/unit level.</li>
          <li>Knowing the acronyms but not applying them to a real field in the interview.</li>
        </ul>
      </div>

      <details class="qa"><summary>Interview Q — Age field accepts 18–65. How do you design cases?</summary>
        <div class="body"><div class="ideal"><strong>Ideal</strong><p>Name EP groups (below / valid / above) and BVA edges (17/18/19, 64/65/66). Automate edges cheaply; keep one thin UI check for the error message.</p></div></div>
      </details>

      <div class="card good"><strong>Practice:</strong> use the generator above, then apply the same idea to Bank Demo transfer amounts.</div>
    `,
  },
  {
    id: 'pyramid-nft',
    nav: 'Pyramid & strategy',
    title: 'Test pyramid & strategy',
    html: `
      <h2 class="sec">Test pyramid &amp; strategy</h2>
      <p class="lead"><strong>After this section you can</strong> explain where Playwright E2E fits, and when you would not use it.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Seniors who only say “automate everything in the UI” fail this. They want risk judgment.</div>

      <p class="lead">Think of layers:</p>
      <ul class="tight">
        <li><strong>Many unit tests</strong> — fast checks of small functions.</li>
        <li><strong>Fewer API / contract tests</strong> — services talk correctly.</li>
        <li><strong>Thin E2E (Playwright)</strong> — only the journeys that hurt users if broken (login, pay, transfer).</li>
      </ul>
      <p class="lead"><strong>Ice-cream cone</strong> = upside-down pyramid: almost everything in slow UI tests. That suite becomes flaky and expensive.</p>
      <p class="lead"><strong>Exploratory testing</strong> = a human follows a short charter (goal for a session) and looks for surprises automation did not cover. It complements automation; it does not replace it.</p>

      <h3 class="sub">Non-functional words (awareness)</h3>
      <table>
        <tr><th>Word</th><th>Plain meaning</th></tr>
        <tr><td>Load</td><td>Normal busy traffic — still OK?</td></tr>
        <tr><td>Stress</td><td>Push past capacity — where does it break?</td></tr>
        <tr><td>Soak</td><td>Run for hours — memory leak?</td></tr>
        <tr><td>Spike</td><td>Sudden burst — recovers?</td></tr>
      </table>
      <p class="lead">Example answer: “k6 on the top 3 APIs: a smoke run, a steady run, a short stress. Playwright checks the user journey, not transactions-per-second.”</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Treating E2E as the only quality gate.</li>
          <li>Confusing performance tools (k6) with Playwright.</li>
          <li>Saying exploratory testing is “random clicking” with no charter.</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> <a href="#bank-demo">Bank Demo</a> = thin E2E journey. Keep API checks for money rules.</div>
    `,
  },
  {
    id: 'multi-context',
    nav: 'Multi-context & pages',
    title: 'Multi-context & pages',
    html: `
      <h2 class="sec">Multi-context &amp; multi-page</h2>
      <p class="lead"><strong>After this section you can</strong> write one test with two users (admin + customer) that do not share cookies.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> This separates people who only used the default <code class="inline">page</code> fixture from people who understand isolation.</div>

      <p class="lead">A <strong>BrowserContext</strong> is like one private browser profile (cookies, storage). Default tests get one context. For two users at once, open two contexts.</p>
      <pre data-lang="typescript"><code>test('admin sees customer action', async ({ browser }) =&gt; {
  const customer = await browser.newContext();
  const admin = await browser.newContext({ storageState: '.auth/admin.json' });
  const customerPage = await customer.newPage();
  const adminPage = await admin.newPage();
  await customerPage.goto('/app');
  await adminPage.goto('/admin');
  // assert each page; cookies never cross contexts
  await customer.close();
  await admin.close();
});

// New tab / popup — start waiting BEFORE the click
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open statement' }).click();
const popup = await popupPromise;
await expect(popup.getByRole('heading')).toBeVisible();</code></pre>

      <h3 class="sub">Shadow DOM — one gotcha</h3>
      <p class="lead">Playwright can look inside <strong>open</strong> shadow roots. It <em>cannot</em> look inside <strong>closed</strong> shadow roots. If the app uses closed roots, ask for a test id on the host or an open mode for test builds.</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Log out / log in on one page to “switch users” (slow and racey).</li>
          <li>Sharing one <code class="inline">storageState</code> across roles.</li>
          <li>Claiming Playwright always pierces every shadow root.</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> imagine Bank Demo support agent + customer in one scenario using two contexts.</div>
    `,
  },
  {
    id: 'fixtures-advanced',
    nav: 'Fixtures, workers & setup',
    title: 'Fixtures, workers & setup',
    html: `
      <h2 class="sec">Fixtures, workers &amp; setup</h2>
      <p class="lead"><strong>After this section you can</strong> explain test-scoped vs worker-scoped fixtures, and setup projects vs <code class="inline">globalSetup</code>.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Parallel flakes often come from shared worker state. Seniors must know the difference.</div>

      <ul class="tight">
        <li><strong>Test-scoped fixture</strong> — runs for every test (fresh data).</li>
        <li><strong>Worker-scoped fixture</strong> — runs once per worker process (expensive shared resource). Only use when data stays safe under parallel tests.</li>
        <li><strong><code class="inline">mergeTests</code></strong> — combine fixture packs from two files into one <code class="inline">test</code>.</li>
        <li><strong>Setup project + <code class="inline">dependencies</code></strong> — a real Playwright project that logs in and writes <code class="inline">storageState</code> for other projects. Preferred for auth.</li>
        <li><strong><code class="inline">globalSetup</code></strong> — Node script once before workers (start a stub server). Not a test; less visible in the report.</li>
      </ul>
      <pre data-lang="typescript"><code>import { test as base, mergeTests } from '@playwright/test';

export const test = base.extend({
  // Once per worker process
  sharedDb: [async ({}, use) =&gt; {
    const db = await startDb();
    await use(db);
    await db.stop();
  }, { scope: 'worker' }],
});

// Combine packs: export const merged = mergeTests(dbTest, authTest);</code></pre>

      <p class="lead"><strong>Parallelism in one line:</strong> workers are processes; each test still gets its own context by default. Flakes appear when tests share mutable data (same user row) across workers.</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Putting mutable shared accounts in a worker fixture.</li>
          <li>Using <code class="inline">globalSetup</code> for auth that should be a setup project (no trace, harder retries).</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> <a href="#fixtures">Fixtures</a> core page + practice-suite <code class="inline">fixtures/test.ts</code>.</div>
    `,
  },
  {
    id: 'websocket',
    nav: 'WebSocket & live UI',
    title: 'WebSocket & live UI',
    html: `
      <h2 class="sec">WebSocket &amp; live UI</h2>
      <p class="lead"><strong>After this section you can</strong> say how you test a live balance update without sleeping for “a few seconds.”</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Real apps push updates over WebSocket/SSE. Waiting with <code class="inline">waitForTimeout</code> is the wrong answer.</div>

      <p class="lead">Register the listener <strong>before</strong> <code class="inline">goto</code>. Prefer asserting the <strong>UI</strong> (banner text, balance) over every wire frame. You can mock with <code class="inline">page.routeWebSocket()</code> when the backend is noisy.</p>
      <pre data-lang="typescript"><code>await page.routeWebSocket('**/socket', ws =&gt; {
  ws.onMessage(message =&gt; {
    // optionally rewrite or drop frames
    ws.send(message);
  });
});
await page.goto('/dashboard');
await expect(page.getByTestId('balance')).toContainText('1,000');</code></pre>
      <p class="lead">Close code <strong>1000</strong> = normal close. <strong>1006</strong> = abnormal (connection dropped). Mentioning that shows depth without CDP trivia.</p>

      <h3 class="sub">Frame assertion pattern tied to Bank Demo's live balance</h3>
      <pre data-lang="typescript"><code>const frames: unknown[] = [];
await page.routeWebSocket('**/bank-live', (ws) => {
  ws.onMessage((msg) => {
    frames.push(JSON.parse(String(msg)));
    ws.send(msg); // pass through unchanged
  });
});
await page.goto('/index.html#bank-demo');
// … trigger a balance-changing action …
await expect(page.getByTestId('checking-balance')).toContainText('4,250');
expect(frames.some((f: any) => f.type === 'balance-update')).toBe(true);</code></pre>
      <p class="lead">Assert the <strong>UI</strong> as the primary signal (that's what the user sees); assert on captured frames only as a secondary check that the right message <em>type</em> actually flowed, not to hand-verify every byte on the wire.</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Attaching the listener after navigation (miss the handshake).</li>
          <li>Sleeping until the UI “probably” updated.</li>
          <li>Asserting on wire frames alone with no corresponding UI assertion.</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> Bank Demo balance mock path — assert UI, not the wire protocol.</div>
    `,
  },
  {
    id: 'performance-cwv',
    nav: 'Performance & coverage',
    title: 'Performance & coverage',
    html: `
      <h2 class="sec">Performance &amp; E2E coverage</h2>
      <p class="lead"><strong>After this section you can</strong> talk about Core Web Vitals in Playwright without treating one run as truth — and reject “100% E2E coverage” as a goal.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Rising Senior topic. They want judgment: noisy metrics, Chromium-only limits, coverage ≠ quality.</div>

      <p class="lead"><strong>Core Web Vitals</strong> (LCP, CLS, INP) measure how fast and stable a page feels. In Playwright you can read them via <code class="inline">PerformanceObserver</code> in Chromium. Run 3–5 times and use the <strong>median</strong> — a single run is noisy. Prefer a CI budget (“LCP under X”) over a vanity screenshot.</p>
      <p class="lead"><strong>E2E code coverage</strong> (V8 / Istanbul) can show which lines UI tests touched. Interview line: “Coverage shows gaps; it does not prove the right journeys are safe. I do not chase 100% E2E coverage.”</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Gating merges on one LCP sample.</li>
          <li>Claiming CWV APIs work the same on every browser.</li>
          <li>Equating high E2E coverage with a good suite.</li>
        </ul>
      </div>
    `,
  },
  {
    id: 'contract-testing',
    nav: 'Contracts & services',
    title: 'Contracts & services',
    html: `
      <h2 class="sec">Contract testing &amp; microservices</h2>
      <p class="lead"><strong>After this section you can</strong> answer “how do you test microservices?” without saying “only Playwright end-to-end.”</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Almost every Senior/Architect microservices question expects <strong>contracts</strong> (e.g. Pact), not a giant UI suite.</div>

      <p class="lead"><strong>Consumer-driven contract</strong> = the UI (consumer) publishes the requests/responses it needs; the API (provider) proves it still meets that contract. That catches breaking API changes early, without a full browser.</p>
      <p class="lead">Strong stack answer: <strong>API + Pact + WireMock/Testcontainers + thin Playwright journeys</strong> for checkout/login. For message queues: test publisher and consumer separately; only then assert the UI after the side effect lands.</p>

      <h3 class="sub">Pact-style consumer/provider sketch</h3>
      <pre data-lang="typescript"><code>// consumer test (runs in the UI repo) — records an interaction
await provider.addInteraction({
  state: 'account apex_user exists',
  uponReceiving: 'a request for the balance',
  withRequest: { method: 'GET', path: '/api/bank/balance' },
  willRespondWith: { status: 200, body: { checking: 4250, savings: 18400 } },
});
// … call the real client against the Pact mock server, assert the UI renders it …
await provider.verify(); // writes a pact.json contract file

// provider verification (runs in the API repo, in CI) — replays every recorded
// interaction against the real API and fails the build if the shape drifted
new Verifier({ provider: 'bank-api', pactUrls: ['./pacts/ui-bank-api.json'] }).verifyProvider();</code></pre>
      <p class="lead">The contract file is the artifact both teams agree to — a broken contract fails the <em>provider's</em> CI before the change ever reaches a shared staging environment, which is the whole point (catches PF9-style "works in dev, 500s in staging" drift earlier).</p>

      <h3 class="sub">GraphQL query/mutation testing notes</h3>
      <p class="lead">Mock at the network layer with <code class="inline">page.route('**/graphql', …)</code> and match on the request body's <code class="inline">operationName</code> (not just the URL — every GraphQL call hits the same endpoint). For contract-style coverage, validate responses against the schema (e.g. via a codegen'd TypeScript type) rather than hand-checking individual fields.</p>
      <pre data-lang="typescript"><code>await page.route('**/graphql', async (route) => {
  const body = route.request().postDataJSON();
  if (body.operationName === 'GetBalance') {
    return route.fulfill({ json: { data: { balance: { checking: 4250 } } } });
  }
  return route.continue();
});</code></pre>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Only E2E across every service (ice-cream cone).</li>
          <li>Mocking so hard that the real request shape is never checked.</li>
          <li>Matching GraphQL routes by URL alone and mocking the wrong operation.</li>
        </ul>
      </div>
      <div class="card good"><strong>Related Q:</strong> Tier C “microservices architecture” and Tier D governance questions; see also <a href="interview/15-contract-and-realtime.md" target="_blank" rel="noopener">interview-qa contract &amp; real-time notes</a> if present.</div>
    `,
  },
  {
    id: 'sdet-field-guide',
    nav: 'SDET field guide',
    title: 'SDET field guide (awareness)',
    html: `
      <h2 class="sec">SDET field guide</h2>
      <p class="lead"><strong>After this section you can</strong> give a short, correct answer on mobile, SQL, DORA, security, and BDD — enough not to freeze. This is <em>awareness</em>, not mastery.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> SDET loops jump outside Playwright. Blank stares hurt more than short accurate answers.</div>

      <h3 class="sub">Mobile / Appium</h3>
      <p class="lead">Playwright = <strong>mobile web emulation</strong> (viewport, user-agent, touch). <strong>Native apps</strong> need Appium / Maestro / Detox. Never say “Playwright tests native iOS/Android apps.”</p>

      <h3 class="sub">SQL for testers</h3>
      <p class="lead">Be ready to check data after a UI action: joins, counts, foreign keys. Example: after a transfer, balance row changed and ledger row inserted.</p>

      <h3 class="sub">DORA &amp; quality metrics</h3>
      <p class="lead"><strong>DORA</strong> = four delivery metrics: deploy frequency, lead time, change-failure rate, MTTR. Also track <strong>escape rate</strong> (bugs found in prod ÷ known bugs) and <strong>flake rate</strong> (often target &lt;1%). Pass rate alone misleads leaders.</p>
      <p class="lead"><strong>Mutation testing</strong> (e.g. Stryker): intentionally break code; if tests still pass, the suite is weak. Awareness-level only.</p>

      <h3 class="sub">Security at QA level</h3>
      <p class="lead">Know OWASP Top 10 names (XSS, CSRF, SQLi, IDOR). Check cookies (<code class="inline">HttpOnly</code>, <code class="inline">SameSite</code>) and that you are not a full pentester. Tools people mention: ZAP / Burp (familiarity, not mastery).</p>

      <h3 class="sub">BDD / Gherkin</h3>
      <p class="lead"><strong>Given / When / Then</strong> is the pattern. Feature files + step definitions. <strong>When not to use it:</strong> when Gherkin becomes a second language nobody maintains — prefer clear Playwright tests for a TS team unless business stakeholders read the features daily.</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Deep-diving Appium gestures in a Playwright interview.</li>
          <li>Quoting “5000 tests, 98% pass” with no flake or escape story.</li>
          <li>Pushing heavy Cucumber layers on a pure TS team with no stakeholder readers.</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> metrics calculator on <a href="#micro-tools">QA micro-tools</a>.</div>
    `,
  },
  {
    id: 'a11y-wcag',
    nav: 'WCAG & accessibility',
    title: 'WCAG & accessibility',
    html: `
      <h2 class="sec">WCAG &amp; accessibility</h2>
      <p class="lead"><strong>After this section you can</strong> explain why axe-core green is not enough, and what WCAG levels mean.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Classic scenario: “axe found zero issues but a screen-reader user cannot finish the form.”</div>

      <p class="lead"><strong>WCAG</strong> = accessibility rules. Levels <strong>A / AA / AAA</strong> (most products aim for AA). <strong>POUR</strong> = Perceivable, Operable, Understandable, Robust.</p>
      <p class="lead">Automated tools catch roughly half of issue volume (Deque’s study ~57% of issues). The “20–40%” figure is about success <em>criteria</em> coverage — either way: automation is required but not sufficient. Still do keyboard + screen-reader checks. Contrast: about <strong>4.5:1</strong> for normal text.</p>

      <div class="card warn"><strong>Common mistakes</strong>
        <ul class="tight">
          <li>Shipping on axe green alone.</li>
          <li>Only pixel screenshots for a11y (use ARIA snapshots + axe + manual).</li>
        </ul>
      </div>
      <div class="card good"><strong>Practice:</strong> <a href="#visual">Visual &amp; a11y</a> section + ARIA snapshots.</div>
    `,
  },
  {
    id: 'trace-lab',
    nav: 'Trace diagnosis lab',
    title: 'Trace diagnosis lab',
    html: `
      <h2 class="sec">Lab: diagnose a trace.zip</h2>
      <p class="lead"><strong>Goal:</strong> open a Playwright trace and find why a test failed — without guessing.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> “CI failed — walk me through the trace” is a real Mid/Senior prompt.</div>

      <h3 class="sub">Setup</h3>
      <ol class="tight">
        <li>In <code class="inline">practice-suite</code>, run:<br><code class="inline">npx playwright test --project=bank-demo --trace on</code></li>
        <li>Open the HTML report, or drag the <code class="inline">.zip</code> onto <a href="https://trace.playwright.dev" target="_blank" rel="noopener">trace.playwright.dev</a> (works in the browser; no server).</li>
      </ol>

      <h3 class="sub">Task</h3>
      <p class="lead">Use the checklist. Panels to know: <strong>actions</strong>, <strong>timeline / screenshots</strong>, <strong>DOM snapshot</strong>, <strong>network</strong>, <strong>console</strong>.</p>
      <div data-gap-widget="trace"></div>

      <h3 class="sub">Expected result</h3>
      <p class="lead">You can point to the failing action, say what the DOM showed, and name one better wait/assertion than a sleep.</p>

      <details class="solution-reveal"><summary>Show solution hints</summary>
        <div class="solution-body">
          <ul class="tight">
            <li>Start at the red action — read the error text.</li>
            <li>Check network for 4xx/5xx or a call that never fired.</li>
            <li>If the locator is ambiguous, the DOM snapshot shows duplicates (strict mode).</li>
            <li>Replace <code class="inline">waitForTimeout</code> with <code class="inline">expect(locator).toBeVisible()</code>.</li>
          </ul>
        </div>
      </details>
    `,
  },
  {
    id: 'antipattern-lab',
    nav: 'Spot the antipattern',
    title: 'Spot the antipattern lab',
    html: `
      <h2 class="sec">Lab: spot the antipattern</h2>
      <p class="lead"><strong>Goal:</strong> read a bad Playwright snippet and mark every real problem.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Code-review style questions beat trivia. Same skills as fixing flakes.</div>

      <h3 class="sub">Setup</h3>
      <p class="lead">No install. Use the drill below (Bank Demo style failures).</p>

      <h3 class="sub">Task</h3>
      <p class="lead">For each snippet: select every issue you see, then check. Issues include missing <code class="inline">await</code>, <code class="inline">waitForTimeout</code>, brittle selectors, shared data, one-shot <code class="inline">isVisible()</code>.</p>
      <div data-gap-widget="antipattern"></div>

      <h3 class="sub">Expected result</h3>
      <p class="lead">You match the expected issue tags and can explain the fix in one sentence.</p>

      <div class="card good"><strong>Also see:</strong> <a href="#mistakes">Anti-patterns</a> curriculum page.</div>
    `,
  },
  {
    id: 'star-builder',
    nav: 'STAR behavioral builder',
    title: 'STAR behavioral builder',
    html: `
      <h2 class="sec">QA STAR behavioral answers</h2>
      <p class="lead"><strong>After this section you can</strong> structure a behavioral answer in under 90 seconds with evidence.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Soft-skill rounds kill strong technical candidates who rant or surrender.</div>

      <p class="lead"><strong>STAR</strong> = Situation, Task, Action, Result. Prefer shared outcomes and numbers (flake %, risk avoided). Avoid “I gave up” or “I was always right.”</p>
      <div data-gap-widget="star"></div>

      <h3 class="sub">Mistakes interviewers punish</h3>
      <ul class="tight">
        <li>Syntax trivia instead of judgment.</li>
        <li>Treating flakes as “just add retries.”</li>
        <li>Surrender or stubbornness on “dev said it’s not a bug.”</li>
      </ul>
    `,
  },
  {
    id: 'mock-interview',
    nav: 'Timed mock interview',
    title: 'Timed mock interview',
    html: `
      <h2 class="sec">Lab: timed mock interview</h2>
      <p class="lead"><strong>Goal:</strong> answer five Playwright/SDET questions out loud, then self-score four dimensions.</p>
      <div class="card note"><strong>Why this exists:</strong> Journey (b) — interview in a few days. Practice under a clock.</div>

      <h3 class="sub">Setup</h3>
      <p class="lead">Quiet space. Speak first, type notes second. Dimensions: Technical · Coverage · Clarity · Best practices.</p>

      <h3 class="sub">Task</h3>
      <div data-gap-widget="mock"></div>

      <h3 class="sub">Expected result</h3>
      <p class="lead">You finish all five. Average self-score tells you what to reopen (trace lab, fixtures, contracts).</p>
    `,
  },
  {
    id: 'postmortems',
    nav: 'Postmortems & design',
    title: 'Postmortems & design prompts',
    html: `
      <h2 class="sec">Incident postmortems &amp; design prompts</h2>
      <p class="lead"><strong>After this section you can</strong> discuss a real incident and sketch a test strategy on a whiteboard.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Architect loops care about blast radius, canaries, and deploy controls — not more UI clicks.</div>

      <div data-gap-widget="postmortems"></div>

      <h3 class="sub">Whiteboard prompts (practice aloud)</h3>
      <ol class="tight">
        <li>Design automation for a microservices checkout (layers + ownership).</li>
        <li>Self-hosted grid vs BrowserStack/Sauce — when would you switch?</li>
        <li>First 30/60/90 days building automation on a brownfield app.</li>
      </ol>
      <p class="lead">Score yourself: risk language, pyramid, contracts, flake budget, metrics for leadership.</p>
    `,
  },
  {
    id: 'currency-2026',
    nav: 'Currency preview',
    title: 'Currency preview',
    html: `
      <h2 class="sec">Currency preview</h2>
      <p class="lead"><strong>After this section you can</strong> talk about AI browser-agents and self-healing without marketing language.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Emerging Senior/Architect signal. They want risks named.</div>

      <h3 class="sub">AI browser-agents</h3>
      <p class="lead">Happy-path benchmarks are not enough. Measure <strong>recovery after failure</strong> for: DOM drift, unclear screenshots, lost login, modal popups, rate limits, irreversible actions.</p>

      <h3 class="sub">Self-healing intent-drift</h3>
      <p class="lead">A healed test can stay green while checking the <em>wrong</em> thing. Invisible wrong asserts are worse than visible failures. Ask for audit trails and false-heal rates.</p>

      <h3 class="sub">Playwright surfaces to verify on the changelog</h3>
      <p class="lead">Speedboard/Timeline in the HTML report, <code class="inline">browser.bind()</code>, <code class="inline">npx playwright trace</code>, <code class="inline">locator.drop()</code>, <code class="inline">tracing.startHar()</code>. Pin versions before you claim them on a résumé. See also <a href="#agents-mcp">Agents &amp; MCP</a> and <a href="#whats-new">What's new</a>.</p>

      <div class="card warn"><strong>Common mistake:</strong> “Green after healer = ship.” Review skips and assertion changes first.</div>
    `,
  },
  {
    id: 'micro-tools',
    nav: 'QA micro-tools',
    title: 'QA micro-tools',
    html: `
      <h2 class="sec">QA micro-tools</h2>
      <p class="lead"><strong>After this section you can</strong> structure a bug report and compute simple quality metrics.</p>
      <div data-gap-widget="metrics"></div>
      <div data-gap-widget="bugreport"></div>
    `,
  },
  {
    id: 'production-failures',
    nav: 'Production failure war room',
    title: 'Production failure war room',
    html: `
      <h2 class="sec">Production failure war room</h2>
      <p class="lead"><strong>After this section you can</strong> answer "the pager went off, walk me through it" with the same shape every time: Symptom → Investigation → Root cause → Fix → Prevention.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> Senior/Lead loops grade your <em>order of operations</em>, not just the final answer. Source: <a href="interview/09-production-failures.md" target="_blank" rel="noopener">interview-qa/09-production-failures.md</a> (14 full write-ups).</div>

      <div class="card" style="margin-bottom:10px"><strong>PF1 — Login fails only right after a deploy.</strong> Reproduce manually first (product bug vs test bug); diff cookie/CSRF/redirect changes; re-record storageState. Related: A9, B27, C21.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF2 — CAPTCHA appears only in CI.</strong> Compare CI's shared IP reputation and headless signals vs local; get a test-mode CAPTCHA site key wired into CI secrets — never solve real CAPTCHAs programmatically.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF3 — Token expires mid-suite.</strong> Check token TTL vs suite runtime; refresh via API in a fixture rather than re-logging in through the UI; treat expiry as its own tested case, not an incident.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF4 — Download works locally, fails in Jenkins.</strong> Headless download-behavior differences, missing <code class="inline">acceptDownloads</code>, or a sandboxed download directory Jenkins can't write to.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF5 — Parallel workers collide on shared staging.</strong> Two workers mutate the same account/row; fix with per-worker data factories or API-seeded unique accounts, not serial execution.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF6 — Random timeouts after a deployment.</strong> New middleware/edge added latency under load that a fixed <code class="inline">actionTimeout</code> no longer covers — check p95 response time, not just "does it eventually load."</div>
      <div class="card" style="margin-bottom:10px"><strong>PF7 — Shadow DOM breaks after a library upgrade.</strong> A component library flipped to closed shadow roots; Playwright can't pierce closed roots — request an open-mode test build or a host-level testid.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF8 — Micro-frontend locator drift.</strong> Two teams ship independently; a shared header changed under a different team's release. Fix: contract on testids across MFEs, not just within one repo.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF9 — API 500s only in staging.</strong> Staging-only feature flags, thinner staging infra, or a shared staging DB in a bad state — isolate whether it's data, config, or capacity before touching the test.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF10 — Dynamic iframe id churns every load.</strong> Stop matching on the generated id; use <code class="inline">frameLocator</code> with a stable <code class="inline">title</code>/<code class="inline">name</code> attribute or index-independent selector.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF11 — Flake wave after a browser engine update.</strong> Playwright/Chromium bump changed timing or a strict-mode edge case; bisect the Playwright version, read the release notes' behavior-change section before patching every test.</div>
      <div class="card" style="margin-bottom:10px"><strong>PF12 — CI-provider pipeline failure (not your code).</strong> Runner image change, rate limiting, or a transient outage; distinguish from an app regression by re-running unchanged on a previous green commit first.</div>
      <p class="lead">Full write-ups (PF13 intermittent TLS/DNS, PF14 worker OOM) and the complete Investigation/Fix/Prevention steps for every scenario above live in the source markdown linked above.</p>
    `,
  },
  {
    id: 'framework-at-scale',
    nav: 'Framework at scale',
    title: 'Framework design at scale',
    html: `
      <h2 class="sec">Framework design at scale</h2>
      <p class="lead"><strong>After this section you can</strong> sketch a folder structure and name the 2–3 decisions that actually change between 500 and 50,000 tests — and what you deliberately do NOT build yet.</p>
      <div class="card note">Full folder-structure blocks: <a href="interview/10-framework-at-scale.md" target="_blank" rel="noopener">interview-qa/10-framework-at-scale.md</a>. See also the <a href="#pom">framework-layers diagram</a> in POM ↔ fixtures.</div>

      <h3 class="sub">FS1 — ~500 tests, one team</h3>
      <p class="lead">Flat <code class="inline">tests/&lt;feature&gt;/</code>, fixtures-first, one CI job. Do NOT build: custom test runners, multi-repo sharing, a framework "team."</p>
      <h3 class="sub">FS2 — ~5,000 tests, growing team</h3>
      <p class="lead">Tags for ownership, sharded CI, a thin internal fixtures package. Do NOT build: a bespoke DSL — plain TS still wins at this size.</p>
      <h3 class="sub">FS3 — ~50,000 tests, platform scale</h3>
      <p class="lead">A dedicated platform team owns fixtures/reporting as a versioned internal package; flake-budget gates block merges. Do NOT build: one giant monorepo test suite with no ownership boundaries.</p>
      <h3 class="sub">FS4–FS6 — multi-team, microservices, white-label</h3>
      <p class="lead">Contract boundaries between teams (own your locators via shared testid conventions), per-service thin E2E instead of one cross-service suite, and tenant-config-driven specs for white-label instead of copy-pasted suites per brand.</p>
      <div class="card warn"><strong>Interviewer signal:</strong> naming what you refuse to build at each size is the senior/lead tell — see D1/D3/D24–D28 for the underlying trade-off reasoning.</div>
    `,
  },
  {
    id: 'internals',
    nav: 'Playwright internals',
    title: 'Playwright internals',
    html: `
      <h2 class="sec">Playwright internals</h2>
      <p class="lead"><strong>After this section you can</strong> answer "why" a second time after the textbook answer — the mechanism under auto-waiting, locators, contexts, fixtures, and traces.</p>
      <div class="card note">Full mechanism write-ups + interview lines: <a href="interview/11-internals.md" target="_blank" rel="noopener">interview-qa/11-internals.md</a>.</div>

      <h3 class="sub">PI1 — Auto-waiting & actionability</h3>
      <p class="lead">Every action polls: attached → visible → stable (no animation) → enabled → receives-events, then dispatches a real trusted input event. <code class="inline">force: true</code> skips every check instead of fixing the reason a real click would also fail.</p>
      <h3 class="sub">PI2 — Locator engine & strictness</h3>
      <p class="lead">Locators are lazy queries re-evaluated on every use, not cached handles. Strict mode throws on ambiguous matches by design — an interview tell for whether you understand locators or memorized syntax.</p>
      <h3 class="sub">PI3–PI4 — BrowserContext & worker lifecycle</h3>
      <p class="lead">A context is an isolated profile (cookies/storage) reused across tests within a worker for speed; a worker is a whole process. Cross-worker shared state is where "flaky only in CI with parallel workers" bugs come from.</p>
      <h3 class="sub">PI5 — Fixture execution order (LIFO teardown)</h3>
      <p class="lead">Setup runs in dependency order; teardown (code after <code class="inline">use()</code>) runs in reverse — last fixture set up is the first torn down, same as a stack.</p>
      <h3 class="sub">PI6–PI8 — Traces, network interception, CDP vs WebDriver</h3>
      <p class="lead">Traces record a snapshot per action (DOM + screenshot + network) rather than a video, which is why they're small and scrubbable. <code class="inline">page.route</code> intercepts at the network layer before the browser sees the request. Playwright drives Chromium/WebKit via each engine's native protocol (CDP-like) rather than the W3C WebDriver HTTP wire protocol WebDriver-based tools use — this is why Playwright can do things like route interception and multiple contexts without a server round-trip per command.</p>
    `,
  },
  {
    id: 'debugging-artifacts-lab',
    nav: 'Debugging artifacts lab',
    title: 'Debugging artifacts lab',
    html: `
      <h2 class="sec">Debugging artifacts lab</h2>
      <p class="lead"><strong>Goal:</strong> triage a HAR file, a raw console log, a screenshot, or a video clip — the messier artifacts a real incident hands you when nobody turned tracing on.</p>
      <div class="card note">Full drills: <a href="interview/16-debugging-artifacts-lab.md" target="_blank" rel="noopener">interview-qa/16-debugging-artifacts-lab.md</a>. Pairs with the <a href="#trace-lab">Trace diagnosis lab</a> above.</div>
      <ul class="tight">
        <li><strong>DBG1–2 HAR triage:</strong> find the request contributing most to time-to-interactive; spot a request that never fired at all (blocked by CSP/ad-blocker/CORS).</li>
        <li><strong>DBG3–4 Console triage:</strong> separate a real uncaught exception from routine warning noise; find the one line that actually explains a broken render.</li>
        <li><strong>DBG5 Screenshot-only triage:</strong> no trace, one image — what can you still conclude (layout state, visible error text, loading spinner stuck)?</li>
        <li><strong>DBG6 Video frame-by-frame:</strong> find the exact frame where an expected element should have appeared and didn't.</li>
        <li><strong>DBG7–8 Combined-artifact drills:</strong> "given this folder, find the bug" — HAR + console + screenshot together, the way a real ticket actually arrives.</li>
      </ul>
    `,
  },
  {
    id: 'code-review-lab',
    nav: 'Code review lab',
    title: 'Code review lab',
    html: `
      <h2 class="sec">Lab: review this test</h2>
      <p class="lead"><strong>Goal:</strong> read a realistic flawed spec, name every issue before revealing them, then compare against the improved version.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> code-review style questions beat trivia and mirror real PR review. Full source: <a href="interview/12-code-review-lab.md" target="_blank" rel="noopener">interview-qa/12-code-review-lab.md</a>.</div>
      <div data-gap-widget="codereview"></div>
      <div class="card good"><strong>Also see:</strong> <a href="#antipattern-lab">Spot the antipattern</a> for single-issue drills; this lab combines several issues per test like a real PR does.</div>
    `,
  },
  {
    id: 'bdd-mapping',
    nav: 'BDD & Gherkin mapping',
    title: 'BDD & Gherkin mapping',
    html: `
      <h2 class="sec">BDD &amp; Gherkin mapping</h2>
      <p class="lead"><strong>After this section you can</strong> map a Gherkin feature to Playwright steps and argue, with a concrete cost, when BDD earns its overhead versus plain TypeScript tests.</p>
      <div class="card note"><strong>Why interviewers ask:</strong> "Do you use BDD?" is really asking whether you pick tools for the team, not out of habit. Cross-link: <a href="#interview-tier-d">Tier D — D20</a> covers the organizational decision in depth.</div>

      <h3 class="sub">Scenario vs Scenario Outline</h3>
      <p class="lead">A <strong>Scenario</strong> is one concrete example. A <strong>Scenario Outline</strong> runs the same steps once per row of an <code class="inline">Examples</code> table — the Gherkin equivalent of a parameterized/data-driven test.</p>
      <pre data-lang="gherkin"><code>Scenario Outline: Login rejects wrong passwords
  Given I am on the login page
  When I sign in as "&lt;user&gt;" with "&lt;password&gt;"
  Then I see the error "&lt;message&gt;"

  Examples:
    | user      | password | message                |
    | apex_user | wrong123 | Invalid credentials    |
    | apex_locked | Password123! | Account locked — contact support |</code></pre>

      <h3 class="sub">Gherkin → Playwright step mapping (playwright-bdd sketch)</h3>
      <pre data-lang="typescript"><code>import { Given, When, Then } from 'playwright-bdd/decorators';
import { test } from '../fixtures/test';

Given('I am on the login page', async ({ page }) => {
  await page.goto('/index.html#bank-demo');
});

When('I sign in as {string} with {string}', async ({ loginPage }, user: string, pass: string) => {
  await loginPage.signIn(user, pass);
});

Then('I see the error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.error).toContainText(message);
});</code></pre>
      <p class="lead">cucumber-js wires the same feature file to step definitions via a <code class="inline">World</code> object instead of Playwright fixtures directly — <code class="inline">playwright-bdd</code> exists specifically to let Gherkin steps use native Playwright fixtures (POM, storageState, etc.) instead of re-plumbing that yourself.</p>

      <h3 class="sub">When BDD earns its overhead</h3>
      <ul class="tight">
        <li><strong>Earns it:</strong> non-technical stakeholders (PM, compliance, business analyst) read and approve feature files as living documentation, and someone keeps them in sync.</li>
        <li><strong>Doesn't earn it:</strong> an all-engineer team where the Gherkin layer becomes a second language nobody but QA reads — plain, well-named Playwright tests communicate the same intent with less ceremony and no step-definition indirection to debug through.</li>
      </ul>
      <div class="card warn"><strong>Common mistake:</strong> adopting Cucumber because "it's more professional" with no stakeholder actually reading the <code class="inline">.feature</code> files — see D20 for the full decision framework.</div>
    `,
  },
  {
    id: 'glossary',
    nav: 'Glossary',
    title: 'Glossary',
    html: `
      <h2 class="sec">Glossary</h2>
      <p class="lead"><strong>After this section you can</strong> look up a term in one line before an interview.</p>
      <table>
        <tr><th>Term</th><th>One-liner</th></tr>
        <tr><td>Actionability</td><td>Checks before click/fill (visible, stable, enabled)</td></tr>
        <tr><td>Web-first assertion</td><td><code class="inline">expect(locator)</code> that retries until timeout</td></tr>
        <tr><td>storageState</td><td>Saved cookies + storage so tests skip UI login</td></tr>
        <tr><td>Trace</td><td>Recording of actions, DOM, network for failures</td></tr>
        <tr><td>Flake</td><td>Fails sometimes with no product change</td></tr>
        <tr><td>Contract test</td><td>Consumer/provider agreement (e.g. Pact)</td></tr>
        <tr><td>DORA</td><td>Four delivery metrics (freq, lead time, CFR, MTTR)</td></tr>
        <tr><td>BVA / EP</td><td>Boundary-value analysis / equivalence partitioning</td></tr>
        <tr><td>Ice-cream cone</td><td>Too much UI E2E, too little unit/API</td></tr>
        <tr><td>Intent-drift</td><td>Self-heal stays green but asserts the wrong thing</td></tr>
        <tr><td>Worker vs context</td><td>Worker = process; context = isolated browser profile</td></tr>
      </table>
    `,
  },
];
