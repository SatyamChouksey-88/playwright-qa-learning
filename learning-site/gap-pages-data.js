/**
 * Gap-analysis curriculum pages (Stages 1–3).
 * Mounted into #content by gap-practice.js — file:// safe, zero install.
 */
window.GAP_PAGES = [
  {
    id: 'test-design',
    nav: 'Test design techniques',
    title: 'Test design techniques',
    lead: 'The most common non-Playwright gap in tool-first curricula. Equivalence partitioning, BVA, decision tables, state-transition, and pairwise — plus a micro-generator below.',
    html: `
      <h2 class="sec">Test design techniques</h2>
      <p class="lead">Interviewers ask these constantly at Junior→Mid. Tool skill without design skill produces suites that miss boundaries and explode combinatorially.</p>
      <h3 class="sub">Equivalence partitioning (EP)</h3>
      <p class="lead">Split inputs into classes that should behave the same. Pick <strong>one representative per class</strong> (valid + invalid). Example: age field 0–120 → classes &lt;0, 0–17, 18–120, &gt;120.</p>
      <h3 class="sub">Boundary-value analysis (BVA)</h3>
      <p class="lead">Defects cluster at edges. For range [min, max] test <code class="inline">min-1, min, min+1, max-1, max, max+1</code>. Pair with EP — do not only test the happy mid-value.</p>
      <h3 class="sub">Decision tables</h3>
      <p class="lead">When rules combine (role × amount × KYC status), enumerate condition columns and expected actions. Collapse impossible combinations; keep forcing functions visible.</p>
      <h3 class="sub">State-transition</h3>
      <p class="lead">Model allowed transitions (draft→submitted→approved). Test valid paths, illegal transitions, and reset/cancel edges — maps cleanly to Bank Demo loan/ticket status.</p>
      <h3 class="sub">Pairwise / combinatorial</h3>
      <p class="lead">When full cartesian product is huge, pairwise covering arrays catch most interaction bugs with far fewer cases. Know when pairwise is enough vs when a high-risk trio needs explicit coverage.</p>
      <div class="card note"><strong>Micro-tool:</strong> BVA/EP generator</div>
      <div data-gap-widget="bva"></div>
      <div class="card good"><strong>Interview line:</strong> “I derive cases from EP/BVA first, then automate the critical boundaries — I don’t invent 40 E2E paths from UI clicks alone.”</div>
    `,
  },
  {
    id: 'pyramid-nft',
    nav: 'Pyramid & non-functional',
    title: 'Test pyramid, risk & non-functional vocabulary',
    lead: 'Where E2E fits, ice-cream-cone anti-pattern, and load/stress/soak/spike literacy (even if execution is k6/JMeter).',
    html: `
      <h2 class="sec">Test pyramid, risk &amp; non-functional testing</h2>
      <p class="lead"><strong>[HIGH]</strong> Mid/Senior. Playwright is the smoke alarm, not the microscope.</p>
      <ul class="tight">
        <li><strong>Pyramid:</strong> many unit → fewer integration/contract → thin E2E for critical journeys.</li>
        <li><strong>Ice-cream cone:</strong> inverted pyramid (UI-heavy) — slow, flaky, expensive.</li>
        <li><strong>Risk-based:</strong> prioritize by likelihood × impact; shift-left with API/contract before UI.</li>
        <li><strong>Exploratory:</strong> charters + session-based testing complements automation; does not replace it.</li>
      </ul>
      <h3 class="sub">Non-functional vocabulary</h3>
      <table>
        <tr><th>Type</th><th>Question it answers</th></tr>
        <tr><td>Load</td><td>Expected concurrent users — steady-state OK?</td></tr>
        <tr><td>Stress</td><td>Where does it break past capacity?</td></tr>
        <tr><td>Soak</td><td>Memory/leak over hours?</td></tr>
        <tr><td>Spike</td><td>Sudden traffic burst recovery?</td></tr>
        <tr><td>Volume</td><td>Large data sets / storage?</td></tr>
      </table>
      <div class="card good"><strong>Strong answer:</strong> “k6 on the top 3 critical APIs: smoke baseline, steady-state, short stress — plus perf budgets in CI. E2E asserts user journeys, not TPS.”</div>
    `,
  },
  {
    id: 'multi-context',
    nav: 'Multi-context & pages',
    title: 'Multi-context & multi-page orchestration',
    lead: 'Two isolated users in one test, popups, OAuth tabs — a top Mid→Senior discriminator.',
    html: `
      <h2 class="sec">Multi-context &amp; multi-page orchestration</h2>
      <p class="lead"><strong>[HIGH]</strong> Extends Bank Demo: support agent + customer simultaneously without cookie bleed.</p>
      <pre data-lang="typescript"><code>test('admin sees user action', async ({ browser }) =&gt; {
  const userCtx = await browser.newContext();
  const adminCtx = await browser.newContext({ storageState: '.auth/admin.json' });
  const userPage = await userCtx.newPage();
  const adminPage = await adminCtx.newPage();
  await userPage.goto('/app');
  await adminPage.goto('/admin');
  // … assert isolation: user cookies never appear on adminCtx
  await userCtx.close();
  await adminCtx.close();
});

// Popup / new tab — listen BEFORE click
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open statement' }).click();
const popup = await popupPromise;
await popup.waitForLoadState();
await expect(popup.getByRole('heading')).toBeVisible();</code></pre>
      <div class="card warn">Default fixtures give one context per test. Multi-user scenarios need explicit <code class="inline">browser.newContext()</code> — don’t share a mutated storageState across roles.</div>
    `,
  },
  {
    id: 'shadow-advanced',
    nav: 'Shadow DOM edge cases',
    title: 'Shadow DOM edge cases',
    lead: 'Open roots auto-pierce; closed roots cannot. Know css:light and nested component cost.',
    html: `
      <h2 class="sec">Shadow DOM edge cases</h2>
      <ul class="tight">
        <li><strong>Open shadow roots:</strong> Playwright pierces automatically with role/CSS locators.</li>
        <li><strong>Closed shadow roots:</strong> <em>cannot</em> be pierced — ask for testability (open mode / test IDs on host) or use higher-level APIs the app exposes.</li>
        <li><strong><code class="inline">css=css:light</code> / light-DOM engines:</strong> restrict matching to light DOM when piercing would grab the wrong node.</li>
        <li><strong>Nested web components:</strong> prefer user-facing roles on the composed tree; avoid deep pierce chains that break on redesign.</li>
      </ul>
      <div class="card note">Interview gotcha: “Playwright always sees inside shadow DOM” — false for closed roots.</div>
    `,
  },
  {
    id: 'fixtures-advanced',
    nav: 'Worker fixtures & mergeTests',
    title: 'Worker-scoped fixtures & mergeTests',
    lead: 'Worker vs test scope, composition, and mergeTests for combining fixture packs.',
    html: `
      <h2 class="sec">Worker-scoped fixtures &amp; mergeTests</h2>
      <pre data-lang="typescript"><code>import { test as base, mergeTests } from '@playwright/test';
import { test as dbTest } from './db.fixtures';
import { test as authTest } from './auth.fixtures';

// Expensive server — once per worker process
export const test = base.extend({
  sharedDb: [async ({}, use) =&gt; {
    const db = await startDb();
    await use(db);
    await db.stop();
  }, { scope: 'worker' }],
});

export const merged = mergeTests(dbTest, authTest);</code></pre>
      <ul class="tight">
        <li><strong>Test scope:</strong> fresh per test (default) — isolation.</li>
        <li><strong>Worker scope:</strong> shared across tests in a worker — great for servers; dangerous for mutable login state.</li>
        <li><strong>mergeTests:</strong> compose fixture sets without inheritance trees.</li>
      </ul>
    `,
  },
  {
    id: 'parallelism',
    nav: 'Parallelism internals',
    title: 'Parallelism internals',
    lead: 'Worker processes vs browser contexts, fullyParallel, and why state leaks.',
    html: `
      <h2 class="sec">Parallelism internals</h2>
      <ul class="tight">
        <li><strong>Workers</strong> = OS processes. Each runs tests with isolated browser contexts by default.</li>
        <li><strong>fullyParallel:</strong> tests inside a file can run in parallel too.</li>
        <li><strong>Isolation guarantee:</strong> don’t share mutable files/DB rows without unique keys — “passes alone, fails in CI” is usually data collision.</li>
        <li><strong>Shards</strong> split the test list across machines; workers parallelize within a machine.</li>
      </ul>
      <div class="card bad">Cargo-cult: raising workers without unique data — amplifies flakes.</div>
    `,
  },
  {
    id: 'websocket',
    nav: 'WebSocket & SSE',
    title: 'WebSocket / SSE / real-time testing',
    lead: 'routeWebSocket, listen before goto, assert UI not wire trivia. Bank Demo live balances map here.',
    html: `
      <h2 class="sec">WebSocket / SSE / real-time testing</h2>
      <pre data-lang="typescript"><code>await page.routeWebSocket('**/socket', ws =&gt; {
  ws.onMessage(message =&gt; {
    // optionally modify / drop frames
    ws.send(message);
  });
});
await page.goto('/dashboard'); // register route BEFORE navigation
await expect(page.getByTestId('live-balance')).toContainText('$');</code></pre>
      <ul class="tight">
        <li>Prefer asserting <strong>user-visible outcomes</strong> over every frame opcode.</li>
        <li>Close codes: 1000 normal vs 1006 abnormal — useful for reconnect UX tests.</li>
        <li>SSE: mock via <code class="inline">route</code> returning <code class="inline">text/event-stream</code> bodies.</li>
      </ul>
    `,
  },
  {
    id: 'performance-cwv',
    nav: 'Performance & CWV',
    title: 'Performance capture & Core Web Vitals',
    lead: 'LCP/CLS/INP via PerformanceObserver; Chromium-only; run 3–5× and take median.',
    html: `
      <h2 class="sec">Performance capture &amp; Core Web Vitals</h2>
      <p class="lead"><strong>[MED→rising]</strong> Senior. Single runs are noisy — budgets need medians.</p>
      <pre data-lang="typescript"><code>const metrics = await page.evaluate(() =&gt; new Promise(resolve =&gt; {
  new PerformanceObserver((list) =&gt; {
    const entries = list.getEntries();
    resolve(entries.map(e =&gt; ({ name: e.name, startTime: e.startTime })));
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}));
// Also: CDP CPU/network throttling; playwright-lighthouse for audits</code></pre>
      <div class="card warn">CWV APIs are Chromium-centric. Don’t fail WebKit on LCP the same way. Pair with API load tests (k6) for capacity.</div>
    `,
  },
  {
    id: 'coverage-e2e',
    nav: 'E2E code coverage',
    title: 'Code coverage from E2E',
    lead: 'page.coverage (V8) → Istanbul; don’t chase 100% E2E coverage.',
    html: `
      <h2 class="sec">Code coverage from E2E</h2>
      <pre data-lang="typescript"><code>await page.coverage.startJSCoverage();
await page.goto('/');
// … journeys …
const coverage = await page.coverage.stopJSCoverage();
// convert with v8-to-istanbul / nyc — Chromium-only for page.coverage</code></pre>
      <div class="card good"><strong>Judgment:</strong> Coverage from E2E finds dead UI paths; it is not a substitute for unit coverage. Interviewers punish “we aim for 100% E2E lines.”</div>
    `,
  },
  {
    id: 'contract-testing',
    nav: 'Contract testing (Pact)',
    title: 'Contract testing alongside E2E',
    lead: 'Consumer-driven contracts reduce brittle cross-service E2E. HIGH for microservices interviews.',
    html: `
      <h2 class="sec">Contract testing (Pact) alongside E2E</h2>
      <p class="lead">Common senior answer: <strong>API-first + Pact + thin UI checks</strong>.</p>
      <ul class="tight">
        <li>Consumer publishes expectations; provider verifies against them in CI.</li>
        <li>Breaks schema drift before UI E2E ever runs.</li>
        <li>Keep a thin Playwright layer for journeys that only exist in the composed UI.</li>
      </ul>
      <div class="card note">Also know: WireMock / Testcontainers for dependency virtualization; GraphQL schema checks via <code class="inline">request</code>.</div>
    `,
  },
  {
    id: 'grids-mobile',
    nav: 'Cloud grids & mobile',
    title: 'Cloud grids & mobile/Appium comparison',
    lead: 'BrowserStack / Sauce / LambdaTest; Playwright = mobile-web emulation only — native needs Appium/Maestro/Detox.',
    html: `
      <h2 class="sec">Cloud grids &amp; mobile fundamentals</h2>
      <table>
        <tr><th>Grid</th><th>Strength</th></tr>
        <tr><td>BrowserStack</td><td>Broadest real-device fleet</td></tr>
        <tr><td>Sauce Labs</td><td>Enterprise / compliance / analytics</td></tr>
        <tr><td>LambdaTest</td><td>Price / parallel scale</td></tr>
      </table>
      <p class="lead">Connect via CDP / <code class="inline">connectOptions.wsEndpoint</code>. Self-host when data residency or cost dominates.</p>
      <h3 class="sub">Appium comparison (favorite gotcha)</h3>
      <ul class="tight">
        <li>Playwright emulates <strong>mobile web</strong> (viewport, touch) — not native apps.</li>
        <li>Native/hybrid → Appium / Maestro / Detox; context switch native↔webview; W3C Actions (TouchAction deprecated).</li>
      </ul>
    `,
  },
  {
    id: 'db-sql',
    nav: 'DB & SQL for testers',
    title: 'Database testing & SQL for testers',
    lead: 'Joins, aggregates, integrity — seed via API/DB, assert via UI.',
    html: `
      <h2 class="sec">Database testing &amp; SQL for testers</h2>
      <ul class="tight">
        <li>Verify referential integrity after UI actions (orphan rows = bug).</li>
        <li>Factories/builders for unique data; cleanup in fixtures or transactions.</li>
        <li>Prefer seeding through APIs the product owns; raw SQL when testing reporting/ETL.</li>
      </ul>
      <div class="card note">Know basic joins + <code class="inline">GROUP BY</code> checks for “does the dashboard match the ledger?” interviews.</div>
    `,
  },
  {
    id: 'metrics-dora',
    nav: 'DORA & quality metrics',
    title: 'DORA & defect-escape metrics',
    lead: 'Leadership wants outcomes, not “5000 tests 98% green.”',
    html: `
      <h2 class="sec">Metrics that matter to leadership</h2>
      <ul class="tight">
        <li><strong>DORA:</strong> deployment frequency, lead time, change-failure rate, MTTR.</li>
        <li><strong>Defect escape / leakage:</strong> bugs found in prod vs pre-prod (target low single digits %; zero critical escape).</li>
        <li><strong>Flakiness rate:</strong> industry conversations often cite &lt;1% as healthy.</li>
        <li><strong>DRE / effectiveness:</strong> defects found by testing vs total found later.</li>
      </ul>
      <div class="card good">Pair coverage % with which <em>business journeys</em> are gated — volume without risk context is ignored.</div>
    `,
  },
  {
    id: 'a11y-wcag',
    nav: 'WCAG & a11y depth',
    title: 'Accessibility depth (WCAG)',
    lead: 'A/AA/AAA, POUR, axe limits (~57% of issue volume per Deque), manual SR testing, contrast.',
    html: `
      <h2 class="sec">Accessibility depth beyond ARIA snapshots</h2>
      <ul class="tight">
        <li><strong>POUR:</strong> Perceivable, Operable, Understandable, Robust.</li>
        <li><strong>Levels:</strong> A / AA (common target) / AAA.</li>
        <li><strong>Contrast:</strong> ~4.5:1 normal text, ~3:1 large text (WCAG AA).</li>
        <li><strong>Keyboard:</strong> focus order, no traps, visible focus.</li>
        <li><strong>Automation ceiling:</strong> Deque’s study (~13k pages) found ~57% of <em>issue volume</em> covered by automation; the “20–40%” figure usually refers to WCAG <em>success criteria</em> — either way, axe green ≠ accessible.</li>
      </ul>
      <div class="card warn">Classic scenario: “axe reports zero violations but a screen-reader user still can’t complete the form.” Answer: name SR testing (NVDA/VoiceOver), labels/live regions, and focus management.</div>
    `,
  },
  {
    id: 'security-qa',
    nav: 'Security at QA level',
    title: 'Security testing at QA level',
    lead: 'OWASP Top 10 awareness — not pentest depth. XSS/CSRF/SQLi/IDOR, cookies, ZAP/Burp familiarity.',
    html: `
      <h2 class="sec">Security testing at QA level</h2>
      <ul class="tight">
        <li>Probe IDOR (change resource IDs), basic XSS reflection, CSRF on state-changing POSTs.</li>
        <li>Cookie flags: <code class="inline">HttpOnly</code>, <code class="inline">Secure</code>, <code class="inline">SameSite</code>; CSP presence.</li>
        <li>Tooling awareness: OWASP ZAP / Burp for exploratory — Playwright for regression of fixed controls.</li>
      </ul>
      <div class="card bad">Don’t “solve CAPTCHA” in legitimate suites — environment bypass keys only.</div>
    `,
  },
  {
    id: 'bdd-awareness',
    nav: 'BDD awareness',
    title: 'BDD / Gherkin awareness',
    lead: 'Given/When/Then + when NOT to use BDD. Awareness depth only.',
    html: `
      <h2 class="sec">BDD / Cucumber / Gherkin — awareness</h2>
      <p class="lead">Candidates are asked even on Playwright-first teams.</p>
      <ul class="tight">
        <li>Feature files + step defs; Scenario Outline for data variants.</li>
        <li><strong>When not to use:</strong> no collaboration on Gherkin, steps become a second programming language, parsing overhead without shared living documentation.</li>
        <li>Playwright can drive BDD layers — or skip them and keep readable <code class="inline">test()</code> titles + <code class="inline">test.step</code>.</li>
      </ul>
    `,
  },
  {
    id: 'mutation-stryker',
    nav: 'Mutation testing',
    title: 'Mutation testing (StrykerJS)',
    lead: 'Measures suite quality beyond coverage. Score &gt;80% is a common “strong” heuristic; full runs are slow — nightly.',
    html: `
      <h2 class="sec">Mutation testing (StrykerJS)</h2>
      <p class="lead">Mutants that survive = tests didn’t catch a deliberate code change. Architect prompt: “How do you know your tests are any good?”</p>
      <div class="card note">Per-test/incremental modes can fit PRs (minutes); full mutation often 30–60 min → schedule nightly.</div>
    `,
  },
  {
    id: 'trace-lab',
    nav: 'Trace diagnosis lab',
    title: 'Trace.zip diagnosis lab',
    lead: 'Use Playwright Trace Viewer (browser-native). Diagnose failing journeys with a structured checklist.',
    html: `
      <h2 class="sec">Trace.zip diagnosis lab</h2>
      <p class="lead"><strong>[HIGH]</strong> Open <a href="https://trace.playwright.dev" target="_blank" rel="noopener">trace.playwright.dev</a> (drag-drop a trace — no backend). Panels: actions, timeline, DOM snapshots, network, console.</p>
      <div class="card note"><strong>Exercise:</strong> Run Bank Demo OTP expiry test with <code class="inline">trace: on</code>, open the zip, and answer the checklist below.</div>
      <div data-gap-widget="trace"></div>
    `,
  },
  {
    id: 'antipattern-lab',
    nav: 'Spot the antipattern',
    title: 'Spot the antipattern / fix the flaky test',
    lead: 'Scored drills: missing await, waitForTimeout, brittle selectors, shared state — mapped to Bank Demo personas.',
    html: `
      <h2 class="sec">Spot the antipattern / fix the flaky test</h2>
      <p class="lead">Differentiation vs generic coding sites: Playwright-specific flawed specs.</p>
      <div data-gap-widget="antipattern"></div>
    `,
  },
  {
    id: 'star-builder',
    nav: 'STAR behavioral builder',
    title: 'QA STAR behavioral builder',
    lead: 'Structure answers: Situation → Task → Action → Result. Avoid surrender-or-stubbornness.',
    html: `
      <h2 class="sec">QA-specific STAR behavioral builder</h2>
      <p class="lead">Interviewers reward evidence + shared outcomes. Penalize ranting or “I just gave up / dug in.”</p>
      <div data-gap-widget="star"></div>
    `,
  },
  {
    id: 'mock-interview',
    nav: 'Timed mock interview',
    title: 'Timed mock interview simulator',
    lead: '5 questions, scored on Technical / Coverage / Clarity / Practices. Playwright follow-ups included.',
    html: `
      <h2 class="sec">Timed mock interview simulator</h2>
      <div data-gap-widget="mock"></div>
    `,
  },
  {
    id: 'postmortems',
    nav: 'Incident postmortems',
    title: 'Architect postmortem library',
    lead: 'Verified incidents where testing/process gaps mattered — discussion prompts, not gore tourism.',
    html: `
      <h2 class="sec">Architect-tier postmortem library</h2>
      <div data-gap-widget="postmortems"></div>
    `,
  },
  {
    id: 'currency-2026',
    nav: 'Currency preview 2026',
    title: 'Currency preview (mid-2026)',
    lead: 'AI browser-agent evaluation, self-healing intent-drift, Playwright 1.58–1.60 surfaces, CI cost for LLM loops.',
    html: `
      <h2 class="sec">Currency preview (mid-2026)</h2>
      <h3 class="sub">Testing AI browser-agents / computer-use</h3>
      <p class="lead">Distinct from “LLM app testing.” Measure <strong>recovery-rate-per-failure-mode</strong> across: DOM drift, screenshot ambiguity, login-state loss, modals, rate limits, irreversibility. Tools: Stagehand, Browser Use, Skyvern, etc. Benchmarks (WebArena) ≠ production recovery metrics.</p>
      <h3 class="sub">Self-healing intent-drift</h3>
      <p class="lead">Healed tests can pass while asserting the wrong thing — “visible failures traded for invisible ones.” Demand audit trails and false-heal rates.</p>
      <h3 class="sub">Playwright 1.58–1.60 surfaces (verify vs changelog)</h3>
      <ul class="tight">
        <li>Speedboard / Timeline in HTML report (suite perf, not only pass/fail)</li>
        <li><code class="inline">browser.bind()</code>, standalone <code class="inline">npx playwright trace</code></li>
        <li><code class="inline">locator.drop()</code>, <code class="inline">tracing.startHar()</code>, pick locator / in-app search</li>
        <li>Chrome for Testing switch; API-surface tightening toward modern locators</li>
      </ul>
      <h3 class="sub">CI cost governance for LLM-in-the-loop</h3>
      <p class="lead">Token cost per run; gate expensive judges on release candidates, not every PR; shard/worker tune for spend.</p>
      <div class="card warn">Version-pinned claims: confirm against <a href="https://playwright.dev/docs/release-notes" target="_blank" rel="noopener">official release notes</a> before citing in a résumé.</div>
    `,
  },
  {
    id: 'global-setup-config',
    nav: 'Global setup & env config',
    title: 'Global setup vs project dependencies & env config',
    lead: 'globalSetup vs setup projects; multi-project baseURL and stage env composition.',
    html: `
      <h2 class="sec">Global setup / teardown vs project dependencies</h2>
      <p class="lead"><strong>[MED→HIGH]</strong> <code class="inline">globalSetup</code> runs once in a separate Node process before workers; setup <strong>projects</strong> with <code class="inline">dependencies</code> are first-class Playwright tests that can produce <code class="inline">storageState</code> artifacts other projects consume.</p>
      <ul class="tight">
        <li>Prefer <strong>setup projects</strong> for auth/seed you want traced, retried, and reported like tests.</li>
        <li>Use globalSetup for one-shot infra (start a stub server, provision a tenant) that isn’t a “test.”</li>
        <li><strong>Env composition:</strong> multiple <code class="inline">projects</code>, env-driven <code class="inline">baseURL</code>, per-stage <code class="inline">.env</code> — never hardcode staging URLs in specs.</li>
      </ul>
      <div class="card good"><strong>Interview line:</strong> “Auth is a setup project dependency; globalSetup is for process-level infra — I don’t conflate them.”</div>
    `,
  },
  {
    id: 'reporters-blob',
    nav: 'Custom reporters & blob',
    title: 'Custom reporters & sharded merge-reports',
    lead: 'Write a reporter; blob + merge-reports for sharded CI.',
    html: `
      <h2 class="sec">Custom reporters &amp; blob merge</h2>
      <p class="lead"><strong>[MED]</strong> Implement the reporter interface (<code class="inline">onBegin</code>/<code class="inline">onTestEnd</code>/<code class="inline">onEnd</code>) to push to dashboards. For sharding, use the <strong>blob</strong> reporter per shard then <code class="inline">npx playwright merge-reports</code> into one HTML/JSON report.</p>
      <div class="card note">Architect angle: report <em>flakiness rate</em> and critical-journey status upward — not raw pass % alone (see DORA module).</div>
    `,
  },
  {
    id: 'downloads-geo',
    nav: 'Downloads, geo &amp; locale',
    title: 'Downloads/PDF, geolocation, permissions, locale',
    lead: 'Bundle Clock with device/locale/timezone emulation and file download assertions.',
    html: `
      <h2 class="sec">Downloads, uploads, PDF &amp; device/locale</h2>
      <ul class="tight">
        <li><code class="inline">waitForEvent('download')</code> then read path / stream; assert PDF text or CSV rows — not only that a file appeared.</li>
        <li><code class="inline">setInputFiles</code> accepts buffers for synthetic uploads.</li>
        <li>Context options: <code class="inline">geolocation</code>, <code class="inline">permissions</code>, <code class="inline">locale</code>, <code class="inline">timezoneId</code>, <code class="inline">colorScheme</code> — i18n/l10n and permission prompts are Mid/Senior staples.</li>
        <li>Electron: <code class="inline">_electron</code> API exists — niche; flag as specialized.</li>
      </ul>
    `,
  },
  {
    id: 'microservices-mq',
    nav: 'Microservices &amp; queues',
    title: 'Microservices, queues &amp; service virtualization',
    lead: 'Pact + WireMock/Testcontainers + thin E2E; Kafka/Rabbit patterns.',
    html: `
      <h2 class="sec">Microservices testing strategy</h2>
      <p class="lead"><strong>[HIGH]</strong> Common senior answer: API-first + consumer-driven contracts (Pact) + service virtualization (WireMock) + Testcontainers for real deps + <strong>thin</strong> Playwright journeys for business-critical paths.</p>
      <h3 class="sub">Message queues</h3>
      <p class="lead">Test publishers/consumers independently; assert eventual UI only after verifying side effects (DB/API). Don’t treat a lucky UI poll as proof the consumer worked.</p>
      <h3 class="sub">GraphQL / gRPC awareness</h3>
      <p class="lead">GraphQL: match by operation name inside one URL; assert <code class="inline">errors[]</code> even on HTTP 200. gRPC: usually tested below the browser; know it exists in the stack diagram.</p>
    `,
  },
  {
    id: 'exploratory-process',
    nav: 'Exploratory &amp; process',
    title: 'Exploratory testing, defect lifecycle &amp; agile QA',
    lead: 'Charters, triage, ceremonies, test strategy docs — Mid/Senior soft process.',
    html: `
      <h2 class="sec">Exploratory testing &amp; QA process</h2>
      <ul class="tight">
        <li><strong>Exploratory:</strong> charters + session-based notes complement automation; automation doesn’t replace curiosity on new risk.</li>
        <li><strong>Defect lifecycle:</strong> reproduce → severity/priority → triage → verify fix → regression — never “closed because can’t repro once.”</li>
        <li><strong>Agile:</strong> tester in refinement (acceptance clarity), shift-left unit/API, protect release with risk-based gates.</li>
        <li><strong>Test strategy/plan:</strong> scope, risks, environments, entry/exit, automation vs manual — interview exercise: given a feature, write a one-pager.</li>
      </ul>
      <div class="card note"><strong>Exercise:</strong> Pick Bank Demo “transfer funds” and write a 10-line risk-based plan (must-test / should / exploratory).</div>
    `,
  },
  {
    id: 'visual-chaos',
    nav: 'Visual tooling &amp; synthetics',
    title: 'Visual regression tooling &amp; synthetic monitoring',
    lead: 'toHaveScreenshot vs Percy/Applitools; Playwright as Checkly-style synthetic.',
    html: `
      <h2 class="sec">Visual tooling &amp; chaos/synthetics</h2>
      <p class="lead"><strong>[MED]</strong> Playwright pixel baselines are free and CI-native; Percy/Applitools add perceptual/AI diff and cross-browser fleets — trade cost vs noise. Mask dynamic regions; expect OS font diffs.</p>
      <p class="lead">Architect: run thin critical journeys as <strong>production synthetics</strong> (canary); chaos is usually infra-layer — Playwright validates user-visible recovery, not the chaos injection itself.</p>
    `,
  },
  {
    id: 'system-design-lab',
    nav: 'System-design prompts',
    title: 'Whiteboard / system-design lab',
    lead: 'Architect interview prompts: framework, grid, 30/60/90.',
    html: `
      <h2 class="sec">Whiteboard / system-design exercises</h2>
      <ol class="tight">
        <li>Design a test framework for a microservices checkout (layers, ownership, CI gates).</li>
        <li>Grid strategy: self-hosted vs BrowserStack/Sauce/LambdaTest — TCO and when to switch.</li>
        <li>Your first 30/60/90 days building automation from scratch on a brownfield app.</li>
        <li>Feature-flag + multi-tenant bank white-label: what do you parameterize vs duplicate?</li>
      </ol>
      <div class="card good">Score yourself: risk language, pyramid, contracts, flake budget, metrics to leadership.</div>
    `,
  },
  {
    id: 'candidate-mistakes',
    nav: 'Common candidate mistakes',
    title: 'Common candidate mistakes (interviewer lens)',
    lead: 'Compiled failure modes: syntax over judgment; flake trust; behavioral extremes.',
    html: `
      <h2 class="sec">Common candidate mistakes</h2>
      <ul class="tight">
        <li>Recalling selector trivia instead of <strong>judgment</strong> (when to mock, what to leave manual).</li>
        <li>Treating flaky tests as “just retries” — interviewers know flakes destroy trust faster than missing tests.</li>
        <li>Behavioral: surrender (“I dropped it”) or stubbornness (“I escalated forever”) — prefer evidence + shared outcome.</li>
        <li>Claiming 100% E2E coverage as a goal.</li>
        <li>Saying Playwright tests native mobile apps (it doesn’t — mobile-web emulation only).</li>
      </ul>
    `,
  },
  {
    id: 'micro-tools',
    nav: 'QA micro-tools',
    title: 'Bug-report builder &amp; defect metrics',
    lead: 'Cheap utilities: structure a bug report; compute DRE / escape rate / pass rate.',
    html: `
      <h2 class="sec">QA micro-tools</h2>
      <div data-gap-widget="metrics"></div>
      <div data-gap-widget="bugreport"></div>
    `,
  },
  {
    id: 'glossary',
    nav: 'Glossary',
    title: 'QA / Playwright glossary',
    lead: 'Fast-lookup terms indexed by MiniSearch after rebuild.',
    html: `
      <h2 class="sec">Glossary (day-before friendly)</h2>
      <table>
        <tr><th>Term</th><th>One-liner</th></tr>
        <tr><td>Actionability</td><td>Checks before click/fill (visible, stable, enabled, receives events)</td></tr>
        <tr><td>Web-first assertion</td><td>expect(locator) that auto-retries until timeout</td></tr>
        <tr><td>storageState</td><td>Cookies + origin storage snapshot for auth reuse</td></tr>
        <tr><td>Trace</td><td>Timeline + DOM + network artifact for CI failures</td></tr>
        <tr><td>Flake</td><td>Intermittent failure without product change — quarantine + diagnose</td></tr>
        <tr><td>Contract test</td><td>Consumer/provider schema agreement (e.g. Pact)</td></tr>
        <tr><td>DORA</td><td>Four key delivery metrics (freq, lead time, CFR, MTTR)</td></tr>
        <tr><td>BVA</td><td>Boundary-value analysis</td></tr>
        <tr><td>Ice-cream cone</td><td>Too much UI E2E, too little unit/API</td></tr>
        <tr><td>Intent-drift</td><td>Self-heal keeps green while asserting the wrong behavior</td></tr>
      </table>
    `,
  },
];
