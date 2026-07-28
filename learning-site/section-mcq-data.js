/* Per-section MCQ practice: answer + what we think vs what actually happens + why stuck */
window.SECTION_MCQ = {
  setup: {
    title: "Install & setup — practice MCQs",
    items: [
      {
        q: "What does `npx playwright install` download?",
        options: [
          "Only the npm package @playwright/test",
          "Browser binaries (Chromium, Firefox, WebKit) into a local cache",
          "Your system Chrome/Edge/Firefox",
          "VS Code and the Playwright extension"
        ],
        answer: 1,
        explain: "The npm package and browser binaries are separate. `playwright install` fetches the browsers Playwright controls.",
        think: "“It just installs the npm package / uses my installed Chrome.”",
        actual: "It downloads pinned browser builds into Playwright’s cache so CI and laptops match.",
        stuck: "People skip install, then tests fail with missing browser errors — or they debug the wrong Chrome."
      },
      {
        q: "Why does each test get its own BrowserContext by default?",
        options: [
          "To share cookies between tests for speed",
          "So tests stay isolated (cookies/storage don’t leak)",
          "Because one context can only open one page",
          "It is required by TypeScript"
        ],
        answer: 1,
        explain: "Fresh context ≈ fresh incognito profile. Parallel workers won’t share login state or localStorage accidentally.",
        think: "“Reuse one browser window for everything — faster.”",
        actual: "Shared state causes order-dependent flakes and false greens.",
        stuck: "Flaky ‘already logged in’ / leftover cart data when someone reused a context incorrectly."
      },
      {
        q: "Which statement about `@playwright/test` is true?",
        options: [
          "It is only a browser driver; you need Jest separately",
          "It is both the test runner and the automation library",
          "It only works with Java",
          "It cannot run TypeScript without Babel"
        ],
        answer: 1,
        explain: "One package: runner + expect + fixtures + browser API. TS works out of the box.",
        think: "“I must wire Jest/Mocha + Selenium + ts-node.”",
        actual: "Scaffold with `npm init playwright@latest` and you’re ready.",
        stuck: "Over-engineering the toolchain before writing the first test."
      }
    ]
  },

  first: {
    title: "Your first test — practice MCQs",
    items: [
      {
        q: "In a basic test, what does `page` typically represent?",
        options: ["The whole browser process", "A tab inside an isolated context", "The HTML report", "A CSS selector engine"],
        answer: 1,
        explain: "Browser → Context → Page (tab). The `page` fixture is that tab.",
        think: "“page = the browser.”",
        actual: "page is one tab; context holds cookies/storage for that profile.",
        stuck: "Confusing multi-tab failures with ‘the browser crashed’."
      },
      {
        q: "Best first assertion after navigating to a page?",
        options: [
          "await page.waitForTimeout(5000)",
          "A web-first expect like expect(page.getByRole('heading', …)).toBeVisible()",
          "expect(await page.title()).toBe(...) without retry",
          "console.log(await page.content())"
        ],
        answer: 1,
        explain: "Web-first assertions retry until timeout — they wait for the UI to settle.",
        think: "“Sleep, then assert once.”",
        actual: "Sleep is slow and still flaky; expect retries on the condition.",
        stuck: "Copying Selenium-style sleeps into the first Playwright test."
      },
      {
        q: "Where should you usually put `baseURL`?",
        options: ["Hard-coded in every goto", "playwright.config.ts use.baseURL", "Only in package.json", "Inside each locator"],
        answer: 1,
        explain: "Config `use.baseURL` lets tests use `page.goto('/login')` and switch envs easily.",
        think: "“Paste full URLs everywhere.”",
        actual: "One config change switches staging/prod-like targets.",
        stuck: "Mass find-replace when the environment changes."
      }
    ]
  },

  ts: {
    title: "TypeScript essentials — practice MCQs",
    items: [
      {
        q: "Why is `async/await` required for most Playwright calls?",
        options: [
          "Playwright APIs return Promises (async I/O)",
          "TypeScript forbids sync functions",
          "Browsers cannot run sync JS",
          "Only for assertions"
        ],
        answer: 0,
        explain: "Navigation, clicks, and expects are asynchronous. Forgetting await is a top beginner bug.",
        think: "“click() runs instantly like a sync DOM call.”",
        actual: "Without await, the test races ahead and flakes or falsely passes.",
        stuck: "Missing await — especially on expect() — looks ‘random’."
      },
      {
        q: "What does a TypeScript interface help with in page objects?",
        options: [
          "Making tests run faster",
          "Typing fixtures/page APIs so misuse is caught at compile time",
          "Replacing playwright.config",
          "Disabling strict mode"
        ],
        answer: 1,
        explain: "Types document contracts (locator names, methods) and catch typos early.",
        think: "“TS is only ceremony.”",
        actual: "Good types reduce wrong method calls and bad fixture shapes.",
        stuck: "Using `any` everywhere, then discovering bugs only at runtime."
      },
      {
        q: "Correct mental model for `Promise.all([waitForEvent, click])`?",
        options: [
          "Click first, then wait",
          "Start waiting before (or with) the click so you don’t miss the event",
          "Only needed for screenshots",
          "It disables auto-wait"
        ],
        answer: 1,
        explain: "Register the waiter with the action to avoid missing download/popup/dialog events.",
        think: "“await click(); then waitForEvent.”",
        actual: "The event may fire before you listen — race lost.",
        stuck: "Intermittent ‘Timeout waiting for event’ on popups/downloads."
      }
    ]
  },

  locators: {
    title: "Locators — practice MCQs",
    items: [
      {
        q: "Which locator should you prefer first?",
        options: [
          "page.locator('.btn-primary')",
          "page.getByRole('button', { name: 'Save' })",
          "page.locator('//button[1]')",
          "page.$('#save')"
        ],
        answer: 1,
        explain: "Role + accessible name matches how users/AT see the control and survives CSS refactors.",
        think: "“Copy CSS/XPath from DevTools — fastest.”",
        actual: "CSS/XPath break when classes/DOM shift; roles are more stable.",
        stuck: "Interview asks locator priority and candidates start with CSS."
      },
      {
        q: "A locator matches 3 elements and you call `.click()`. What happens?",
        options: [
          "Clicks the first match",
          "Clicks all three",
          "Throws a strict mode violation",
          "Auto-picks the visible one forever"
        ],
        answer: 2,
        explain: "Locators are strict by default — ambiguity fails loudly on purpose.",
        think: "“It will click the first one like Selenium.”",
        actual: "Strict mode error — you must narrow with filter/scope/first intentionally.",
        stuck: "Blind `.first()` to silence the error without understanding duplicates."
      },
      {
        q: "Why are locators ‘lazy’?",
        options: [
          "They download the DOM later from the server",
          "Creating them does nothing; lookup happens on action/assert",
          "They only work after waitForTimeout",
          "They cache the first ElementHandle forever"
        ],
        answer: 1,
        explain: "Locators re-query on use — that’s why they survive re-renders better than ElementHandles.",
        think: "“const el = locator means I already found the node.”",
        actual: "No DOM work until click/fill/expect.",
        stuck: "Confusing Locator with ElementHandle and chasing stale nodes."
      },
      {
        q: "Best way to click Edit on the row containing ‘Ada’?",
        options: [
          "page.locator('tr').nth(3).getByRole('button').click()",
          "page.getByRole('row').filter({ hasText: 'Ada' }).getByRole('button', { name: 'Edit' }).click()",
          "page.click('text=Edit')",
          "page.locator('button').first().click()"
        ],
        answer: 1,
        explain: "Filter the row by business text, then act inside it — order-independent.",
        think: "“Row index is fine if it works today.”",
        actual: "Indexes shuffle with sorting/filtering/pagination.",
        stuck: "Dynamic tables — nth() flakes in CI."
      }
    ]
  },

  actions: {
    title: "Actions — practice MCQs",
    items: [
      {
        q: "Which is NOT a typical actionability check before click?",
        options: ["Visible", "Stable", "Receives events", "Has a unique id attribute"],
        answer: 3,
        explain: "Attached, visible, stable, enabled, receives events (and editable for fill). IDs don’t matter.",
        think: "“If it has an id, Playwright can click it.”",
        actual: "Overlays/disabled state still block clicks.",
        stuck: "Reaching for `force: true` instead of fixing the overlay."
      },
      {
        q: "When prefer `pressSequentially` over `fill`?",
        options: [
          "Always — fill is deprecated",
          "When the app listens to per-key events (OTP, autocomplete)",
          "Only for passwords",
          "Never — fill is always better"
        ],
        answer: 1,
        explain: "fill sets value quickly; key-by-key typing triggers keydown handlers.",
        think: "“fill always types like a user.”",
        actual: "Many OTP/autocomplete UIs ignore a single value set.",
        stuck: "OTP tests that ‘sometimes’ work with fill."
      },
      {
        q: "For a download, when do you call `waitForEvent('download')`?",
        options: [
          "After the click that starts the download",
          "Before / together with the click (Promise.all)",
          "Only in afterEach",
          "Never — downloads are automatic"
        ],
        answer: 1,
        explain: "Listen first or you race the event.",
        think: "“Click, then wait.”",
        actual: "Fast downloads finish before the listener attaches.",
        stuck: "Flaky download timeouts in CI."
      },
      {
        q: "`locator.drop()` (1.60+) is mainly for…",
        options: [
          "Replacing all click() calls",
          "Dropping files (or payloads) onto a drop zone that listens for drop events",
          "Closing the browser",
          "Disabling actionability checks globally"
        ],
        answer: 1,
        explain: "Prefer drop() for HTML5 file/drop-target flows instead of brittle mouse sequences when the app listens for drop.",
        think: "“dragTo and drop are the same.”",
        actual: "dragTo moves an element; drop targets file/payload drop zones.",
        stuck: "Hand-rolling mouse.down/up for every file upload zone."
      }
    ]
  },

  assertions: {
    title: "Assertions — practice MCQs",
    items: [
      {
        q: "Default timeout for web-first `expect(locator).toBeVisible()`?",
        options: ["3 seconds", "5 seconds", "10 seconds", "30 seconds"],
        answer: 1,
        explain: "Expect timeout defaults to 5s; test timeout defaults to 30s — different knobs.",
        think: "“Everything times out at 30s.”",
        actual: "Assertion can fail at 5s while the test budget remains.",
        stuck: "Bumping the wrong timeout and still failing."
      },
      {
        q: "What’s wrong with `expect(await loc.isVisible()).toBe(true)`?",
        options: [
          "Nothing — preferred pattern",
          "No retry — one-shot boolean, flakes on slow UI",
          "isVisible is illegal",
          "It only works in headed mode"
        ],
        answer: 1,
        explain: "Use `await expect(loc).toBeVisible()` so Playwright retries.",
        think: "“Jest-style expect on a boolean is fine.”",
        actual: "You lose auto-retry; race with rendering.",
        stuck: "Intermittent visibility failures."
      },
      {
        q: "What does `expect.soft()` do?",
        options: [
          "Skips the assert in CI",
          "Records failure but continues; test still fails at end",
          "Retries forever",
          "Converts failures to warnings that never fail"
        ],
        answer: 1,
        explain: "Soft asserts collect multiple issues in one run — great for form validation lists.",
        think: "“Soft means it won’t fail the test.”",
        actual: "It still fails the test after continuing.",
        stuck: "Thinking soft = optional quality."
      }
    ]
  },

  waiting: {
    title: "Auto-waiting & timeouts — practice MCQs",
    items: [
      {
        q: "Which is a hard-sleep anti-pattern?",
        options: [
          "await expect(loc).toBeVisible()",
          "await page.waitForURL('**/done')",
          "await page.waitForTimeout(3000)",
          "await page.waitForResponse(r => r.ok())"
        ],
        answer: 2,
        explain: "Fixed sleeps are slow when unnecessary and still flaky when the app is slower.",
        think: "“Just wait 3 seconds — always enough.”",
        actual: "CI is slower; local is faster — both break the sleep.",
        stuck: "Sleep cascades that make suites glacial."
      },
      {
        q: "When is `networkidle` a bad wait?",
        options: [
          "Never — always safest",
          "When websockets/analytics keep the network busy",
          "Only on Firefox",
          "Only without baseURL"
        ],
        answer: 1,
        explain: "Prefer asserting UI state or a specific response over global network quiet.",
        think: "“Wait until network is idle = page ready.”",
        actual: "Background traffic prevents idle forever.",
        stuck: "Timeouts on pages with chat/analytics."
      },
      {
        q: "Best replacement for sleep after clicking Load?",
        options: [
          "waitForTimeout(2000)",
          "Promise.all([waitForResponse(...), click]) then web-first expects",
          "page.reload() in a loop",
          "force: true on the next click"
        ],
        answer: 1,
        explain: "Wait for the observable network + UI condition.",
        think: "“I don’t know the API URL so I sleep.”",
        actual: "You can wait for spinner hidden / list items / URL — or discover the API once.",
        stuck: "Fear of waitForResponse because ‘I don’t know the endpoint’."
      }
    ]
  },

  frames: {
    title: "Frames, tabs, dialogs — practice MCQs",
    items: [
      {
        q: "How do you click a button inside an iframe?",
        options: [
          "page.locator('iframe button').click()",
          "page.frameLocator('#frame').getByRole('button').click()",
          "page.switchTo().frame('#frame')",
          "Normal locators pierce iframes automatically"
        ],
        answer: 1,
        explain: "Iframes are separate documents — use frameLocator (chain for nested frames).",
        think: "“Same as Shadow DOM — locators pierce everything.”",
        actual: "Shadow (open) pierces; iframes do not.",
        stuck: "Mixing up iframe vs shadow solutions in interviews."
      },
      {
        q: "How do you handle `target=_blank` new tabs?",
        options: [
          "page.waitForEvent('popup') after click only",
          "context.waitForEvent('page') before/with the click, then use the new Page",
          "Switch with Selenium-style window handles only",
          "Playwright cannot do multi-tab"
        ],
        answer: 1,
        explain: "Listen on the context for a new page, then interact with that Page.",
        think: "“Stay on the original page object.”",
        actual: "New tab is a different Page instance.",
        stuck: "Asserting on the wrong page."
      },
      {
        q: "Native `confirm()` dialog vs in-page modal — key difference?",
        options: [
          "Same API",
          "Native → page.on('dialog'); modal → normal locators on getByRole('dialog')",
          "Both need frameLocator",
          "Modals need force:true"
        ],
        answer: 1,
        explain: "Native dialogs are browser events; HTML modals are DOM.",
        think: "“Every popup is page.on('dialog').”",
        actual: "Wrong API = hang or never-seen dialog.",
        stuck: "Timeouts waiting for dialog that is actually a div modal."
      },
      {
        q: "Safest way to open a popup without missing a fast event?",
        options: [
          "Click first, then waitForEvent('popup')",
          "Promise.all([page.waitForEvent('popup'), click()])",
          "page.waitForTimeout(2000) then look for pages()",
          "Only use window.open from evaluate"
        ],
        answer: 1,
        explain: "Register the waiter with the click so you never race a fast popup.",
        think: "“Click first feels more natural.”",
        actual: "Fast popups can fire before the listener is attached.",
        stuck: "Intermittent timeout waiting for popup."
      },
      {
        q: "How do you switch back to the original tab after working in a popup?",
        options: [
          "page.switchToParent()",
          "await page.bringToFront() on the original Page reference",
          "Close the browser and reopen",
          "context.setActivePage(0)"
        ],
        answer: 1,
        explain: "Keep the original page reference and call bringToFront() when you need it again.",
        think: "“There is only one page handle.”",
        actual: "You hold multiple Page objects; bringToFront focuses the one you want.",
        stuck: "Asserting on a background tab and wondering why nothing updates."
      },
      {
        q: "New tabs in the same BrowserContext share…",
        options: [
          "Nothing — fully isolated",
          "Cookies and storage (same profile)",
          "Only localStorage, never cookies",
          "Only the viewport size"
        ],
        answer: 1,
        explain: "Same context ≈ same browser profile. Need isolation? newContext().",
        think: "“Every tab is a fresh profile.”",
        actual: "Shared session surprises auth tests.",
        stuck: "Leakage of login state across tabs in one context."
      }
    ]
  },

  clipboard: {
    title: "Clipboard & copy/paste — practice MCQs",
    items: [
      {
        q: "What do you usually need before navigator.clipboard.readText() works?",
        options: [
          "Nothing special",
          "clipboard-read permission on the context (and a secure origin)",
          "force: true on the locator",
          "waitForTimeout(1000)"
        ],
        answer: 1,
        explain: "Grant permissions: ['clipboard-read', 'clipboard-write'] in config or newContext.",
        think: "“Clipboard always works in automation.”",
        actual: "NotAllowedError without permission / insecure context.",
        stuck: "Works headed locally, fails in CI without permissions."
      },
      {
        q: "Most user-like way to paste into an input?",
        options: [
          "locator.fill(clipboardText) only",
          "Focus field then keyboard Control/Meta+V (after seeding or copying)",
          "page.mouse.wheel",
          "Always use { force: true }"
        ],
        answer: 1,
        explain: "Real paste key events matter when the app listens for paste handlers.",
        think: "“fill() is always identical to paste.”",
        actual: "Some editors only update on paste events.",
        stuck: "App ignores fill() but works when a human pastes."
      },
      {
        q: "Control+C fails on a teammate’s Mac. Why?",
        options: [
          "Playwright forbids copy on Mac",
          "macOS uses Meta (⌘) instead of Control for clipboard shortcuts",
          "Clipboard only works in Firefox",
          "You must use XPath"
        ],
        answer: 1,
        explain: "Branch on process.platform === 'darwin' ? 'Meta' : 'Control'.",
        think: "“Ctrl is universal.”",
        actual: "Wrong modifier → silent no-op.",
        stuck: "Cross-OS suite flakes only on Mac agents."
      },
      {
        q: "When should you NOT bother with clipboard APIs?",
        options: [
          "Never — always use clipboard",
          "When fill()/pressSequentially is enough and the product doesn’t depend on paste",
          "Only when testing iframes",
          "Only in headed mode"
        ],
        answer: 1,
        explain: "Clipboard testing is for clipboard-dependent UX; ordinary forms should use fill.",
        think: "“Every text entry should go through the OS clipboard.”",
        actual: "Extra flaky surface for no product benefit.",
        stuck: "Over-engineering simple form tests."
      }
    ]
  },

  mistakes: {
    title: "Anti-patterns — practice MCQs",
    items: [
      {
        q: "Best replacement for page.waitForTimeout(3000) after a click?",
        options: [
          "waitForTimeout(5000)",
          "await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible()",
          "{ force: true }",
          "test.slow() only"
        ],
        answer: 1,
        explain: "Web-first assertions wait for real readiness, not arbitrary time.",
        think: "“Sleep longer until CI is happy.”",
        actual: "Still brittle and slow.",
        stuck: "Suite runtime balloons with sleeps."
      },
      {
        q: "What’s wrong with expect(await loc.isVisible()).toBe(true)?",
        options: [
          "Syntax error in Playwright",
          "No retry — one-shot boolean can flake",
          "It always fails in headed mode",
          "It requires XPath"
        ],
        answer: 1,
        explain: "Use await expect(loc).toBeVisible() for retrying checks.",
        think: "“It’s still an assertion.”",
        actual: "Timing luck.",
        stuck: "Flakes that disappear when you debug slowly."
      },
      {
        q: "Correct waitForResponse order?",
        options: [
          "Click, then create waiter, then await",
          "Create promise (no await) → click → await promise",
          "Await waiter before registering it",
          "Only use waitForTimeout"
        ],
        answer: 1,
        explain: "Register first so you cannot miss a fast response.",
        think: "“Await everything immediately.”",
        actual: "Awaiting the waiter before click blocks forever.",
        stuck: "Race: response already finished."
      },
      {
        q: "{ force: true } on click is usually…",
        options: [
          "Required for all CI runs",
          "A smell — hides overlays / non-actionable elements",
          "Faster than auto-wait",
          "Needed for getByRole"
        ],
        answer: 1,
        explain: "Prefer dismissing blockers; force skips actionability.",
        think: "“Force makes tests robust.”",
        actual: "False greens when users also can’t click.",
        stuck: "Production bugs masked by force."
      },
      {
        q: "networkidle as page-ready signal is risky because…",
        options: [
          "It is the official recommended default",
          "WebSockets/analytics may never idle, or idle too early",
          "It only works with XPath",
          "It disables screenshots"
        ],
        answer: 1,
        explain: "Assert a user-visible ready state instead.",
        think: "“No network = UI ready.”",
        actual: "Brittle on modern SPAs.",
        stuck: "Timeouts on pages with long-polling."
      },
      {
        q: "Best strategy for shared test users under parallel workers?",
        options: [
          "One global admin for all tests",
          "Unique data per test + fresh context; avoid shared mutable accounts",
          "describe.serial for the whole suite",
          "retries: 10"
        ],
        answer: 1,
        explain: "Isolation + unique data prevents worker collisions.",
        think: "“Shared accounts are fine if we’re careful.”",
        actual: "Intermittent failures only under --workers=N.",
        stuck: "Works locally with workers=1."
      },
      {
        q: "Retries in CI should be…",
        options: [
          "The primary flake fix (retries: 5+)",
          "A small safety net (e.g. 1–2) while you fix root causes with traces",
          "Disabled forever",
          "Set equal to the number of tests"
        ],
        answer: 1,
        explain: "Retries mask bugs if overused; still triage with --repeat-each.",
        think: "“More retries = greener CI.”",
        actual: "Real bugs look intermittent.",
        stuck: "Nobody trusts the suite."
      },
      {
        q: "Official best-practice locator priority starts with…",
        options: [
          "Absolute XPath",
          "getByRole / getByLabel / getByText / getByTestId",
          "nth-child CSS only",
          "document.querySelector in evaluate"
        ],
        answer: 1,
        explain: "User-facing locators from Playwright best practices.",
        think: "“DevTools CSS is fine everywhere.”",
        actual: "High maintenance.",
        stuck: "Redesign breaks half the suite."
      }
    ]
  },

  hooks: {
    title: "Hooks & organisation — practice MCQs",
    items: [
      {
        q: "What does `test.describe.serial()` do?",
        options: [
          "Runs tests in parallel across workers",
          "Runs in order; after a failure, remaining in the group are skipped",
          "Repeats each test 3 times",
          "Disables retries globally"
        ],
        answer: 1,
        explain: "Serial groups share order/state carefully — prefer independent tests when possible.",
        think: "“Serial is the default best practice.”",
        actual: "It couples tests; one failure blocks the rest.",
        stuck: "Building long dependent chains that are hard to debug."
      },
      {
        q: "Where should one-time expensive setup usually live?",
        options: [
          "Inside every test body duplicated",
          "beforeAll / project setup / fixture — not copy-pasted UI login every time",
          "Only in afterEach",
          "In the HTML report"
        ],
        answer: 1,
        explain: "Share setup via hooks/fixtures/setup projects; keep tests focused.",
        think: "“Paste login into each test for clarity.”",
        actual: "Slow + flaky + hard to change.",
        stuck: "Suites that take forever because every test logs in via UI."
      },
      {
        q: "`test.only` left in a PR — how does CI catch it?",
        options: ["maxFailures", "forbidOnly: !!process.env.CI", "fullyParallel", "retries: 2"],
        answer: 1,
        explain: "forbidOnly fails the run if focused tests are present in CI.",
        think: "“CI will run everything anyway.”",
        actual: "Without forbidOnly, CI may run a tiny subset and go green.",
        stuck: "False confidence from accidental test.only."
      }
    ]
  },

  fixtures: {
    title: "Fixtures — practice MCQs",
    items: [
      {
        q: "Which fixture is the isolated cookie/storage profile?",
        options: ["page", "context", "browser", "request"],
        answer: 1,
        explain: "BrowserContext is the profile; page is a tab inside it.",
        think: "“page holds cookies.”",
        actual: "Cookies live on the context.",
        stuck: "Wrong answers in interviews about isolation."
      },
      {
        q: "Why write a custom fixture?",
        options: [
          "To replace playwright.config",
          "To inject reusable setup (e.g. logged-in page, API client) with auto cleanup",
          "To disable TypeScript",
          "To force serial mode"
        ],
        answer: 1,
        explain: "Fixtures encapsulate setup/teardown and keep tests thin.",
        think: "“Fixtures are only the built-in page/context.”",
        actual: "You extend test with your own fixtures.",
        stuck: "Giant beforeEach blocks instead of fixtures."
      },
      {
        q: "Fixture scope `worker` means…",
        options: [
          "Created once per worker process and shared by tests on that worker",
          "Created once per click",
          "Global across all machines",
          "Never cleaned up"
        ],
        answer: 0,
        explain: "Worker-scoped fixtures amortize expensive setup; test-scoped is fresher isolation.",
        think: "“Everything should be worker-scoped for speed.”",
        actual: "Shared worker state can leak between tests if mutable.",
        stuck: "Flakes from shared worker DB/user fixtures."
      }
    ]
  },

  config: {
    title: "playwright.config — practice MCQs",
    items: [
      {
        q: "Best CI trace setting cost/benefit?",
        options: ["trace: 'off'", "trace: 'on'", "trace: 'on-first-retry'", "trace: 'retain-on-failure' only locally"],
        answer: 2,
        explain: "Record rich traces when a test already failed once — debug signal without tracing every green run.",
        think: "“Always trace on for safety.”",
        actual: "Traces slow CI and fill disks.",
        stuck: "Either no traces when needed, or always-on traces forever."
      },
      {
        q: "`fullyParallel: true` means…",
        options: [
          "Tests inside a file can run in parallel",
          "Only files run in parallel, tests in a file stay ordered",
          "Disables workers",
          "Enables Selenium Grid"
        ],
        answer: 0,
        explain: "With fullyParallel, even tests in one file can parallelize (if independent).",
        think: "“Parallel only means multiple files.”",
        actual: "File-level tests can also interleave across workers.",
        stuck: "Order-dependent tests break when fullyParallel is enabled."
      },
      {
        q: "Projects in config are mainly for…",
        options: [
          "CSS themes",
          "Different browsers/devices/settings (and setup dependencies)",
          "Replacing npm scripts",
          "Hiding failed tests"
        ],
        answer: 1,
        explain: "Projects = Chromium/Firefox/WebKit, mobile, authenticated suite, etc.",
        think: "“One project is enough forever.”",
        actual: "Projects scale cross-browser and auth setups cleanly.",
        stuck: "Duplicating configs instead of projects."
      }
    ]
  },

  pom: {
    title: "POM ↔ fixtures — practice MCQs",
    items: [
      {
        q: "What should a page object expose?",
        options: [
          "Raw CSS strings only",
          "User-meaningful methods (login, addToCart) built on resilient locators",
          "waitForTimeout helpers",
          "Direct ElementHandles stored in fields forever"
        ],
        answer: 1,
        explain: "POM hides selectors behind intent; tests read like journeys.",
        think: "“POM = dump every locator as public fields.”",
        actual: "Fat locator bags still couple tests to DOM noise.",
        stuck: "Page objects that are just selector dictionaries."
      },
      {
        q: "Should page objects contain assertions?",
        options: [
          "Always — all expects belong in POM",
          "Prefer assertions in tests; POM can offer expect helpers sparingly",
          "Never use expect in the suite",
          "Only soft asserts in POM"
        ],
        answer: 1,
        explain: "Keep business assertions visible in tests; POM focuses on interactions.",
        think: "“Hide all expects inside POM for DRY.”",
        actual: "Failures become opaque; interviews dislike black-box asserts.",
        stuck: "Can’t tell what failed without reading POM internals."
      },
      {
        q: "Default for a new small-to-medium suite in 2026?",
        options: [
          "Always a deep BasePage inheritance tree",
          "Fixtures exposing business intents; add thin page objects when the same UI churns across many tests",
          "No structure — copy-paste locators forever",
          "Only component testing, never E2E"
        ],
        answer: 1,
        explain: "Fixtures-first reduces ceremony; POM pays off when selector churn concentrates on shared surfaces.",
        think: "“Interview answer is always full POM.”",
        actual: "Senior answer is a decision rule, not dogma.",
        stuck: "Mega page hierarchies before understanding locators."
      },
      {
        q: "POM vs fixtures — short distinction?",
        options: [
          "Same thing",
          "POM models pages/components; fixtures provide setup/injection/lifecycle (and can expose intents without classes)",
          "Fixtures replace locators",
          "POM only works without TypeScript"
        ],
        answer: 1,
        explain: "Different layers: fixtures wire the test; page objects (optional) encapsulate UI surfaces.",
        think: "“Pick one: fixtures OR page objects.”",
        actual: "They compose — or fixtures alone for many suites.",
        stuck: "Either no structure or over-abstracted mess."
      }
    ]
  },

  data: {
    title: "Data-driven testing — practice MCQs",
    items: [
      {
        q: "Best practice for test users in parallel runs?",
        options: [
          "One shared user for all workers",
          "Unique data per test (timestamp/faker) or isolated seeded accounts",
          "Disable parallel",
          "Use production admin always"
        ],
        answer: 1,
        explain: "Shared mutable users collide across workers.",
        think: "“demo/demo is fine for everything.”",
        actual: "Parallel tests overwrite each other’s state.",
        stuck: "Flaky login/create conflicts."
      },
      {
        q: "`for (const data of cases) test(...)` is useful because…",
        options: [
          "It runs one merged test only",
          "It generates separate tests with clear titles/failures per case",
          "It disables retries",
          "It requires serial mode"
        ],
        answer: 1,
        explain: "Each iteration becomes its own test in the report.",
        think: "“Loop inside one test is the same.”",
        actual: "One test with a loop hides which case failed and stops early.",
        stuck: "Debugging a giant loop test."
      },
      {
        q: "Where should secrets (passwords, tokens) live?",
        options: [
          "Committed in repo as plain JSON",
          "Env vars / CI secrets — not in git",
          "Inside locator names",
          "In screenshots"
        ],
        answer: 1,
        explain: "Use env + dotenv locally; CI secret store in pipelines.",
        think: "“Put passwords in test-data.json for convenience.”",
        actual: "Secrets leak via git history.",
        stuck: "Security review fails the suite."
      }
    ]
  },

  auth: {
    title: "Authentication & state — practice MCQs",
    items: [
      {
        q: "Best way to reuse a logged-in session?",
        options: [
          "UI login in beforeEach every test",
          "Setup project saves storageState; dependent projects load it",
          "Hard-code cookies in every file",
          "--workers=1 so session persists magically"
        ],
        answer: 1,
        explain: "Login once, reuse storageState — fast and stable.",
        think: "“Real users log in every time, so tests should too.”",
        actual: "UI login is slow/flaky; session reuse tests the product better overall.",
        stuck: "Hours lost to login flakes."
      },
      {
        q: "storageState mainly stores…",
        options: [
          "Screenshots",
          "Cookies and web storage for a context",
          "Trace files",
          "TypeScript types"
        ],
        answer: 1,
        explain: "It rehydrates auth into new contexts/projects.",
        think: "“It’s a database dump of the app.”",
        actual: "Browser origin storage/cookies snapshot.",
        stuck: "Expecting server-side session tables in the JSON."
      },
      {
        q: "Auth setup project dependency is configured via…",
        options: [
          "test.describe.serial only",
          "projects[].dependencies in playwright.config",
          "package.json postinstall",
          "expect.soft"
        ],
        answer: 1,
        explain: "Setup project runs first; dependents load storageState.",
        think: "“Just put login in beforeAll of every file.”",
        actual: "Duplicated logins and racey shared state.",
        stuck: "Slow suites and login flakes."
      },
      {
        q: "`page.localStorage` / `sessionStorage` helpers (1.61+) exist so you…",
        options: [
          "Avoid browser contexts entirely",
          "Read/write origin storage without wrapping every call in page.evaluate",
          "Replace cookies",
          "Disable storageState"
        ],
        answer: 1,
        explain: "First-class helpers for common storage ops; storageState still snapshots sessions for reuse.",
        think: "“evaluate is the only way forever.”",
        actual: "Verbose boilerplate and harder-to-read auth setup.",
        stuck: "Copy-pasting evaluate snippets in every test."
      }
    ]
  },

  api: {
    title: "API testing — practice MCQs",
    items: [
      {
        q: "Which fixture is ideal for HTTP API calls without a UI page?",
        options: ["page", "request", "browser", "context only"],
        answer: 1,
        explain: "`request` is an APIRequestContext for HTTP assertions/setup.",
        think: "“Always drive APIs through the browser page.”",
        actual: "request is lighter and perfect for setup/teardown + contract checks.",
        stuck: "Using UI for data seeding only."
      },
      {
        q: "Good pattern: create data via API, assert via UI. Why?",
        options: [
          "UI creation is illegal",
          "Faster/less flaky setup; UI still validates the user journey",
          "API tests cannot assert JSON",
          "It disables parallel"
        ],
        answer: 1,
        explain: "Hybrid tests keep E2E focused on what users see.",
        think: "“Pure UI E2E for every precondition.”",
        actual: "Suites become slow and brittle.",
        stuck: "Timeouts while creating complex records through forms."
      },
      {
        q: "After `request.post`, you should usually…",
        options: [
          "Ignore status codes",
          "Assert status + schema/body fields you care about",
          "Only console.log",
          "Call waitForTimeout"
        ],
        answer: 1,
        explain: "Treat API tests like contracts: status, body, headers as needed.",
        think: "“If it didn’t throw, it’s fine.”",
        actual: "200 with wrong body still ships bugs.",
        stuck: "Weak API asserts that miss regressions."
      }
    ]
  },

  network: {
    title: "Network mocking — practice MCQs",
    items: [
      {
        q: "Correct way to stub a JSON API in the page?",
        options: [
          "page.mock(url, data)",
          "page.route(url, route => route.fulfill({ status: 200, body: JSON.stringify(data) }))",
          "page.intercept(url).reply(data)",
          "context.stub(url, data)"
        ],
        answer: 1,
        explain: "route + fulfill/abort/continue is the Playwright model.",
        think: "“Cypress intercept API names work here.”",
        actual: "Different API — learn route.fulfill.",
        stuck: "Copying Cypress snippets into Playwright."
      },
      {
        q: "When should you register `page.route`?",
        options: [
          "After navigation that already fetched the API",
          "Before the action/navigation that triggers the request",
          "Only in afterAll",
          "Routes are automatic"
        ],
        answer: 1,
        explain: "Late registration misses the request.",
        think: "“Route anytime before assert.”",
        actual: "Race: real network wins first.",
        stuck: "Mock ‘not applied’ flakes."
      },
      {
        q: "`route.abort()` is useful to…",
        options: [
          "Speed up fonts only",
          "Simulate failed/blocked requests and assert UI error handling",
          "Delete tests",
          "Bypass strict mode"
        ],
        answer: 1,
        explain: "Failure injection tests resilience.",
        think: "“Mocks are only for happy JSON.”",
        actual: "Abort/fulfill error statuses test negative paths.",
        stuck: "No negative network coverage."
      }
    ]
  },

  visual: {
    title: "Visual & a11y — practice MCQs",
    items: [
      {
        q: "Visual snapshot tip for CI?",
        options: [
          "Generate baselines on any laptop OS freely",
          "Generate/compare in the same environment (often Docker) as CI",
          "Always 0 tolerance forever",
          "Screenshots replace all functional asserts"
        ],
        answer: 1,
        explain: "Font/OS differences cause noisy diffs — pin the environment.",
        think: "“PNG pixels are identical everywhere.”",
        actual: "Anti-aliasing/fonts differ by OS.",
        stuck: "Constant visual flake across machines."
      },
      {
        q: "Accessibility checks with axe typically…",
        options: [
          "Replace all E2E tests",
          "Catch automated a11y violations; still need manual/keyboard testing",
          "Only work on Firefox",
          "Disable role locators"
        ],
        answer: 1,
        explain: "Automation helps but doesn’t prove full a11y.",
        think: "“axe green = fully accessible.”",
        actual: "Many issues need human judgment.",
        stuck: "Over-claiming a11y coverage in interviews."
      },
      {
        q: "`toHaveScreenshot` failed — first good move?",
        options: [
          "Delete the test",
          "Open the diff/trace, decide intentional UI change vs bug, then update baseline knowingly",
          "Increase sleep",
          "Use force click"
        ],
        answer: 1,
        explain: "Treat baseline updates as deliberate reviews.",
        think: "“Always re-record baselines to go green.”",
        actual: "You can bake bugs into baselines.",
        stuck: "Blind -u updates in CI."
      },
      {
        q: "`toMatchAriaSnapshot` is valuable because it…",
        options: [
          "Compares raw pixels like a screenshot",
          "Asserts accessibility-tree structure (roles/names) — more OS-independent than pixels",
          "Replaces axe-core entirely",
          "Only works in Firefox"
        ],
        answer: 1,
        explain: "ARIA snapshots catch structural/a11y-name regressions without font-flake pixel diffs.",
        think: "“It’s just another PNG.”",
        actual: "Different tool: structure vs pixels.",
        stuck: "Fighting visual flake when an ARIA snapshot would suffice."
      },
      {
        q: "`page.accessibility` in modern Playwright?",
        options: [
          "Still the recommended a11y API",
          "Removed in 1.57 — use axe-core + ARIA snapshots",
          "Only available on WebKit",
          "Required for getByRole"
        ],
        answer: 1,
        explain: "Long-deprecated API was removed; curriculum flags this on the Deprecated board.",
        think: "“Old tutorial code still works.”",
        actual: "Suite fails to compile/run on current Playwright.",
        stuck: "Copy-pasting pre-1.57 snippets into interviews."
      }
    ]
  },

  debug: {
    title: "Debugging & reports — practice MCQs",
    items: [
      {
        q: "Best artifact to debug a flaky CI failure?",
        options: [
          "Only console.log",
          "Trace Viewer (timeline, DOM snapshots, network)",
          "Increase workers",
          "Disable assertions"
        ],
        answer: 1,
        explain: "Traces show what the browser saw step-by-step.",
        think: "“Re-run locally until it fails.”",
        actual: "CI-only flakes need traces/videos from CI.",
        stuck: "Cannot reproduce, so ‘mark flaky’ forever."
      },
      {
        q: "`--debug` / UI Mode helps you…",
        options: [
          "Ship to production",
          "Step through tests, time-travel, inspect locators interactively",
          "Skip fixtures",
          "Turn off TypeScript"
        ],
        answer: 1,
        explain: "Interactive debugging shortens locator/action diagnosis.",
        think: "“Print debugging is enough.”",
        actual: "UI Mode/trace is much faster for timing issues.",
        stuck: "Slow printf loops."
      },
      {
        q: "HTML report is primarily for…",
        options: [
          "Replacing git",
          "Human-readable results with links to traces/errors",
          "Storing storageState",
          "Compiling TypeScript"
        ],
        answer: 1,
        explain: "Share report links in PRs/CI for triage.",
        think: "“Exit code is enough.”",
        actual: "Teams need failure context.",
        stuck: "No artifacts attached in CI jobs."
      }
    ]
  },

  sharding: {
    title: "Sharding — practice MCQs",
    items: [
      {
        q: "What does sharding do?",
        options: [
          "Splits the suite across multiple machines/jobs",
          "Deletes slow tests",
          "Forces serial mode",
          "Merges all browsers into one"
        ],
        answer: 0,
        explain: "`--shard=1/4` runs a portion of tests; CI aggregates results.",
        think: "“More workers on one machine is the same as sharding.”",
        actual: "Workers = one machine; shards = many machines/jobs.",
        stuck: "Confusing parallelism levels in interviews."
      },
      {
        q: "Shard-friendly suites need…",
        options: [
          "Shared mutable global users",
          "Independent tests and isolated data",
          "One giant serial file",
          "Disabled retries always"
        ],
        answer: 1,
        explain: "Shards assume tests don’t depend on each other.",
        think: "“Order will stay the same across shards.”",
        actual: "Different shards run different subsets.",
        stuck: "Order-dependent tests fail only in CI shards."
      },
      {
        q: "Where do you usually configure shard jobs?",
        options: [
          "Inside each test file only",
          "CI matrix / multiple jobs passing --shard=i/n",
          "getByRole options",
          "expect.soft"
        ],
        answer: 1,
        explain: "CI runs several containers with different shard indexes.",
        think: "“Playwright auto-shards across the internet.”",
        actual: "You wire shards in CI config.",
        stuck: "Only local parallel, slow CI wall-clock."
      }
    ]
  },

  ci: {
    title: "CI/CD & Docker — practice MCQs",
    items: [
      {
        q: "Why run Playwright in Docker/CI images?",
        options: [
          "Because Playwright cannot run on Windows",
          "Consistent browsers/OS/dependencies for reproducible tests",
          "To avoid writing assertions",
          "To disable traces"
        ],
        answer: 1,
        explain: "Same image locally/CI reduces ‘works on my machine’.",
        think: "“Any agent OS is fine.”",
        actual: "Missing deps/fonts/browsers cause noise.",
        stuck: "Visual and browser install failures."
      },
      {
        q: "Good CI defaults include…",
        options: [
          "forbidOnly, retries, traces on first retry, upload report/trace artifacts",
          "test.only allowed, retries 99, traces off",
          "headed mode always",
          "workers=1 forever without measuring"
        ],
        answer: 0,
        explain: "Defend against focused tests; debug flakes with traces; keep artifacts.",
        think: "“Copy local config unchanged into CI.”",
        actual: "CI needs stricter, artifact-oriented settings.",
        stuck: "Green CI with test.only or no failure artifacts."
      },
      {
        q: "On CI failure, first place to look?",
        options: [
          "Randomly rewrite locators",
          "HTML report + trace for the failed test",
          "Delete the job",
          "Increase sleep globally"
        ],
        answer: 1,
        explain: "Evidence-driven triage beats guessy locator edits.",
        think: "“It failed so the locator must be wrong.”",
        actual: "Could be data, env, timing, or product bug.",
        stuck: "Churning selectors without reading the trace."
      }
    ]
  },

  best: {
    title: "Best practices — practice MCQs",
    items: [
      {
        q: "Highest-level guidance for stable Playwright suites?",
        options: [
          "Prefer role/label locators, web-first asserts, isolated data, avoid sleeps",
          "Prefer XPath, sleep often, share one user",
          "Always force:true",
          "Never use fixtures"
        ],
        answer: 0,
        explain: "Resilient locators + assertions + isolation beat brittle shortcuts.",
        think: "“Speed of writing selectors matters more than resilience.”",
        actual: "Brittle suites cost more in maintenance.",
        stuck: "Short-term hacks that explode in CI."
      },
      {
        q: "Test independence means…",
        options: [
          "Tests must share the same cart state",
          "Any test can run alone/parallel without relying on another test’s side effects",
          "Only one test file is allowed",
          "Hooks are forbidden"
        ],
        answer: 1,
        explain: "Independence enables parallel, sharding, and selective retries.",
        think: "“A long journey as dependent tests is fine.”",
        actual: "One failure cascades; order becomes load-bearing.",
        stuck: "Cannot run a single test usefully."
      },
      {
        q: "When is `force: true` acceptable to mention in an interview?",
        options: [
          "As the default click strategy",
          "Rarely — explain it skips actionability; prefer fixing overlays/state",
          "Whenever a test flakes once",
          "Only with XPath"
        ],
        answer: 1,
        explain: "Show you understand the tradeoff.",
        think: "“force fixes flakes — use it.”",
        actual: "It can click non-user-visible controls and hide bugs.",
        stuck: "Force as a habit → false confidence."
      }
    ]
  },

  cheatsheet: {
    title: "Cheat sheet — practice MCQs",
    items: [
      {
        q: "Quick recall: getByRole is preferred because…",
        options: [
          "It is the shortest API name",
          "It uses the accessibility tree and mirrors user perception",
          "It ignores visible state",
          "It only works with IDs"
        ],
        answer: 1,
        explain: "Accessible name + role = resilient, user-centric locators.",
        think: "“It’s just another selector sugar.”",
        actual: "It pushes better a11y and stabler tests.",
        stuck: "Treating it as optional style."
      },
      {
        q: "Quick recall: web-first expect means…",
        options: [
          "Assert once immediately",
          "Retry the condition until pass or timeout",
          "Only works offline",
          "Disables auto-wait on clicks"
        ],
        answer: 1,
        explain: "Retries are the flake-killer vs one-shot booleans.",
        think: "“expect is Jest-only semantics.”",
        actual: "Playwright expect is async and retrying for locators.",
        stuck: "Mixing non-retrying checks into suites."
      },
      {
        q: "Quick recall: frameLocator vs open Shadow DOM?",
        options: [
          "Same mechanism",
          "Frames need frameLocator; open shadow is pierced by normal locators",
          "Shadow always needs frameLocator",
          "Neither is supported"
        ],
        answer: 1,
        explain: "Keep the distinction sharp for interviews and debugging.",
        think: "“Pierce everything with one API.”",
        actual: "Different document boundaries.",
        stuck: "Wrong tool for the boundary type."
      }
    ]
  },

  xpath: {
    title: "XPath for Playwright — practice MCQs",
    items: [
      {
        q: "In a new Playwright suite, what is the best default locator strategy?",
        options: [
          "Absolute XPath from /html/body",
          "getByRole / getByLabel / getByTestId first; XPath last resort",
          "Always CSS class selectors",
          "page.$ with XPath only"
        ],
        answer: 1,
        explain: "User-facing locators are resilient; XPath is for legacy/complex tree relationships.",
        think: "“XPath is the most powerful so use it everywhere.”",
        actual: "Power ≠ maintainability; role/label survive refactors better.",
        stuck: "Copying DevTools XPath into every new test."
      },
      {
        q: "Which XPath is more resilient?",
        options: [
          "/html/body/div[2]/form/button",
          "//button[@type='submit']",
          "//div/div/div/div/button[1]",
          "/html/body//*[1]"
        ],
        answer: 1,
        explain: "Relative + stable attribute beats absolute/positional chains.",
        think: "“Absolute is precise so it must be safer.”",
        actual: "Any layout insert breaks absolute paths.",
        stuck: "Flakes after small UI wrapper changes."
      },
      {
        q: "Browsers typically evaluate which XPath version?",
        options: [
          "XPath 3.0 only",
          "XPath 1.0 (no ends-with, limited types)",
          "XPath 2.0 with full sequence support",
          "Whatever Selenium polyfills"
        ],
        answer: 1,
        explain: "Use contains() instead of ends-with; avoid XPath 2-only functions in browser automation.",
        think: "“ends-with works like in XML tools.”",
        actual: "InvalidSelector or empty results in DevTools/Playwright.",
        stuck: "Writing XPath 2 syntax from a cheat sheet for browsers."
      },
      {
        q: "Correct way to exclude Removed plans?",
        options: [
          "//div[@data-plan]//not(.//span[text()='Removed'])",
          "//div[@data-plan and not(.//span[text()='Removed'])]",
          "//not(div[@data-plan])",
          "//div[@data-plan]/span[text()!='Removed']"
        ],
        answer: 1,
        explain: "`not()` is a predicate function on the node you filter — not a location step name.",
        think: "“Put //not(...) like a pseudo-element.”",
        actual: "Invalid or wrong node-set; filter the plan wrapper with and not(...).",
        stuck: "SO-style mistakes treating not as a node name."
      },
      {
        q: "Same XPath matches two dropdown chevrons. Best fix?",
        options: [
          "Disable strict mode globally",
          "Scope from a unique parent, or (//...)[1] / nth() as last resort",
          "Always click both",
          "Use waitForTimeout(5000)"
        ],
        answer: 1,
        explain: "Parent scope > index. Indexes belong on the whole match set: (xpath)[n].",
        think: "“Append [1] anywhere inside the path.”",
        actual: "Wrong node indexed or still ambiguous.",
        stuck: "Duplicate expiryDate icons in forms."
      },
      {
        q: "Dynamic React class `css-a1b2c3 submit-btn` — best XPath fragment?",
        options: [
          "@class='css-a1b2c3 submit-btn'",
          "contains(@class,'submit-btn')",
          "@class='css-a1b2c3'",
          "starts-with(@class,'css-')"
        ],
        answer: 1,
        explain: "Stable token via contains; hashed prefixes change every build.",
        think: "“Exact class match is more precise.”",
        actual: "Breaks on every CSS-modules rebuild.",
        stuck: "Hardcoding full generated class strings."
      },
      {
        q: "XPath works in DevTools but the test flakes. Most likely cause?",
        options: [
          "Playwright disables XPath randomly",
          "Timing/dynamic DOM/iframe context/overlay — not “random XPath”",
          "XPath indexes are 0-based in Playwright only",
          "You must use absolute paths in CI"
        ],
        answer: 1,
        explain: "Auto-wait helps; still need correct context and resilient expressions.",
        think: "“The expression is haunted.”",
        actual: "Race, dynamic id, or wrong document (frame).",
        stuck: "Adding sleeps instead of fixing locator/context."
      },
      {
        q: "How do you write XPath in Playwright?",
        options: [
          "page.findByXpath only",
          "page.locator('xpath=//...') or page.locator('//...')",
          "page.xpath.click()",
          "Only via CSS engine"
        ],
        answer: 1,
        explain: "Locator API accepts xpath= prefix or // / .. shortcuts and still auto-waits.",
        think: "“Need Selenium By.xpath.”",
        actual: "Same locator pipeline as CSS/role.",
        stuck: "Mixing ElementHandle mental model with XPath."
      },
      {
        q: "`//*[contains(text(),'promo')]` sometimes matches a script. Fix?",
        options: [
          "Ignore it — scripts never match",
          "//*[not(self::script) and contains(.,'promo')] or target a concrete tag",
          "Use absolute /html only",
          "Force: true on click"
        ],
        answer: 1,
        explain: "Exclude script nodes or narrow to visible elements.",
        think: "“Text() only hits what I see.”",
        actual: "Hydration scripts can contain the same string briefly.",
        stuck: "Debugging after the script node is already gone."
      },
      {
        q: "Chrome finds the radio; Firefox says another element obscures the click. XPath broken?",
        options: [
          "Yes — rewrite all XPath for Gecko",
          "Usually no — wait for overlay/spinner to hide; actionability differs by timing",
          "Firefox does not support XPath",
          "Use document.querySelector instead forever"
        ],
        answer: 1,
        explain: "Element was located; click intercepted by loader/modal.",
        think: "“Browser XPath engines disagree.”",
        actual: "Obscuring layer / race — wait for it hidden.",
        stuck: "Rewriting locators when you needed a wait."
      },
      {
        q: "Which expression is invalid / problematic in browser XPath 1.0?",
        options: [
          "//button[normalize-space()='Save']",
          "//label[ends-with(text(),'Email')]",
          "//tr[td[contains(.,'Ada')]]//button",
          "//span[@class='button02']//button"
        ],
        answer: 1,
        explain: "ends-with is XPath 2; browsers are XPath 1 — use contains().",
        think: "“All string functions from the XPath 2 cheat sheet work.”",
        actual: "Selector error or no matches.",
        stuck: "Copy-pasting from XML tooling docs."
      },
      {
        q: "Best XPath for Edit in Ada’s row?",
        options: [
          "//table/tbody/tr[2]/td[3]/button",
          "//tr[td[contains(.,'Ada')]]//button[contains(.,'Edit')]",
          "(//button)[5]",
          "/html/body/table//button[2]"
        ],
        answer: 1,
        explain: "Filter by business text; avoid positional tr[2].",
        think: "“Row 2 is Ada today.”",
        actual: "Sort/filter changes row order → wrong click.",
        stuck: "Index-based table automation."
      },
      {
        q: "What is the difference between the parent:: and ancestor:: axes?",
        options: [
          "They are identical",
          "parent:: is exactly one node up; ancestor:: is every node up to the root",
          "ancestor:: is faster to evaluate",
          "parent:: only works on <div> elements"
        ],
        answer: 1,
        explain: "parent:: returns 0/1 result (one step up); ancestor:: returns every level above, all the way to <html>.",
        think: "“They both just mean ‘go up’.”",
        actual: "Using ancestor:: when you meant the immediate parent over-matches grandparents too.",
        stuck: "Mixing up how far up the tree an axis reaches."
      },
      {
        q: "//tbody/child::tr is equivalent to which shorter expression?",
        options: [
          "//tbody//tr",
          "//tbody/tr",
          "//tbody/descendant::tr",
          "//tbody[tr]"
        ],
        answer: 1,
        explain: "A single / already means the child:: axis — writing it out is identical to //tbody/tr.",
        think: "“child:: must mean something different from /.”",
        actual: "child:: is just the explicit, spelled-out form of the default axis for /.",
        stuck: "Confusing explicit axis syntax with a totally new operator."
      },
      {
        q: "A payment form's Pay button lives inside an <iframe>. page.locator(\"xpath=//button[text()='Pay']\") times out. Why?",
        options: [
          "The XPath syntax is invalid",
          "The iframe has its own document; XPath scoped to the main page never searches inside it",
          "XPath cannot match <button> elements",
          "You must use CSS selectors for iframes"
        ],
        answer: 1,
        explain: "Frames are separate documents. Use page.frameLocator('#id') to step in, then locate inside it.",
        think: "“// searches the whole page, iframe included.”",
        actual: "// only ever searches the document it's evaluated against.",
        stuck: "Debugging the XPath text instead of the frame context."
      },
      {
        q: "Best place to put a reusable XPath locator in a well-structured suite?",
        options: [
          "Typed directly inside every spec that needs it",
          "As a readonly Locator property on a Page Object, built once in the constructor",
          "In a global string constants file with no typing",
          "Inline inside a beforeEach hook only"
        ],
        answer: 1,
        explain: "POM exposes Locators (XPath or otherwise) as properties, so a markup change means one edit, not a spec-wide search-and-replace.",
        think: "“XPath strings are fine copy-pasted per test.”",
        actual: "Every markup tweak now requires hunting down every spec that inlined the string.",
        stuck: "Skipping Page Object Model for ‘legacy’ XPath-based locators."
      },
      {
        q: "An XPath-based suite is flaky only on the CI server, never on a developer's laptop. Best first step?",
        options: [
          "Delete the XPath and replace with waitForTimeout(5000)",
          "Turn on trace: 'on-first-retry' and check for shared dynamic data, timing, or extra CI-only markup",
          "Switch the whole suite to a different browser",
          "Increase the global test timeout to 5 minutes and move on"
        ],
        answer: 1,
        explain: "Traces show the real DOM at failure time; CI usually differs via parallel data collisions, slower timing, or environment-only markup (banners, experiments).",
        think: "“CI is just a slower laptop, same behaviour.”",
        actual: "CI often runs more workers in parallel and may inject env-specific markup that shifts your XPath's ancestor chain.",
        stuck: "Papering over CI-only flakiness with sleeps or retries instead of diagnosing it."
      }
    ]
  },

  "interview-essentials": {
    title: "Interview essentials — quick check",
    items: [
      {
        q: "Smoke vs sanity vs regression — which is the shallow “build not broken” gate on every PR?",
        options: [
          "Full regression",
          "Smoke",
          "Sanity only",
          "Exploratory"
        ],
        answer: 1,
        explain: "Smoke is a thin critical-path check. Sanity focuses on a small change area; regression is broader protection of existing behavior.",
        think: "“Regression means the same as smoke.”",
        actual: "Teams that run full regression on every PR usually burn CI time and still ship late.",
        stuck: "Using the three terms interchangeably."
      },
      {
        q: "Misspelled company name on the marketing homepage — severity vs priority?",
        options: [
          "High severity, low priority",
          "Low severity, high priority (brand)",
          "Both always high",
          "Neither — cosmetic bugs are ignored"
        ],
        answer: 1,
        explain: "Severity is technical impact; priority is business urgency. Brand typos are often low severity but high priority.",
        think: "Severity and priority are the same number.",
        actual: "Triage meetings stall when everything is marked P1.",
        stuck: "Using severity and priority as synonyms."
      },
      {
        q: "Best way to configure CI retries in Playwright?",
        options: [
          "retries: 10 everywhere so CI is always green",
          "retries: process.env.CI ? 2 : 0 with trace on-first-retry, plus quarantine for chronic flakes",
          "Only test.setTimeout(999999)",
          "Disable assertions"
        ],
        answer: 1,
        explain: "Limited CI retries + traces help triage; endless retries hide product bugs.",
        think: "More retries = more stability.",
        actual: "Flaky product bugs get merged because retries mask them.",
        stuck: "Setting high retries and calling the suite stable."
      },
      {
        q: "Scenario Outline in BDD is best for…",
        options: [
          "Unrelated behaviors in one outline",
          "One template with an Examples table for data variants",
          "Replacing all unit tests",
          "Storing passwords in Gherkin"
        ],
        answer: 1,
        explain: "Outlines parameterize the same behavior; keep distinct behaviors as separate Scenarios.",
        think: "Outlines exist only to reduce typing of different features.",
        actual: "Unreadable feature files and weak collaboration.",
        stuck: "Giant Examples tables for unrelated flows."
      },
      {
        q: "Playwright auto-wait means a 6-minute page load will…",
        options: [
          "Wait forever",
          "Wait only until configured navigation/test timeouts, then fail",
          "Skip the test automatically",
          "Switch to Selenium implicit wait"
        ],
        answer: 1,
        explain: "Auto-wait polls until timeout — it is not infinite. Raise timeouts deliberately for known slow flows and assert progress.",
        think: "Auto-wait = infinite patience.",
        actual: "CI jobs hang or fail late without clear signals.",
        stuck: "Adding waitForTimeout(600000) instead of diagnosing slowness."
      },
      {
        q: "git stash is best when you…",
        options: [
          "Need a long-term backup of unfinished work for months",
          "Need a quick shelf of uncommitted changes to switch branches briefly",
          "Want to rewrite main history",
          "Replace pull requests"
        ],
        answer: 1,
        explain: "Stash is for short context switches; lasting WIP belongs on a branch/commit.",
        think: "Stash replaces branches.",
        actual: "Lost work in forgotten stash entries.",
        stuck: "Stashing forever instead of committing WIP."
      },
      {
        q: "MCP + Playwright in interviews — strongest answer emphasizes…",
        options: [
          "AI writes tests so humans never review locators",
          "AI as accelerator; humans still own assertions, secrets, and suite quality",
          "MCP replaces CI",
          "Only Java Selenium supports MCP"
        ],
        answer: 1,
        explain: "Treat agents as drafting help; review and run every change.",
        think: "Generated tests are production-ready.",
        actual: "Brittle suites and leaked secrets in prompts.",
        stuck: "Claiming AI needs no review."
      },
      {
        q: "Non-locator causes of Playwright failures include all EXCEPT…",
        options: [
          "Auth/session expiry and data collisions",
          "Overlays intercepting clicks",
          "Wrong environment / feature flags",
          "Using getByRole for a labeled button"
        ],
        answer: 3,
        explain: "getByRole for a labeled control is a best practice, not a failure cause. Timing, env, auth, overlays, and data races are common non-locator failures.",
        think: "Every red build is a bad XPath.",
        actual: "Wasted time rewriting locators when the env was down.",
        stuck: "Only blaming locators."
      }
    ]
  },

  "whats-new": {
    title: "What's new — practice MCQs",
    items: [
      {
        q: "Playwright Test Agents (planner/generator/healer) arrived roughly in…",
        options: ["1.20", "1.56", "1.40", "Only as a separate paid product"],
        answer: 1,
        explain: "Agents shipped around 1.56 via `npx playwright init-agents`.",
        think: "“Agents have always been core.”",
        actual: "Recent surface — interviewers may ask governance more than APIs.",
        stuck: "Claiming expertise without knowing healer skip behavior."
      },
      {
        q: "Why pin `@playwright/test` instead of floating latest?",
        options: [
          "npm forbids latest",
          "APIs are version-gated (ARIA, Clock, WebAuthn, Agents) — pin so the suite matches docs/CI",
          "TypeScript requires it",
          "GitHub Pages blocks unpinned packages"
        ],
        answer: 1,
        explain: "Currency modules assume known minima; floating majors surprise CI.",
        think: "“Always take latest on every install.”",
        actual: "Breaks from removed APIs (e.g. page.accessibility) or experimental CT churn.",
        stuck: "Debugging ‘works on my machine’ version drift."
      },
      {
        q: "Bundled Playwright MCP / CLI are highlighted from…",
        options: ["1.30", "1.62", "1.45", "Selenium 4"],
        answer: 1,
        explain: "1.62 bundles MCP/CLI surfaces this curriculum maps under Agents & MCP.",
        think: "“MCP is only a third-party plugin.”",
        actual: "First-party tooling exists; still needs human review.",
        stuck: "Out-of-date ‘no MCP’ interview answers."
      }
    ]
  },

  deprecated: {
    title: "Deprecated — practice MCQs",
    items: [
      {
        q: "`page.accessibility` status as of Playwright 1.57+?",
        options: ["Recommended", "Removed — use axe-core + ARIA snapshots", "Firefox-only", "Required for traces"],
        answer: 1,
        explain: "Removed after long deprecation.",
        think: "“Still in every tutorial.”",
        actual: "Code fails on current Playwright.",
        stuck: "Shipping dead API snippets."
      },
      {
        q: "`waitForLoadState('networkidle')` is…",
        options: ["Best practice for SPAs", "Discouraged — assert UI/network you control", "Required before every click", "Faster than expect"],
        answer: 1,
        explain: "Healer guidance and docs discourage networkidle; prefer end-state asserts.",
        think: "“Idle network means UI is ready.”",
        actual: "SPAs rarely go idle; flakes and long waits.",
        stuck: "Sleep-shaped waits dressed as networkidle."
      },
      {
        q: "Playwright Docker `:latest` / floating distro tags?",
        options: ["Always use them", "Pin an exact version tag — floating tags stopped publishing", "Only for WebKit", "Required by GitHub Actions"],
        answer: 1,
        explain: "Pin versions for reproducible CI.",
        think: "`:latest` is fine forever.",
        actual: "Image pull breaks or silent drift.",
        stuck: "Mystery CI failures after image moves."
      }
    ]
  },

  "agents-mcp": {
    title: "Agents & MCP — practice MCQs",
    items: [
      {
        q: "Healer may skip a test when it believes the product is broken. Why does that matter?",
        options: [
          "Skipped tests always count as failures",
          "It changes suite signal — green/skip is not the same as a fixed assertion",
          "Skips delete the test file",
          "It only happens locally"
        ],
        answer: 1,
        explain: "Governance: humans must review skips and own architecture.",
        think: "“Healer makes CI always green — perfect.”",
        actual: "Silent coverage loss.",
        stuck: "Trusting agent output without review gates."
      },
      {
        q: "Strongest interview framing for Agents/MCP?",
        options: [
          "AI replaces SDETs",
          "AI scaffolds; humans own locators, assertions, secrets, and suite quality",
          "MCP removes the need for CI",
          "Only use codegen forever"
        ],
        answer: 1,
        explain: "Accelerator with review — not autonomous ownership.",
        think: "“Generated tests ship as-is.”",
        actual: "Brittle suites and leaked secrets.",
        stuck: "Over-claiming AI autonomy."
      },
      {
        q: "MCP vs playwright-cli — useful distinction?",
        options: [
          "Identical interfaces",
          "MCP is tool-call oriented for LLM clients; CLI is often more token-efficient with filesystem access",
          "CLI cannot drive a browser",
          "MCP only works offline"
        ],
        answer: 1,
        explain: "Trade-off question interviewers may ask in 2026.",
        think: "“Pick MCP always.”",
        actual: "Cost/permissions differ by client.",
        stuck: "No vocabulary for the trade-off."
      }
    ]
  },

  clock: {
    title: "Clock API — practice MCQs",
    items: [
      {
        q: "Best use of `page.clock`?",
        options: [
          "Speed up CI by skipping assertions",
          "Fast-forward timers/Date so expiry/OTP UI can be asserted without real waits",
          "Replace storageState",
          "Fix network flakes"
        ],
        answer: 1,
        explain: "Install clock, assert, fastForward, assert expired.",
        think: "“Sleep five minutes in the test.”",
        actual: "Slow, flaky suite.",
        stuck: "Never testing timeout UX."
      },
      {
        q: "Clock mocking alone is enough when…",
        options: [
          "Always — servers obey page.clock",
          "The app’s timers/Date are interceptable in the browser; server wall-clock still needs stubs/cooperation",
          "Only for screenshots",
          "Never — Clock is experimental forever"
        ],
        answer: 1,
        explain: "Client timers ≠ server expiry.",
        think: "“One API controls the universe.”",
        actual: "False confidence on server-driven sessions.",
        stuck: "Flaky OTP tests against real backends."
      },
      {
        q: "`page.clock` has been GA since roughly…",
        options: ["1.62 only", "1.45", "1.20", "Never — still experimental"],
        answer: 1,
        explain: "Stable Clock API for years; curriculum still treats it as under-taught.",
        think: "“Too new to mention.”",
        actual: "Strong interview differentiator for timeout UX.",
        stuck: "Blank stare on time-control questions."
      }
    ]
  },

  webauthn: {
    title: "WebAuthn — practice MCQs",
    items: [
      {
        q: "How do you exercise passkey flows in CI without hardware?",
        options: [
          "Skip all passkey tests forever",
          "Virtual authenticator via browserContext.credentials (1.61+)",
          "Only manual testing on a laptop",
          "Screenshot the QR code"
        ],
        answer: 1,
        explain: "Virtual credentials make passwordless flows automatable.",
        think: "“Passkeys can’t be automated.”",
        actual: "Missing coverage on a high-value auth path.",
        stuck: "Leaving passkeys out of the portfolio suite."
      },
      {
        q: "WebAuthn credentials can persist into storageState starting in…",
        options: ["1.40", "1.62", "1.49", "Never"],
        answer: 1,
        explain: "1.62 expands storageState to carry WebAuthn credentials.",
        think: "“Always re-register every test.”",
        actual: "Unnecessary setup cost.",
        stuck: "Slow auth setup for passkey suites."
      },
      {
        q: "WebAuthn automation support covers…",
        options: ["Chromium only", "All Playwright browsers", "WebKit only", "Mobile only"],
        answer: 1,
        explain: "Virtual authenticator is cross-browser in modern Playwright.",
        think: "“Chrome DevTools Protocol only.”",
        actual: "Narrow coverage.",
        stuck: "Wrong limitation in interviews."
      }
    ]
  },

  "component-testing": {
    title: "Component testing — practice MCQs",
    items: [
      {
        q: "Honest status of Playwright component testing?",
        options: [
          "Stable since 2020",
          "Experimental since 2022 — APIs can change between minors",
          "Deprecated entirely",
          "Only for Java"
        ],
        answer: 1,
        explain: "Say experimental in interviews; pin exact versions.",
        think: "“CT is as stable as E2E.”",
        actual: "Surprise breakages on upgrade.",
        stuck: "Résumé overclaims."
      },
      {
        q: "`@playwright/experimental-ct-svelte` in 1.59?",
        options: ["Became stable", "Removed with no long deprecation window", "Renamed only", "Required for React CT"],
        answer: 1,
        explain: "Example of experimental risk — package removed.",
        think: "“Experimental means slow deprecation.”",
        actual: "Hard break.",
        stuck: "Surprised migration."
      },
      {
        q: "When is Playwright CT a reasonable choice?",
        options: [
          "To replace all E2E journeys",
          "When a design-system unit needs real browser rendering checks",
          "Instead of unit tests always",
          "Only without pinning versions"
        ],
        answer: 1,
        explain: "Narrow use-case; not a pyramid replacement.",
        think: "“CT kills E2E.”",
        actual: "Missing user-journey coverage.",
        stuck: "Wrong layer for the risk."
      }
    ]
  }
};
