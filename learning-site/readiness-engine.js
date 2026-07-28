/**
 * Interview Readiness Score — deterministic, explainable, ML-free (RS-*).
 * TopicMastery = 0.5·EWMA accuracy + 0.3·mean FSRS R + 0.2·exercise completion
 */
(function () {
  const STATE_KEY = 'pqa.readiness.v1';
  const ATTEMPTS_DB = 'pqa-readiness';
  const ATTEMPTS_STORE = 'attempts';
  const EWMA_ALPHA = 0.2;
  const MIN_ATTEMPTS = 3;
  const WEIGHTS = { accuracy: 0.5, fsrs: 0.3, exercise: 0.2 };

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(ATTEMPTS_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(ATTEMPTS_STORE)) {
          db.createObjectStore(ATTEMPTS_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function recordAttempt({ itemId, topic, type, correct }) {
    const db = await openDb();
    const rec = { itemId, topic, type, correct: !!correct, ts: Date.now() };
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ATTEMPTS_STORE, 'readwrite');
      tx.objectStore(ATTEMPTS_STORE).add(rec);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const state = loadState();
    const t = state[topic] || { ewmaAccuracy: 0.5, attempts: 0, lastTs: 0, exercisesDone: 0, exercisesTotal: 0 };
    const outcome = correct ? 1 : 0;
    t.ewmaAccuracy = (1 - EWMA_ALPHA) * (t.attempts ? t.ewmaAccuracy : 0.5) + EWMA_ALPHA * outcome;
    t.attempts += 1;
    t.lastTs = rec.ts;
    state[topic] = t;
    saveState(state);
    window.dispatchEvent(new CustomEvent('pqa:readiness-updated'));
    return rec;
  }

  async function getAttemptsForTopic(topic) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ATTEMPTS_STORE, 'readonly');
      const req = tx.objectStore(ATTEMPTS_STORE).getAll();
      req.onsuccess = () => resolve((req.result || []).filter((a) => a.topic === topic));
      req.onerror = () => reject(req.error);
    });
  }

  function fsrsRetrievability(card, now = Date.now()) {
    const stability = Number(card.stability) || 0;
    if (!stability) return 0.9;
    const last = card.last_review ? new Date(card.last_review).getTime() : now;
    const elapsedDays = Math.max(0, (now - last) / 86400000);
    const api = window.FSRS;
    if (api?.FSRS?.prototype?.algorithm?.forgetting_curve) {
      try {
        const f = new api.FSRS({});
        return f.algorithm.forgetting_curve(elapsedDays, stability);
      } catch {
        /* fall through */
      }
    }
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
  }

  async function meanFsrsForTopic(topic) {
    const cards = (await window.FSRSApp?.getCards?.()) || [];
    const topicCards = cards.filter((c) => String(c.id || '').includes(topic) || c.topic === topic);
    if (!topicCards.length) return null;
    const rs = topicCards.map((c) => fsrsRetrievability(c));
    return rs.reduce((a, b) => a + b, 0) / rs.length;
  }

  function exerciseTotals(topic) {
    const skills = window.SKILL_MODULES || { exercises: [], lessons: [] };
    const fw = window.FRAMEWORK_ACADEMY || { exercises: [], lessons: [] };
    const allEx = [...skills.exercises, ...fw.exercises].filter((e) => e.topic === topic);
    const progress = {
      ...JSON.parse(localStorage.getItem('pw-sk-progress') || '{}'),
      ...JSON.parse(localStorage.getItem('pw-fw-progress') || '{}'),
    };
    const done = allEx.filter((e) => progress[e.id]).length;
    return { done, total: allEx.length || 1 };
  }

  function band(score) {
    if (score >= 0.8) return 'ready';
    if (score >= 0.5) return 'developing';
    return 'weak';
  }

  async function computeTopicMastery(topic) {
    const state = loadState()[topic] || { ewmaAccuracy: 0.5, attempts: 0 };
    if (state.attempts < MIN_ATTEMPTS) {
      return { topic, insufficient: true, attempts: state.attempts, band: 'insufficient' };
    }
    const fsrsR = await meanFsrsForTopic(topic);
    const ex = exerciseTotals(topic);
    const exRatio = ex.total ? ex.done / ex.total : 0;
    let wAcc = WEIGHTS.accuracy;
    let wFsrs = WEIGHTS.fsrs;
    let wEx = WEIGHTS.exercise;
    if (fsrsR == null) {
      const sum = wAcc + wEx;
      wAcc /= sum;
      wEx /= sum;
      wFsrs = 0;
    }
    const mastery =
      wAcc * state.ewmaAccuracy + (fsrsR != null ? wFsrs * fsrsR : 0) + wEx * exRatio;
    return {
      topic,
      mastery,
      band: band(mastery),
      ewmaAccuracy: state.ewmaAccuracy,
      fsrsR,
      exerciseRatio: exRatio,
      attempts: state.attempts,
      insufficient: false,
    };
  }

  async function computeAllTopics() {
    const registry = window.TOPICS_REGISTRY?.topics || [];
    const results = [];
    for (const t of registry) {
      results.push(await computeTopicMastery(t.key));
    }
    return results;
  }

  async function overallReadiness() {
    const all = await computeAllTopics();
    const valid = all.filter((t) => !t.insufficient);
    if (!valid.length) return { percent: 0, band: 'insufficient', topics: all };
    const weighted = valid.reduce((s, t) => s + t.mastery * Math.max(1, t.attempts), 0);
    const weightSum = valid.reduce((s, t) => s + Math.max(1, t.attempts), 0);
    const mastery = weighted / weightSum;
    return {
      percent: Math.round(mastery * 100),
      band: band(mastery),
      topics: all,
      weak: all.filter((t) => !t.insufficient && t.band === 'weak').slice(0, 3),
    };
  }

  function markExerciseDone(exerciseId, topic) {
    const key = exerciseId.startsWith('FW-') ? 'pw-fw-progress' : 'pw-sk-progress';
    const p = JSON.parse(localStorage.getItem(key) || '{}');
    p[exerciseId] = true;
    localStorage.setItem(key, JSON.stringify(p));
    const state = loadState();
    const t = state[topic] || { ewmaAccuracy: 0.5, attempts: 0, exercisesDone: 0, exercisesTotal: 0 };
    t.exercisesDone = (t.exercisesDone || 0) + 1;
    state[topic] = t;
    saveState(state);
    window.Gamification?.onQualityAction?.('exercise');
  }

  window.ReadinessEngine = {
    EWMA_ALPHA,
    MIN_ATTEMPTS,
    WEIGHTS,
    recordAttempt,
    computeTopicMastery,
    computeAllTopics,
    overallReadiness,
    markExerciseDone,
    band,
    loadState,
  };
})();
