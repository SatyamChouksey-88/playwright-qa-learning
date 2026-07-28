/* Versioned localStorage + thin IndexedDB helpers (file:// safe). */
(function () {
  const SCHEMA_VERSION = 1;
  const META_KEY = 'pw-storage-meta';

  function readMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function migrateLocal() {
    const meta = readMeta();
    const from = Number(meta.version || 0);
    if (from >= SCHEMA_VERSION) return;
    // v0 → v1: prefix legacy keys stay; record version only.
    try {
      localStorage.setItem(META_KEY, JSON.stringify({ version: SCHEMA_VERSION, migratedAt: Date.now() }));
    } catch (err) {
      console.warn('storage migrate failed', err);
    }
  }

  migrateLocal();

  window.PWStorage = {
    schemaVersion: SCHEMA_VERSION,
    loadSet(key) {
      try {
        return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      } catch {
        return new Set();
      }
    },
    saveSet(key, set) {
      try {
        localStorage.setItem(key, JSON.stringify([...set]));
      } catch (err) {
        console.warn('Quota or storage error', err);
      }
    },
    getTheme() {
      try {
        return localStorage.getItem('pw-theme');
      } catch {
        return null;
      }
    },
    setTheme(v) {
      try {
        localStorage.setItem('pw-theme', v);
      } catch (err) {
        console.warn(err);
      }
    },
  };
})();
