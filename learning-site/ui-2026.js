/* =============================================================================
   ui-2026.js — app shell interactions + hand-rolled dashboard charts.
   No dependencies, no build step, file:// safe. Loads after app.js.
   ============================================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const DAY = 86400000;
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadSet = (key) => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  };
  const loadArr = (key) => {
    try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; }
    catch { return []; }
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const isEditable = (el) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

  const goTo = (id) => {
    if (typeof window.showSection === 'function') window.showSection(id);
    else location.hash = '#' + id;
  };

  const svg = (tag, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  /* ------------------------------------------------------------------ *
   * Review history — written by fsrs-app.js on every grade.
   * ------------------------------------------------------------------ */
  function reviewLog() {
    return loadArr('pw-fsrs-log')
      .map((entry) => (typeof entry === 'number' ? entry : Date.parse(entry)))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
  }

  function dayCounts(log) {
    const map = new Map();
    for (const ts of log) {
      const key = startOfDay(ts).getTime();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }

  function streakFrom(counts) {
    let streak = 0;
    const cursor = startOfDay(Date.now());
    if (!counts.get(cursor.getTime())) cursor.setTime(cursor.getTime() - DAY);
    while (counts.get(cursor.getTime())) {
      streak += 1;
      cursor.setTime(cursor.getTime() - DAY);
    }
    return streak;
  }

  /* ------------------------------------------------------------------ *
   * Charts
   * ------------------------------------------------------------------ */
  function renderHeatmap(host, counts) {
    const weeks = 20;
    const today = startOfDay(Date.now());
    const end = new Date(today.getTime() + (6 - today.getDay()) * DAY);
    const start = new Date(end.getTime() - (weeks * 7 - 1) * DAY);
    const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

    host.textContent = '';
    let total = 0;
    let best = 0;
    for (const v of counts.values()) best = Math.max(best, v);

    for (let i = 0; i < weeks * 7; i += 1) {
      const day = new Date(start.getTime() + i * DAY);
      const n = counts.get(day.getTime()) || 0;
      total += n;
      const cell = document.createElement('i');
      const level = n === 0 ? 0 : Math.min(4, Math.ceil((n / Math.max(best, 4)) * 4));
      cell.dataset.l = String(level);
      cell.title = `${n} review${n === 1 ? '' : 's'} · ${fmt.format(day)}`;
      if (day > today) cell.style.visibility = 'hidden';
      host.appendChild(cell);
    }
    host.setAttribute('aria-label',
      `Review activity heatmap: ${total} reviews across the last ${weeks} weeks, busiest day ${best}.`);
    return total;
  }

  function renderRings(host, tiers) {
    host.textContent = '';
    tiers.forEach((tier) => {
      const pct = tier.total ? Math.round((tier.done / tier.total) * 100) : 0;
      const r = 22;
      const c = 2 * Math.PI * r;
      const wrap = document.createElement('div');
      wrap.className = 'ring';
      const s = svg('svg', { class: 'chart', width: '58', height: '58', viewBox: '0 0 58 58', role: 'img' });
      s.setAttribute('aria-label', `${tier.label}: ${tier.done} of ${tier.total} practised, ${pct} percent`);
      s.appendChild(svg('circle', { class: 'ring-track', cx: 29, cy: 29, r, 'stroke-width': 5 }));
      const val = svg('circle', {
        class: 'ring-value', cx: 29, cy: 29, r, 'stroke-width': 5,
        transform: 'rotate(-90 29 29)',
        'stroke-dasharray': c,
        'stroke-dashoffset': prefersReduced() ? c * (1 - pct / 100) : c,
      });
      s.appendChild(val);
      const label = svg('text', { class: 'ring-num', x: 29, y: 29 });
      label.textContent = pct + '%';
      s.appendChild(label);
      wrap.appendChild(s);
      const cap = document.createElement('b');
      cap.textContent = tier.label;
      wrap.appendChild(cap);
      host.appendChild(wrap);
      if (!prefersReduced()) {
        requestAnimationFrame(() => { val.setAttribute('stroke-dashoffset', String(c * (1 - pct / 100))); });
      }
    });
  }

  function renderCurve(host, cards) {
    host.textContent = '';
    const now = Date.now();
    const stable = cards.filter((c) => Number(c.stability) > 0 && c.last_review);
    if (!stable.length) {
      host.innerHTML = `<div class="empty-state">
        <svg class="ico" viewBox="0 0 18 18" aria-hidden="true"><use href="#i-trend"/></svg>
        <strong>No memory model yet</strong>Grade a few cards and the forgetting curve appears here.</div>`;
      return;
    }

    // FSRS forgetting curve: R(t) = (1 + F * t / S) ^ C, F = 19/81, C = -0.5
    const F = 19 / 81;
    const days = 30;
    const points = [];
    for (let d = 0; d <= days; d += 1) {
      let sum = 0;
      for (const card of stable) {
        const elapsed = Math.max(0, (now + d * DAY - Date.parse(card.last_review)) / DAY);
        sum += Math.pow(1 + F * (elapsed / Number(card.stability)), -0.5);
      }
      points.push(sum / stable.length);
    }

    const W = 320, H = 132, PL = 30, PR = 8, PT = 10, PB = 20;
    const FLOOR = 0.4; // retention below this is "relearn it anyway"
    const x = (i) => PL + (i / days) * (W - PL - PR);
    const y = (v) => PT + (1 - (Math.max(v, FLOOR) - FLOOR) / (1 - FLOOR)) * (H - PT - PB);

    const s = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img' });
    const defs = svg('defs');
    const grad = svg('linearGradient', { id: 'pwAreaFill', x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svg('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': '.22' }));
    grad.appendChild(svg('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': '0' }));
    defs.appendChild(grad);
    s.appendChild(defs);

    [1, 0.8, 0.6, 0.4].forEach((v) => {
      s.appendChild(svg('line', { class: 'grid-line', x1: PL, x2: W - PR, y1: y(v), y2: y(v) }));
      const t = svg('text', { class: 'axis-label', x: 4, y: y(v) + 3 });
      t.textContent = Math.round(v * 100) + '%';
      s.appendChild(t);
    });
    [0, 10, 20, 30].forEach((d) => {
      const t = svg('text', { class: 'axis-label', x: x(d), y: H - 5, 'text-anchor': d === 0 ? 'start' : 'middle' });
      t.textContent = d === 0 ? 'today' : `+${d}d`;
      s.appendChild(t);
    });

    const line = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    s.appendChild(svg('path', { class: 'series-area', d: `${line} L${x(days)},${y(FLOOR)} L${x(0)},${y(FLOOR)} Z` }));
    const path = svg('path', { class: 'series', d: line });
    s.appendChild(path);
    s.appendChild(svg('circle', { class: 'marker', cx: x(0), cy: y(points[0]), r: 3 }));

    const pctNow = Math.round(points[0] * 100);
    const pct30 = Math.round(points[days] * 100);
    s.setAttribute('aria-label',
      `Projected retention across ${stable.length} cards: ${pctNow}% today, falling to ${pct30}% in 30 days without review.`);
    host.appendChild(s);

    if (!prefersReduced()) {
      const len = path.getTotalLength ? path.getTotalLength() : 1000;
      path.style.setProperty('--dash', String(len));
      path.classList.add('is-drawn');
    }
    return pctNow;
  }

  function renderTopicBars(host, rows) {
    host.textContent = '';
    if (!rows.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'bars';
    rows.forEach((row) => {
      const pct = row.total ? Math.round((row.done / row.total) * 100) : 0;
      const el = document.createElement('div');
      el.className = 'bar-row';
      el.innerHTML = `<span title="${esc(row.label)}">${esc(row.label)}</span>
        <span class="track"><span class="fill"></span></span>
        <em>${row.done}/${row.total}</em>`;
      wrap.appendChild(el);
      const fill = el.querySelector('.fill');
      if (prefersReduced()) fill.style.width = pct + '%';
      else requestAnimationFrame(() => { fill.style.width = pct + '%'; });
    });
    host.appendChild(wrap);
    const summary = document.createElement('p');
    summary.className = 'visually-hidden';
    summary.textContent = 'Topic mastery: ' + rows.map((r) => `${r.label} ${r.done} of ${r.total}`).join(', ');
    host.appendChild(summary);
  }

  /* ------------------------------------------------------------------ *
   * Dashboard
   * ------------------------------------------------------------------ */
  const SECTION_TITLES = () => {
    const map = new Map();
    $$('.sidebar .navlink').forEach((a) => {
      const id = a.dataset.target;
      if (id && !map.has(id)) map.set(id, a.textContent.trim());
    });
    return map;
  };

  function navGroups() {
    return $$('.sidebar details.nav-group').map((group) => {
      const targets = $$('.navlink', group).map((a) => a.dataset.target).filter(Boolean);
      // Read only the summary's own text so the injected progress hint is excluded.
      const summary = group.querySelector('summary');
      const label = Array.from(summary?.childNodes || [])
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join(' ')
        .trim();
      return { label, targets, el: group };
    });
  }

  function tierProgress() {
    const data = window.INTERVIEW_DATA;
    const practised = loadSet('pw-interview-practiced');
    const keys = [['tierA', 'Tier A'], ['tierB', 'Tier B'], ['tierC', 'Tier C'], ['tierD', 'Tier D']];
    return keys.map(([key, label]) => {
      const questions = data?.[key]?.questions || [];
      return { label, total: questions.length, done: questions.filter((q) => practised.has(q.id)).length };
    });
  }

  async function fsrsCards() {
    try {
      if (typeof window.FSRSApp?.getCards === 'function') return await window.FSRSApp.getCards();
    } catch { /* IndexedDB unavailable on some file:// setups */ }
    return [];
  }

  async function renderDashboard() {
    const root = $('#dashboard');
    if (!root) return;

    const log = reviewLog();
    const counts = dayCounts(log);
    const streak = streakFrom(counts);
    const cards = await fsrsCards();
    const now = Date.now();
    const due = cards.filter((c) => !c.due || Date.parse(c.due) <= now).length;
    const reviews30 = log.filter((ts) => ts > now - 30 * DAY).length;

    const set = (name, value) => {
      const el = root.querySelector(`[data-dash="${name}"]`);
      if (el) el.textContent = value;
    };

    const dueEl = root.querySelector('[data-dash="due"]');
    if (dueEl) dueEl.innerHTML = `${due}<small>${due === 1 ? 'card due' : 'cards due'}</small>`;
    set('due-context', due
      ? 'Clear the queue before you open anything else.'
      : cards.length ? 'Queue clear. Next card unlocks as its interval elapses.'
        : 'Open FSRS review once to seed your deck from the interview bank.');
    set('streak', streak);
    set('reviews30', reviews30);

    const heatTotal = renderHeatmap(root.querySelector('[data-dash="heatmap"]'), counts);
    set('heat-note', heatTotal
      ? `${heatTotal} reviews in the last 20 weeks · longest current streak ${streak} day${streak === 1 ? '' : 's'}.`
      : 'No reviews logged yet — the grid fills in as you grade cards.');

    const tiers = tierProgress();
    renderRings(root.querySelector('[data-dash="rings"]'), tiers);
    const tierDone = tiers.reduce((n, t) => n + t.done, 0);
    const tierTotal = tiers.reduce((n, t) => n + t.total, 0);
    set('tier-total', `${tierDone}/${tierTotal} practised`);

    const pctNow = renderCurve(root.querySelector('[data-dash="curve"]'), cards);
    set('retention', pctNow ? pctNow + '%' : '—');

    const studyDone = loadSet('pw-study-checklist');
    const rows = navGroups()
      .map((group) => ({
        label: group.label,
        total: group.targets.length,
        done: group.targets.filter((t) => studyDone.has(t)).length,
      }))
      .filter((row) => row.total > 1)
      .sort((a, b) => (b.done / b.total) - (a.done / a.total));
    renderTopicBars(root.querySelector('[data-dash="topics"]'), rows);

    renderResume(root.querySelector('[data-dash="resume"]'), studyDone);

    const fresh = !log.length && !studyDone.size && !tierDone;
    const pathsTitle = root.querySelector('[data-dash="paths-title"]');
    if (pathsTitle) pathsTitle.textContent = fresh ? 'New here? Pick a path' : 'Jump back in';
    root.querySelector('.tile.is-hero')?.classList.toggle('is-fresh', fresh);
    window.ReadinessUI?.updateDashboardTile?.();
  }

  function renderResume(host, studyDone) {
    if (!host) return;
    const titles = SECTION_TITLES();
    const last = localStorage.getItem('pw-last-section');
    const items = window.PW_STUDY_ITEMS || [];
    const next = items.find((item) => !studyDone.has(item.id));

    const block = (chip, id, label) => `
      <button type="button" class="path" data-go="${esc(id)}" style="margin-bottom:8px">
        <span class="journey-chip">${esc(chip)}</span>
        <b>${esc(label)}</b>
      </button>`;

    let html = '';
    if (last && last !== 'home' && titles.has(last)) html += block('Last opened', last, titles.get(last));
    if (next) html += block('Next up', next.id, next.label);
    if (!html) {
      html = `<div class="empty-state">
        <svg class="ico" viewBox="0 0 18 18" aria-hidden="true"><use href="#i-check"/></svg>
        <strong>Checklist complete</strong>Everything ticked — switch to review and drills.</div>`;
    }
    host.innerHTML = html;
  }

  function updateStreakChip() {
    const streak = streakFrom(dayCounts(reviewLog()));
    $$('[data-streak-count]').forEach((el) => { el.textContent = String(streak); });
    const chip = $('#streakChip');
    if (chip) chip.title = streak ? `${streak}-day review streak` : 'No review streak yet — grade a card today';
  }

  function updateGroupHints() {
    const studyDone = loadSet('pw-study-checklist');
    navGroups().forEach((group) => {
      const done = group.targets.filter((t) => studyDone.has(t)).length;
      if (!group.targets.length) return;
      let hint = group.el.querySelector('.grp-progress');
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'grp-progress';
        group.el.querySelector('summary')?.insertBefore(hint, group.el.querySelector('.chev'));
      }
      hint.textContent = done ? `${done}/${group.targets.length}` : '';
    });
    $$('.sidebar .navlink').forEach((a) => {
      if (studyDone.has(a.dataset.target)) a.dataset.done = '1';
      else delete a.dataset.done;
    });
  }

  /* ------------------------------------------------------------------ *
   * Learning path % (roadmap SVG)
   * ------------------------------------------------------------------ */
  const PATH_STAGE_SECTIONS = {
    beginner: ['home', 'whats-new', 'test-design', 'pyramid-nft', 'deprecated', 'setup'],
    intermediate: ['locators', 'xpath', 'waiting', 'actions', 'frames', 'multi-context', 'clipboard'],
    advanced: ['fixtures', 'fixtures-advanced', 'pom', 'auth', 'clock', 'webauthn', 'websocket', 'network', 'visual'],
    senior: ['ci', 'a11y-wcag', 'performance-cwv', 'agents-mcp', 'component-testing', 'mistakes', 'antipattern-lab', 'trace-lab', 'flake'],
    architect: ['contract-testing', 'sdet-field-guide', 'currency-2026', 'interview', 'fsrs', 'glossary', 'quiz', 'star-builder', 'mock-interview', 'postmortems', 'micro-tools', 'playground', 'bank-demo'],
  };

  function refreshLearningPath() {
    const root = $('#learningPath');
    if (!root) return;
    const studyDone = loadSet('pw-study-checklist');
    const items = window.PW_STUDY_ITEMS || [];
    const known = new Set(items.map((i) => i.id));
    let stageSum = 0;
    let stageCount = 0;

    Object.entries(PATH_STAGE_SECTIONS).forEach(([stage, ids]) => {
      const scoped = ids.filter((id) => known.has(id));
      const total = scoped.length || ids.length;
      const done = scoped.filter((id) => studyDone.has(id)).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      stageSum += pct;
      stageCount += 1;
      const g = root.querySelector(`[data-path-stage="${stage}"]`);
      const label = g?.querySelector('[data-path-pct]');
      if (label) label.textContent = `${pct}%`;
    });

    const progress = root.querySelector('[data-path-progress]');
    if (progress && stageCount) {
      const overall = stageSum / stageCount / 100;
      const len = Number(progress.getAttribute('pathLength') || 544);
      progress.setAttribute('stroke-dasharray', String(len));
      progress.setAttribute('stroke-dashoffset', String(Math.round(len * (1 - overall))));
      progress.setAttribute('data-path-progress', String(Math.round(overall * 100)));
    }
  }

  /* ------------------------------------------------------------------ *
   * Command palette
   * ------------------------------------------------------------------ */
  const RECENT_KEY = 'pw-cmdk-recent';
  const palette = {
    dialog: null, input: null, list: null, items: [], index: 0,
  };

  function paletteCommands() {
    return [
      { kind: 'command', id: 'skills', title: 'Skill Modules', icon: 'i-book', where: 'Skills' },
      { kind: 'command', id: 'readiness', title: 'Interview readiness', icon: 'i-target', where: 'Readiness' },
      { kind: 'command', id: 'mock-exam', title: 'Mock exam', icon: 'i-spark', where: 'Readiness' },
      { kind: 'command', id: 'planner', title: 'Study planner', icon: 'i-clock', where: 'Readiness' },
      { kind: 'command', id: 'interviewer', title: 'Interviewer Mode', icon: 'i-mic', where: 'Interview' },
      { kind: 'command', id: 'framework', title: 'Framework Academy', icon: 'i-layers', where: 'Structure' },
      { kind: 'command', id: 'fsrs', title: 'Start due review', icon: 'i-play', where: 'Review' },
      { kind: 'command', id: 'drill', title: 'Random drill', icon: 'i-spark', where: 'Review' },
      { kind: 'command', id: 'interview', title: 'Interview bank', icon: 'i-mic', where: 'Interview' },
      { kind: 'command', id: 'cheatsheet', title: 'Cheat sheet', icon: 'i-bookmark', where: 'Reference' },
      { kind: 'command', id: 'bank-demo', title: 'Bank demo (E2E target)', icon: 'i-flask', where: 'Practice' },
      { kind: 'action', id: 'theme', title: 'Toggle dark / light theme', icon: 'i-sun', where: 'Action' },
    ];
  }

  function recentItems() {
    const titles = SECTION_TITLES();
    return loadArr(RECENT_KEY)
      .filter((id) => titles.has(id))
      .slice(0, 5)
      .map((id) => ({ kind: 'section', id, title: titles.get(id), icon: 'i-clock', where: 'Recent' }));
  }

  function pushRecent(id) {
    const list = loadArr(RECENT_KEY).filter((x) => x !== id);
    list.unshift(id);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8))); } catch { /* quota */ }
  }

  function searchItems(query) {
    const mini = window.PWMiniSearch;
    if (!mini) return [];
    let hits;
    try {
      hits = mini.search(query, { boost: { title: 4, nav: 2, body: 1 }, fuzzy: 0.15, prefix: true });
    } catch { return []; }
    const seen = new Set();
    const out = [];
    for (const hit of hits) {
      const key = (hit.title || '') + '|' + (hit.target || '');
      if (seen.has(key)) continue;
      seen.add(key);
      const kind = hit.kind || 'result';
      let navId = hit.target || 'home';
      // Framework lesson/mcq/scenario targets map onto Academy pages.
      if (String(navId).startsWith('FW-L-') || String(navId).startsWith('fw-l-')) {
        navId = 'framework-lesson';
      } else if (
        String(kind).startsWith('framework') ||
        String(navId).startsWith('FW-') ||
        String(navId).startsWith('fw-')
      ) {
        navId = 'framework';
      } else if (String(kind) === 'stuck' || String(navId).startsWith('stuck-')) {
        navId = 'framework'; // stuck hub UI may land elsewhere; keep searchable
      } else if (
        String(kind).startsWith('iv-') ||
        String(navId).startsWith('IV-Q-') ||
        String(navId).startsWith('IV-CODE-') ||
        String(navId).startsWith('IV-KIT-') ||
        String(navId).startsWith('IV-CRAFT-')
      ) {
        if (String(navId).startsWith('IV-KIT-')) navId = 'interviewer-kit';
        else if (String(navId).startsWith('IV-CRAFT-')) navId = 'interviewer-craft';
        else navId = 'interviewer-question';
      } else if (
        String(kind).startsWith('skill') ||
        String(navId).startsWith('SK-')
      ) {
        if (String(navId).startsWith('SK-') && navId.includes('-L')) navId = 'skills-lesson';
        else if (String(kind) === 'skill-track' || String(navId).startsWith('SK-')) navId = 'skills';
      }
      out.push({
        kind: 'result',
        contentKind: kind,
        lessonId: hit.target,
        id: navId,
        title: hit.title || hit.id,
        where: hit.nav || hit.kind || '',
        icon: kind.startsWith('framework') ? 'i-layers' : kind.startsWith('iv-') ? 'i-mic' : kind.startsWith('skill') ? 'i-book' : 'i-arrow',
      });
      if (out.length >= 24) break;
    }
    // Prefer Framework group first for framework-shaped queries.
    const fwish = /fixture|pom|storageState|shard|worker.?scope|framework|mergeTests/i.test(query);
    if (fwish) {
      out.sort((a, b) => {
        const aFw = String(a.contentKind || '').startsWith('framework') ? 0 : 1;
        const bFw = String(b.contentKind || '').startsWith('framework') ? 0 : 1;
        return aFw - bFw;
      });
    }
    return out;
  }

  function highlight(text, query) {
    if (!query) return esc(text);
    const rx = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return esc(text).replace(rx, '<mark>$1</mark>');
  }

  function renderPalette(query) {
    const groups = [];
    if (!query) {
      const recent = recentItems();
      if (recent.length) groups.push(['Recent', recent]);
      groups.push(['Jump to', paletteCommands()]);
    } else {
      const results = searchItems(query);
      const commands = paletteCommands().filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
      if (commands.length) groups.push(['Commands', commands]);
      if (results.length) groups.push([`${results.length} match${results.length === 1 ? '' : 'es'}`, results]);
    }

    palette.items = groups.flatMap(([, items]) => items);
    palette.index = 0;

    if (!palette.items.length) {
      palette.list.innerHTML = `<li class="cmdk-empty">No matches for “${esc(query)}”.
        Try <b>locator</b>, <b>flaky</b>, <b>storageState</b>, or a tier id like <b>B12</b>.</li>`;
      return;
    }

    let i = 0;
    palette.list.innerHTML = groups.map(([label, items]) => `
      <li class="cmdk-sec" role="presentation">${esc(label)}</li>
      ${items.map((item) => `
        <li class="cmdk-item" role="option" id="cmdk-opt-${i}" data-i="${i++}" aria-selected="false">
          <svg class="ico" viewBox="0 0 18 18" aria-hidden="true"><use href="#${item.icon}"/></svg>
          <b>${highlight(item.title, query)}</b>
          ${item.where ? `<span class="where">${esc(item.where)}</span>` : ''}
        </li>`).join('')}
    `).join('');
    selectPalette(0);
  }

  function selectPalette(next) {
    const options = $$('.cmdk-item', palette.list);
    if (!options.length) return;
    palette.index = (next + options.length) % options.length;
    options.forEach((el, i) => el.setAttribute('aria-selected', String(i === palette.index)));
    const active = options[palette.index];
    active.scrollIntoView({ block: 'nearest' });
    palette.input.setAttribute('aria-activedescendant', active.id);
  }

  function runPaletteItem(item) {
    if (!item) return;
    palette.dialog.close();
    if (item.kind === 'action' && item.id === 'theme') {
      $('#themeBtn')?.click();
      return;
    }
    pushRecent(item.id);
    goTo(item.id);
    if (item.lessonId && /^FW-L-\d+/i.test(String(item.lessonId))) {
      window.FrameworkAcademy?.showLesson?.(String(item.lessonId));
    }
    if (item.lessonId && /^IV-/i.test(String(item.lessonId))) {
      const tid = String(item.lessonId);
      if (tid.startsWith('IV-KIT-')) window.InterviewerMode?.showKit?.(tid);
      else if (tid.startsWith('IV-CRAFT-')) window.InterviewerMode?.showCraft?.(tid);
      else window.InterviewerMode?.showQuestion?.(tid);
    }
    if (item.lessonId && /^SK-[A-Z]+-L/i.test(String(item.lessonId))) {
      window.SkillsModules?.showLesson?.(String(item.lessonId));
    }
  }

  async function openPalette() {
    if (!palette.dialog) return;
    if (!palette.dialog.open) palette.dialog.showModal();
    palette.input.value = '';
    palette.input.disabled = true;
    palette.input.placeholder = 'Loading search…';
    palette.list.innerHTML = '<li class="cmdk-empty" role="status">Loading search index…</li>';
    try {
      await window.ensureSearchIndex?.(palette.input);
    } catch {
      palette.list.innerHTML = '<li class="cmdk-empty" role="alert">Search failed to load — reload the page.</li>';
      return;
    }
    palette.input.disabled = false;
    palette.input.placeholder = 'Search topics, questions, labs…';
    renderPalette('');
    palette.input.focus();
  }

  function initPalette() {
    palette.dialog = $('#cmdk');
    palette.input = $('#cmdkInput');
    palette.list = $('#cmdkList');
    if (!palette.dialog || !palette.input || !palette.list) return;

    let timer;
    palette.input.addEventListener('input', () => {
      clearTimeout(timer);
      const value = palette.input.value.trim();
      timer = setTimeout(() => renderPalette(value), 90);
    });

    palette.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectPalette(palette.index + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectPalette(palette.index - 1); }
      else if (e.key === 'Home') { e.preventDefault(); selectPalette(0); }
      else if (e.key === 'End') { e.preventDefault(); selectPalette(palette.items.length - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(palette.items[palette.index]); }
    });

    palette.list.addEventListener('click', (e) => {
      const li = e.target.closest('.cmdk-item');
      if (li) runPaletteItem(palette.items[Number(li.dataset.i)]);
    });
    palette.list.addEventListener('mousemove', (e) => {
      const li = e.target.closest('.cmdk-item');
      if (li) selectPalette(Number(li.dataset.i));
    });
    palette.dialog.addEventListener('click', (e) => {
      if (e.target === palette.dialog) palette.dialog.close();
    });

    $('#cmdkTrigger')?.addEventListener('click', openPalette);
    $('#pathBrowse')?.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
      const combo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !isEditable(e.target);
      if (combo || slash) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openPalette();
      }
    }, true);

    window.PWPalette = { open: openPalette };
  }

  /* ------------------------------------------------------------------ *
   * In-page table of contents for long theory sections
   * ------------------------------------------------------------------ */
  function buildToc(page) {
    if (!page || page.id === 'home' || page.dataset.tocReady) return;
    const headings = $$('h2.sec, h3.sub', page)
      .filter((h) => h.textContent.trim().length && !h.closest('details, .tile, .quiz-q, .card'))
      // The first heading is the page title — the TOC sits beside it already.
      .filter((h, i) => !(i === 0 && h === page.firstElementChild));
    if (headings.length < 4) return;
    page.dataset.tocReady = '1';

    const nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = '<b>On this page</b>';
    headings.forEach((h, i) => {
      if (!h.id) h.id = `${page.id}-h${i}`;
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = h.textContent.trim();
      a.title = a.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
      });
      nav.appendChild(a);
    });
    page.insertBefore(nav, page.firstChild);
    page.classList.add('has-toc');

    const links = $$('a', nav);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = headings.indexOf(entry.target);
        links.forEach((a, j) => a.classList.toggle('active', j === i));
      });
    }, { rootMargin: '-70px 0px -75% 0px' });
    headings.forEach((h) => observer.observe(h));
  }

  /* ------------------------------------------------------------------ *
   * Review keyboard shortcuts (1–4 grade the current card)
   * ------------------------------------------------------------------ */
  function initReviewShortcuts() {
    const grades = ['Again', 'Hard', 'Good', 'Easy'];
    document.addEventListener('keydown', (e) => {
      if (isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const page = $('#fsrs');
      if (!page || page.classList.contains('hidden')) return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx === -1) return;
      const btn = $(`[data-fsrs-grade="${grades[idx]}"]`);
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
    });
  }

  /* ------------------------------------------------------------------ *
   * Theme icon + shell wiring
   * ------------------------------------------------------------------ */
  function syncThemeIcon() {
    const dark = document.documentElement.dataset.theme !== 'light';
    const use = $('#themeBtn use');
    if (use) use.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    $('#themeBtn')?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function initShell() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-go]');
      if (!trigger || trigger.classList.contains('result')) return;
      const id = trigger.dataset.go;
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      goTo(id);
    });

    $('#themeBtn')?.addEventListener('click', () => setTimeout(syncThemeIcon, 0));
    new MutationObserver(syncThemeIcon).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    syncThemeIcon();

    // Refresh dashboard data whenever the user lands back on it.
    const original = window.showSection;
    if (typeof original === 'function') {
      window.showSection = function patched(id, push) {
        const out = original.call(this, id, push);
        try { localStorage.setItem('pw-last-section', id); } catch { /* quota */ }
        if (id === 'home') refresh();
        if (id === 'roadmap') refreshLearningPath();
        updateGroupHints();
        buildToc(document.getElementById(id));
        return out;
      };
    }
    window.addEventListener('pw:review-graded', refresh);
  }

  function refresh() {
    renderDashboard();
    updateStreakChip();
    updateGroupHints();
    refreshLearningPath();
  }

  function boot() {
    initPalette();
    initReviewShortcuts();
    initShell();
    refresh();
    window.applyReadingTimes?.();
    buildToc(document.querySelector('.page:not(.hidden)'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.PWDash = { refresh, refreshLearningPath };
})();
