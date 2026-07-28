/* ---------------- Progress (localStorage) ---------------- */
const STUDY_KEY = 'pw-study-checklist';
const PRACTICE_KEY = 'pw-interview-practiced';
const PLAY_DONE_KEY = 'pw-playground-done';
const MINI_DONE_KEY = 'pw-miniapps-done';
const HUB_DONE_KEY = 'pw-hub-done';
const ASSESS_DONE_KEY = 'pw-assess-done';
const XPATH_DONE_KEY = 'pw-xpath-done';
const SKILLS_DONE_KEY = 'pw-skills-practice-done';

const STUDY_ITEMS = [
  { id: 'home', label: 'Overview / mental model' },
  { id: 'whats-new', label: "What's new (1.49–1.62)" },
  { id: 'deprecated', label: 'Deprecated & discouraged' },
  { id: 'setup', label: 'Install & first project' },
  { id: 'locators', label: 'Locators' },
  { id: 'xpath', label: 'XPath deep dive' },
  { id: 'waiting', label: 'Auto-waiting & timeouts' },
  { id: 'actions', label: 'Actions (incl. drop)' },
  { id: 'frames', label: 'Frames, tabs, dialogs' },
  { id: 'clipboard', label: 'Clipboard & copy/paste' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'pom', label: 'POM ↔ fixtures trade-off' },
  { id: 'auth', label: 'Authentication & storage' },
  { id: 'clock', label: 'Clock API' },
  { id: 'webauthn', label: 'WebAuthn / passkeys' },
  { id: 'visual', label: 'Visual, ARIA & a11y' },
  { id: 'agents-mcp', label: 'Agents, MCP & CLI' },
  { id: 'component-testing', label: 'Component testing (experimental)' },
  { id: 'network', label: 'Network mocking' },
  { id: 'ci', label: 'CI/CD & sharding' },
  { id: 'mistakes', label: 'Anti-patterns & mistakes' },
  { id: 'flake', label: 'Flake triage playbook' },
  { id: 'playground', label: 'UI Practice Lab (elements)' },
  { id: 'playground-qa', label: 'Practice elements Q&A' },
  { id: 'elements-hub', label: 'Elements Hub (advanced widgets)' },
  { id: 'miniapps', label: 'Mini-app challenges' },
  { id: 'miniapps-qa', label: 'Mini-app interview Q&A' },
  { id: 'bank-demo', label: 'Bank Demo E2E app' },
  { id: 'assessments', label: 'Assessments workbook' },
  { id: 'interview', label: 'Interview hub (start Tier A)' },
  { id: 'interview-essentials', label: 'Interview essentials (HR / QA / BDD / Git)' },
  { id: 'quiz', label: 'Finish the quiz (≥80%)' },
];

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}
function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

let practiced = loadSet(PRACTICE_KEY);
let studyDone = loadSet(STUDY_KEY);
let playDone = loadSet(PLAY_DONE_KEY);
let miniDone = loadSet(MINI_DONE_KEY);
let hubDone = loadSet(HUB_DONE_KEY);
let assessDone = loadSet(ASSESS_DONE_KEY);
let xpathDone = loadSet(XPATH_DONE_KEY);
let skillsDone = loadSet(SKILLS_DONE_KEY);

/* ---------------- UI Practice Lab (self-contained) ---------------- */
let playgroundLevel = 'All';

function renderPlayground() {
  const data = window.PLAYGROUND_DATA;
  if (!data) return;

  const title = document.getElementById('playgroundTitle');
  const lead = document.getElementById('playgroundLead');
  const ext = document.getElementById('playgroundExternal');
  const filters = document.getElementById('playgroundLevelFilters');
  const cards = document.getElementById('playgroundCards');
  const filterInput = document.getElementById('playgroundFilter');
  if (!cards) return;

  if (title) title.textContent = data.hub.title;
  if (lead) lead.textContent = data.hub.lead;
  if (ext) {
    ext.innerHTML = `<strong>How to practise here:</strong>
      Use the <em>live challenge</em> UI below each card → try the interaction yourself → click <em>Show solution</em> for the Playwright code → mark practiced.
      Then drill <a href="#playground-qa">Practice Q&amp;A</a> and <a href="#miniapps">Mini-app challenges</a>.`;
  }

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  if (filters) {
    filters.innerHTML = levels.map(l =>
      `<button type="button" class="pill jump level-pill ${playgroundLevel === l ? 'active' : ''}" data-level="${l}">${l}</button>`
    ).join('');
    filters.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        playgroundLevel = btn.dataset.level;
        filters.querySelectorAll('.level-pill').forEach(b => b.classList.toggle('active', b.dataset.level === playgroundLevel));
        paintPlaygroundCards();
      });
    });
  }

  filterInput?.addEventListener('input', paintPlaygroundCards);
  paintPlaygroundCards();
  renderPlaygroundQa();
}

function paintPlaygroundCards() {
  const data = window.PLAYGROUND_DATA;
  const cards = document.getElementById('playgroundCards');
  const q = (document.getElementById('playgroundFilter')?.value || '').trim().toLowerCase();
  if (!data || !cards) return;

  const list = data.elements.filter(el => {
    const levelOk = playgroundLevel === 'All' || el.level === playgroundLevel;
    const text = `${el.name} ${el.skill} ${el.goal} ${el.traps}`.toLowerCase();
    return levelOk && (!q || text.includes(q));
  });

  cards.innerHTML = list.map(el => {
    const done = playDone.has(el.id);
    return `
    <div class="card playground-card" data-id="${el.id}">
      <div class="pillrow" style="margin:0 0 8px">
        <span class="pill">${el.level}</span>
        <span class="pill">${el.skill}</span>
      </div>
      <h3 class="sub" style="margin-top:0">${el.name}</h3>
      <p class="lead"><strong>Challenge:</strong> ${el.goal}</p>
      <div class="live-challenge">
        <div class="live-label">Live challenge — practise here</div>
        <div data-widget="${el.id}"></div>
      </div>
      <details class="solution-reveal">
        <summary>Show solution</summary>
        <div class="solution-body">
          <pre><code data-lang="ts">${el.recipe.replace(/</g, '&lt;')}</code></pre>
          <p class="lead"><strong>Common trap:</strong> ${el.traps}</p>
        </div>
      </details>
      <button type="button" class="iconbtn mark-play ${done ? 'is-done' : ''}" data-play="${el.id}">${done ? 'Practiced ✓' : 'Mark practiced'}</button>
    </div>`;
  }).join('') || '<div class="card">No elements match this filter.</div>';

  enhanceCodeBlocks(cards);
  window.PracticeWidgets?.mount(cards);
  cards.querySelectorAll('[data-play]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.play;
      if (playDone.has(id)) playDone.delete(id);
      else playDone.add(id);
      saveSet(PLAY_DONE_KEY, playDone);
      paintPlaygroundCards();
    });
  });
}

