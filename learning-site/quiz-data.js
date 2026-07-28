window.QUIZ = [
  {
    q: "Which locator should you prefer first, according to Playwright's own best practices?",
    options: ["page.locator('.btn-primary')", "page.getByRole('button', { name: 'Save' })", "page.locator('//button[1]')", "page.$('#save')"],
    answer: 1,
    explain: "Role-based locators mirror how users and assistive technology perceive the page, so they survive CSS/markup refactors. CSS and XPath are last resorts."
  },
  {
    q: "What happens when a locator matches 3 elements and you call .click()?",
    options: ["It clicks the first match", "It clicks all three", "It throws a strict mode violation", "It waits until only one matches"],
    answer: 2,
    explain: "Locators are strict by default. Narrow with .filter(), scope to a parent, or be explicit with .first()/.nth()."
  },
  {
    q: "Which is NOT one of Playwright's actionability checks before a click?",
    options: ["Visible", "Stable", "Receives events", "Has a unique id"],
    answer: 3,
    explain: "The checks are: attached, visible, stable, enabled, editable (for fill) and receives events. Element ids are irrelevant."
  },
  {
    q: "Default timeout for a web-first assertion like expect(locator).toBeVisible()?",
    options: ["3 seconds", "5 seconds", "10 seconds", "30 seconds"],
    answer: 1,
    explain: "expect timeout defaults to 5 s (configurable via expect.timeout). The test timeout is 30 s."
  },
  {
    q: "What does test.describe.serial() do?",
    options: ["Runs tests in parallel across workers", "Runs tests in order and skips the rest after a failure", "Repeats each test serially 3 times", "Disables retries"],
    answer: 1,
    explain: "Serial mode runs the group in declaration order on one worker; if one test fails the remaining ones are skipped, and a retry restarts the whole group."
  },
  {
    q: "Which fixture gives you an isolated cookie/localStorage profile?",
    options: ["page", "context", "browser", "request"],
    answer: 1,
    explain: "BrowserContext is the isolated profile — like incognito. Each test gets a fresh one, and page lives inside it."
  },
  {
    q: "Best way to reuse a logged-in session across many tests?",
    options: ["Log in via the UI in beforeEach", "Save storageState in a setup project and set use.storageState", "Hard-code cookies in every test", "Use --workers=1 so the session persists"],
    answer: 1,
    explain: "A setup project logs in once, saves storageState to JSON, and dependent projects load it — dramatically faster and less flaky than UI logins per test."
  },
  {
    q: "Which trace setting gives the best cost/benefit in CI?",
    options: ["trace: 'off'", "trace: 'on'", "trace: 'on-first-retry'", "trace: 'screenshot-only'"],
    answer: 2,
    explain: "'on-first-retry' records a full trace only when a test already failed once, so you get debugging data without slowing down every green run."
  },
  {
    q: "How do you interact with an element inside an iframe?",
    options: ["page.frame('#id').click()", "page.frameLocator('#id').getByRole('button').click()", "page.switchTo().frame('#id')", "page.locator('iframe #id').click()"],
    answer: 1,
    explain: "frameLocator() returns a locator scoped to the frame's document and supports the same getBy* chain."
  },
  {
    q: "Which of these is a hard-sleep anti-pattern?",
    options: ["await expect(loc).toBeVisible()", "await page.waitForURL('**/done')", "await page.waitForTimeout(3000)", "await page.waitForResponse(r => r.ok())"],
    answer: 2,
    explain: "waitForTimeout is a fixed sleep: slow when unnecessary, still flaky when the app is slower. Assert on the observable end state instead."
  },
  {
    q: "What does expect.soft() do?",
    options: ["Retries the assertion twice", "Records the failure but lets the test continue", "Skips the assertion in CI", "Converts the failure into a warning that never fails the run"],
    answer: 1,
    explain: "Soft assertions collect failures and continue; the test is still marked failed at the end, so you see all problems in one run."
  },
  {
    q: "Which config option stops CI from passing when someone committed test.only?",
    options: ["forbidOnly", "maxFailures", "strictMode", "failOnOnly"],
    answer: 0,
    explain: "forbidOnly: !!process.env.CI makes the run fail if any test.only is present."
  },
  {
    q: "Correct way to mock a JSON API response?",
    options: ["page.route(url, r => r.fulfill({ status: 200, body: JSON.stringify(data) }))", "page.mock(url, data)", "page.intercept(url).reply(data)", "context.stub(url, data)"],
    answer: 0,
    explain: "page.route() with route.fulfill() serves a stubbed response. route.abort() blocks, route.continue() modifies the outgoing request."
  },
  {
    q: "What's the scope of a fixture declared with { scope: 'worker' }?",
    options: ["Created per test", "Created once per file", "Created once per worker process and shared by its tests", "Created once per project"],
    answer: 2,
    explain: "Worker-scoped fixtures are ideal for expensive read-only resources like tokens or seeded reference data. Avoid mutable per-test state there."
  },
  {
    q: "How do you run only tests tagged @smoke?",
    options: ["npx playwright test --tag=@smoke", "npx playwright test --grep @smoke", "npx playwright test --filter smoke", "npx playwright test --only @smoke"],
    answer: 1,
    explain: "--grep matches the test title including tags; --grep-invert excludes."
  },
  {
    q: "What is the difference between fill() and pressSequentially()?",
    options: ["No difference", "fill() sets the value directly and fires input events; pressSequentially types key by key", "fill() is slower", "pressSequentially clears the field first"],
    answer: 1,
    explain: "Use fill() by default. Use pressSequentially when the app reacts to individual keystrokes, e.g. autocomplete or input masks."
  },
  {
    q: "Which assertion verifies a successful API response object?",
    options: ["expect(res).toBeTruthy()", "expect(res).toBeOK()", "expect(res.status).toBe(200)", "expect(res).toHaveStatus(200)"],
    answer: 1,
    explain: "toBeOK() passes for any 2xx status. Note status() is a method: res.status() === 200."
  },
  {
    q: "In a Page Object class, what type should locator properties be?",
    options: ["string", "ElementHandle", "Locator", "Promise<Element>"],
    answer: 2,
    explain: "Store readonly Locator properties initialised in the constructor. Locators are lazy, so creating them before navigation is fine."
  },
  {
    q: "What does the blob reporter enable?",
    options: ["Uploading videos to the cloud", "Merging results from multiple shards into one HTML report", "Compressing screenshots", "Streaming logs to stdout"],
    answer: 1,
    explain: "Each shard emits a blob report; `npx playwright merge-reports --reporter html ./all-blob-reports` combines them."
  },
  {
    q: "You need to wait until a background job's API status becomes 'done'. Best tool?",
    options: ["page.waitForTimeout in a loop", "expect.poll() or expect(async () => {...}).toPass()", "page.waitForLoadState('networkidle')", "A recursive setTimeout"],
    answer: 1,
    explain: "expect.poll() retries an async value with configurable intervals and timeout; expect(fn).toPass() retries a whole block of assertions."
  },
  {
    q: "Workers vs shards — which statement is true?",
    options: [
      "Workers and shards are the same thing",
      "Workers parallelise on one machine; shards split the suite across machines",
      "Shards only work locally",
      "Workers require a paid plan"
    ],
    answer: 1,
    explain: "Workers use CPU on one host. Shards use --shard=i/n across CI agents, then merge blob reports."
  },
  {
    q: "A button is visible but click() times out. Most likely?",
    options: [
      "Playwright auto-wait is broken",
      "Another overlay is intercepting pointer events, or the control is disabled/unstable",
      "You must use force:true always",
      "The locator API does not support buttons"
    ],
    answer: 1,
    explain: "Actionability includes receives-events. Fix the blocker or wait for enabled state — do not start with waitForTimeout."
  },
  {
    q: "Best default for CAPTCHA in automated suites?",
    options: [
      "Use a third-party CAPTCHA solver in CI",
      "Disable / bypass in non-prod and fail fast if a challenge appears unexpectedly",
      "Skip all login tests",
      "Screenshot the CAPTCHA and assert pixels"
    ],
    answer: 1,
    explain: "CAPTCHA exists to block bots. Own the environment (test keys / disable) rather than defeating detection in production-like flows."
  },
  {
    q: "storageState JSON committed to git is risky because…",
    options: [
      "It slows CI",
      "It contains live session cookies/tokens (credentials)",
      "Playwright cannot read JSON",
      "GitHub bans JSON files"
    ],
    answer: 1,
    explain: "Treat storageState like a secret: generate in CI, gitignore .auth/, rotate credentials."
  },
  {
    q: "When multiple page.route handlers match, they run…",
    options: [
      "In registration order only",
      "In reverse registration order (last registered first)",
      "Randomly",
      "Only the first forever"
    ],
    answer: 1,
    explain: "Last registered handler runs first; fallback() can pass to the next handler for layered routing."
  },
  {
    q: "Visual baselines differ Mac vs Linux CI. Fix?",
    options: [
      "Disable all visual tests",
      "Generate and compare baselines inside the official Playwright Docker image; mask volatile regions",
      "Increase maxDiffPixels to 1_000_000",
      "Only run visual tests on WebKit"
    ],
    answer: 1,
    explain: "Font/anti-aliasing differ by OS. Same Docker image for baseline + CI is the durable fix."
  },
  {
    q: "Service Workers can break page.route() because…",
    options: [
      "Playwright cannot mock HTTPS",
      "The SW may intercept fetches before Playwright's routing layer",
      "route() only works in headed mode",
      "JSON cannot be fulfilled"
    ],
    answer: 1,
    explain: "Disable/block Service Workers in the test context when you need reliable mocking, or mock behind the SW."
  },
  {
    q: "Soft assertions are best for…",
    options: [
      "Critical login failures only",
      "Collecting multiple independent field validation failures in one test",
      "Skipping flaky tests",
      "Replacing all hard asserts"
    ],
    answer: 1,
    explain: "expect.soft continues and reports all failures at the end — ideal for multi-field forms."
  },
  {
    q: "A senior answer to 'POM everywhere?' should emphasise…",
    options: [
      "Always use POM for every line of test code",
      "Restraint — POM/components/fixtures/API clients each have a job; don't over-abstract",
      "Never use page objects",
      "Put test() inside page classes"
    ],
    answer: 1,
    explain: "The senior signal is knowing what not to build — fixtures for state, components for widgets, POM for pages."
  },
  {
    q: "Missing await on a Playwright call usually causes…",
    options: [
      "A compile error always",
      "A floating promise and intermittent flakes",
      "Automatic retries forever",
      "The browser to crash"
    ],
    answer: 1,
    explain: "Enable @typescript-eslint/no-floating-promises. Almost every Playwright API returns a Promise and must be awaited."
  }
];
