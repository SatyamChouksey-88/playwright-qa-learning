/** Personal knowledge tools (PK-*) — bookmarks, notes, cheat sheet, backup. */
(function () {
  const BOOKMARKS_KEY = 'pqa.bookmarks.v1';
  const NOTES_KEY = 'pqa.notes.v1';
  const CHEAT_KEY = 'pqa.cheatsheet.v1';
  const BACKUP_VERSION = 1;

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return key.includes('notes') ? {} : [];
    }
  }

  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function toggleBookmark(id, kind, title) {
    let list = load(BOOKMARKS_KEY);
    const ix = list.findIndex((b) => b.id === id);
    if (ix >= 0) list.splice(ix, 1);
    else list.push({ id, kind, title, ts: Date.now() });
    save(BOOKMARKS_KEY, list);
    return ix < 0;
  }

  function setNote(id, text) {
    const notes = load(NOTES_KEY);
    if (typeof notes !== 'object') return;
    notes[id] = text;
    save(NOTES_KEY, notes);
  }

  function addCheatSnippet(text, source) {
    const list = load(CHEAT_KEY);
    list.push({ id: `cs-${Date.now()}`, text, source, ts: Date.now() });
    save(CHEAT_KEY, list);
  }

  function exportAll() {
    const payload = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      bookmarks: load(BOOKMARKS_KEY),
      notes: load(NOTES_KEY),
      cheatsheet: load(CHEAT_KEY),
      readiness: localStorage.getItem('pqa.readiness.v1'),
      exams: localStorage.getItem('pqa.exams.v1'),
      plan: localStorage.getItem('pqa.plan.v1'),
      streak: localStorage.getItem('pqa.streak.v1'),
      badges: localStorage.getItem('pqa.badges.v1'),
      skProgress: localStorage.getItem('pw-sk-progress'),
      fwProgress: localStorage.getItem('pw-fw-progress'),
      fsrsLog: localStorage.getItem('pw-fsrs-log'),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pqa-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importAll(file) {
    const data = JSON.parse(await file.text());
    if (data.version !== BACKUP_VERSION) throw new Error('Unsupported backup version');
    if (data.bookmarks) save(BOOKMARKS_KEY, data.bookmarks);
    if (data.notes) save(NOTES_KEY, data.notes);
    if (data.cheatsheet) save(CHEAT_KEY, data.cheatsheet);
    const keys = ['readiness', 'exams', 'plan', 'streak', 'badges', 'skProgress', 'fwProgress', 'fsrsLog'];
    const map = {
      readiness: 'pqa.readiness.v1',
      exams: 'pqa.exams.v1',
      plan: 'pqa.plan.v1',
      streak: 'pqa.streak.v1',
      badges: 'pqa.badges.v1',
      skProgress: 'pw-sk-progress',
      fwProgress: 'pw-fw-progress',
      fsrsLog: 'pw-fsrs-log',
    };
    keys.forEach((k) => {
      if (data[k] != null) localStorage.setItem(map[k], typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]));
    });
  }

  function renderBookmarks(root) {
    const list = load(BOOKMARKS_KEY);
    root.innerHTML = `
      <ul class="pk-list">${list.map((b) => `<li><code>${b.kind}</code> ${b.title || b.id}</li>`).join('') || '<li class="muted">No bookmarks yet.</li>'}</ul>
    `;
  }

  function renderNotes(root) {
    root.innerHTML = `
      <label>Attach note to current lesson id <input id="pkNoteId" placeholder="SK-API-L01"/></label>
      <textarea id="pkNoteText" rows="8" class="pk-note"></textarea>
      <button type="button" class="pw-btn tiny" id="pkSaveNote">Save note</button>
    `;
    root.querySelector('#pkSaveNote')?.addEventListener('click', () => {
      const id = root.querySelector('#pkNoteId').value.trim();
      const text = root.querySelector('#pkNoteText').value;
      if (id) setNote(id, text);
    });
  }

  function renderCheatsheet(root) {
    const list = load(CHEAT_KEY);
    root.innerHTML = `
      <div class="pk-cheatsheet pk-printable">
        <button type="button" class="pw-btn ghost tiny" onclick="window.print()">Print</button>
        <ol>${list.map((s) => `<li>${s.text} <span class="muted">(${s.source})</span></li>`).join('') || '<li class="muted">Add snippets from lessons via "Add to cheat sheet".</li>'}</ol>
      </div>
    `;
  }

  function renderBackup(root) {
    root.innerHTML = `
      <p class="muted">Export/import all local progress — the only cross-device backup (no accounts).</p>
      <button type="button" class="pw-btn" id="pkExport">Export JSON</button>
      <label class="pw-btn ghost">Import JSON <input type="file" id="pkImport" accept="application/json" hidden/></label>
    `;
    root.querySelector('#pkExport')?.addEventListener('click', exportAll);
    root.querySelector('#pkImport')?.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (f) await importAll(f);
    });
  }

  function boot() {
    document.querySelectorAll('.pk-bookmark').forEach((btn) => {
      btn.addEventListener('click', () => toggleBookmark(btn.dataset.pkId, btn.dataset.pkKind, btn.textContent));
    });
    const bm = document.getElementById('bookmarksMount');
    if (bm) renderBookmarks(bm);
    const nm = document.getElementById('notesMount');
    if (nm) renderNotes(nm);
    const cm = document.getElementById('cheatsheetMount');
    if (cm) renderCheatsheet(cm);
    const bk = document.getElementById('backupMount');
    if (bk) renderBackup(bk);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.PersonalKnowledge = {
    toggleBookmark,
    setNote,
    addCheatSnippet,
    exportAll,
    importAll,
    renderBookmarks,
    renderNotes,
    renderCheatsheet,
    renderBackup,
  };
})();