function renderPlaygroundQa() {
  const data = window.PLAYGROUND_DATA;
  const list = document.getElementById('playgroundQaList');
  if (!data || !list) return;

  list.innerHTML = data.questions.map((item, i) => `
    <details class="qa" data-q="${escapeAttr(item.q)}">
      <summary>${i + 1}. ${item.q}</summary>
      <div class="body">${item.a}</div>
    </details>`).join('');

  enhanceCodeBlocks(list);

  const filter = document.getElementById('playgroundQaFilter');
  const countEl = document.getElementById('playgroundQaCount');
  const apply = () => {
    const q = (filter?.value || '').trim().toLowerCase();
    let shown = 0, total = 0;
    list.querySelectorAll('details.qa').forEach(d => {
      total++;
      const ok = !q || (d.dataset.q || '').toLowerCase().includes(q);
      d.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = `${shown}/${total} shown`;
  };
  filter?.addEventListener('input', apply);
  document.getElementById('playgroundQaExpand')?.addEventListener('click', () => {
    list.querySelectorAll('details.qa:not(.hidden)').forEach(d => { d.open = true; });
  });
  document.getElementById('playgroundQaCollapse')?.addEventListener('click', () => {
    list.querySelectorAll('details.qa').forEach(d => { d.open = false; });
  });
  apply();
}

/* ---------------- Mini-app challenges (self-contained) ---------------- */
function renderMiniapps() {
  const data = window.MINIAPPS_DATA;
  if (!data) return;

  const title = document.getElementById('miniappsTitle');
  const lead = document.getElementById('miniappsLead');
  const ext = document.getElementById('miniappsExternal');
  const list = document.getElementById('miniappsList');
  const filterInput = document.getElementById('miniappsFilter');
  if (!list) return;

  if (title) title.textContent = data.hub.title;
  if (lead) lead.textContent = data.hub.lead;
  if (ext) {
    ext.innerHTML = `<strong>How to practise here:</strong>
      Use the <em>live challenge</em> mini-app below → complete the task → click <em>Show solution</em> for Playwright code → mark solved.
      Pair with <a href="#miniapps-qa">Mini-app Q&amp;A</a> and <a href="#playground">UI Practice Lab</a>.`;
  }

  filterInput?.addEventListener('input', paintMiniapps);
  paintMiniapps();
  renderMiniappsQa();
}

function paintMiniapps() {
  const data = window.MINIAPPS_DATA;
  const list = document.getElementById('miniappsList');
  const q = (document.getElementById('miniappsFilter')?.value || '').trim().toLowerCase();
  if (!data || !list) return;

  const filtered = data.challenges.filter(ch => {
    const text = `${ch.name} ${ch.challenge} ${ch.skills.join(' ')} ${ch.tags.join(' ')} ${ch.why}`.toLowerCase();
    return !q || text.includes(q);
  });

  list.innerHTML = filtered.map((ch, i) => {
    const done = miniDone.has(ch.id);
    const skills = (ch.skills || []).map(s => `<span class="pill">${s}</span>`).join('');
    const tags = (ch.tags || []).map(t => `<span class="pill">#${t}</span>`).join('');
    return `
    <article class="card miniapp-card" data-id="${ch.id}">
      <div class="pillrow" style="margin:0 0 8px">${skills}${tags}</div>
      <h3 class="sub" style="margin-top:0">${i + 1}. ${ch.name}</h3>
      <p class="lead"><strong>Challenge:</strong> ${ch.challenge}</p>
      <div class="live-challenge">
        <div class="live-label">Live challenge — practise here</div>
        <div data-widget="${ch.id}"></div>
      </div>
      <details class="solution-reveal">
        <summary>Show solution</summary>
        <div class="solution-body">
          <pre><code data-lang="ts">${ch.solution.replace(/</g, '&lt;')}</code></pre>
          <p class="lead"><strong>Why this works:</strong> ${ch.why}</p>
        </div>
      </details>
      <button type="button" class="iconbtn mark-play ${done ? 'is-done' : ''}" data-mini="${ch.id}">${done ? 'Solved ✓' : 'Mark solved'}</button>
    </article>`;
  }).join('') || '<div class="card">No challenges match this filter.</div>';

  enhanceCodeBlocks(list);
  window.PracticeWidgets?.mount(list);
  list.querySelectorAll('[data-mini]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.mini;
      if (miniDone.has(id)) miniDone.delete(id);
      else miniDone.add(id);
      saveSet(MINI_DONE_KEY, miniDone);
      paintMiniapps();
    });
  });
}

function renderMiniappsQa() {
  const data = window.MINIAPPS_DATA;
  const list = document.getElementById('miniappsQaList');
  if (!data || !list) return;

  list.innerHTML = data.questions.map((item, i) => `
    <details class="qa" data-q="${escapeAttr(item.q)}">
      <summary>${i + 1}. ${item.q}</summary>
      <div class="body">${item.a}</div>
    </details>`).join('');

  enhanceCodeBlocks(list);

  const filter = document.getElementById('miniappsQaFilter');
  const countEl = document.getElementById('miniappsQaCount');
  const apply = () => {
    const q = (filter?.value || '').trim().toLowerCase();
    let shown = 0, total = 0;
    list.querySelectorAll('details.qa').forEach(d => {
      total++;
      const ok = !q || (d.dataset.q || '').toLowerCase().includes(q);
      d.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = `${shown}/${total} shown`;
  };
  filter?.addEventListener('input', apply);
  document.getElementById('miniappsQaExpand')?.addEventListener('click', () => {
    list.querySelectorAll('details.qa:not(.hidden)').forEach(d => { d.open = true; });
  });
  document.getElementById('miniappsQaCollapse')?.addEventListener('click', () => {
    list.querySelectorAll('details.qa').forEach(d => { d.open = false; });
  });
  apply();
}

/* ---------------- Elements Hub ---------------- */
let hubLevel = 'All';
const HUB_SOLUTIONS = {
  'hub-locator': `await expect(page.locator('#loc-by-id')).toBeVisible();
await expect(page.getByTestId('specific-test-id')).toBeVisible();
await expect(page.getByLabel('unique-aria-target')).toBeVisible();
await page.getByRole('button', { name: 'ExactTextTarget' }).click();`,
  'hub-toast': `await page.getByRole('button', { name: /success toast/i }).click();
await expect(page.getByRole('status')).toContainText(/success/i);`,
  'hub-listbox': `await page.getByLabel('Available').selectOption('Playwright');
await page.getByRole('button', { name: '→' }).click();
await expect(page.getByLabel('Chosen')).toContainText('Playwright');`,
  'hub-autocomplete': `await page.getByLabel('Type fruit').fill('app');
await page.getByRole('option', { name: 'Apple' }).click();
await expect(page.getByText('Selected: Apple')).toBeVisible();`,
  'hub-dependent': `await page.getByLabel('Country').selectOption('India');
await page.getByLabel('City').selectOption('Mumbai');`,
  'hub-delayed-btn': `await page.getByRole('button', { name: /enable btn/i }).click();
await expect(page.locator('#wait-for-me')).toBeEnabled({ timeout: 5000 });
await page.locator('#wait-for-me').click();`,
  'hub-stale': `// Prefer locators — they re-query after Replace
await page.getByRole('button', { name: /replace/i }).click();
await expect(page.locator('#stale-target')).toContainText(/Replaced/);`,
  'hub-flaky': `test.describe(() => {
  test('flaky action with retries', async ({ page }) => {
    // configure retries in project; assert eventual Pass stats or wrap expect.poll
    await page.getByRole('button', { name: /run flaky/i }).click();
  });
});`,
  'hub-network': `await page.getByRole('button', { name: /fast/i }).click();
await expect(page.getByTestId('spinner')).toBeHidden();
await expect(page.locator('.pw-api-out')).toContainText(/OK/);`,
  'hub-keyboard': `await page.getByLabel('Press Enter to Submit').press('Enter');
await page.getByLabel('Tab target').press('ArrowUp');`,
  'hub-dynamic-list': `await page.getByRole('button', { name: 'Add Item' }).click();
await expect(page.getByTestId('dyn-list').locator('li')).toHaveCount(1);`,
  'hub-dynamic-id': `await page.locator('[data-stable="action"]').click();
await expect(page.locator('[data-stable="action"]')).toBeVisible();`,
  'hub-select-all': `await page.locator('#sel-all').check();
await expect(page.locator('.fruit')).toHaveCount(3);
await page.locator('#reveal-cb').check();
await expect(page.locator('#secret-text')).toBeVisible();`,
  'hub-hidden': `await page.getByRole('button', { name: /reveal/i }).click();
await expect(page.locator('#hidden-display')).toBeVisible();`,
  'hub-progress': `await page.getByRole('button', { name: /start progress/i }).click();
await expect(page.locator('.pw-pct')).toHaveText('100%', { timeout: 5000 });`,
  'hub-notifications': `await page.getByRole('button', { name: /notification/i }).click();
await expect(page.getByRole('alert')).toBeVisible();`,
  'hub-disappear': `await page.getByRole('button', { name: /show disappearing/i }).click();
await page.locator('#vanish').click();
await expect(page.locator('#vanish')).toHaveCount(0);`,
  'hub-double-click': `await page.locator('#dbl').dblclick();
await expect(page.getByText('Double-clicked!')).toBeVisible();`,
  'hub-color-range': `await page.getByLabel('Range').fill('75');
await expect(page.locator('.pw-range-val')).toHaveText('75');`,
  'hub-masked': `await page.getByLabel('Masked').pressSequentially('5551234567');
await expect(page.getByLabel('Masked')).toHaveValue(/\\(555\\)/);`,
};

function renderElementsHub() {
  const hub = window.HUB_WIDGETS;
  const cards = document.getElementById('hubCards');
  const filters = document.getElementById('hubLevelFilters');
  const filterInput = document.getElementById('hubFilter');
  if (!hub || !cards) return;

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  if (filters) {
    filters.innerHTML = levels.map(l =>
      `<button type="button" class="pill jump level-pill ${hubLevel === l ? 'active' : ''}" data-hub-level="${l}">${l}</button>`
    ).join('');
    filters.querySelectorAll('[data-hub-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        hubLevel = btn.dataset.hubLevel;
        filters.querySelectorAll('.level-pill').forEach(b => b.classList.toggle('active', b.dataset.hubLevel === hubLevel));
        paintHubCards();
      });
    });
  }
  filterInput?.addEventListener('input', paintHubCards);
  paintHubCards();
}

