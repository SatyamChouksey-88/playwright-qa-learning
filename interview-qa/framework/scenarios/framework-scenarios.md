---
topic: framework
title: Framework interview scenarios
count: 20
---

# Framework interview scenarios

### FW-S-01. Walk me through initializing a Playwright TypeScript project from an empty repo.

**Think first:** - What belongs in day-one config vs later?
- Strict TypeScript — yes or later?
- What is the runner vs your conventions?

**Ideal approach:** Add `@playwright/test`, enable strict tsconfig, create root `playwright.config.ts` with testDir, list+html reporters, trace on-first-retry, and forbidOnly in CI. Document folder conventions before the tenth test. Do not wrap Playwright in a custom runner.

**Why they get stuck:** They describe copying Selenium patterns or disabling strict mode "temporarily."

**Why the interviewer asks this:** Junior signal: have they actually bootstrapped a repo or only joined an existing one?

**Common wrong answer:** "We built a custom CLI so QAs never touch Playwright" — adds maintenance without value.

**Real project example:** FinTech startup: init with strict TS + eslint-plugin-playwright; first PR added fixtures/ before pages/ grew to 40 files — zero retrofit cost.

**Follow-up questions:** - What trace default for CI?
- When add a second browser project?
- What goes in package.json scripts vs config?

### FW-S-02. Draw the folder structure for a 200-test suite with three engineers.

**Think first:** - Feature vs layer grouping?
- Where page objects and fixtures?
- What is the junk drawer to avoid?

**Ideal approach:** `tests/<feature>/*.spec.ts`, shared `pages/`, `fixtures/base.ts` exporting extended test, `data/factories/`, root config. Tests import test from fixtures. No flat numbered specs.

**Why they get stuck:** Mirror entire app src tree or one giant helpers/ folder.

**Why the interviewer asks this:** Tests whether conventions scale with headcount.

**Common wrong answer:** Every engineer picks their own pattern per feature — review chaos.

**Real project example:** Marketplace team grouped by checkout/orders/account; onboarding doc one page; new hire added auth test in correct folder day two.

**Follow-up questions:** - When colocate page object with feature?
- Where do API clients live?
- How enforce with CODEOWNERS?

### FW-S-03. What locator strategy would you standardize for the team?

**Think first:** - Role vs test id vs CSS?
- How enforce?
- XPath ever?

**Ideal approach:** Priority: getByRole/getByLabel → getByTestId (contract with devs) → CSS. Ban XPath in new tests. ESLint + review checklist. Locators as readonly fields on page objects.

**Why they get stuck:** Codegen CSS copied everywhere; no written policy.

**Why the interviewer asks this:** Locator policy is the longest-lived framework decision.

**Common wrong answer:** "We use whatever codegen outputs" — suite rots on first redesign.

**Real project example:** SaaS dashboard: pushed devs for accessible names; role locators survived React refactor without test edits.

**Follow-up questions:** - When is test id acceptable?
- How handle duplicate button names?
- Component scoping?

### FW-S-04. Review this thick Page Object with verify* methods full of expects. What do you change?

**Think first:** - Assertions in tests or POM?
- What stays in POM?
- Component extraction?

**Ideal approach:** Thin POM: locators + actions. Move business expects to spec. Optional waitForLoaded() for readiness. Extract repeated widgets to component objects.

**Why they get stuck:** Defend thick POM as "DRY" without seeing hidden assertions hurt readability.

**Why the interviewer asks this:** Mid-level code review scenario — very common in real PRs.

**Common wrong answer:** Add BasePage with 50 shared verify methods — inheritance tar pit.

**Real project example:** 600-line OrdersPage split into OrdersPage + DataGridComponent + ConfirmModal; spec assertions visible in failure output.

**Follow-up questions:** - POM vs Screenplay?
- When allow assertion in POM?
- Fixture inject page object how?

### FW-S-05. Replace this beforeEach that constructs page objects and mutates shared state with fixtures.

