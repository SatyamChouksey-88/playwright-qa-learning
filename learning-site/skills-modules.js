/**
 * Skill Modules hub (SK-*) — tracks, lessons, MCQs.
 */
(function () {
  const PROGRESS_KEY = 'pw-sk-progress';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getData() {
    return window.SKILL_MODULES || { tracks: [], lessons: [], mcqs: [], exercises: [] };
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function allLessonsComplete() {
    const data = getData();
    const progress = loadProgress();
    const ids = data.tracks.flatMap((t) => t.lessonIds || []);
    return ids.length > 0 && ids.every((id) => progress[id]);
  }

  function maybeUnlockTrackBadge() {
    if (!allLessonsComplete()) return;
    window.Gamification?.unlockBadge?.('sk-complete');
  }

  function renderCertPanel(root) {
    if (!allLessonsComplete()) return;
    const panel = document.createElement('div');
    panel.className = 'gm-cert card tip';
    panel.innerHTML = `
      <h3>All skill tracks complete</h3>
      <label>Name for certificate <input type="text" id="skCertName" class="pw-input" placeholder="Your name" /></label>
      <button type="button" class="pw-btn tiny" id="skCertBtn">Download certificate (PNG)</button>
    `;
    root.prepend(panel);
    $('#skCertBtn', panel)?.addEventListener('click', () => {
      const name = $('#skCertName', panel)?.value?.trim() || 'Learner';
      window.Gamification?.downloadCertificate?.(name, 'Skill Modules — all tracks');
    });
  }

  function renderHub(root) {
    const data = getData();
    const progress = loadProgress();
    root.innerHTML = `
      <div class="sk-counts">
        <span class="pill">${data.tracks.length} tracks</span>
        <span class="pill">${data.lessons.length} lessons</span>
        <span class="pill">${data.mcqs.length} MCQs</span>
        <span class="pill">${data.exercises.length} exercises</span>
      </div>
      <div class="sk-tracks">
        ${data.tracks
          .map((t) => {
            const done = t.lessonIds.filter((id) => progress[id]).length;
            return `<article class="sk-track-card">
              <h3>${esc(t.title)}</h3>
              <p class="muted">${esc(t.description.slice(0, 160))}…</p>
              <p>${done}/${t.lessonIds.length} lessons · ${t.mcqIds.length} MCQs · ${t.exerciseIds.length} exercises</p>
              <button type="button" class="pw-btn tiny" data-sk-track="${esc(t.id)}">Open track</button>
            </article>`;
          })
          .join('')}
      </div>
      <div id="skTrackDetail" class="sk-track-detail" hidden></div>
    `;
    root.querySelectorAll('[data-sk-track]').forEach((btn) => {
      btn.addEventListener('click', () => showTrack(btn.getAttribute('data-sk-track')));
    });
    renderCertPanel(root);
  }

  function showTrack(trackId) {
    const data = getData();
    const track = data.tracks.find((t) => t.id === trackId);
    const mount = $('#skTrackDetail') || $('#skLessonMount');
    if (!track || !mount) return;
    mount.hidden = false;
    const lessons = data.lessons.filter((l) => l.track === trackId);
    mount.innerHTML = `
      <h2>${esc(track.title)}</h2>
      <ol class="sk-lesson-list">
        ${lessons
          .map(
            (l) =>
              `<li><a href="#" data-sk-lesson="${esc(l.id)}"><code>${esc(l.id)}</code> ${esc(l.title)}</a></li>`,
          )
          .join('')}
      </ol>
      <p><a href="#skills" class="pw-btn ghost">Back to Skills</a></p>
    `;
    mount.querySelectorAll('[data-sk-lesson]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showLesson(a.getAttribute('data-sk-lesson'));
        location.hash = 'skills-lesson';
      });
    });
  }

  function showLesson(id) {
    const data = getData();
    const lesson = data.lessons.find((l) => l.id === id);
    const mount = $('#skLessonMount');
    if (!lesson || !mount) return;
    const mcqs = (lesson.mcqIds || []).map((mid) => data.mcqs.find((m) => m.id === mid)).filter(Boolean);
    mount.innerHTML = `
      <article class="sk-lesson">
        <p class="eyebrow"><code>${esc(lesson.id)}</code> · ${esc(lesson.track)} · topic: ${esc(lesson.topic)}</p>
        <h2>${esc(lesson.title)}</h2>
        <section><h3>Concept</h3><p>${esc(lesson.concept)}</p></section>
        <section><h3>Why it matters for QA</h3><p>${esc(lesson.why)}</p></section>
        <section><h3>Worked example</h3><pre class="code">${esc(lesson.example)}</pre></section>
        <section><h3>Interview angle</h3><p>${esc(lesson.interview)}</p></section>
        ${
          mcqs.length
            ? `<section class="sk-mcqs"><h3>Check understanding</h3>${mcqs
                .map(
                  (m) => `<div class="sk-mcq" data-mid="${esc(m.id)}">
              <p>${esc(m.question)}</p>
              <ol>${m.options.map((o, i) => `<li><button type="button" class="pw-btn ghost tiny sk-opt" data-i="${i}">${esc(o)}</button></li>`).join('')}</ol>
              <p class="sk-mcq-fb muted" hidden></p>
            </div>`,
                )
                .join('')}</section>`
            : ''
        }
        <p><button type="button" class="pw-btn" id="skMarkDone">Mark complete</button>
           <button type="button" class="pw-btn ghost pk-bookmark" data-pk-id="${esc(lesson.id)}" data-pk-kind="skill-lesson">Bookmark</button></p>
      </article>
    `;
    mount.querySelectorAll('.sk-mcq').forEach((box) => {
      const mid = box.getAttribute('data-mid');
      const m = data.mcqs.find((x) => x.id === mid);
      box.querySelectorAll('.sk-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-i'));
          const fb = box.querySelector('.sk-mcq-fb');
          fb.hidden = false;
          const correct = i === m.answerIndex;
          fb.textContent = correct ? m.whyCorrect : m.whyWrong[Math.min(i, 2)] || m.whyCorrect;
          fb.className = correct ? 'sk-mcq-fb pass' : 'sk-mcq-fb fail';
          window.ReadinessEngine?.recordAttempt?.({
            itemId: mid,
            topic: m.topic,
            type: 'mcq',
            correct,
          });
          if (correct) window.Gamification?.onQualityAction?.('mcq');
        });
      });
    });
    $('#skMarkDone', mount)?.addEventListener('click', () => {
      const p = loadProgress();
      p[lesson.id] = true;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
      window.Gamification?.onQualityAction?.('lesson');
      maybeUnlockTrackBadge();
      $('#skMarkDone', mount).textContent = 'Completed ✓';
    });
  }

  function boot() {
    const hub = $('#skHubMount');
    if (hub && window.SKILL_MODULES) renderHub(hub);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.SkillsModules = { renderHub, showTrack, showLesson, boot };
})();