function paintHubCards() {
  const hub = window.HUB_WIDGETS;
  const cards = document.getElementById('hubCards');
  if (!hub || !cards) return;
  const q = (document.getElementById('hubFilter')?.value || '').trim().toLowerCase();
  const list = hub.catalog.filter(el => {
    const levelOk = hubLevel === 'All' || el.level === hubLevel;
    const text = `${el.name} ${el.goal} ${el.level}`.toLowerCase();
    return levelOk && (!q || text.includes(q));
  });
  cards.innerHTML = list.map(el => {
    const done = hubDone.has(el.id);
    const sol = HUB_SOLUTIONS[el.id] || '// Interact with the live widget, then assert the resulting UI state.';
    return `<div class="card playground-card" data-id="${el.id}">
      <div class="pillrow" style="margin:0 0 8px"><span class="pill">${el.level}</span></div>
      <h3 class="sub" style="margin-top:0">${el.name}</h3>
      <p class="lead"><strong>Challenge:</strong> ${el.goal}</p>
      <div class="live-challenge">
        <div class="live-label">Live challenge — practise here</div>
        <div data-widget="${el.id}"></div>
      </div>
      <details class="solution-reveal">
        <summary>Show solution</summary>
        <div class="solution-body"><pre><code data-lang="ts">${sol.replace(/</g, '&lt;')}</code></pre></div>
      </details>
      <button type="button" class="iconbtn mark-play ${done ? 'is-done' : ''}" data-hub="${el.id}">${done ? 'Practiced ✓' : 'Mark practiced'}</button>
    </div>`;
  }).join('') || '<div class="card">No widgets match.</div>';
  enhanceCodeBlocks(cards);
  hub.mount(cards);
  cards.querySelectorAll('[data-hub]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.hub;
      if (hubDone.has(id)) hubDone.delete(id); else hubDone.add(id);
      saveSet(HUB_DONE_KEY, hubDone);
      paintHubCards();
    });
  });
}

/* ---------------- Bank Demo + Assessments ---------------- */
function renderBankDemo() {
  window.BankDemo?.mount(document.getElementById('bankDemoHost'));
  const host = document.getElementById('bankDemoHost');
  if (host) enhanceCodeBlocks(host.parentElement);
}

function renderAssessments() {
  const data = window.ASSESSMENTS_DATA;
  const list = document.getElementById('assessmentsList');
  if (!data || !list) return;
  const title = document.getElementById('assessmentsTitle');
  const lead = document.getElementById('assessmentsLead');
  if (title) title.textContent = data.hub.title;
  if (lead) lead.innerHTML = `${data.hub.lead} Open <a href="#bank-demo">Bank Demo</a> in another tab/section while executing.`;

  const modules = ['All', ...new Set(data.cases.map(c => c.module))];
  const modSel = document.getElementById('assessModule');
  if (modSel && modSel.options.length <= 1) {
    modules.slice(1).forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      modSel.appendChild(o);
    });
  }

  const paint = () => {
    const q = (document.getElementById('assessFilter')?.value || '').trim().toLowerCase();
    const mod = document.getElementById('assessModule')?.value || 'All';
    const filtered = data.cases.filter(c => {
      const modOk = mod === 'All' || c.module === mod;
      const text = `${c.id} ${c.module} ${c.objective} ${c.expected} ${c.type}`.toLowerCase();
      return modOk && (!q || text.includes(q));
    });
    const countEl = document.getElementById('assessCount');
    if (countEl) countEl.textContent = `${filtered.length}/${data.cases.length} · done ${assessDone.size}`;
    list.innerHTML = filtered.map(c => {
      const done = assessDone.has(c.id);
      return `<article class="card assess-card" data-id="${c.id}">
        <div class="pillrow" style="margin:0 0 8px">
          <span class="pill">${c.id}</span>
          <span class="pill">${c.module}</span>
          <span class="pill">${c.type}</span>
          <span class="pill">${c.difficulty}</span>
          <span class="pill">${c.priority}</span>
        </div>
        <h3 class="sub" style="margin-top:0">${c.objective}</h3>
        <p class="lead"><strong>Steps:</strong> ${c.steps}</p>
        <p class="lead"><strong>Data:</strong> ${c.data}</p>
        <p class="lead"><strong>Expected:</strong> ${c.expected}</p>
        <p class="lead"><strong>Selector hints:</strong> <code class="inline">${c.hints}</code></p>
        <details class="solution-reveal">
          <summary>Show Playwright solution</summary>
          <div class="solution-body"><pre><code data-lang="ts">${c.solution.replace(/</g, '&lt;')}</code></pre></div>
        </details>
        <button type="button" class="iconbtn mark-play ${done ? 'is-done' : ''}" data-assess="${c.id}">${done ? 'Practiced ✓' : 'Mark practiced'}</button>
      </article>`;
    }).join('') || '<div class="card">No cases match.</div>';
    enhanceCodeBlocks(list);
    list.querySelectorAll('[data-assess]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.assess;
        if (assessDone.has(id)) assessDone.delete(id); else assessDone.add(id);
        saveSet(ASSESS_DONE_KEY, assessDone);
        paint();
      });
    });
  };
  document.getElementById('assessFilter')?.addEventListener('input', paint);
  document.getElementById('assessModule')?.addEventListener('change', paint);
  paint();
}

/* ---------------- Interview scenario bank render ---------------- */
function renderScenarioList(container, questions, tierKey) {
  if (!container || !questions) return;
  container.innerHTML = questions.map((item, i) => {
    const done = practiced.has(item.id);
    return `
    <details class="qa" id="${item.id || ''}" data-q="${escapeAttr(item.q)}" data-id="${item.id}">
      <summary>
        <span class="qa-summary-text">${i + 1}. ${item.q}</span>
        <span class="qa-actions">
          <button type="button" class="mark-btn ${done ? 'is-done' : ''}" data-mark="${item.id}" title="Mark practiced">${done ? 'Practiced' : 'Mark'}</button>
        </span>
      </summary>
      <div class="body">
        <div class="ideal"><strong>Ideal approach</strong>${item.ideal}</div>
        <div class="stuck"><strong>Why candidates get stuck</strong>${item.stuck}</div>
      </div>
    </details>`;
  }).join('');

  container.querySelectorAll('[data-mark]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.mark;
      if (practiced.has(id)) practiced.delete(id);
      else practiced.add(id);
      saveSet(PRACTICE_KEY, practiced);
      btn.classList.toggle('is-done', practiced.has(id));
      btn.textContent = practiced.has(id) ? 'Practiced' : 'Mark';
      updateInterviewProgress();
    });
  });
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function allInterviewQuestions() {
  const data = window.INTERVIEW_DATA;
  const essentials = window.INTERVIEW_ESSENTIALS;
  const tiers = data
    ? ['tierA', 'tierB', 'tierC', 'tierD'].flatMap(key =>
        (data[key]?.questions || []).map(q => ({ ...q, tierKey: key, tierTitle: data[key].title }))
      )
    : [];
  const ess = essentials?.categories
    ? essentials.categories.flatMap(cat =>
        (cat.questions || []).map(q => ({
          ...q,
          tierKey: 'essentials',
          tierTitle: `Essentials — ${cat.title}`,
        }))
      )
    : [];
  return [...tiers, ...ess];
}

function updateInterviewProgress() {
  const all = allInterviewQuestions();
  const n = all.length || 1;
  const done = all.filter(q => practiced.has(q.id)).length;
  const pct = Math.round((done / n) * 100);
  const label = document.getElementById('interviewProgressLabel');
  const fill = document.getElementById('interviewProgressFill');
  if (label) label.textContent = `(${done}/${all.length} · ${pct}%)`;
  if (fill) fill.style.width = pct + '%';
}

