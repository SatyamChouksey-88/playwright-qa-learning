/**
 * Interviewer Mode — kits, question bank, craft guide, local scoring.
 * Data: window.INTERVIEWER_MODE, window.INTERVIEWER_DIAGRAMS
 */
(function () {
  const SCORE_KEY = 'pw-iv-scores';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mdLite(text) {
    const escaped = esc(text);
    return escaped
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  function renderCodeBlocks(md) {
    return String(md || '').replace(/```ts\r?\n([\s\S]*?)```/g, (_, code) => {
      return `<pre class="code"><code>${esc(code.trim())}</code></pre>`;
    });
  }

  function renderMixed(md) {
    return String(md || '')
      .split(/(```ts\r?\n[\s\S]*?```)/g)
      .map((part) => (part.startsWith('```ts') ? renderCodeBlocks(part) : mdLite(part)))
      .join('');
  }

  function getData() {
    return (
      window.INTERVIEWER_MODE || {
        questions: [],
        coding: [],
        kits: [],
        craft: [],
        rubric: null,
      }
    );
  }

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveScores(map) {
    localStorage.setItem(SCORE_KEY, JSON.stringify(map));
  }

  function setScore(questionId, dimension, value) {
    const s = loadScores();
    s[questionId] = s[questionId] || {};
    s[questionId][dimension] = value;
    saveScores(s);
  }

  const LEVELS = [
    { id: 'fresher', label: 'Fresher' },
    { id: 'junior', label: 'Junior' },
    { id: 'mid', label: 'Mid' },
    { id: 'senior', label: 'Senior' },
    { id: 'architect', label: 'Architect' },
  ];

  const ROUNDS = ['screening', 'theory', 'coding', 'design', 'behavioral-technical'];

  function renderLanding(root) {
    const data = getData();
    const roundFlow = window.INTERVIEWER_DIAGRAMS?.['IV-DIAG-ROUND-FLOW'] || '';
    const scoringDiag = window.INTERVIEWER_DIAGRAMS?.['IV-DIAG-SCORING'] || '';

    root.innerHTML = `
      <div class="iv-counts" aria-label="Interviewer Mode counts">
        <span class="pill">${data.questions.length} questions</span>
        <span class="pill">${data.coding.length} live coding</span>
        <span class="pill">${data.kits.length} interview kits</span>
        <span class="pill">${data.craft.length} craft lessons</span>
      </div>
      <div class="iv-pickers">
        <label>Level
          <select id="ivLevelPick" aria-label="Candidate level">
            <option value="">All levels</option>
            ${LEVELS.map((l) => `<option value="${l.id}">${l.label}</option>`).join('')}
          </select>
        </label>
        <label>Round type
          <select id="ivRoundPick" aria-label="Round type">
            <option value="">All rounds</option>
            ${ROUNDS.map((r) => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="iv-grid">
        <section class="iv-panel">
          <h3>Interview kits</h3>
          <ul class="iv-kit-list" id="ivKitList"></ul>
        </section>
        <section class="iv-panel">
          <h3>Question bank</h3>
          <ul class="iv-q-list" id="ivQList" aria-live="polite"></ul>
        </section>
        <section class="iv-panel">
          <h3>Interviewer craft</h3>
          <ul class="iv-craft-list">
            ${data.craft
              .map(
                (c) =>
                  `<li><a href="#" class="iv-craft-link" data-iv-craft="${esc(c.id)}">${esc(c.title)}</a></li>`,
              )
              .join('')}
          </ul>
        </section>
      </div>
      ${roundFlow ? `<div class="iv-diagram">${roundFlow}</div>` : ''}
      ${scoringDiag ? `<div class="iv-diagram">${scoringDiag}</div>` : ''}
    `;

    const kitList = $('#ivKitList', root);
    kitList.innerHTML = data.kits
      .map(
        (k) =>
          `<li><a href="#" class="iv-kit-link" data-iv-kit="${esc(k.id)}"><code>${esc(k.id)}</code> · ${esc(k.level)} · ${k.duration}m</a></li>`,
      )
      .join('');

    function refreshQuestions() {
      const level = $('#ivLevelPick', root)?.value || '';
      const round = $('#ivRoundPick', root)?.value || '';
      const items = [
        ...data.questions.filter((q) => (!level || q.level === level) && (!round || q.round === round)),
        ...data.coding.filter((c) => (!level || c.level === level) && (!round || c.round === round)),
      ].sort((a, b) => a.id.localeCompare(b.id));
      const qList = $('#ivQList', root);
      qList.innerHTML = items.length
        ? items
            .map(
              (q) =>
                `<li><a href="#" class="iv-q-link" data-iv-q="${esc(q.id)}"><code>${esc(q.id)}</code> · ${esc((q.question || q.task || '').slice(0, 72))}${(q.question || q.task || '').length > 72 ? '…' : ''}</a></li>`,
            )
            .join('')
        : '<li class="muted">No questions match filters.</li>';
    }

    $('#ivLevelPick', root)?.addEventListener('change', refreshQuestions);
    $('#ivRoundPick', root)?.addEventListener('change', refreshQuestions);
    refreshQuestions();

    root.querySelectorAll('[data-iv-kit]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showKit(a.getAttribute('data-iv-kit'));
        location.hash = 'interviewer-kit';
      });
    });
    root.querySelectorAll('[data-iv-craft]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showCraft(a.getAttribute('data-iv-craft'));
        location.hash = 'interviewer-craft';
      });
    });
    root.addEventListener('click', (e) => {
      const link = e.target.closest('[data-iv-q]');
      if (!link) return;
      e.preventDefault();
      showQuestion(link.getAttribute('data-iv-q'));
      location.hash = 'interviewer-question';
    });
  }

  function showQuestion(id) {
    const data = getData();
    const q = data.questions.find((x) => x.id === id) || data.coding.find((x) => x.id === id);
    const mount = $('#ivQuestionMount');
    if (!q || !mount) return;

    const isCoding = q.type === 'iv-coding';
    const hints = (q.hints || [])
      .map((h, i) => `<details><summary>Hint ${i + 1}</summary><p>${mdLite(h)}</p></details>`)
      .join('');

    const scoringRows = q.scoring
      ? Object.entries(q.scoring)
          .map(([s, anchor]) => `<tr><td>${esc(s)}</td><td>${mdLite(anchor)}</td></tr>`)
          .join('')
      : '';

    mount.innerHTML = `
      <article class="iv-question" data-qid="${esc(q.id)}">
        <p class="eyebrow"><code>${esc(q.id)}</code> · ${esc(q.level)} · ${esc(q.round)} · ${q.timebox} min</p>
        <h2>${mdLite(isCoding ? q.task : q.question)}</h2>
        ${isCoding ? `<p class="callout note"><strong>Interviewer script:</strong> ${mdLite(q.script)}</p>` : ''}
        <section><h3>What this tests</h3><p>${mdLite(isCoding ? q.evaluate?.join('; ') : q.tests)}</p></section>
        <details class="iv-reveal">
          <summary>Model answer / exemplar solution</summary>
          <div>${isCoding ? renderCodeBlocks(q.solution) : renderMixed(q.modelAnswer)}</div>
        </details>
        ${
          !isCoding
            ? `<section><h3>Strong answer signals</h3><ul>${q.strongSignals.map((s) => `<li>${mdLite(s)}</li>`).join('')}</ul></section>
        <section class="callout warn"><h3>Weak answer / red flags</h3><ul>${q.weakSignals.map((s) => `<li>${mdLite(s)}</li>`).join('')}</ul></section>
        <section><h3>Follow-up probes</h3><ul>${q.followUps.map((s) => `<li>${mdLite(s)}</li>`).join('')}</ul></section>`
            : `<section><h3>Common mistakes</h3><ul>${(q.mistakes || []).map((s) => `<li>${mdLite(s)}</li>`).join('')}</ul></section>
        ${q.starter ? `<section><h3>Starter code</h3>${renderCodeBlocks(q.starter)}</section>` : ''}
        ${q.specFile ? `<p class="muted">Run: <code>npm --prefix practice-suite run exercise:interviewer</code> · ${esc(q.specFile)}</p>` : ''}`
        }
        ${hints ? `<section class="iv-hints"><h3>Hint ladder</h3>${hints}</section>` : ''}
        ${
          scoringRows
            ? `<section><h3>Scoring guide</h3><table class="iv-score-table"><thead><tr><th>Score</th><th>Anchor</th></tr></thead><tbody>${scoringRows}</tbody></table></section>`
            : ''
        }
        <section class="iv-local-score">
          <h3>Session notes (local only)</h3>
          <p class="muted">Scores stay in your browser — never uploaded.</p>
          ${['Technical depth', 'Problem-solving process', 'Communication', 'Code quality', 'Judgment / trade-offs']
            .map(
              (dim) =>
                `<label>${esc(dim)}
              <select data-dim="${esc(dim)}" aria-label="Score ${dim}">
                <option value="">—</option>
                ${[1, 2, 3, 4].map((n) => `<option value="${n}">${n}</option>`).join('')}
              </select></label>`,
            )
            .join('')}
        </section>
        <p><a class="pw-btn ghost" href="#interviewer">Back to Interviewer Mode</a></p>
      </article>
    `;

    const scores = loadScores()[q.id] || {};
    mount.querySelectorAll('[data-dim]').forEach((sel) => {
      const dim = sel.getAttribute('data-dim');
      if (scores[dim]) sel.value = String(scores[dim]);
      sel.addEventListener('change', () => setScore(q.id, dim, Number(sel.value) || null));
    });
  }

  function showKit(id) {
    const kit = getData().kits.find((k) => k.id === id);
    const mount = $('#ivKitMount');
    if (!kit || !mount) return;

    const agendaRows = kit.agenda
      .map(([seg, min]) => `<tr><td>${esc(seg)}</td><td>${min}</td></tr>`)
      .join('');
    mount.innerHTML = `
      <article class="iv-kit iv-printable">
        <header class="iv-kit-header">
          <p class="eyebrow"><code>${esc(kit.id)}</code> · ${esc(kit.level)} · ${kit.duration} minutes</p>
          <h2>Interview kit</h2>
          <button type="button" class="pw-btn tiny" id="ivPrintKit">Print kit</button>
        </header>
        <section><h3>Agenda</h3>
          <table><thead><tr><th>Segment</th><th>Min</th></tr></thead><tbody>${agendaRows}</tbody></table>
        </section>
        <section><h3>Ordered questions</h3><ol>${kit.questions.map((q) => `<li><code>${esc(q.id)}</code> (${q.timebox} min)</li>`).join('')}</ol></section>
        <section><h3>Backup questions</h3><ul>${kit.backup.map((b) => `<li><code>${esc(b)}</code></li>`).join('')}</ul></section>
        <section><h3>Hire bar</h3><p>${mdLite(kit.hireBar)}</p></section>
        <section class="iv-dos-donts"><h3>Do's &amp; don'ts</h3>
          <div class="cols"><div><strong>Do's</strong><ul>${kit.dos.map((d) => `<li>${mdLite(d)}</li>`).join('')}</ul></div>
          <div><strong>Don'ts</strong><ul>${kit.donts.map((d) => `<li>${mdLite(d)}</li>`).join('')}</ul></div></div>
        </section>
        <section><h3>Scoring sheet</h3>
          <p class="muted">Use IV-RUBRIC dimensions (1–4). Record evidence per question id.</p>
          <table class="iv-score-sheet"><thead><tr><th>Dimension</th><th>Score</th><th>Evidence</th></tr></thead>
          <tbody>${['Technical depth', 'Problem-solving process', 'Communication', 'Code quality', 'Judgment / trade-offs']
            .map((d) => `<tr><td>${esc(d)}</td><td></td><td></td></tr>`)
            .join('')}</tbody></table>
        </section>
        <p><a class="pw-btn ghost" href="#interviewer">Back to Interviewer Mode</a></p>
      </article>
    `;
    $('#ivPrintKit', mount)?.addEventListener('click', () => window.print());
  }

  function showCraft(id) {
    const c = getData().craft.find((x) => x.id === id);
    const mount = $('#ivCraftMount');
    if (!c || !mount) return;
    mount.innerHTML = `
      <article class="iv-craft-lesson">
        <p class="eyebrow"><code>${esc(c.id)}</code></p>
        <h2>${esc(c.title)}</h2>
        <p class="lead">${esc(c.objective)}</p>
        <section><h3>Concept</h3><p>${mdLite(c.concept)}</p></section>
        <section><h3>Why it matters</h3><p>${mdLite(c.why)}</p></section>
        <section><h3>Practice</h3><p>${mdLite(c.practice)}</p></section>
        <section class="callout warn"><h3>Common mistakes</h3><p>${mdLite(c.mistakes)}</p></section>
        <section><h3>Related</h3><ul>${c.related.map((r) => `<li>${mdLite(r)}</li>`).join('')}</ul></section>
        <p><a class="pw-btn ghost" href="#interviewer">Back to Interviewer Mode</a></p>
      </article>
    `;
  }

  function boot() {
    const hub = $('#ivModeMount');
    if (hub && window.INTERVIEWER_MODE) renderLanding(hub);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.InterviewerMode = { showQuestion, showKit, showCraft, renderLanding, boot };
})();