**Think first:** - Parallel safety?
- Teardown where?
- Import path for test?

**Ideal approach:** `test.extend` with typed fixtures; module-level mutable state removed; export test/expect from fixtures/base; specs depend on `{ loginPage }` in signature.

**Why they get stuck:** Keep beforeEach and add `--workers=1` as "fix."

**Why the interviewer asks this:** Core Playwright framework mechanism at mid level.

**Common wrong answer:** Singleton page object cache shared across tests.

**Real project example:** Parallel failures traced to module-level `currentUser`; fixture per test fixed overnight.

**Follow-up questions:** - Worker vs test scope?
- mergeTests when split fixtures?
- Auto fixture cost?

### FW-S-06. Design auth so 2,000 tests do not UI-login every time.

**Think first:** - storageState?
- Setup project?
- API login in setup?

**Ideal approach:** Setup project runs auth.setup.ts, saves gitignored `.auth/user.json`, consumer projects use dependencies + storageState. Prefer API/token in setup when available.

**Why they get stuck:** Login in beforeEach; hit rate limits; 40-minute suites.

**Why the interviewer asks this:** Standard senior efficiency question.

**Common wrong answer:** Commit storageState JSON to repo for "speed."

**Real project example:** B2B app: setup project + API login; suite login time 38 min → 4 min.

**Follow-up questions:** - Multi-role auth?
- Session expiry?
- Security on artifacts?

### FW-S-07. How test admin vs member RBAC in parallel without one shared user?

**Think first:** - storageState per role?
- Projects matrix?
- PR vs nightly scope?

**Ideal approach:** Separate setup tests write `admin.json` / `member.json`; projects or grep tiers map roles; member tests assert forbidden on admin routes.

**Why they get stuck:** One admin cookie for everything; skip negative tests.

**Why the interviewer asks this:** RBAC is where auth architecture shows depth.

**Common wrong answer:** Logout/login switch role mid-test for every case.

**Real project example:** Healthcare portal: member project expects 403 on `/admin/billing`; parallel-safe.

**Follow-up questions:** - Matrix explosion control?
- Dynamic role fixture?
- MFA in setup?

### FW-S-08. Same tests must run against local, staging, and CI — config design?

**Think first:** - Env vars?
- Multiple config files?
- Secrets?

**Ideal approach:** Single config; `use.baseURL` from `process.env.BASE_URL`; secrets in CI store; `.env.example` documents vars; smoke project on PR against staging.

**Why they get stuck:** Duplicate spec folders per environment.

**Why the interviewer asks this:** Environment layering is architect interview staple.

**Common wrong answer:** Hardcode staging URL in 200 tests.

**Real project example:** GitHub Actions injects BASE_URL; developers use localhost via `.env.local` — same specs.

**Follow-up questions:** - When split config files?
- Per-env project metadata?
- Feature flags per env?

### FW-S-09. Tests collide on email unique constraint when run with 4 workers. Fix?

**Think first:** - Factories?
- Static data?
- DB isolation?

**Ideal approach:** Factory with UUID email suffix; API create user; optional per-worker prefix; never shared static `test@example.com`.

**Why they get stuck:** Run `--workers=1` permanently.

**Why the interviewer asks this:** Parallel data isolation — senior must-have.

**Common wrong answer:** Serial mode as policy — hides design bug.

**Real project example:** CRM signup tests used `createUser()` factory; parallel green after months of serial runs.

**Follow-up questions:** - Sweeper job?
- Shared tenant DB?
- Teardown failure?

### FW-S-10. When API-seed vs full UI journey for checkout test?

**Think first:** - What is under test?
- Speed vs coverage?
- Hybrid?

**Ideal approach:** If asserting checkout total, API seed cart and open checkout URL. If testing "add to cart" journey, drive UI from catalog. Document decision tree in README.

**Why they get stuck:** Always UI from login; or always API skipping UI under test.