function wireTierToolbars() {
  // Only interview tier toolbars (data-tier). Do NOT wipe XPath / other custom toolbars.
  document.querySelectorAll('.tier-toolbar[data-tier]').forEach(bar => {
    const tierKey = bar.dataset.tier;
    bar.innerHTML = `
      <input type="search" class="tier-filter" placeholder="Filter scenarios…" aria-label="Filter scenarios" />
      <button type="button" class="iconbtn" data-act="expand">Expand all</button>
      <button type="button" class="iconbtn" data-act="collapse">Collapse all</button>
      <button type="button" class="iconbtn" data-act="unpracticed">Show unpracticed</button>
      <span class="filter-count muted-inline"></span>`;

    const list = bar.parentElement.querySelector('[id$="List"]');
    const input = bar.querySelector('.tier-filter');
    const countEl = bar.querySelector('.filter-count');

    if (!list || !input || !countEl) return;

    const applyFilter = () => {
      const q = input.value.trim().toLowerCase();
      const onlyUn = bar.dataset.onlyUn === '1';
      let shown = 0, total = 0;
      list.querySelectorAll('details.qa').forEach(d => {
        total++;
        const text = (d.dataset.q || '').toLowerCase();
        const id = d.dataset.id;
        const matchText = !q || text.includes(q) || (id || '').toLowerCase().includes(q);
        const matchPrac = !onlyUn || !practiced.has(id);
        const show = matchText && matchPrac;
        d.classList.toggle('hidden', !show);
        if (show) shown++;
      });
      countEl.textContent = `${shown}/${total} shown`;
    };

    input.addEventListener('input', applyFilter);
    bar.querySelector('[data-act="expand"]').addEventListener('click', () => {
      list.querySelectorAll('details.qa:not(.hidden)').forEach(d => { d.open = true; });
    });
    bar.querySelector('[data-act="collapse"]').addEventListener('click', () => {
      list.querySelectorAll('details.qa').forEach(d => { d.open = false; });
    });
    bar.querySelector('[data-act="unpracticed"]').addEventListener('click', () => {
      bar.dataset.onlyUn = bar.dataset.onlyUn === '1' ? '0' : '1';
      bar.querySelector('[data-act="unpracticed"]').textContent =
        bar.dataset.onlyUn === '1' ? 'Show all' : 'Show unpracticed';
      applyFilter();
    });
    applyFilter();
  });
}

function renderInterviewSection(onReady) {
  const data = window.INTERVIEW_DATA;
  if (!data) return;

  const hubTitle = document.getElementById('interviewHubTitle');
  const hubLead = document.getElementById('interviewHubLead');
  const hubCards = document.getElementById('interviewHubCards');
  const hubRec = document.getElementById('interviewHubRecommendations');

  if (hubTitle && data.hub.title) hubTitle.textContent = data.hub.title;
  if (hubLead) hubLead.textContent = data.hub.lead;

  const tiers = [
    { key: 'tierA', blurb: 'Screening & fundamentals — locators, waits, downloads, permissions' },
    { key: 'tierB', blurb: 'Fixtures, auth, mocking, CI, WebSockets, visual regression' },
    { key: 'tierC', blurb: 'Architecture, flake governance, a11y, hybrid design' },
    { key: 'tierD', blurb: 'Platform economics, migration, governance at org scale' },
  ];

  if (hubCards) {
    const ess = window.INTERVIEW_ESSENTIALS;
    const essCount = ess?.categories?.reduce((n, c) => n + (c.questions?.length || 0), 0) || 0;
    const essDone = ess?.categories
      ? ess.categories.flatMap(c => c.questions || []).filter(q => practiced.has(q.id)).length
      : 0;

    hubCards.innerHTML = tiers.map(({ key, blurb }) => {
      const block = data[key];
      const done = block.questions.filter(q => practiced.has(q.id)).length;
      return `
      <div class="card interview-hub-card" data-go="${block.id}" role="button" tabindex="0">
        <h3 class="sub">${block.title}</h3>
        <p class="lead" style="margin:0">${blurb}</p>
        <div class="pillrow" style="margin-top:10px">
          <span class="pill">${block.questions.length} scenarios</span>
          <span class="pill">${done} practiced</span>
        </div>
      </div>`;
    }).join('') + (ess ? `
      <div class="card interview-hub-card" data-go="interview-essentials" role="button" tabindex="0">
        <h3 class="sub">${ess.hub.title}</h3>
        <p class="lead" style="margin:0">HR openers, smoke/sanity, severity, BDD, Git/Jira, MCP &amp; codegen — from real interview lists</p>
        <div class="pillrow" style="margin-top:10px">
          <span class="pill">${essCount} Q&amp;A</span>
          <span class="pill">${essDone} practiced</span>
        </div>
      </div>` : '');
    hubCards.querySelectorAll('[data-go]').forEach(el => {
      const go = () => show(el.dataset.go);
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  }

  if (hubRec && data.recommendations?.html) {
    hubRec.innerHTML = data.recommendations.html;
  }

  const tierDom = [
    ['tierA', 'TierA'],
    ['tierB', 'TierB'],
    ['tierC', 'TierC'],
    ['tierD', 'TierD'],
  ];
  tierDom.forEach(([key, label]) => {
    const block = data[key];
    if (!block) return;
    const titleEl = document.getElementById(`interview${label}Title`);
    const leadEl = document.getElementById(`interview${label}Lead`);
    const listEl = document.getElementById(`interview${label}List`);
    if (titleEl) titleEl.textContent = block.title;
    if (leadEl) leadEl.textContent = block.lead;
    renderScenarioList(listEl, block.questions, key);
  });

  wireTierToolbars();
  updateInterviewProgress();
  renderInterviewEssentials();

  document.querySelectorAll('#interview, [id^="interview-tier-"], #interview-essentials, #drill').forEach(section => {
    enhanceCodeBlocks(section);
  });

  if (typeof onReady === 'function') onReady();
}

function renderInterviewEssentials() {
  const data = window.INTERVIEW_ESSENTIALS;
  if (!data) return;

  const title = document.getElementById('interviewEssentialsTitle');
  const lead = document.getElementById('interviewEssentialsLead');
  const host = document.getElementById('interviewEssentialsHost');
  if (title) title.textContent = data.hub.title;
  if (lead) lead.textContent = data.hub.lead;
  if (!host) return;

  host.innerHTML = data.categories.map((cat) => `
    <section class="essentials-cat" data-cat="${cat.id}">
      <h3 class="sub" id="ess-${cat.id}">${cat.title}</h3>
      <p class="lead">${cat.lead}</p>
      <div class="essentials-list" id="essList-${cat.id}"></div>
    </section>`).join('');

  data.categories.forEach((cat) => {
    renderScenarioList(document.getElementById(`essList-${cat.id}`), cat.questions, cat.id);
  });

  const bar = document.getElementById('interviewEssentialsToolbar');
  if (bar && !bar.dataset.wired) {
    bar.dataset.wired = '1';
    bar.innerHTML = `
      <input type="search" class="tier-filter" id="essentialsFilter" placeholder="Filter essentials (smoke, git, BDD, MCP…)" aria-label="Filter essentials" />
      <button type="button" class="iconbtn" data-act="expand">Expand all</button>
      <button type="button" class="iconbtn" data-act="collapse">Collapse all</button>
      <span class="filter-count muted-inline" id="essentialsCount"></span>`;
    const input = bar.querySelector('#essentialsFilter');
    const countEl = bar.querySelector('#essentialsCount');
    const apply = () => {
      const q = (input.value || '').trim().toLowerCase();
      let shown = 0, total = 0;
      host.querySelectorAll('details.qa').forEach((d) => {
        total++;
        const text = (d.dataset.q || '').toLowerCase();
        const id = (d.dataset.id || '').toLowerCase();
        const show = !q || text.includes(q) || id.includes(q);
        d.classList.toggle('hidden', !show);
        if (show) shown++;
      });
      host.querySelectorAll('.essentials-cat').forEach((sec) => {
        const any = [...sec.querySelectorAll('details.qa')].some((d) => !d.classList.contains('hidden'));
        sec.classList.toggle('hidden', !any && !!q);
      });
      if (countEl) countEl.textContent = `${shown}/${total} shown`;
    };
    input.addEventListener('input', apply);
    bar.querySelector('[data-act="expand"]').addEventListener('click', () => {
      host.querySelectorAll('details.qa:not(.hidden)').forEach((d) => { d.open = true; });
    });
    bar.querySelector('[data-act="collapse"]').addEventListener('click', () => {
      host.querySelectorAll('details.qa').forEach((d) => { d.open = false; });
    });
    apply();
  }
}

/* ---------------- Random drill ---------------- */
let drillFilters = new Set(['tierA', 'tierB', 'tierC', 'tierD', 'essentials']);
let currentDrill = null;

function initDrill() {
  const filters = document.getElementById('drillTierFilters');
  if (!filters || !window.INTERVIEW_DATA) return;
  const labels = { tierA: 'A', tierB: 'B', tierC: 'C', tierD: 'D', essentials: 'Essentials' };
  filters.innerHTML = Object.keys(labels).map(k =>
    `<button type="button" class="pill jump drill-tier active" data-tier="${k}">${k === 'essentials' ? 'Essentials' : 'Tier ' + labels[k]}</button>`
  ).join('');
  filters.querySelectorAll('.drill-tier').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tier;
      if (drillFilters.has(t)) {
        if (drillFilters.size > 1) drillFilters.delete(t);
      } else drillFilters.add(t);
      btn.classList.toggle('active', drillFilters.has(t));
    });
  });

  document.getElementById('drillNext')?.addEventListener('click', pickDrill);
  document.getElementById('drillReveal')?.addEventListener('click', () => {
    document.getElementById('drillAnswer')?.classList.remove('hidden');
  });
  document.getElementById('drillMark')?.addEventListener('click', () => {
    if (!currentDrill) return;
    practiced.add(currentDrill.id);
    saveSet(PRACTICE_KEY, practiced);
    updateInterviewProgress();
    pickDrill();
  });
  pickDrill();
}

