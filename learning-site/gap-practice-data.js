window.GAP_ANTIPATTERNS = [
  {
    id: 'ap1',
    title: 'Hard sleep login',
    bad: `await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForTimeout(3000);
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    issues: ['waitForTimeout', 'non-retrying race'],
    fix: `await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    explain: 'Web-first expect retries; sleeps are both slow and flaky on CI.',
  },
  {
    id: 'ap2',
    title: 'Missing await',
    bad: `page.getByTestId('bank-login').click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    issues: ['floating promise', 'missing await'],
    fix: `await page.getByTestId('bank-login').click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    explain: 'Floating promises race the assertion — enable no-floating-promises lint.',
  },
  {
    id: 'ap3',
    title: 'Brittle CSS + shared user',
    bad: `await page.locator('div.bank-auth > button:nth-child(3)').click();
// every worker uses apex_user mutating the same savings row`,
    issues: ['brittle selector', 'shared mutable data'],
    fix: `await page.getByTestId('bank-login').click();
// unique account per worker via factory / API seed`,
    explain: 'Role/testid locators + unique data prevent CI collisions.',
  },
  {
    id: 'ap5',
    title: 'Reload loses frame locator',
    bad: `const frame = page.frameLocator('#pay-iframe');
await frame.getByLabel('Card').fill('4111');
await page.reload();
await frame.getByLabel('Card').fill('4111'); // often flakes`,
    issues: ['non-retrying race', 'brittle selector'],
    fix: `await page.reload();
const frame = page.frameLocator('#pay-iframe');
await frame.getByLabel('Card').fill('4111');`,
    explain: 'Re-acquire frame locators after navigation/reload — stale frame handles are a common flake source.',
  },
];

window.GAP_STAR_PROMPTS = [
  { id: 's1', q: 'A developer disagreed that your finding was a bug. What did you do?' },
  { id: 's2', q: 'Convince a team to invest in automation when a release deadline is tight.' },
  { id: 's3', q: 'Communicate quality risk to a non-technical stakeholder.' },
  { id: 's4', q: 'Advocate for testing time vs shipping this Friday.' },
  { id: 's5', q: 'Mentor a junior who keeps adding waitForTimeout.' },
  { id: 's6', q: 'A flaky suite destroyed trust in CI. How did you recover it?' },
];

window.GAP_MOCK_QUESTIONS = [
  {
    q: 'A test passes locally but fails in CI on “element not found.” Walk your diagnosis.',
    followUps: ['Why not add a 5s sleep?', 'What does the trace show you first?'],
    rubric: {
      technical: 'iframe/shadow/strict mode/actionability; trace first',
      coverage: 'mentions env diffs (data, parallel, banners)',
      clarity: 'ordered steps',
      practices: 'rejects waitForTimeout as fix',
    },
  },
  {
    q: 'How do you structure auth for 200 UI tests?',
    followUps: ['Setup project vs beforeEach UI login?', 'How do roles stay isolated?'],
    rubric: {
      technical: 'storageState + setup project dependencies',
      coverage: 'admin/viewer/anon states',
      clarity: 'speed vs journey coverage trade-off',
      practices: '.auth gitignored',
    },
  },
  {
    q: 'Design automation for a microservices checkout.',
    followUps: ['Where do contracts fit?', 'What stays in Playwright E2E?'],
    rubric: {
      technical: 'Pact/API + thin E2E journeys',
      coverage: 'critical path only in UI',
      clarity: 'pyramid language',
      practices: 'avoid ice-cream cone',
    },
  },
  {
    q: 'OTP expires in 60s — how do you test it without sleeping?',
    followUps: ['What if expiry is server-side?'],
    rubric: {
      technical: 'page.clock / API stub',
      coverage: 'valid + expired paths',
      clarity: 'Bank Demo TTL example',
      practices: 'no waitForTimeout(60000)',
    },
  },
  {
    q: 'Healer agent skipped 12 tests overnight. Green build — ship?',
    followUps: ['How does skip change signal?'],
    rubric: {
      technical: 'healer skip governance',
      coverage: 'review skips as failures until proven',
      clarity: 'AI scaffolds humans own',
      practices: 'no silent coverage loss',
    },
  },
];

window.GAP_POSTMORTEMS = [
  {
    id: 'knight',
    title: 'Knight Capital (Aug 1, 2012)',
    blurb: 'Untested deployment of dormant “Power Peg” code on 1 of 8 servers. SEC Order 34-70694: millions of child orders in ~45 minutes; ~$3.5B long / ~$3.15B short; ~$460M loss + $12M penalty.',
    prompt: 'What test/process controls would you require before a trading deploy script can touch production?',
  },
  {
    id: 'crowdstrike',
    title: 'CrowdStrike (July 19, 2024)',
    blurb: 'IPC template expected 21 inputs; integration supplied 20 — wildcard matching hid the mismatch. Microsoft estimate ~8.5M Windows devices. No canary/staged rollout.',
    prompt: 'How would you test config/content updates that bypass normal app binaries?',
  },
  {
    id: 'ariane',
    title: 'Ariane 5 Flight 501 (1996)',
    blurb: '64-bit float → 16-bit signed integer overflow in reused inertial code never tested under Ariane-5 trajectories. Failure ~37s after ignition; >$370M.',
    prompt: 'How do you test reused components under new operational envelopes?',
  },
  {
    id: 'therac',
    title: 'Therac-25 (1985–87)',
    blurb: 'Race conditions; software replaced hardware interlocks without adequate V&V (Leveson & Turner).',
    prompt: 'When is “we have unit tests” insufficient for safety-critical control software?',
  },
  {
    id: 'max',
    title: 'Boeing 737 MAX / MCAS',
    blurb: 'Single AoA sensor design + certification downplay limited scrutiny (DOT OIG). 346 deaths across accidents.',
    prompt: 'How should test strategy change when a feature is safety-related but marketed as minor?',
  },
];

window.GAP_TRACE_CHECKLIST = [
  { id: 't1', text: 'Which action timed out — and what does the DOM snapshot show at that step?' },
  { id: 't2', text: 'Did a network call 4xx/5xx or never fire?' },
  { id: 't3', text: 'Console errors before the failure?' },
  { id: 't4', text: 'Is the locator strict-mode ambiguous in the snapshot?' },
  { id: 't5', text: 'Would a web-first assertion replace a sleep/race?' },
];
