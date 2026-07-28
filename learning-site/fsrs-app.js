/* FSRS-6 review UI — uses vendored ts-fsrs (window.tsFsrs / global). file:// safe. */
(function () {
  const DB_NAME = 'pw-fsrs';
  const DB_VERSION = 1;
  const STORE = 'cards';

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllCards() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function putCard(card) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(card);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearCards() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function getFsrsApi() {
    return window.FSRS || null;
  }

  function seedDeck() {
    const items = [];
    const data = window.INTERVIEW_DATA;
    if (data) {
      for (const key of ['tierA', 'tierB', 'tierC', 'tierD']) {
        for (const q of data[key]?.questions || []) {
          items.push({ id: `interview:${q.id}`, title: q.q, target: data[key].id, kind: 'interview' });
        }
      }
    }
    const ess = window.INTERVIEW_ESSENTIALS;
    if (ess?.categories) {
      for (const cat of ess.categories) {
        for (const q of cat.questions || []) {
          items.push({ id: `essentials:${q.id}`, title: q.q, target: 'interview-essentials', kind: 'essentials' });
        }
      }
    }
    return items.slice(0, 75);
  }

  function createEmptyCard(api, id) {
    if (api.createEmptyCard) return { id, ...api.createEmptyCard() };
    return {
      id,
      due: new Date(),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      last_review: undefined,
    };
  }

  let deckMeta = [];
  let queue = [];
  let current = null;

  async function ensureSeeded(api) {
    const existing = await getAllCards();
    if (existing.length) return existing;
    deckMeta = seedDeck();
    for (const item of deckMeta) {
      await putCard({ ...createEmptyCard(api, item.id), title: item.title, target: item.target, kind: item.kind });
    }
    return getAllCards();
  }

  function dueCards(cards) {
    const now = Date.now();
    return cards
      .filter((c) => !c.due || new Date(c.due).getTime() <= now)
      .sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0));
  }

  let sessionCount = 0;
  let sessionStart = 0;

  /* Human-readable interval each grade would schedule, shown on the buttons. */
  function humanDays(days) {
    if (!Number.isFinite(days) || days <= 0) return '<10m';
    if (days < 1) return `${Math.max(10, Math.round(days * 24 * 60))}m`;
    if (days < 30) return `${Math.round(days)}d`;
    if (days < 365) return `${(days / 30).toFixed(1)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  }

  function previewIntervals(host, api) {
    const Rating = api.Rating || { Again: 1, Hard: 2, Good: 3, Easy: 4 };
    const now = new Date();
    for (const name of ['Again', 'Hard', 'Good', 'Easy']) {
      const slot = host.querySelector(`[data-fsrs-next="${name}"]`);
      if (!slot) continue;
      if (!current) { slot.textContent = '—'; continue; }
      try {
        const input = {
          ...current,
          due: current.due ? new Date(current.due) : now,
          last_review: current.last_review ? new Date(current.last_review) : undefined,
        };
        const next = api.fsrs().next(input, now, Rating[name]).card;
        const dueAt = next.due instanceof Date ? next.due : new Date(next.due);
        slot.textContent = humanDays((dueAt.getTime() - now.getTime()) / 86400000);
      } catch {
        slot.textContent = '—';
      }
    }
  }

  /* Cards store only the prompt; pull the model answer back out of the bank. */
  function answerFor(card) {
    if (!card?.id) return null;
    const [kind, rawId] = String(card.id).split(':');
    const pools = [];
    if (kind === 'interview' && window.INTERVIEW_DATA) {
      for (const key of ['tierA', 'tierB', 'tierC', 'tierD']) {
        pools.push(...(window.INTERVIEW_DATA[key]?.questions || []));
      }
    }
    if (kind === 'essentials' && window.INTERVIEW_ESSENTIALS?.categories) {
      for (const cat of window.INTERVIEW_ESSENTIALS.categories) pools.push(...(cat.questions || []));
    }
    return pools.find((q) => q.id === rawId) || null;
  }

  function renderCard(host, api) {
    const title = host.querySelector('[data-fsrs-title]');
    const meta = host.querySelector('[data-fsrs-meta]');
    const kind = host.querySelector('[data-fsrs-kind]');
    const empty = host.querySelector('[data-fsrs-empty]');
    const grades = host.querySelector('[data-fsrs-grades]');
    const card = host.querySelector('[data-fsrs-card]');
    const answer = host.querySelector('[data-fsrs-answer]');
    const progress = host.querySelector('[data-fsrs-progress]');
    const session = host.querySelector('[data-fsrs-session]');

    if (answer) answer.hidden = true;
    if (session) session.textContent = `${sessionCount} graded this session`;
    if (progress) {
      const total = Math.max(sessionStart, 1);
      progress.style.width = Math.round((sessionCount / total) * 100) + '%';
    }

    if (!current) {
      if (card) card.hidden = true;
      empty.hidden = false;
      grades.hidden = true;
      return;
    }
    if (card) card.hidden = false;
    empty.hidden = true;
    grades.hidden = false;
    title.textContent = current.title || current.id;
    if (kind) kind.textContent = current.kind === 'essentials' ? 'Interview essentials' : 'Interview bank';
    meta.textContent = `Reps ${current.reps || 0} · lapses ${current.lapses || 0}` +
      (current.stability ? ` · stability ${Number(current.stability).toFixed(1)}d` : ' · new card');

    if (answer) {
      const model = answerFor(current);
      answer.innerHTML = model
        ? `<div class="ideal"><strong>Ideal approach</strong>${model.ideal || model.a || ''}</div>` +
          (model.stuck ? `<div class="stuck"><strong>Where candidates get stuck</strong>${model.stuck}</div>` : '')
        : '<p class="lead" style="margin:0">Answer out loud, then open the source section to check yourself.</p>';
      if (typeof window.enhanceCodeBlocks === 'function') window.enhanceCodeBlocks(answer);
    }
    if (api) previewIntervals(host, api);
  }

  async function refresh(host, api) {
    const cards = await ensureSeeded(api);
    queue = dueCards(cards);
    if (!sessionStart) sessionStart = queue.length;
    current = queue[0] || null;
    document.querySelectorAll('[data-fsrs-due]').forEach((el) => {
      el.textContent = String(queue.length);
      if (el.dataset.zero !== undefined) el.dataset.zero = queue.length ? '0' : '1';
    });
    renderCard(host, api);
    const live = document.getElementById('ariaLive');
    if (live) live.textContent = queue.length ? `${queue.length} cards due` : 'Review queue empty';
  }

  async function grade(host, api, rating) {
    if (!current || !api.fsrs) return;
    const f = api.fsrs();
    const now = new Date();
    const input = {
      ...current,
      due: current.due ? new Date(current.due) : now,
      last_review: current.last_review ? new Date(current.last_review) : undefined,
    };
    const result = f.next(input, now, rating);
    const card = result.card;
    const nextCard = {
      ...current,
      ...card,
      due: card.due instanceof Date ? card.due.toISOString() : card.due,
      last_review: card.last_review instanceof Date ? card.last_review.toISOString() : card.last_review,
      title: current.title,
      target: current.target,
      kind: current.kind,
    };
    await putCard(nextCard);
    logReview();
    sessionCount += 1;
    await refresh(host, api);
    window.dispatchEvent(new CustomEvent('pw:review-graded'));
  }

  /* Lightweight review history for the dashboard heatmap + streak. */
  function logReview() {
    try {
      const log = JSON.parse(localStorage.getItem('pw-fsrs-log') || '[]');
      const list = Array.isArray(log) ? log : [];
      list.push(Date.now());
      localStorage.setItem('pw-fsrs-log', JSON.stringify(list.slice(-4000)));
    } catch { /* storage disabled */ }
  }

  async function exportJson() {
    const cards = await getAllCards();
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), cards }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pw-fsrs-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importJson(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data.cards)) throw new Error('Invalid export');
    await clearCards();
    for (const c of data.cards) await putCard(c);
  }

  window.FSRSApp = {
    getCards: getAllCards,
    async mount(host) {
      if (!host) return;
      const api = getFsrsApi();
      if (!api) {
        host.querySelector('[data-fsrs-title]').textContent = 'FSRS vendor missing';
        host.querySelector('[data-fsrs-meta]').textContent = 'Expected learning-site/vendor/ts-fsrs.js';
        return;
      }
      // Rating enum: Again=1 Hard=2 Good=3 Easy=4 in ts-fsrs
      const Rating = api.Rating || { Again: 1, Hard: 2, Good: 3, Easy: 4 };
      host.querySelectorAll('[data-fsrs-grade]').forEach((btn) => {
        btn.onclick = () => grade(host, api, Rating[btn.dataset.fsrsGrade] || Number(btn.dataset.fsrsGrade));
      });
      host.querySelector('[data-fsrs-export]')?.addEventListener('click', () => exportJson());
      host.querySelector('[data-fsrs-import]')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await importJson(file);
        await refresh(host, api);
      });
      const answer = host.querySelector('[data-fsrs-answer]');
      const revealBtn = host.querySelector('[data-fsrs-reveal]');
      revealBtn?.addEventListener('click', () => {
        if (answer) answer.hidden = !answer.hidden;
        revealBtn.setAttribute('aria-expanded', String(!answer?.hidden));
      });
      document.addEventListener('keydown', (e) => {
        const page = document.getElementById('fsrs');
        if (e.code !== 'Space' || !page || page.classList.contains('hidden')) return;
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || e.target?.isContentEditable) return;
        e.preventDefault();
        revealBtn?.click();
      });
      host.querySelector('[data-fsrs-open]')?.addEventListener('click', () => {
        if (current?.target && typeof window.showSection === 'function') window.showSection(current.target);
        else if (current?.target) location.hash = '#' + current.target;
      });
      await refresh(host, api);
    },
  };
})();