function pickDrill() {
  const pool = allInterviewQuestions().filter(q => drillFilters.has(q.tierKey));
  if (!pool.length) return;
  currentDrill = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('drillMeta').textContent =
    `${currentDrill.tierTitle} · ${currentDrill.id.toUpperCase()}` +
    (practiced.has(currentDrill.id) ? ' · already practiced' : '');
  document.getElementById('drillQuestion').textContent = currentDrill.q;
  const ans = document.getElementById('drillAnswer');
  ans.classList.add('hidden');
  ans.innerHTML = `
    <div class="ideal"><strong>Ideal approach</strong>${currentDrill.ideal}</div>
    <div class="stuck"><strong>Why candidates get stuck</strong>${currentDrill.stuck}</div>`;
  enhanceCodeBlocks(ans);
}

/* ---------------- Study checklist ---------------- */
function renderStudyChecklist() {
  const el = document.getElementById('studyChecklist');
  if (!el) return;
  el.innerHTML = STUDY_ITEMS.map(item => `
    <label class="check-row">
      <input type="checkbox" data-study="${item.id}" ${studyDone.has(item.id) ? 'checked' : ''} />
      <span>${item.label}</span>
      <a class="jump-mini" href="#${item.id}">Open</a>
    </label>`).join('');
  el.querySelectorAll('[data-study]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) studyDone.add(cb.dataset.study);
      else studyDone.delete(cb.dataset.study);
      saveSet(STUDY_KEY, studyDone);
      updateStudyLabel();
    });
  });
  el.querySelectorAll('.jump-mini').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      show(a.getAttribute('href').slice(1));
    });
  });
  updateStudyLabel();
}

function updateStudyLabel() {
  const label = document.getElementById('studyProgressLabel');
  if (!label) return;
  const pct = Math.round((studyDone.size / STUDY_ITEMS.length) * 100);
  label.textContent = `(${studyDone.size}/${STUDY_ITEMS.length} · ${pct}%)`;
}

document.getElementById('resetStudyProgress')?.addEventListener('click', () => {
  studyDone = new Set();
  saveSet(STUDY_KEY, studyDone);
  renderStudyChecklist();
});
document.getElementById('resetInterviewProgress')?.addEventListener('click', () => {
  practiced = new Set();
  saveSet(PRACTICE_KEY, practiced);
  renderInterviewSection(() => { index = buildSearchIndex(); });
  updateInterviewProgress();
});

/* ---------------- Navigation ---------------- */
const links = Array.from(document.querySelectorAll('.navlink'));
let pages = Array.from(document.querySelectorAll('.page'));
const searchPanel = document.getElementById('searchPanel');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
const PAGE_ORDER = links.map(l => l.dataset.target).filter(Boolean);

function show(id, push = true) {
  searchPanel.classList.add('hidden');
  document.getElementById('searchInput').value = '';
  pages.forEach(p => p.classList.toggle('hidden', p.id !== id));
  links.forEach(l => l.classList.toggle('active', l.dataset.target === id));
  // Jump to top immediately on section switch (bypass CSS smooth-scroll).
  window.scrollTo({ top: 0, behavior: 'instant' });
  sidebar.classList.remove('open');
  backdrop?.classList.add('hidden');
  if (push && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  updatePageNav(id);
  const activeLink = links.find(l => l.dataset.target === id);
  activeLink?.scrollIntoView({ block: 'nearest' });
}

const LEGACY_INTERVIEW_HASH = {
  'interview-junior': 'interview-tier-a',
  'interview-mid': 'interview-tier-b',
  'interview-senior': 'interview-tier-c',
  'interview-architect': 'interview-tier-d',
  'interview-stuck': 'interview',
};

function resolvePageId(id) {
  return LEGACY_INTERVIEW_HASH[id] || id;
}

/** Open a page section, or a subsection id inside a page (scroll after show). */
function navigateToHash(rawId, push = true) {
  const id = resolvePageId(rawId);
  const el = document.getElementById(id);
  if (!el) {
    show('home', push);
    return;
  }
  if (el.classList.contains('page')) {
    show(id, push);
    return;
  }
  const page = el.closest('.page');
  if (page) {
    show(page.id, push);
    requestAnimationFrame(() => {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    });
    return;
  }
  show('home', push);
}

function updatePageNav(id) {
  const nav = document.getElementById('pageNav');
  if (!nav) return;
  const i = PAGE_ORDER.indexOf(id);
  if (i < 0) { nav.innerHTML = ''; return; }
  const prev = PAGE_ORDER[i - 1];
  const next = PAGE_ORDER[i + 1];
  const label = t => links.find(l => l.dataset.target === t)?.textContent.trim() || t;
  nav.innerHTML = `
    ${prev ? `<button type="button" class="iconbtn" data-go="${prev}">← ${label(prev)}</button>` : '<span></span>'}
    ${next ? `<button type="button" class="iconbtn" data-go="${next}">${label(next)} →</button>` : '<span></span>'}`;
  nav.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
}

links.forEach(l => l.addEventListener('click', () => show(l.dataset.target)));
document.getElementById('menuBtn').addEventListener('click', () => {
  sidebar.classList.toggle('open');
  backdrop?.classList.toggle('hidden', !sidebar.classList.contains('open'));
});
backdrop?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  backdrop.classList.add('hidden');
});

window.addEventListener('hashchange', () => {
  const id = resolvePageId(location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (el?.classList.contains('page')) show(id, false);
  else if (el) navigateToHash(id, false);
});

document.querySelectorAll('a.pill.jump').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      navigateToHash(href.slice(1));
    }
  });
});

let initial = (location.hash || '#home').slice(1);
initial = resolvePageId(initial);
if (document.getElementById(initial)?.classList.contains('page')) {
  show(initial, false);
} else if (document.getElementById(initial)) {
  navigateToHash(initial, false);
} else {
  show('home', false);
}

/* ---------------- Theme ---------------- */
const themeBtn = document.getElementById('themeBtn');
const saved = localStorage.getItem('pw-theme');
if (saved) document.documentElement.dataset.theme = saved;

function paintThemeButton() {
  const isLight = document.documentElement.dataset.theme === 'light';
  themeBtn.textContent = isLight ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  themeBtn.setAttribute('aria-pressed', String(isLight));
}
paintThemeButton();

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('pw-theme', next);
  paintThemeButton();
});

