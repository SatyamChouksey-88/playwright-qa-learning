/** Mock Exam Simulator (MX-*) — seeded stratified sampling, timer, FSRS seeding. */
(function () {
  const HISTORY_KEY = 'pqa.exams.v1';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sampleExam(pool, mode, seed) {
    const rng = mulberry32(seed);
    const count = mode === 'full' ? 60 : 25;
    const byDiff = { easy: [], medium: [], hard: [] };
    for (const q of pool) byDiff[q.difficulty]?.push(q);
    const targets = {
      easy: Math.round(count * 0.4),
      medium: Math.round(count * 0.4),
      hard: count - Math.round(count * 0.4) - Math.round(count * 0.4),
    };
    const picked = [];
    const used = new Set();
    for (const diff of ['easy', 'medium', 'hard']) {
      const arr = [...byDiff[diff]].sort(() => rng() - 0.5);
      let n = 0;
      for (const q of arr) {
        if (n >= targets[diff]) break;
        if (used.has(q.id)) continue;
        used.add(q.id);
        picked.push(q);
        n += 1;
      }
    }
    while (picked.length < count && pool.length > picked.length) {
      const q = pool[Math.floor(rng() * pool.length)];
      if (!used.has(q.id)) {
        used.add(q.id);
        picked.push(q);
      }
    }
    return picked.slice(0, count);
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveHistory(entry) {
    const h = loadHistory();
    h.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  }

  let timerId = null;
  let endsAt = 0;
  let exam = null;
  let answers = [];

  function renderExam(root) {
    const pool = window.MOCK_EXAM_POOL || [];
    root.innerHTML = `
      <div class="mx-setup">
        <label>Mode <select id="mxMode"><option value="quick">Quick (25 Q · ~35 min)</option><option value="full">Full (60 Q · 90 min)</option></select></label>
        <label>Seed <input id="mxSeed" type="number" value="${Date.now() % 100000}" /></label>
        <button type="button" class="pw-btn" id="mxStart">Start exam</button>
      </div>
      <div id="mxActive" hidden></div>
      <div id="mxReport" hidden></div>
      <section class="mx-history"><h3>Past exams</h3><ul id="mxHistory"></ul></section>
    `;
    const hist = $('#mxHistory', root);
    if (hist) {
      hist.innerHTML = loadHistory()
        .map((e) => `<li>${new Date(e.ts).toLocaleDateString()} · ${e.mode} · ${e.score}% · seed ${e.seed}</li>`)
        .join('') || '<li class="muted">No exams yet.</li>';
    }
    $('#mxStart', root)?.addEventListener('click', () => startExam(root));
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function startExam(root) {
    const mode = $('#mxMode', root)?.value || 'quick';
    const seed = Number($('#mxSeed', root)?.value) || Date.now();
    const pool = window.MOCK_EXAM_POOL || [];
    exam = { mode, seed, questions: sampleExam(pool, mode, seed), started: Date.now() };
    answers = exam.questions.map(() => ({ choice: null, ms: 0 }));
    const mins = mode === 'full' ? 90 : 35;
    endsAt = Date.now() + mins * 60000;
    const active = $('#mxActive', root);
    active.hidden = false;
    renderQuestion(root, 0);
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      const el = $('#mxTimer', root);
      if (el) el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
      if (left <= 0) submitExam(root);
    }, 500);
  }

  let qStart = 0;
  let qIndex = 0;

  function renderQuestion(root, idx) {
    qIndex = idx;
    qStart = Date.now();
    const q = exam.questions[idx];
    const active = $('#mxActive', root);
    active.innerHTML = `
      <p id="mxTimer" class="mx-timer"></p>
      <p>Question ${idx + 1} / ${exam.questions.length}</p>
      <h3>${q.question}</h3>
      <ol class="mx-options">${q.options.map((o, i) => `<li><button type="button" class="pw-btn ghost mx-opt" data-i="${i}">${o}</button></li>`).join('')}</ol>
      <div class="tile-actions">
        ${idx > 0 ? '<button type="button" class="pw-btn ghost" id="mxPrev">Previous</button>' : ''}
        ${idx < exam.questions.length - 1 ? '<button type="button" class="pw-btn" id="mxNext">Next</button>' : '<button type="button" class="pw-btn" id="mxSubmit">Submit</button>'}
      </div>
    `;
    active.querySelectorAll('.mx-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        answers[idx].choice = Number(btn.getAttribute('data-i'));
        answers[idx].ms += Date.now() - qStart;
        active.querySelectorAll('.mx-opt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    $('#mxPrev', active)?.addEventListener('click', () => {
      answers[idx].ms += Date.now() - qStart;
      renderQuestion(root, idx - 1);
    });
    $('#mxNext', active)?.addEventListener('click', () => {
      answers[idx].ms += Date.now() - qStart;
      renderQuestion(root, idx + 1);
    });
    $('#mxSubmit', active)?.addEventListener('click', () => submitExam(root));
  }

  function submitExam(root) {
    if (timerId) clearInterval(timerId);
    answers[qIndex].ms += Date.now() - qStart;
    let correct = 0;
    const byTopic = {};
    exam.questions.forEach((q, i) => {
      const ok = answers[i].choice === q.answerIndex;
      if (ok) correct += 1;
      else {
        window.ReadinessEngine?.recordAttempt?.({ itemId: q.id, topic: q.topic, type: 'mcq', correct: false });
        void window.FSRSApp?.ensureMcqCard?.({
          id: q.id,
          title: q.question,
          explanation: q.explanation || q.options?.[q.answerIndex],
          target: q.source === 'framework' ? 'framework' : q.source === 'quiz' ? 'quiz' : 'skills',
          topic: q.topic,
        });
      }
      if (ok) window.ReadinessEngine?.recordAttempt?.({ itemId: q.id, topic: q.topic, type: 'mcq', correct: true });
      byTopic[q.topic] = byTopic[q.topic] || { c: 0, t: 0 };
      byTopic[q.topic].t += 1;
      if (ok) byTopic[q.topic].c += 1;
    });
    const score = Math.round((correct / exam.questions.length) * 100);
    saveHistory({ mode: exam.mode, seed: exam.seed, score, ts: Date.now(), byTopic });
    window.Gamification?.onQualityAction?.('mock-exam');
    if (score >= 90) window.Gamification?.unlockBadge?.('mx-90');
    $('#mxActive', root).hidden = true;
    const report = $('#mxReport', root);
    report.hidden = false;
    report.innerHTML = `
      <h3>Score: ${score}%</h3>
      <p>${correct} / ${exam.questions.length} correct</p>
      <ul>${Object.entries(byTopic)
        .map(([t, v]) => `<li>${t}: ${Math.round((v.c / v.t) * 100)}%</li>`)
        .join('')}</ul>
      <button type="button" class="pw-btn ghost" id="mxRetry">New exam</button>
    `;
    $('#mxRetry', report)?.addEventListener('click', () => {
      report.hidden = true;
      renderExam(root);
    });
  }

  function boot() {
    const root = document.getElementById('mockExamMount');
    if (root) renderExam(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.MockExam = { sampleExam, mulberry32, boot };
})();