**Why the interviewer asks this:** Efficiency without false confidence.

**Common wrong answer:** API-mock your own checkout API in smoke — misses integration.

**Real project example:** Retail: 200 regression tests API-arrange; 15 smoke tests full UI happy path.

**Follow-up questions:** - Hybrid fixture teardown?
- Network mock boundaries?
- Contract tests where?

### FW-S-11. Implement network mocking for flaky payment provider without mocking your own API.

**Think first:** - page.route scope?
- Option fixture?
- Unroute?

**Ideal approach:** Option fixture registers Stripe routes only when test opts in; fulfill JSON; unroute after test; own checkout API stays real in regression.

**Why they get stuck:** Mock everything including internal APIs.

**Why the interviewer asks this:** Boundary judgment on mocks.

**Common wrong answer:** Global route in beforeAll affecting all tests.

**Real project example:** Subscription flow: `@external-pay` tests use route fixture; core billing API unmocked nightly.

**Follow-up questions:** - HAR vs handler?
- Third-party SLA tests?
- Route order conflicts?

### FW-S-12. Teardown failed and orphaned e2e users accumulated for months. Permanent fix?

**Think first:** - Idempotent delete?
- Prefix convention?
- Scheduled sweeper?

**Ideal approach:** Fixture teardown tolerates 404; all test data prefixed `e2e-`; nightly sweeper deletes aged records; alert on count growth.

**Why they get stuck:** Only happy-path afterEach; no backstop.

**Why the interviewer asks this:** D19-style production hygiene at framework level.

**Common wrong answer:** Manual DB cleanup script run "when someone remembers."

**Real project example:** Shared staging DB: sweeper + prefix reduced orphans 12k → 0 in one week.

**Follow-up questions:** - CI kill mid-test?
- Shared env isolation?
- Legal/data retention?

### FW-S-13. Design PR smoke vs nightly regression tiers for 3,000 tests.

**Think first:** - Tags?
- Projects?
- Quarantine?

**Ideal approach:** @smoke grep on PR (~10–15 min); full regression nightly with sharding; @quarantine excluded from merge gate with ticket+owner+expiry.

**Why they get stuck:** Full suite on every PR or no tests on PR.

**Why the interviewer asks this:** Org-scale CI strategy.

**Common wrong answer:** Retry until green on PR with 5 retries — masks debt.

**Real project example:** PR: chromium smoke 180 tests; nightly: 4 shards × 3 browsers, merge-reports html.

**Follow-up questions:** - Who owns tag list?
- New test default tier?
- Quarantine metrics?

### FW-S-14. Nightly suite still 45 minutes after workers maxed on one machine. Next step?

**Think first:** - Workers vs shards?
- Blob merge?
- Isolation prerequisite?

**Ideal approach:** Verify parallel-safe tests; horizontal sharding with blob reporter; merge-reports; tune slow files; smoke on PR. Consider timing-aware orchestrator at 10k+.

**Why they get stuck:** Conflate workers with shards; shard before fixing shared data.

**Why the interviewer asks this:** D3 scaling execution — architect favorite.

**Common wrong answer:** Buy bigger machine only — vertical limit hits.

**Real project example:** 4-shard GitHub matrix + merge; 45 min → 14 min wall clock.

**Follow-up questions:** - Unbalanced shards?
- Trace storage cost?
- Test impact analysis later?

### FW-S-15. Flaky tests break every team's merge. Quarantine policy?

**Think first:** - Threshold?
- Owner?
- Retries vs quarantine?

**Ideal approach:** Define flaky threshold; quarantine with ticket ID, owner, expiry; exclude from gate but run nightly; CI retries 1–2 max with trace on-first-retry; visible quarantine count.

**Why they get stuck:** Increase retries to 5; no ownership.

**Why the interviewer asks this:** D5 governance — lead level.

**Common wrong answer:** Delete flaky tests without triage.

**Real project example:** Quarantine dashboard in CI summary; count dropped 28 → 6 in one quarter with owners.