/* ---------------- Syntax highlighting (lightweight) ---------------- */
const KEYWORDS = ['await','async','const','let','var','function','return','import','from','export',
  'class','extends','new','if','else','for','of','in','while','try','catch','finally','throw',
  'type','interface','implements','readonly','private','protected','public','abstract','as','typeof',
  'default','true','false','null','undefined','this','void','Promise','string','number','boolean'];

function highlight(code) {
  const out = [];
  let i = 0;
  const push = (cls, text) => out.push(cls ? `<span class="${cls}">${text}</span>` : text);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  while (i < code.length) {
    const rest = code.slice(i);
    let m = rest.match(/^(\/\/[^\n]*|#[^\n]*)/);
    if (m && (m[0][0] === '/' || /^#\s/.test(m[0]) || /^#[^\w]/.test(m[0]) || m[0].startsWith('# '))) {
      push('tok-com', esc(m[0])); i += m[0].length; continue;
    }
    m = rest.match(/^\/\*[\s\S]*?\*\//);
    if (m) { push('tok-com', esc(m[0])); i += m[0].length; continue; }
    m = rest.match(/^(`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/);
    if (m) { push('tok-str', esc(m[0])); i += m[0].length; continue; }
    m = rest.match(/^\b\d[\d_]*(\.\d+)?\b/);
    if (m) { push('tok-num', esc(m[0])); i += m[0].length; continue; }
    m = rest.match(/^[A-Za-z_$][\w$]*/);
    if (m) {
      const w = m[0];
      if (KEYWORDS.includes(w)) push('tok-key', w);
      else if (/^[A-Z]/.test(w)) push('tok-type', w);
      else if (code[i + w.length] === '(') push('tok-fn', w);
      else push(null, esc(w));
      i += w.length; continue;
    }
    push(null, esc(code[i])); i++;
  }
  return out.join('');
}

function enhanceCodeBlocks(root = document) {
  root.querySelectorAll('pre > code').forEach(codeEl => {
    if (codeEl.dataset.enhanced) return;
    codeEl.dataset.enhanced = '1';
    const pre = codeEl.parentElement;
    const raw = codeEl.textContent;
    codeEl.innerHTML = highlight(raw);

    if (!pre.parentElement.classList.contains('codewrap')) {
      const wrap = document.createElement('div');
      wrap.className = 'codewrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const lang = pre.dataset.lang || codeEl.dataset.lang;
      if (lang) {
        const tag = document.createElement('span');
        tag.className = 'lang';
        tag.textContent = lang;
        wrap.appendChild(tag);
      }

      const btn = document.createElement('button');
      btn.className = 'copybtn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(raw);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = raw; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        btn.textContent = 'Copied ✓';
        setTimeout(() => (btn.textContent = 'Copy'), 1400);
      });
      wrap.appendChild(btn);
    }
  });
}

enhanceCodeBlocks(document);

function renderSkillsPracticeBlock(sectionKey, hostId, leadId) {
  const data = window.SKILLS_PRACTICE?.[sectionKey];
  const host = document.getElementById(hostId);
  const lead = document.getElementById(leadId);
  if (!data || !host) return;
  if (lead) lead.textContent = data.lead;

  host.innerHTML = `
    <div class="card note" style="margin-bottom:12px"><strong>${data.title}</strong> — live UI below each card, then Show solution for Playwright.</div>
    <div class="grid g2 sk-practice-grid"></div>`;
  const grid = host.querySelector(".sk-practice-grid");
  grid.innerHTML = data.challenges.map((c) => {
    const done = skillsDone.has(c.id);
    return `<article class="card playground-card sk-challenge-card" data-id="${c.id}">
      <h3 class="sub" style="margin-top:0">${c.name}</h3>
      <p class="lead"><strong>Challenge:</strong> ${c.goal}</p>
      <div class="live-challenge">
        <div class="live-label">Live practice</div>
        <div data-widget="${c.id}"></div>
      </div>
      <details class="solution-reveal">
        <summary>Show solution (Playwright)</summary>
        <div class="solution-body">
          <pre><code data-lang="ts">${c.recipe.replace(/</g, "&lt;")}</code></pre>
          <p class="lead"><strong>Trap:</strong> ${c.traps}</p>
        </div>
      </details>
      <button type="button" class="iconbtn mark-play ${done ? "is-done" : ""}" data-skill="${c.id}">${done ? "Practiced ✓" : "Mark practiced"}</button>
    </article>`;
  }).join("");

  enhanceCodeBlocks(host);
  // Only SkillsPracticeWidgets — PracticeWidgets.mount would clear unknown sk-* slots
  window.SkillsPracticeWidgets?.mount(host);

  host.querySelectorAll("[data-skill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.skill;
      if (skillsDone.has(id)) skillsDone.delete(id);
      else skillsDone.add(id);
      saveSet(SKILLS_DONE_KEY, skillsDone);
      btn.textContent = skillsDone.has(id) ? "Practiced ✓" : "Mark practiced";
      btn.classList.toggle("is-done", skillsDone.has(id));
    });
  });
}

function renderAllSkillsPractice() {
  renderSkillsPracticeBlock("mistakes", "mistakesPracticeHost", "mistakesPracticeLead");
  renderSkillsPracticeBlock("frames", "framesPracticeHost", "framesPracticeLead");
  renderSkillsPracticeBlock("clipboard", "clipboardPracticeHost", "clipboardPracticeLead");
}

/* ---------------- Mistakes / anti-patterns ---------------- */
function renderMistakesSection() {
  const data = window.MISTAKES_DATA;
  if (!data) return;

  const title = document.getElementById('mistakesTitle');
  const lead = document.getElementById('mistakesLead');
  const sources = document.getElementById('mistakesSources');
  if (title) title.textContent = data.hub.title;
  if (lead) lead.textContent = data.hub.lead;
  if (sources) sources.textContent = data.sourcesNote || '';

  const glance = document.getElementById('mistakesGlance');
  if (glance) {
    glance.innerHTML = `<table>
      <tr><th>Mistake</th><th>Impact</th></tr>
      ${data.glance.map(g => `<tr><td><code>${escapeXpHtml(g.m)}</code></td><td>${escapeXpHtml(g.i)}</td></tr>`).join('')}
    </table>`;
  }

  paintMistakesPitfalls();
  document.getElementById('mistakesFilter')?.addEventListener('input', paintMistakesPitfalls);
  document.getElementById('mistakesExpand')?.addEventListener('click', () => {
    document.querySelectorAll('#mistakesPitfalls details').forEach(d => { d.open = true; });
  });
  document.getElementById('mistakesCollapse')?.addEventListener('click', () => {
    document.querySelectorAll('#mistakesPitfalls details').forEach(d => { d.open = false; });
  });

  paintMistakesQa();
  document.getElementById('mistakesQaFilter')?.addEventListener('input', paintMistakesQa);
  document.getElementById('mistakesQaExpand')?.addEventListener('click', () => {
    document.querySelectorAll('#mistakesQaList details').forEach(d => { d.open = true; });
  });
  document.getElementById('mistakesQaCollapse')?.addEventListener('click', () => {
    document.querySelectorAll('#mistakesQaList details').forEach(d => { d.open = false; });
  });
}

function paintMistakesPitfalls() {
  const data = window.MISTAKES_DATA;
  const host = document.getElementById('mistakesPitfalls');
  const countEl = document.getElementById('mistakesCount');
  if (!data || !host) return;

  const q = (document.getElementById('mistakesFilter')?.value || '').trim().toLowerCase();
  const items = data.pitfalls.filter(p => {
    const text = `${p.title} ${p.think} ${p.actual} ${p.fix} ${p.bad} ${p.good}`.toLowerCase();
    return !q || text.includes(q);
  });
  if (countEl) countEl.textContent = `${items.length} of ${data.pitfalls.length}`;

  if (!items.length) {
    host.innerHTML = '<div class="card">No mistakes match your filter.</div>';
    return;
  }

  host.innerHTML = items.map((p, i) => `
    <details class="xpath-acc mistakes-pitfall"${i === 0 && !q ? ' open' : ''} data-id="${escapeXpHtml(p.id)}">
      <summary>
        <span class="xpath-acc-title">${escapeXpHtml(p.title)}</span>
        <span class="xpath-acc-icon" aria-hidden="true"></span>
      </summary>
      <div class="xpath-acc-body">
        <div class="mcq-debrief show">
          <div class="mcq-think"><strong>What we think</strong><p>${escapeXpHtml(p.think)}</p></div>
          <div class="mcq-actual"><strong>What actually happens</strong><p>${escapeXpHtml(p.actual)}</p></div>
          <div class="mcq-why"><strong>Fix</strong><p>${escapeXpHtml(p.fix)}</p></div>
        </div>
        <div class="mistakes-code-grid">
          <div class="card bad" style="margin:10px 0 0">
            <strong>Wrong</strong>
            <pre data-lang="typescript"><code>${escapeXpHtml(p.bad)}</code></pre>
          </div>
          <div class="card good" style="margin:10px 0 0">
            <strong>Right</strong>
            <pre data-lang="typescript"><code>${escapeXpHtml(p.good)}</code></pre>
          </div>
        </div>
      </div>
    </details>`).join('');
  enhanceCodeBlocks(host);
}

function paintMistakesQa() {
  const data = window.MISTAKES_DATA;
  const list = document.getElementById('mistakesQaList');
  const countEl = document.getElementById('mistakesQaCount');
  if (!data || !list) return;
  const q = (document.getElementById('mistakesQaFilter')?.value || '').trim().toLowerCase();
  const items = data.interview.filter(item => {
    const text = `${item.q} ${item.a}`.toLowerCase();
    return !q || text.includes(q);
  });
  if (countEl) countEl.textContent = `${items.length} question${items.length === 1 ? '' : 's'}`;
  list.innerHTML = items.map((item, i) => `
    <details class="qa">
      <summary>${i + 1}. ${escapeXpHtml(item.q)}</summary>
      <div class="body">${escapeXpHtml(item.a)}</div>
    </details>`).join('') || '<div class="card">No questions match.</div>';
}

/* ---------------- XPath deep dive ---------------- */
function escapeXpHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderXpathSection() {
  const data = window.XPATH_DATA;
  const widgets = window.XPathWidgets;
  if (!data) return;

  const title = document.getElementById('xpathTitle');
  const lead = document.getElementById('xpathLead');
  if (title) title.textContent = data.hub.title;
  if (lead) lead.textContent = data.hub.lead;

  document.querySelectorAll('#xpath [data-xp-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.xpJump);
      if (!target) return;
      const xpathPage = document.getElementById('xpath');
      const needShow = xpathPage?.classList.contains('hidden');
      if (needShow) show('xpath', true);
      // After a page switch, show() scrolls to top — wait one frame then jump to the subsection.
      requestAnimationFrame(() => {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), needShow ? 40 : 0);
      });
    });
  });

  // Theory — collapsible accordion with visible + / − icons
  const theory = document.getElementById('xpathTheory');
  if (theory) {
    theory.innerHTML = data.theory.map((t, i) => `
      <details class="xpath-acc xpath-theory-card"${i === 0 ? ' open' : ''}>
        <summary>
          <span class="xpath-acc-title">${escapeXpHtml(t.h)}</span>
          <span class="xpath-acc-icon" aria-hidden="true"></span>
        </summary>
        <div class="xpath-theory-body xpath-acc-body">${t.p}</div>
      </details>`).join('');
    enhanceCodeBlocks(theory);
    theory.querySelectorAll('[data-go]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        show(a.dataset.go);
      });
    });
    const theoryCount = document.getElementById('xpathTheoryCount');
    if (theoryCount) theoryCount.textContent = `${data.theory.length} topics`;
  }

  document.getElementById('xpathTheoryExpand')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathTheory details').forEach(d => { d.open = true; });
  });
  document.getElementById('xpathTheoryCollapse')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathTheory details').forEach(d => { d.open = false; });
  });

  const axisHost = document.getElementById('xpathAxisHost');
  if (axisHost && widgets) widgets.mountAxisNavigator(axisHost);

  paintXpathPitfalls();
  document.getElementById('xpathPitfallFilter')?.addEventListener('input', paintXpathPitfalls);
  document.getElementById('xpathPitfallExpand')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathPitfalls details').forEach(d => { d.open = true; });
  });
  document.getElementById('xpathPitfallCollapse')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathPitfalls details').forEach(d => { d.open = false; });
  });

  const testerHost = document.getElementById('xpathTesterHost');
  if (testerHost && widgets) widgets.mountTester(testerHost);

  const iframeHost = document.getElementById('xpathIframeHost');
  if (iframeHost && widgets) widgets.mountIframeDemo(iframeHost);

  const challenges = document.getElementById('xpathChallenges');
  if (challenges && widgets) {
    widgets.mountChallengeCards(challenges, data.challenges, (id, btn) => {
      if (xpathDone.has(id)) xpathDone.delete(id); else xpathDone.add(id);
      saveSet(XPATH_DONE_KEY, xpathDone);
      btn.textContent = xpathDone.has(id) ? 'Practiced ✓' : 'Mark practiced';
      btn.classList.toggle('is-done', xpathDone.has(id));
    });
    challenges.querySelectorAll('.mark-done').forEach(btn => {
      const card = btn.closest('[data-id]');
      const id = card?.dataset.id;
      if (id && xpathDone.has(id)) {
        btn.textContent = 'Practiced ✓';
        btn.classList.add('is-done');
      }
    });
    enhanceCodeBlocks(challenges);
  }

  paintXpathQa();
  document.getElementById('xpathQaFilter')?.addEventListener('input', paintXpathQa);
  document.getElementById('xpathQaExpand')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathQaList details').forEach(d => { d.open = true; });
  });
  document.getElementById('xpathQaCollapse')?.addEventListener('click', () => {
    document.querySelectorAll('#xpathQaList details').forEach(d => { d.open = false; });
  });
}

function paintXpathPitfalls() {
  const data = window.XPATH_DATA;
  const host = document.getElementById('xpathPitfalls');
  const countEl = document.getElementById('xpathPitfallCount');
  if (!data || !host) return;

  const q = (document.getElementById('xpathPitfallFilter')?.value || '').trim().toLowerCase();
  const items = data.pitfalls.filter(p => {
    const text = `${p.title} ${p.think} ${p.actual} ${p.fix}`.toLowerCase();
    return !q || text.includes(q);
  });

  if (countEl) countEl.textContent = `${items.length} of ${data.pitfalls.length}`;

  if (!items.length) {
    host.innerHTML = '<div class="card">No troubleshooting topics match your filter.</div>';
    return;
  }

  host.innerHTML = items.map((p, i) => `
    <details class="xpath-acc xpath-pitfall"${i === 0 && !q ? ' open' : ''}>
      <summary>
        <span class="xpath-acc-title">${escapeXpHtml(p.title)}</span>
        <span class="xpath-acc-icon" aria-hidden="true"></span>
      </summary>
      <div class="xpath-acc-body">
        <div class="mcq-debrief show">
          <div class="mcq-think"><strong>What we think</strong><p>${escapeXpHtml(p.think)}</p></div>
          <div class="mcq-actual"><strong>What actually happens</strong><p>${escapeXpHtml(p.actual)}</p></div>
          <div class="mcq-why"><strong>Fix</strong><p>${escapeXpHtml(p.fix)}</p></div>
        </div>
      </div>
    </details>`).join('');
}

function paintXpathQa() {
  const data = window.XPATH_DATA;
  const list = document.getElementById('xpathQaList');
  const countEl = document.getElementById('xpathQaCount');
  if (!data || !list) return;
  const q = (document.getElementById('xpathQaFilter')?.value || '').trim().toLowerCase();
  const items = data.interview.filter(item => {
    const text = `${item.q} ${item.a}`.toLowerCase();
    return !q || text.includes(q);
  });
  if (countEl) countEl.textContent = `${items.length} question${items.length === 1 ? '' : 's'}`;
  list.innerHTML = items.map((item, i) => `
    <details class="qa xpath-qa">
      <summary>${i + 1}. ${escapeXpHtml(item.q)}</summary>
      <div class="body">${item.a}</div>
    </details>`).join('') || '<div class="card">No questions match.</div>';
}

/* ---------------- Per-section MCQ practice ---------------- */
function renderSectionMcqs() {
  const bank = window.SECTION_MCQ;
  if (!bank) return;

  Object.keys(bank).forEach(sectionId => {
    const page = document.getElementById(sectionId);
    const block = bank[sectionId];
    if (!page || !block?.items?.length) return;

    let host = page.querySelector('.section-mcq-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'section-mcq-host';
      page.appendChild(host);
    }

    const items = block.items;
    host.innerHTML = `
      <div class="section-mcq card">
        <h3 class="sub" style="margin-top:0">${block.title}</h3>
        <p class="lead">Pick an answer. You’ll see the explanation, <em>what we think</em>, <em>what actually happens</em>, and <em>why we get stuck</em>.</p>
        <div class="section-mcq-score muted-inline">Score: <b data-mcq-score>0</b> / ${items.length}</div>
        <div class="section-mcq-list"></div>
        <button type="button" class="iconbtn" data-mcq-reset>Reset section MCQs</button>
      </div>`;

    const list = host.querySelector('.section-mcq-list');
    const scoreEl = host.querySelector('[data-mcq-score]');
    let score = 0;
    let answered = 0;

    const paint = () => {
      score = 0;
      answered = 0;
      scoreEl.textContent = '0';
      list.innerHTML = '';

      items.forEach((item, qi) => {
        const div = document.createElement('div');
        div.className = 'quiz-q section-mcq-q';
        div.innerHTML = `<div class="qtext">${qi + 1}. ${item.q}</div>`;

        item.options.forEach((opt, oi) => {
          const b = document.createElement('div');
          b.className = 'opt';
          b.textContent = opt;
          b.setAttribute('role', 'button');
          b.setAttribute('tabindex', '0');
          const choose = () => {
            if (div.dataset.done) return;
            div.dataset.done = '1';
            answered++;
            const correct = oi === item.answer;
            if (correct) {
              score++;
              scoreEl.textContent = String(score);
            }
            b.classList.add(correct ? 'correct' : 'wrong');
            if (!correct) div.querySelectorAll('.opt')[item.answer].classList.add('correct');
            div.querySelector('.mcq-debrief').classList.add('show');
          };
          b.addEventListener('click', choose);
          b.addEventListener('keydown', ev => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(); }
          });
          div.appendChild(b);
        });

        const debrief = document.createElement('div');
        debrief.className = 'mcq-debrief';
        debrief.innerHTML = `
          <div class="mcq-why"><strong>Why this answer</strong><p>${item.explain}</p></div>
          <div class="mcq-think"><strong>What we think</strong><p>${item.think}</p></div>
          <div class="mcq-actual"><strong>What actually happens</strong><p>${item.actual}</p></div>
          <div class="mcq-stuck"><strong>Why we get stuck</strong><p>${item.stuck}</p></div>`;
        div.appendChild(debrief);
        list.appendChild(div);
      });
    };

    host.querySelector('[data-mcq-reset]').addEventListener('click', paint);
    paint();
  });
}

renderSectionMcqs();

/* ---------------- Search ---------------- */
function buildSearchIndex() {
  pages = Array.from(document.querySelectorAll('.page'));
  return pages.map(p => {
    const title = p.querySelector('h2.sec, .hero h1')?.textContent.trim() || p.id;
    const link = links.find(l => l.dataset.target === p.id);
    return { id: p.id, title, nav: link ? link.textContent.trim() : title, text: p.innerText };
  });
}
let index = buildSearchIndex();

renderStudyChecklist();
renderPlayground();
renderMiniapps();
renderElementsHub();
renderXpathSection();
renderMistakesSection();
renderAllSkillsPractice();
renderBankDemo();
renderAssessments();
renderInterviewSection(() => {
  index = buildSearchIndex();
});
initDrill();
index = buildSearchIndex();

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function runSearch(q) {
  const query = q.trim().toLowerCase();
  if (query.length < 2) {
    searchPanel.classList.add('hidden');
    const active = links.find(l => l.classList.contains('active'));
    pages.forEach(p => p.classList.toggle('hidden', p.id !== (active ? active.dataset.target : 'home')));
    return;
  }
  pages.forEach(p => p.classList.add('hidden'));
  searchPanel.classList.remove('hidden');

  const hits = [];
  index.forEach(entry => {
    const lower = entry.text.toLowerCase();
    let pos = lower.indexOf(query);
    let n = 0;
    while (pos !== -1 && n < 3) {
      const start = Math.max(0, pos - 70);
      const snippet = entry.text.slice(start, pos + query.length + 90).replace(/\s+/g, ' ');
      hits.push({ id: entry.id, nav: entry.nav, snippet, pos });
      pos = lower.indexOf(query, pos + query.length);
      n++;
    }
  });

  if (!hits.length) {
    searchResults.innerHTML = `<div class="card">No matches for <b>${q}</b>.</div>`;
    return;
  }

  const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rx = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  searchResults.innerHTML = hits.slice(0, 40).map(h =>
    `<div class="result" data-go="${h.id}">
       <div class="rsec">${escHtml(h.nav)}</div>
       <div>…${escHtml(h.snippet).replace(rx, '<span class="searchhit">$1</span>')}…</div>
     </div>`).join('');

  searchResults.querySelectorAll('.result').forEach(r =>
    r.addEventListener('click', () => show(r.dataset.go)));
}

let t;
searchInput.addEventListener('input', e => {
  clearTimeout(t);
  const v = e.target.value;
  t = setTimeout(() => runSearch(v), 160);
});

const helpDialog = document.getElementById('helpDialog');

// True when the user is typing in a field, so global shortcuts must not steal keys.
function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

document.addEventListener('keydown', e => {
  if (e.key === '/' && !isEditableTarget(e.target)) {
    e.preventDefault(); searchInput.focus();
  }
  if (e.key === 'Escape') {
    searchInput.value = ''; runSearch(''); searchInput.blur();
    helpDialog?.open && helpDialog.close();
  }
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !isEditableTarget(e.target)) {
    e.preventDefault();
    helpDialog?.showModal();
  }
});

/* ---------------- Back to top ---------------- */
const backTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backTop?.classList.toggle('hidden', window.scrollY < 400);
}, { passive: true });
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------------- Quiz ---------------- */
const container = document.getElementById('quizContainer');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const fill = document.getElementById('progressFill');
const doneEl = document.getElementById('quizDone');
let score = 0, answered = 0;

function renderQuiz() {
  score = 0; answered = 0;
  scoreEl.textContent = '0';
  totalEl.textContent = String(window.QUIZ.length);
  fill.style.width = '0%';
  doneEl.classList.add('hidden');
  container.innerHTML = '';

  window.QUIZ.forEach((item, qi) => {
    const div = document.createElement('div');
    div.className = 'quiz-q';
    div.innerHTML = `<div class="qtext">${qi + 1}. ${item.q}</div>`;

    item.options.forEach((opt, oi) => {
      const b = document.createElement('div');
      b.className = 'opt';
      b.textContent = opt;
      b.setAttribute('role', 'button');
      b.setAttribute('tabindex', '0');
      const choose = () => {
        if (div.dataset.done) return;
        div.dataset.done = '1';
        answered++;
        const correct = oi === item.answer;
        if (correct) { score++; scoreEl.textContent = String(score); }
        b.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) div.querySelectorAll('.opt')[item.answer].classList.add('correct');
        div.querySelector('.explain').classList.add('show');
        fill.style.width = (answered / window.QUIZ.length * 100) + '%';
        if (answered === window.QUIZ.length) {
          const pct = Math.round(score / window.QUIZ.length * 100);
          doneEl.classList.remove('hidden');
          doneEl.innerHTML = `<h3 class="sub">Finished — ${score}/${window.QUIZ.length} (${pct}%)</h3>
            <p class="lead">${pct >= 85 ? 'Excellent — you are interview ready. Try Random drill next.' :
              pct >= 60 ? 'Solid base. Re-read Locators, Fixtures, Waiting, and Anti-patterns, then retry.' :
              'Work through Core API + Flake playbook again, then retake.'}</p>`;
          if (pct >= 80) {
            studyDone.add('quiz');
            saveSet(STUDY_KEY, studyDone);
            updateStudyLabel();
          }
          doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      b.addEventListener('click', choose);
      b.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(); }
      });
      div.appendChild(b);
    });

    const ex = document.createElement('div');
    ex.className = 'explain';
    ex.innerHTML = `<b>Why:</b> ${item.explain}`;
    div.appendChild(ex);
    container.appendChild(div);
  });
}
document.getElementById('resetQuiz').addEventListener('click', renderQuiz);
renderQuiz();
