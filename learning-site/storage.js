/* Versioned localStorage helpers (file:// safe). */
(function () {
  const SCHEMA_VERSION = 1;
  const META_KEY = 'pw-storage-meta';
  /** Keys owned by this app — wiped by wipeAllAppKeys(). */
  const APP_KEY_PREFIXES = ['pw-', 'pw_'];

  function readMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Migration map: version → function(meta).
   * v0→v1 records schema version only (legacy keys already used pw- prefixes).
   * Future migrations add numbered handlers here — do not silently no-op without documenting.
   */
  const MIGRATIONS = {
    1(meta) {
      return { ...meta, version: 1, migratedAt: Date.now(), note: 'v0→v1: adopt versioned meta; keys unchanged' };
    },
  };

  function migrateLocal() {
    const meta = readMeta();
    let from = Number(meta.version || 0);
    if (from >= SCHEMA_VERSION) return;
    let next = { ...meta };
    while (from < SCHEMA_VERSION) {
      const step = from + 1;
      const fn = MIGRATIONS[step];
      if (typeof fn === 'function') next = fn(next);
      else next = { ...next, version: step, migratedAt: Date.now() };
      from = step;
    }
    try {
      localStorage.setItem(META_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('storage migrate failed', err);
    }
  }

  function isAppKey(key) {
    return APP_KEY_PREFIXES.some((p) => key.startsWith(p));
  }

  function wipeAllAppKeys() {
    const doomed = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && isAppKey(k)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
    try {
      localStorage.setItem(META_KEY, JSON.stringify({ version: SCHEMA_VERSION, wipedAt: Date.now() }));
    } catch (err) {
      console.warn(err);
    }
    return doomed.length;
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
    wipeAllAppKeys,
  };
})();
