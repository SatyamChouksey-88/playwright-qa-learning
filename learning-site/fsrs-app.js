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

  function renderCard(host) {
    const title = host.querySelector('[data-fsrs-title]');
    const meta = host.querySelector('[data-fsrs-meta]');
    const empty = host.querySelector('[data-fsrs-empty]');
    const grades = host.querySelector('[data-fsrs-grades]');
    if (!current) {
      title.textContent = 'All caught up';
      meta.textContent = 'No cards due. Export your progress or come back later.';
      empty.hidden = false;
      grades.hidden = true;
      return;
    }
    empty.hidden = true;
    grades.hidden = false;
    title.textContent = current.title || current.id;
    meta.textContent = `${current.kind || ''} · reps ${current.reps || 0} · lapses ${current.lapses || 0}`;
  }

  async function refresh(host, api) {
    const cards = await ensureSeeded(api);
    queue = dueCards(cards);
    current = queue[0] || null;
    const dueEl = host.querySelector('[data-fsrs-due]');
    if (dueEl) dueEl.textContent = String(queue.length);
    renderCard(host);
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
    await refresh(host, api);
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
      host.querySelector('[data-fsrs-open]')?.addEventListener('click', () => {
        if (current?.target && typeof window.showSection === 'function') window.showSection(current.target);
        else if (current?.target) location.hash = '#' + current.target;
      });
      await refresh(host, api);
    },
  };
})();
