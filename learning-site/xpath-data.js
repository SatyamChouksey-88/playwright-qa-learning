/* XPath for Playwright — theory, challenges, interview Q&A (self-contained) */
window.XPATH_DATA = {
  hub: {
    title: "XPath for Playwright",
    lead: "Learn XPath deeply for interviews and legacy apps — then prefer Playwright’s role/label/testid locators in new suites. Absolute vs relative, axes, predicates, flaky XPath fixes, and live practice — all on this site.",
  },

  theory: [
    {
      h: "What is XPath?",
      p: `XPath (XML Path Language) navigates a document tree with path expressions. In browsers it works on the HTML DOM. Playwright supports it via <code>page.locator('xpath=...')</code> or shortcuts starting with <code>//</code> / <code>..</code>. Prefer <code>getByRole</code> / <code>getByLabel</code> / <code>getByTestId</code> first; use XPath when structure or text relationships are the only stable handle.`
    },
    {
      h: "Absolute vs relative XPath",
      p: `<strong>Absolute</strong> starts from root (<code>/html/body/div[2]/form/input</code>) — brittle when layout shifts.<br>
      <strong>Relative</strong> starts anywhere (<code>//button[@type='submit']</code>) — more resilient.<br>
      Best practice: short, unique, relative expressions anchored on stable attributes or visible text.`
    },
    {
      h: "Core syntax (cheat sheet)",
      p: `<table>
        <tr><th>Expression</th><th>Meaning</th></tr>
        <tr><td><code>//button</code></td><td>Any button anywhere</td></tr>
        <tr><td><code>//div[@id='x']</code></td><td>div with id=x</td></tr>
        <tr><td><code>//input[@name='email']</code></td><td>attribute equals</td></tr>
        <tr><td><code>//*[contains(@class,'btn')]</code></td><td>partial class (dynamic CSS modules)</td></tr>
        <tr><td><code>//button[normalize-space()='Save']</code></td><td>visible text, trimmed</td></tr>
        <tr><td><code>//a[contains(text(),'Docs')]</code></td><td>partial text</td></tr>
        <tr><td><code>//ul/li[1]</code></td><td>first li (1-based!)</td></tr>
        <tr><td><code>//ul/li[last()]</code></td><td>last li</td></tr>
        <tr><td><code>//div[@data-id]/span</code></td><td>has attribute data-id</td></tr>
        <tr><td><code>//book|//cd</code></td><td>union of node sets</td></tr>
      </table>`
    },
    {
      h: "Axes (relationships)",
      p: `Axes walk the tree from a context node — think of it as “from where I am, which direction do I look?”<br>
      <table>
        <tr><th>Axis</th><th>Selects</th><th>Example</th></tr>
        <tr><td><code>parent::</code></td><td>The one node directly above (exactly 1 or 0 results)</td><td><code>//td[text()='Ada']/parent::tr</code></td></tr>
        <tr><td><code>child::</code></td><td>Direct children, one level down (default for <code>/</code>)</td><td><code>//tbody/child::tr</code> = <code>//tbody/tr</code></td></tr>
        <tr><td><code>ancestor::</code></td><td>Every node above, all the way to <code>html</code></td><td><code>//span[@class='btn02']/ancestor::form</code></td></tr>
        <tr><td><code>descendant::</code></td><td>Every node below, any depth (like <code>//</code> from here)</td><td><code>//form/descendant::input</code></td></tr>
        <tr><td><code>following-sibling::</code></td><td>Siblings that appear <em>after</em> this node, same parent</td><td><code>//label[text()='Email']/following-sibling::input[1]</code></td></tr>
        <tr><td><code>preceding-sibling::</code></td><td>Siblings that appear <em>before</em> this node, same parent</td><td><code>//input[@id='pass']/preceding-sibling::label</code></td></tr>
        <tr><td><code>following::</code></td><td>Every node later in document order (any branch)</td><td><code>//label[text()='Email']/following::input[1]</code></td></tr>
        <tr><td><code>preceding::</code></td><td>Every node earlier in document order (any branch)</td><td><code>//button/preceding::h2[1]</code></td></tr>
        <tr><td><code>self::</code></td><td>The context node itself — used to filter, e.g. <code>not(self::script)</code></td><td><code>//*[not(self::script)]</code></td></tr>
        <tr><td><code>ancestor-or-self::</code> / <code>descendant-or-self::</code></td><td>Same as ancestor/descendant but include the node itself too</td><td>rare; mostly generated XPath</td></tr>
      </table>
      <p class="muted" style="margin:8px 0 0"><strong>parent</strong> vs <strong>ancestor</strong>: parent is exactly one step up; ancestor is <em>every</em> step up to the root. <strong>child</strong> vs <strong>descendant</strong>: child is exactly one step down; descendant is every level below. Prefer <code>descendant::</code> / <code>//</code> over long <code>div/div/div</code> chains — fewer break points when markup inserts a wrapper.</p>
      <p class="muted" style="margin:6px 0 0">👉 Play with every axis hands-on in the <strong>Axis navigator</strong> just below — click a node, click an axis, watch exactly which elements light up.</p>`
    },
    {
      h: "XPath inside iframes (and why it silently fails)",
      p: `A page's main document and each <code>&lt;iframe&gt;</code>'s content are <strong>separate DOM documents</strong>. An XPath like <code>//button[text()='Pay']</code> only ever searches the document it is evaluated against — it never automatically reaches into an iframe, no matter how you write the expression. This is the #1 cause of “element not found” on payment widgets, embedded chat, and third-party checkouts.<br>
      <pre><code data-lang="ts">// ❌ Wrong — searches the top-level document only, iframe content is invisible here
await page.locator("xpath=//button[text()='Pay']").click();

// ✅ Right — step into the frame first, then use XPath (or any locator) inside it
const frame = page.frameLocator('#payment-iframe');
await frame.locator("xpath=//button[text()='Pay']").click();

// nested iframes chain the same way
page.frameLocator('#outer').frameLocator('#inner').locator("xpath=//input");</code></pre>
      <p class="muted" style="margin:6px 0 0">See it fail and succeed live in the <strong>iframe demo</strong> further down this page. Full frame/tab/dialog coverage lives in the <a href="#" data-go="frames">Frames, tabs, dialogs</a> section.</p>`
    },
    {
      h: "XPath locators inside a Page Object Model (POM)",
      p: `XPath strings should never be typed directly inside a spec file. Store each locator once, as a <code>readonly Locator</code> on the page object — exactly like a <code>getByRole</code> locator — so a markup change means editing one class instead of every test that touches that element.<br>
      <pre><code data-lang="ts">// pages/LegacyGrid.ts — XPath is the last resort, wrapped once
import { type Page, type Locator } from '@playwright/test';

export class LegacyGrid {
  readonly page: Page;
  // Prefer role/testid first; fall back to XPath only when the DOM gives no better hook
  readonly editButtonForAda: Locator;
  readonly activePlanCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editButtonForAda = page.locator("xpath=//tr[td[contains(.,'Ada')]]//button[contains(.,'Edit')]");
    this.activePlanCards  = page.locator("xpath=//div[@data-plan and not(.//span[text()='Removed'])]");
  }

  async editAda() {
    await this.editButtonForAda.click();
  }
}</code></pre>
      <p class="muted" style="margin:6px 0 0">Rules of thumb: expose <code>Locator</code>s, not raw strings · one XPath per property, never inline in a spec · re-check the expression whenever the wrapped component's markup changes. Full pattern (base page, components, fixtures) is in the <a href="#" data-go="pom">Page Object Model</a> section.</p>`
    },
    {
      h: "Setting up Playwright to practice XPath locally",
      p: `You do not need this whole site to try real XPath against a real browser — three commands get you a sandbox:
      <pre><code data-lang="bash"># 1. scaffold a project (choose TypeScript + install browsers when asked)
npm init playwright@latest

# 2. open Codegen against any page — click elements, it records locators for you
npx playwright codegen https://demo.playwright.dev/todomvc

# 3. inside Codegen's picker, switch the locator style to "xpath" to see/copy
#    the exact expression Playwright would use for the element you clicked</code></pre>
      <p class="muted" style="margin:6px 0 0">Quick sanity-check without any project at all: open DevTools Console on any page and run <code>$x("//button[@type='submit']")</code> — it returns the matching array instantly, same engine Playwright uses under the hood. Full install walkthrough: <a href="#" data-go="setup">Install &amp; project setup</a>.</p>`
    },
    {
      h: "XPath locators in CI/CD pipelines",
      p: `XPath itself does not behave differently in CI — but CI amplifies whatever fragility was already hiding in the expression: more parallel workers hitting shared dynamic ids, slower/headless machines racing animations, and preview/staging environments injecting extra A/B-test wrapper divs that shift ancestor chains.<br>
      <ul class="tight">
        <li><strong>Before merging</strong>, run <code class="inline">npx playwright test --repeat-each=5</code> on anything with a fresh/complex XPath — it's the cheapest flake detector you have.</li>
        <li><strong>Turn on artefacts</strong> for the pipeline: <code class="inline">trace: 'on-first-retry'</code> plus screenshots, so a failing XPath shows you the DOM at the moment of failure instead of a bare timeout.</li>
        <li><strong>Keep CI green by fixing the locator</strong>, not by adding retries/sleeps — retries hide a real selector or timing bug that will resurface as the suite grows.</li>
        <li><strong>Prefer role/testid in anything new</strong>; treat XPath as a deliberate, reviewed exception in a PR, not a default.</li>
      </ul>
      <p class="muted" style="margin:6px 0 0">Pipeline config, sharding, Docker images and reporting all live in the <a href="#" data-go="ci">CI/CD &amp; Docker</a> section.</p>`
    },
    {
      h: "Playwright API",
      p: `<pre><code data-lang="ts">// Explicit
page.locator('xpath=//button[@type="submit"]');
// Shortcut (string starting with // or ..)
page.locator('//button[@type="submit"]');
// Combine with Playwright filters
page.locator('//tr').filter({ hasText: 'Ada' }).locator('xpath=.//button');
// Still prefer when possible:
page.getByRole('button', { name: 'Submit' });</code></pre>`
    },
    {
      h: "Good XPath = unique + resilient + short",
      p: `Unique: matches one intended node. Resilient: survives class renames / wrapper divs. Short: easier to read and debug. Avoid absolute paths, positional <code>[2]</code> when business text exists, and <code>//* [contains(text(),'x')]</code> that accidentally matches <code>&lt;script&gt;</code> nodes.`
    }
  ],

  pitfalls: [
    {
      title: "Flaky / sometimes works",
      think: "XPath is wrong randomly.",
      actual: "Usually timing (AJAX), dynamic ids (ext-element-123), or long brittle chains. Same expression fails when DOM isn’t ready or structure shifted.",
      fix: "Use Playwright auto-wait on locators; shorten with // / descendant::; anchor on stable attrs/text; avoid sleeping."
    },
    {
      title: "InvalidSelector / syntax",
      think: "Browser hates my XPath.",
      actual: "Mismatched quotes/brackets, normalise-space typo (use normalize-space), ends-with (XPath 2 — browsers are XPath 1), trailing /div/ junk.",
      fix: "Validate in DevTools $x('...'). Fix quotes; use contains() instead of ends-with."
    },
    {
      title: "not() used as a node name",
      think: "//div//not(.//span[text()='Removed'])",
      actual: "not must be a predicate function on the node you filter.",
      fix: "//div[@data-id and not(.//span[text()='Removed'])]"
    },
    {
      title: "Same XPath for multiple dropdowns",
      think: "Add [1] inside the wrong place.",
      actual: "Index the whole match set: (//div[@name='expiryDate']//i)[1] vs [2], or scope from a unique parent, or locator.nth(0) in Playwright.",
      fix: "Parent scope > index. Index as last resort."
    },
    {
      title: "Dynamic class names (React/CSS modules)",
      think: "Exact @class='qzc7p submit-button' forever.",
      actual: "Hash prefixes change every build.",
      fix: "//button[contains(@class,'submit-button')] or better: role/name/testid."
    },
    {
      title: "Matches script text",
      think: "My div vanished; XPath found nothing useful.",
      actual: "//*[contains(text(),'test text')] briefly matched a script node that was removed.",
      fix: "//*[not(self::script) and contains(text(),'test text')] or target //div[...]."
    },
    {
      title: "Chrome finds it, Firefox click fails",
      think: "XPath broken in Firefox.",
      actual: "Element was found; another overlay intercepted the click (loading modal).",
      fix: "Wait for overlay hidden; Playwright actionability already helps — assert spinner gone."
    },
    {
      title: "Iframe / Shadow DOM",
      think: "XPath from root should pierce everything.",
      actual: "Frames are separate documents; closed shadow is sealed.",
      fix: "Playwright: frameLocator then locate; open shadow is pierced by normal locators — don’t confuse with XPath-only thinking."
    },
    {
      title: "parent:: vs ancestor:: confusion",
      think: "Both just mean “go up”, so either works.",
      actual: "parent:: is exactly one step up (0 or 1 node). ancestor:: returns every node above, up to <html> — easy to over-match a distant wrapper.",
      fix: "Need the immediate parent? Use parent:: or /.. . Need “some container above”? Use ancestor::tag[1] for the nearest match, or a more specific ancestor predicate."
    },
    {
      title: "Works locally, fails in CI only",
      think: "CI “breaks XPath”.",
      actual: "Usually shared dynamic data across workers, slower headless timing, or staging markup (banners/experiments) that inserts wrappers into your ancestor chain.",
      fix: "Enable trace: 'on-first-retry'; re-check the DOM in the trace; prefer short relative XPath / role locators; avoid sleeping — fix the locator or isolation."
    }
  ],

  challenges: [
    {
      id: "xp-c1",
      name: "Relative submit button",
      goal: "Write a relative XPath for the Submit button with type=submit (not absolute /html/...).",
      answer: "//button[@type='submit']",
      why: "Relative + stable attribute beats absolute path."
    },
    {
      id: "xp-c2",
      name: "Partial dynamic class",
      goal: "Match the button whose class contains submit-btn (hash prefix may change).",
      answer: "//button[contains(@class,'submit-btn')]",
      why: "contains(@class,...) survives CSS-module prefixes."
    },
    {
      id: "xp-c3",
      name: "Label → nested input",
      goal: "From the Email label, reach its related input (nested under the label).",
      answer: "//label[contains(.,'Email')]//input",
      why: "Relationship XPath beats absolute /html/... when for/id pairing is messy."
    },
    {
      id: "xp-c3b",
      name: "following-sibling axis",
      goal: "From label Company, select the input that is its following sibling.",
      answer: "//label[normalize-space()='Company']/following-sibling::input[1]",
      why: "Axes (following-sibling) express layout relationships Selenium/Playwright interviews love."
    },
    {
      id: "xp-c4",
      name: "Table row by cell text",
      goal: "Click Edit in the row that contains Ada (no hard-coded tr[2]).",
      answer: "//tr[td[contains(.,'Ada')]]//button[contains(.,'Edit')]",
      why: "Business text filter > positional index."
    },
    {
      id: "xp-c5",
      name: "Exclude Removed plans",
      goal: "Select plan cards that do NOT contain a Removed badge.",
      answer: "//div[@data-plan and not(.//span[text()='Removed'])]",
      why: "`not()` belongs in a predicate on the plan node."
    },
    {
      id: "xp-c6",
      name: "Second duplicate icon",
      goal: "Two identical icons share the same XPath — target the second.",
      answer: "(//button[@data-icon='more'])[2]",
      why: "Wrap expression then index the node-set; or scope by parent."
    },
    {
      id: "xp-c7",
      name: "Invalid XPath quiz",
      goal: "Which is invalid in browser XPath 1.0? ends-with vs contains / normalize-space typo.",
      answer: "//label[ends-with(text(),'Email')]",
      why: "`ends-with` is XPath 2; browsers use XPath 1 — use contains()."
    },
    {
      id: "xp-c8",
      name: "Avoid script false match",
      goal: "Find visible text 'promo' without matching script tags.",
      answer: "//*[not(self::script) and contains(normalize-space(.),'promo')]",
      why: "Generic //* + text() can hit scripts during hydration."
    },
    {
      id: "xp-c9",
      name: "Ancestor jump (Removed plan)",
      goal: "From the 'Removed' badge, select the plan card that contains it (its ancestor div[data-plan]) — not just the badge.",
      answer: "//span[contains(@class,'removed')]/ancestor::div[@data-plan][1]",
      why: "ancestor:: walks up every level to the root; [1] picks the nearest matching ancestor, not the outer page wrapper."
    },
    {
      id: "xp-c10",
      name: "Explicit child axis",
      goal: "Select the table's row elements using the explicit child:: axis instead of the // shortcut.",
      answer: "//tbody/child::tr",
      why: "child:: is exactly what a single / already means — writing it out is identical to //tbody/tr but shows you understand the underlying axis, a common interview follow-up."
    }
  ],

  interview: [
    {
      q: "When should you use XPath in Playwright vs getByRole?",
      a: `Prefer getByRole/label/text/testid. Use XPath when you need complex tree relationships (parent/sibling axes), legacy DOM without a11y names, or migrating Selenium suites. Interview signal: you know XPath but don’t default to it.`
    },
    {
      q: "Absolute vs relative XPath — which and why?",
      a: `Relative (//...) — shorter and survives layout inserts. Absolute (/html/body/...) breaks when any ancestor changes. Good XPath: unique, resilient, short.`
    },
    {
      q: "Same XPath matches two dropdowns. How do you disambiguate?",
      a: `Scope from a unique parent; or \`(//...)[1]\` / \`(//...)[2]\`; or Playwright \`locator.nth(0)\`. Prefer parent scope over indexes.`
    },
    {
      q: "XPath works in DevTools but flakes in the test. Why?",
      a: `Timing (element not ready), dynamic attributes, overlay intercepting click, iframe context, or matching a transient node (script). Fix waits/context — not sleep hacks.`
    },
    {
      q: "How do you handle dynamic React class names in XPath?",
      a: `contains(@class,'stable-token') or better switch to role/testid. Never hardcode hashed full class strings.`
    },
    {
      q: "Explain following-sibling with an example.",
      a: `//label[text()='Password']/following-sibling::input[1] — input that is a sibling after the label. Useful when for/id association is missing.`
    },
    {
      q: "What’s wrong with //input[@id='pass']div ?",
      a: `Missing axis/step separator — invalid syntax. Should be //input[@id='pass']/div or //input[@id='pass']//div.`
    },
    {
      q: "How does Playwright express XPath?",
      a: `page.locator('xpath=//...') or page.locator('//...'). Still auto-waits. Can chain .filter() and other locators.`
    },
    {
      q: "XPath found the element but click fails in Firefox only.",
      a: `Often ElementClickIntercepted — overlay/spinner. Wait for obscurer to hide. Not an XPath engine difference in most cases.`
    },
    {
      q: "Can XPath pierce iframes or closed shadow roots?",
      a: `No for separate frame documents — switch frame first (frameLocator). Open shadow: Playwright locators pierce; closed shadow needs app support. Don’t expect one root XPath to magically enter frames.`
    },
    {
      q: "Write XPath: button Submit inside span.button02",
      a: `//span[@class='button02']//button[contains(normalize-space(.),'Submit')] — parent scope beats //button[2].`
    },
    {
      q: "How do you debug a failing XPath quickly?",
      a: `DevTools $x('expr'); simplify segments; check quotes/brackets; refresh and re-test dynamic ids; confirm iframe/shadow; exclude scripts; compare with getByRole alternative.`
    },
    {
      q: "What exactly is the difference between the parent and ancestor axes?",
      a: `parent:: returns exactly the one node directly above the context node (0 or 1 result). ancestor:: returns every node above it, all the way up to <html> — parent, grandparent, great-grandparent, etc. If you only need one specific level, use parent:: (or //x/y); if you need "somewhere above, don't care how far", use ancestor::.`
    },
    {
      q: "What is the difference between child:: and descendant::?",
      a: `child:: (same as a single /) matches only direct children, one level down. descendant:: (same as //) matches every node nested at any depth below. //div/p finds <p> that is an immediate child of <div>; //div//p finds a <p> anywhere inside the <div>, no matter how many wrapper elements are in between.`
    },
    {
      q: "Does the // operator search inside iframes?",
      a: `No. // only searches within the document it is evaluated against. An <iframe> is a completely separate Document — Playwright's page.locator('//...') never crosses into it. You must switch context with page.frameLocator('#id') first, then locate (with XPath or any other engine) inside that frame.`
    },
    {
      q: "How should XPath locators be stored in a Page Object Model?",
      a: `Exactly like any other locator: as a readonly Locator built once in the page object's constructor (e.g. this.editBtn = page.locator("xpath=//tr[...]//button")), never as a raw string typed inside a spec file. That way a markup change means editing one class, and the spec still reads as user intent.`
    },
    {
      q: "Your XPath-based suite is flaky only in CI, never locally. What do you check first?",
      a: `Parallel workers colliding on shared/dynamic test data or ids that differ per run; headless timing on a slower CI machine racing an animation your local Chrome finishes instantly; and whether the CI/staging build injects extra experiment or consent-banner markup that shifts an ancestor chain your XPath relied on. Turn on trace: 'on-first-retry' before guessing further.`
    },
    {
      q: "How would you quickly prototype an XPath expression without writing a test file?",
      a: `Open DevTools Console on the target page and run $x("//button[@type='submit']") — it evaluates instantly with the same engine Playwright uses. For something closer to real automation, npx playwright codegen <url> lets you click elements and copy the locator (switchable to XPath) it recorded.`
    },
    {
      q: "What do ancestor-or-self:: and descendant-or-self:: do?",
      a: `Same as ancestor:: / descendant:: but the result also includes the context node itself, not just the nodes above/below it. They're rare to hand-write but show up in generated/legacy XPath, so recognizing them is an easy interview point.`
    },
    {
      q: "From a table cell's text, how do you reach a button in a different cell of the same row?",
      a: `Go up out of the cell with parent::, then back down with //: //td[text()='Ada']/parent::tr//button. This "up-then-down" pattern (cell → row → sibling cell's button) is one of the most common real-world XPath interview questions.`
    }
  ]
};
