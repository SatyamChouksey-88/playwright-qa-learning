/* Essential interview Q&A from real screening rounds — behavioral, QA theory, Playwright, BDD, Git/Jira */
window.INTERVIEW_ESSENTIALS = {
  hub: {
    title: "Interview essentials (HR + QA + Playwright)",
    lead: "Real screening questions collected from interviews: introductions, manual QA theory, Playwright mechanics, BDD, Git/Jira, and AI/MCP. Answer out loud first, then reveal Ideal + Stuck.",
  },

  categories: [
    {
      id: "behavioral",
      title: "Behavioral & introduction",
      lead: "Openers almost every interviewer starts with. Keep answers to 60–90 seconds with a clear structure.",
      questions: [
        {
          id: "e1",
          q: "Tell me about yourself.",
          ideal: `<p>Use a short arc: <strong>Present → Past → Future</strong>. Present: role, stack (Playwright + TypeScript), domain. Past: 1–2 concrete wins (flake reduced X%, CI time cut, critical journey automated). Future: why this role. Skip life story; end with what you want to own next (CI quality, framework design, mentoring).</p>`,
          stuck: `<p>Rambling chronology, reading the résumé aloud, or no measurable outcomes.</p>`,
        },
        {
          id: "e2",
          q: "Tell me about your previous / last project.",
          ideal: `<p>Cover in order: product (1 line), your ownership (automation scope), architecture (POM/fixtures/CI), hardest problem (flake, auth, iframes), result (metrics or risk avoided). Name tools: Playwright, GitHub Actions, Jira. End with what you’d improve next.</p>`,
          stuck: `<p>Only listing tech names with no problem → action → result.</p>`,
        },
        {
          id: "e3",
          q: "Tell me about your daily activities as a QA / automation engineer.",
          ideal: `<p>Typical day: stand-up → triage overnight CI failures (trace first) → automate/expand coverage for sprint stories → review PRs / pair with devs on testability → update tickets → regression or smoke before merge/release. Emphasize communication of risk, not just “writing scripts.”</p>`,
          stuck: `<p>Saying only “I write test cases all day” with no CI, triage, or collaboration.</p>`,
        },
        {
          id: "e4",
          q: "What were your roles and responsibilities in the last project?",
          ideal: `<p>Own E2E suite health, design cases from acceptance criteria, maintain page objects/fixtures, gate PRs with smoke, run/analyze regression, raise defects with severity/priority, mentor juniors on locators/flake, improve pipeline (shards, reports). Clarify what you did <em>not</em> own (prod deploy, product backlog).</p>`,
          stuck: `<p>Claiming ownership of everything, or only “executed manual cases.”</p>`,
        },
        {
          id: "e5",
          q: "How do you write test cases (manual or automation)?",
          ideal: `<p>From requirements/AC: identify risk → happy path + negative + edge → preconditions, steps, data, expected result. For automation: map each case to a stable assertion on user-visible outcome; prefer API setup for data; keep UI checks thin. Traceability: link case IDs to Jira stories.</p>`,
          stuck: `<p>Writing steps without expected results, or automating every manual case blindly.</p>`,
        },
        {
          id: "e6",
          q: "Rate yourself in Manual Testing (1–5) and in Playwright with / without MCP or AI assistants.",
          ideal: `<p>Be honest and specific. Example: Manual 4/5 (strong on exploratory + defect clarity); Playwright 4/5 without AI (locators, fixtures, CI); with MCP/codegen 3–4/5 (faster drafts, still review every locator and assertion). Never claim 5/5 unless you can teach it.</p>`,
          stuck: `<p>Inflated 5/5 with no examples, or underrating to seem humble without evidence.</p>`,
        },
        {
          id: "e7",
          q: "Describe the framework of your last project.",
          ideal: `<p>Layers: @playwright/test + TypeScript → fixtures (auth, API) → page objects / screen modules → test specs tagged (smoke/@regression) → config projects (browsers/envs) → CI sharding + HTML/Allure + trace on retry. Mention how data and secrets are handled.</p>`,
          stuck: `<p>“We use POM” with no fixtures, CI, or tagging story.</p>`,
        },
        {
          id: "e8",
          q: "Any questions for me? (end of interview)",
          ideal: `<p>Ask about: how automation gates releases today, flake ownership, team size vs suite size, definition of done for stories, how they measure automation ROI. Shows you care about impact, not just a job.</p>`,
          stuck: `<p>“No questions” or only salary/benefits on a technical round.</p>`,
        },
      ],
    },

    {
      id: "qa-theory",
      title: "Manual QA theory",
      lead: "Smoke, sanity, regression, severity/priority, SDLC/STLC — interview staples.",
      questions: [
        {
          id: "e10",
          q: "What is smoke, regression, and sanity testing?",
          ideal: `<p><strong>Smoke:</strong> shallow “build is not broken” checks (app starts, login, critical path). <strong>Sanity:</strong> focused check after a small fix/change that the specific area works. <strong>Regression:</strong> broader suite to ensure old behavior still works after changes. In CI: smoke on every PR; regression nightly or pre-release; sanity around hotfixes.</p>`,
          stuck: `<p>Using the three terms interchangeably.</p>`,
        },
        {
          id: "e11",
          q: "Difference between retest and regression?",
          ideal: `<p><strong>Retest:</strong> re-run the same failed case after a fix to confirm that defect is gone. <strong>Regression:</strong> run surrounding / related suites to ensure the fix didn’t break anything else.</p>`,
          stuck: `<p>Saying regression means “run the failed test again.”</p>`,
        },
        {
          id: "e12",
          q: "Difference between end-to-end testing and regression testing?",
          ideal: `<p><strong>E2E</strong> describes <em>scope/style</em> (full user journey through UI/API). <strong>Regression</strong> describes <em>purpose</em> (catch unintended breakage of existing behavior). An E2E test can be part of a regression suite; regression can also include API/unit checks.</p>`,
          stuck: `<p>Treating them as mutually exclusive test types.</p>`,
        },
        {
          id: "e13",
          q: "Explain defect severity vs priority with a scenario.",
          ideal: `<p><strong>Severity</strong> = impact on the system (blocker → trivial). <strong>Priority</strong> = business urgency to fix. Example: misspelled company name on homepage → low severity, high priority (brand). Rare crash in admin export used yearly → high severity, low priority if workaround exists.</p>`,
          stuck: `<p>Using severity and priority as synonyms.</p>`,
        },
        {
          id: "e14",
          q: "Give a high-severity, low-priority example.",
          ideal: `<p>Server crash when generating a year-end report used once annually year, with a manual SQL workaround available → high severity (crash), low priority until the reporting window approaches.</p>`,
          stuck: `<p>Picking a production login-down scenario (that is high priority too).</p>`,
        },
        {
          id: "e15",
          q: "Explain the defect life cycle.",
          ideal: `<p>New → Assigned → Open/In Progress → Fixed → Retest → Verified/Closed. Branches: Rejected, Duplicate, Deferred, Reopened (failed retest). Automation helps by attaching traces/screenshots and reproducing steps.</p>`,
          stuck: `<p>Stopping at “dev fixes it” with no retest/closure.</p>`,
        },
        {
          id: "e16",
          q: "In Jira, when would you mark an issue as Deferred?",
          ideal: `<p>When the bug is valid but won’t be fixed in the current release (low business value now, depends on a future epic, or accepted risk). Document why, owner, and revisit condition. Not for “I don’t understand the bug.”</p>`,
          stuck: `<p>Deferring unclear bugs instead of asking for clarification.</p>`,
        },
        {
          id: "e17",
          q: "Explain SDLC and STLC briefly.",
          ideal: `<p><strong>SDLC:</strong> how software is built (requirements → design → develop → test → deploy → maintain). <strong>STLC:</strong> how testing is performed (plan → analyze → design cases → environment → execute → close). STLC runs inside / alongside SDLC; shift-left means starting STLC activities earlier.</p>`,
          stuck: `<p>Listing phases with no relationship between the two.</p>`,
        },
        {
          id: "e18",
          q: "What is verification vs validation?",
          ideal: `<p><strong>Verification:</strong> building the product right (reviews, static checks, “does it match the spec?”). <strong>Validation:</strong> building the right product (UAT, E2E against user needs). Both matter; automation mostly supports validation of behavior plus some verification (lint, typecheck).</p>`,
          stuck: `<p>Memorizing “verification = QA, validation = UAT” without meaning.</p>`,
        },
        {
          id: "e19",
          q: "At what stages in a sprint do you execute regression?",
          ideal: `<p>Continuous: smoke on every PR. Mid-sprint: targeted regression for touched modules. End of sprint / release candidate: fuller regression. Hotfix: sanity of fix + narrow regression. Nightly full suite catches drift.</p>`,
          stuck: `<p>“Only on the last day of the sprint.”</p>`,
        },
        {
          id: "e20",
          q: "What is exploratory testing?",
          ideal: `<p>Simultaneous learning, test design, and execution — charter-based sessions exploring risks not covered by scripted cases. Complements automation; finds UX and odd integrations scripts miss. Time-box and note findings.</p>`,
          stuck: `<p>Calling exploratory “random clicking with no goal.”</p>`,
        },
        {
          id: "e21",
          q: "If certain test cases are not part of regression, what will you do?",
          ideal: `<p>Risk-assess: keep them in a separate suite (extended/nightly), convert critical ones into smoke, drop obsolete ones, or cover via API/unit if cheaper. Document why they’re out of PR regression so coverage gaps are conscious.</p>`,
          stuck: `<p>Deleting them silently or insisting every case must run on every PR.</p>`,
        },
      ],
    },

    {
      id: "playwright-core",
      title: "Playwright mechanics",
      lead: "Locators, config, hooks, waits, retries, parallel, tags, codegen — answer with concrete APIs.",
      questions: [
        {
          id: "e30",
          q: "Why are Playwright locators important? Which ones should you prefer?",
          ideal: `<p>Locators are lazy + auto-waiting and enforce strict mode. Prefer user-facing: <code>getByRole</code> → <code>getByLabel</code> → <code>getByText</code> → <code>getByTestId</code> → CSS/XPath last. Stable locators reduce flake and make tests readable like a user’s intent.</p>`,
          stuck: `<p>Defaulting to absolute XPath from DevTools.</p>`,
        },
        {
          id: "e31",
          q: "What are hooks in Playwright Test? Types?",
          ideal: `<p><code>test.beforeEach</code> / <code>afterEach</code> (per test), <code>beforeAll</code> / <code>afterAll</code> (per worker/file). Prefer fixtures for reusable setup. Don’t put mutable shared UI state in <code>beforeAll</code> unless <code>test.describe.configure({ mode: 'serial' })</code>.</p>`,
          stuck: `<p>Confusing Playwright hooks with Cucumber/TestNG annotations only.</p>`,
        },
        {
          id: "e32",
          q: "What is playwright.config and what do you put there?",
          ideal: `<p>Central project config: <code>testDir</code>, <code>timeout</code>, <code>expect.timeout</code>, <code>retries</code>, <code>workers</code>, <code>reporter</code>, <code>use</code> (baseURL, trace, screenshot, video, viewport), <code>projects</code> (browsers/deps), webServer. Keep env-specific values via env vars, not hardcoded secrets.</p>`,
          stuck: `<p>Dumping all timeouts inside every test instead of config defaults.</p>`,
        },
        {
          id: "e33",
          q: "How do you add timeouts in Playwright tests?",
          ideal: `<p>Global: <code>timeout</code> / <code>expect.timeout</code> in config. Per test: <code>test.setTimeout(120_000)</code>. Per action: <code>locator.click({ timeout: 10_000 })</code>. Per assertion: <code>expect(loc).toBeVisible({ timeout: 20_000 })</code>. Prefer fixing waits/assertions over raising timeouts blindly.</p>`,
          stuck: `<p>Using <code>waitForTimeout</code> as a timeout strategy.</p>`,
        },
        {
          id: "e34",
          q: "How do you configure retries in playwright.config?",
          ideal: `<p><code>retries: process.env.CI ? 2 : 0</code> at top level (or per project). Use with <code>trace: 'on-first-retry'</code> so failures are diagnosable. Retries hide flake — also quarantine chronic offenders. <code>test.describe.configure({ retries: 1 })</code> for local overrides.</p>`,
          stuck: `<p>Setting high retries everywhere and calling the suite “stable.”</p>`,
        },
        {
          id: "e35",
          q: "How do you manage failed tests in CI?",
          ideal: `<p>Fail the job on real failures; keep HTML report + trace artifacts; triage: reproduce with <code>--repeat-each</code>, open trace, classify (product bug vs flake vs env). Quarantine with ticket; don’t “green” the pipeline by ignoring failures. Optional: known-failure annotations with expiry.</p>`,
          stuck: `<p>“Just increase retries until CI is green.”</p>`,
        },
        {
          id: "e36",
          q: "How do you run tests in parallel in Playwright? How mix parallel + serial?",
          ideal: `<p>Default: files run across <code>workers</code>. <code>fullyParallel: true</code> parallelizes tests inside a file. Isolation via fresh context per test. For order-dependent journeys: <code>test.describe.configure({ mode: 'serial' })</code>. Prefer fixing isolation over serializing everything. Single worker only for debugging or known shared-state suites.</p>`,
          stuck: `<p>Turning workers to 1 permanently “because parallel is flaky” without fixing shared state.</p>`,
        },
        {
          id: "e37",
          q: "How would you automate / finish 1000+ tests in a day of CI?",
          ideal: `<p>Not one machine sequentially — shard across CI jobs (<code>--shard=i/n</code>), enough workers per shard, API setup instead of UI login everywhere, skip video unless failure, keep tests short, parallel browsers via projects carefully. Merge reports. Bottleneck is usually data/env, not Playwright itself.</p>`,
          stuck: `<p>Claiming one laptop with headed mode can finish 1000 E2E in a day.</p>`,
        },
        {
          id: "e38",
          q: "If the test is not failing because of locators, what else causes failures?",
          ideal: `<p>Timing/race, wrong environment/config, auth/session expired, test data collision, network/API errors, overlays intercepting clicks, iframe/shadow miss, strict-mode multi-match, assertion on wrong page/tab, flaky third-party, CI resource starvation, timezone/locale, feature flags.</p>`,
          stuck: `<p>Only blaming “bad XPath” for every red build.</p>`,
        },
        {
          id: "e39",
          q: "What if Playwright auto-wait is not enough / UI takes long to load?",
          ideal: `<p>Assert the readiness signal: <code>expect(locator).toBeVisible()</code>, wait for response/navigation, or network idle only when appropriate. Raise specific timeouts for known slow pages. Fix app performance if a page needs 6 minutes — tests should wait up to configured timeout, then fail with trace; don’t sleep blindly.</p>`,
          stuck: `<p>Adding <code>waitForTimeout(60000)</code> as the first fix.</p>`,
        },
        {
          id: "e40",
          q: "If a page takes 6 minutes to load, will the script wait?",
          ideal: `<p>Only up to the configured navigation/action/test timeout (defaults are much lower, e.g. 30s navigation / 30s test unless raised). After timeout the test fails. For legitimately slow flows, raise <code>navigationTimeout</code> / test timeout deliberately and assert intermediate progress — don’t assume infinite wait.</p>`,
          stuck: `<p>“Playwright waits forever because of auto-wait.”</p>`,
        },
        {
          id: "e41",
          q: "How do you handle waits in Playwright vs Selenium implicit / explicit / fluent waits?",
          ideal: `<p>Playwright auto-waits for actionability; web-first assertions retry. You rarely set implicit waits. Selenium: implicit = global poll; explicit = condition; fluent = explicit with polling/ignore. Map “explicit” → <code>expect(...).toBeVisible()</code> / <code>waitForURL</code>, not <code>Thread.sleep</code>.</p>`,
          stuck: `<p>Bringing Selenium implicit wait habits into Playwright config as random sleeps.</p>`,
        },
        {
          id: "e42",
          q: "What are assertions in Playwright and types?",
          ideal: `<p>Web-first <code>expect(locator)</code> assertions auto-retry (visibility, text, value, count, attributes). Non-retrying: <code>expect(value).toBe()</code> on plain data. Soft assertions via <code>expect.configure({ soft: true })</code> or collecting errors. Prefer locator assertions for UI state.</p>`,
          stuck: `<p><code>expect(await loc.isVisible()).toBe(true)</code> — no retry.</p>`,
        },
        {
          id: "e43",
          q: "What are tags and how do you run certain tests?",
          ideal: `<p>Annotate: <code>test('login @smoke', …)</code> or <code>test.skip(({ }, testInfo) =&gt; …)</code>. Run subset: <code>npx playwright test --grep @smoke</code>, by file/line, project name, or <code>test.only</code> locally. CI jobs map pipelines to tags (PR=smoke, nightly=full).</p>`,
          stuck: `<p>Commenting out tests instead of tagging/grepping.</p>`,
        },
        {
          id: "e44",
          q: "How do you execute Playwright tests?",
          ideal: `<p>CLI: <code>npx playwright test</code>, <code>--headed</code>, <code>--ui</code>, <code>--debug</code>, <code>--project=chromium</code>, <code>--grep</code>, <code>--shard</code>. npm scripts wrap CI. Reports via HTML reporter; open with <code>npx playwright show-report</code>.</p>`,
          stuck: `<p>Only knowing the IDE green button, not CLI flags.</p>`,
        },
        {
          id: "e45",
          q: "What is the default timeout / wait in Playwright?",
          ideal: `<p>Defaults (unless overridden): test timeout ~30s, expect timeout ~5s, action/navigation often 0 meaning “use test timeout” or documented defaults in your version — always check current docs/config. Auto-wait polls until timeout; it is not a fixed sleep.</p>`,
          stuck: `<p>Confusing auto-wait with a fixed 3-second sleep.</p>`,
        },
        {
          id: "e46",
          q: "How do you use Codegen in Playwright?",
          ideal: `<p><code>npx playwright codegen URL</code> records actions and suggests locators. Use it to discover roles/labels quickly, then clean the script: replace brittle selectors, add assertions, extract POM/fixtures. Never commit raw codegen output unchanged.</p>`,
          stuck: `<p>Treating codegen as production-ready tests.</p>`,
        },
        {
          id: "e47",
          q: "Playwright vs Selenium — key differences?",
          ideal: `<p>Playwright: auto-wait, browser contexts, tracing, network interception, one API for Chromium/Firefox/WebKit, parallel by design. Selenium: mature ecosystem, WebDriver protocol, waits often manual. Migrations fail when treated as syntax swaps without rethinking waits and isolation.</p>`,
          stuck: `<p>“Playwright is just faster Selenium” with no mechanism differences.</p>`,
        },
        {
          id: "e48",
          q: "How do you validate errors in log files during Playwright runs?",
          ideal: `<p>Listen to <code>page.on('console')</code> / <code>page.on('pageerror')</code> and fail on unexpected errors; for server logs, fetch via API or CI artifact and assert absence of ERROR patterns. Keep allowlists for known noise. Attach log snippets to the report on failure.</p>`,
          stuck: `<p>Only looking at UI assertions and ignoring console/network failures.</p>`,
        },
        {
          id: "e49",
          q: "How do you debug failing Playwright tests?",
          ideal: `<p>Reproduce locally → open trace (<code>trace: on-first-retry</code>) → Inspector/<code>--debug</code> → check timing, overlays, iframes, data → fix assertion/locator/product. Avoid adding sleeps. Use headed mode sparingly to see UX issues.</p>`,
          stuck: `<p>Guessing fixes without a trace or reproduction.</p>`,
        },
        {
          id: "e50",
          q: "How do you manage environment / slow environment loading issues?",
          ideal: `<p>Health-check env before suite (<code>globalSetup</code> or webServer ready); retry transient network at infra layer; seed data via API; isolate tenants; fail fast with clear “env down” vs “test bug”; cache auth with <code>storageState</code>; don’t hide env flakes with endless test retries.</p>`,
          stuck: `<p>Blaming Playwright for a down staging server and adding sleeps.</p>`,
        },
        {
          id: "e51",
          q: "Playwright best practices you follow?",
          ideal: `<p>User-facing locators, web-first assertions, no hard sleeps, isolated tests, API for setup, fixtures over deep inheritance, trace on retry, tag smoke vs full, keep tests deterministic, review flaky quarantine weekly. See also official Playwright best practices.</p>`,
          stuck: `<p>Reciting “use POM” as the only practice.</p>`,
        },
      ],
    },

    {
      id: "bdd",
      title: "BDD (Cucumber-style) + TestNG crossover",
      lead: "Common when teams mix BDD layers with Playwright or compare to TestNG.",
      questions: [
        {
          id: "e60",
          q: "What is a BDD framework?",
          ideal: `<p>Behavior-Driven Development: express examples in business language (Given/When/Then), collaborate with PO/dev/QA, automate those examples. Tools: Cucumber/SpecFlow + step defs calling Playwright. BDD is a collaboration practice; the tool is optional.</p>`,
          stuck: `<p>Equating BDD with “we have .feature files” and no collaboration.</p>`,
        },
        {
          id: "e61",
          q: "What is Scenario vs Scenario Outline?",
          ideal: `<p><strong>Scenario:</strong> one concrete example. <strong>Scenario Outline:</strong> template with <code>Examples</code> table — runs once per row with substituted variables. Use outlines for data variants; keep scenarios for distinct behaviors.</p>`,
          stuck: `<p>Using outlines for unrelated behaviors just to reduce typing.</p>`,
        },
        {
          id: "e62",
          q: "How do you use test data in a BDD framework?",
          ideal: `<p>Examples tables for small variants; external JSON/CSV for larger sets; API fixtures to create users; avoid hardcoding secrets in .feature files. Step defs read data and pass into Playwright fixtures. Keep features readable — put technical data in support code.</p>`,
          stuck: `<p>Giant Examples tables that nobody reads, or credentials in Gherkin.</p>`,
        },
        {
          id: "e63",
          q: "How does DataProvider work in TestNG? (crossover question)",
          ideal: `<p><code>@DataProvider</code> methods return Object[][]; <code>@Test(dataProvider=…)</code> runs once per row. Similar idea to Scenario Outline / Playwright parameterized tests (<code>for (const data of cases) test(…)</code> or test.step loops). In Playwright prefer explicit parameterization over reflection magic.</p>`,
          stuck: `<p>Saying Playwright has @DataProvider built-in.</p>`,
        },
      ],
    },

    {
      id: "git-jira",
      title: "Git, PRs & process",
      lead: "Version control questions that appear in almost every QA automation interview.",
      questions: [
        {
          id: "e70",
          q: "How do you push changes from local to remote?",
          ideal: `<p><code>git status</code> → <code>git add</code> → <code>git commit</code> → <code>git push -u origin branch</code>. Pull/rebase first if remote moved. Never force-push shared main without team agreement.</p>`,
          stuck: `<p>Committing directly to main or force-pushing blindly.</p>`,
        },
        {
          id: "e71",
          q: "How do you resolve a merge conflict in Git?",
          ideal: `<p>Pull/rebase → open conflicted files → choose correct hunks → <code>git add</code> → continue rebase/merge → run tests → push. Talk to the other author if logic conflicts. Don’t delete their changes without understanding.</p>`,
          stuck: `<p>Accepting “all incoming” without reading the conflict.</p>`,
        },
        {
          id: "e72",
          q: "How does git stash work and when do you use it?",
          ideal: `<p><code>git stash</code> shelves uncommitted changes so you can switch branches; <code>stash pop/apply</code> restores. Use for quick context switches; don’t stash long-term — commit to a WIP branch instead.</p>`,
          stuck: `<p>Losing work because they stashed and forgot which stash entry.</p>`,
        },
        {
          id: "e73",
          q: "How do you raise a Pull Request?",
          ideal: `<p>Branch from up-to-date main → small focused commits → push → open PR with summary + test plan → link Jira → ensure CI green → request review → address comments → squash/merge per team policy.</p>`,
          stuck: `<p>Huge PRs with no description or failing CI.</p>`,
        },
      ],
    },

    {
      id: "mcp-ai",
      title: "MCP, AI & prompting with Playwright",
      lead: "Newer interview questions about AI-assisted test authoring — stay grounded in review discipline.",
      questions: [
        {
          id: "e80",
          q: "What is MCP + Playwright? How do you use it?",
          ideal: `<p>MCP (Model Context Protocol) lets an AI agent use tools (browser, docs, repo) in a controlled way. With Playwright, agents can explore apps, draft tests, or debug — but humans must review locators, assertions, and secrets. Treat MCP as an accelerator, not an owner of suite quality.</p>`,
          stuck: `<p>Claiming AI-generated tests need no review.</p>`,
        },
        {
          id: "e81",
          q: "How do you design / write Playwright tests via MCP or prompting?",
          ideal: `<p>Prompt with: user journey, acceptance criteria, preferred locators, env constraints. Generate draft → run → fix from trace → extract POM/fixtures → add assertions. Keep prompts in-repo as docs if the team shares patterns. Never paste secrets into prompts.</p>`,
          stuck: `<p>One-shot “write all tests” prompts with no verification loop.</p>`,
        },
        {
          id: "e82",
          q: "How is prompting done for Playwright automation?",
          ideal: `<p>Be specific: stack (TS + @playwright/test), patterns (getByRole, expect), file paths, and “no waitForTimeout.” Iterate: ask for one flow, then refactor. Prefer linking to existing fixtures over regenerating auth every time.</p>`,
          stuck: `<p>Vague prompts that produce Selenium-style sleeps and CSS soup.</p>`,
        },
      ],
    },
  ],
};