**Follow-up questions:** - Retry vs product bug?
- Trace-first workflow?
- Re-entry criteria?

### FW-S-16. You join with zero automation. Design framework to thousands of tests — what do you NOT build?

**Think first:** - Year one restraint?
- Playwright already provides?
- Checkpoints for scale?

**Ideal approach:** No custom runner, BaseTest inheritance, hand-rolled parallelism, plugin architecture, or Screenplay without org buy-in. DO build: folders, fixtures, thin POM/components, storageState auth, env config, tags, lint.

**Why they get stuck:** Over-abstract day one; cannot name deferred items.

**Why the interviewer asks this:** D1 architect question — restraint separates seniors.

**Common wrong answer:** "We'll build our own Selenium-compatible layer for portability."

**Real project example:** ADR-001 listed deferred items; revisited at 500 and 5k tests — avoided 6-month framework rewrite.

**Follow-up questions:** - When add shared npm package?
- Component objects threshold?
- BDD layer?

### FW-S-17. 100 teams depend on your shared framework. Ship breaking fixture API change how?

**Think first:** - Semver?
- Deprecation window?
- Codemod?

**Ideal approach:** Major version bump; old+new coexist with deprecation warning; migration guide; teams opt-in schedule; no flag-day across 100 teams.

**Why they get stuck:** Silent breaking change merged Friday.

**Why the interviewer asks this:** D25 internal product thinking.

**Common wrong answer:** Email "please update" without version or timeline.

**Real project example:** @corp/playwright-fixtures v3 removed `login()` fixture — v2 supported 90 days; codemod for rename.

**Follow-up questions:** - RFC process?
- Compatibility test suite?
- D27 blast radius?

### FW-S-18. 15 teams use POM, Screenplay, and raw tests in one shared repo. Fix without rewrite.

**Think first:** - Convergence?
- Lint?
- Reference impl?

**Ideal approach:** Platform picks one pattern (thin POM + fixtures); reference implementation; lint/review flags deviation; incremental migration when teams touch code — not stop-the-world.

**Why they get stuck:** Build adapters supporting all three forever.

**Why the interviewer asks this:** D26 pattern anarchy.

**Common wrong answer:** Mandate rewrite freeze for 6 months.

**Real project example:** Screenplay team migrated hottest 20 specs first; lint blocked new Screenplay imports.

**Follow-up questions:** - Extension points?
- Team autonomy limits?
- mergeTests split?

### FW-S-19. Security bans persisting auth cookies to disk. Redesign suite auth.

**Think first:** - storageState alternative?
- API token in memory?
- Talk to security?

**Ideal approach:** API auth per worker in memory; short-lived test credentials; or security-approved encrypted store — explicit conversation; never ignore requirement.

**Why they get stuck:** Insist storageState is the only way.

**Why the interviewer asks this:** D23 real constraint.

**Common wrong answer:** Write storageState to /tmp and claim compliance.

**Real project example:** Worker fixture obtains JWT via API; injects via addInitScript; no disk persistence; security signed off.

**Follow-up questions:** - MFA bypass?
- Token refresh?
- Trace leakage?

### FW-S-20. CI test bill tripled. Cut cost without dropping coverage.

**Think first:** - Tiering?
- Matrix scope?
- Cache?
- Shard efficiency?

**Ideal approach:** Audit: full cross-browser on every commit → move to nightly; cache browsers; right-size workers; smoke on PR; track cost per run; avoid over-sharding small suites.

**Why they get stuck:** More parallelism everywhere — same bill driver.

**Why the interviewer asks this:** D28 platform economics.

**Common wrong answer:** Delete regression tier entirely.

**Real project example:** Moved firefox/webkit to weekly; PR chromium smoke only; bill −55%, coverage unchanged on schedule.

**Follow-up questions:** - Visual tests tier?
- Cloud vs self-host?
- Test impact analysis ROI?
