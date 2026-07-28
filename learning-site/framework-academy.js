/**
 * Framework Academy — landing stepper + lesson/MCQ/exercise rendering.
 * Data: window.FRAMEWORK_ACADEMY (generated), window.FRAMEWORK_DIAGRAMS (hand-rolled SVGs).
 */
(function () {
  const PROGRESS_KEY = 'pw-fw-progress';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveProgress(map) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  }

  function markComplete(id) {
    const p = loadProgress();
    p[id] = true;
    saveProgress(p);
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

  function getData() {
    return window.FRAMEWORK_ACADEMY || { lessons: [], mcqs: [], exercises: [], scenarios: [] };
  }

  function stageLessons(stage) {
    return getData().lessons.filter((l) => l.stage === stage);
  }

  function renderStepper(root) {
    const progress = loadProgress();
    const stages = [
      { n: 1, title: 'Foundations' },
      { n: 2, title: 'Core architecture' },
      { n: 3, title: 'Data & API' },
      { n: 4, title: 'Scale & governance' },
    ];
    const data = getData();
    root.innerHTML = `
      <div class="fw-counts" aria-label="Framework Academy counts">
        <span class="pill">${data.lessons.length} lessons</span>
        <span class="pill">${data.mcqs.length} MCQs</span>
        <span class="pill">${data.exercises.length} exercises</span>
        <span class="pill">${data.scenarios.length} scenarios</span>
      </div>
      <ol class="fw-stepper">
        ${stages
          .map((s) => {
            const lessons = stageLessons(s.n);
            const done = lessons.filter((l) => progress[l.id]).length;
            return `<li class="fw-stage">
              <h3>Stage ${s.n} · ${esc(s.title)} <span class="muted">(${done}/${lessons.length})</span></h3>
              <ul class="fw-lesson-list">
                ${lessons
                  .map(
                    (l) => `<li>
                  <a href="#framework-lesson" data-fw-lesson="${esc(l.id)}" class="fw-lesson-link ${progress[l.id] ? 'done' : ''}">
                    <code>${esc(l.id)}</code> ${esc(l.title)}
                  </a>
                </li>`,
                  )
                  .join('')}
              </ul>
            </li>`;
          })
          .join('')}
      </ol>
      <section class="fw-bank" aria-labelledby="fwScenariosTitle">
        <h3 id="fwScenariosTitle">Framework interview scenarios</h3>
        <p class="lead">Topic pill: <span class="pill">framework</span> — open any scenario below.</p>
        <ul class="fw-scenario-list">
          ${data.scenarios
            .map(
              (s) => `<li>
              <details>
                <summary><code>${esc(s.id.toUpperCase())}</code> ${esc(s.q)}</summary>
                <div class="callout tip"><strong>Think first</strong>${s.thinkFirst || ''}</div>
                <div class="prose"><h4>Expected answer</h4>${s.ideal}</div>
                <div class="callout note"><strong>Why asked</strong>${s.whyAsked || ''}</div>
                <div class="callout warn"><strong>Common wrong answer</strong>${s.wrongAnswer || ''}</div>
                <div class="prose"><h4>Real project example</h4>${s.realExample || ''}</div>
                <div class="prose"><h4>Follow-ups</h4>${s.followUps || ''}</div>
              </details>
            </li>`,
            )
            .join('')}
        </ul>
      </section>
    `;
    root.querySelectorAll('[data-fw-lesson]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('data-fw-lesson');
        showLesson(id);
        location.hash = 'framework-lesson';
        document.getElementById('framework-lesson')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function showLesson(id) {
    const data = getData();
    const lesson = data.lessons.find((l) => l.id === id);
    const mount = $('#fwLessonMount');
    if (!lesson || !mount) return;

    const mcqItems = (lesson.mcqs || [])
      .map((mid) => data.mcqs.find((m) => m.id === mid))
      .filter(Boolean);
    const exercise = lesson.exercise
      ? data.exercises.find((e) => e.id === lesson.exercise)
      : null;
    const diagramSvg =
      lesson.diagram && window.FRAMEWORK_DIAGRAMS
        ? window.FRAMEWORK_DIAGRAMS[lesson.diagram] || ''
        : '';

    mount.innerHTML = `
      <article class="fw-lesson" data-lesson-id="${esc(lesson.id)}">
        <p class="eyebrow"><code>${esc(lesson.id)}</code> · Stage ${lesson.stage}</p>
        <h2>${esc(lesson.title)}</h2>
        <p class="lead">${esc(lesson.objective)}</p>
        ${diagramSvg ? `<div class="fw-diagram">${diagramSvg}</div>` : ''}
        <section><h3>Concept</h3><p>${mdLite(lesson.concept)}</p></section>
        <section><h3>Why it matters</h3><p>${mdLite(lesson.whyMatters)}</p></section>
        <section><h3>Architecture decision</h3><p>${mdLite(lesson.architecture)}</p></section>
        <section><h3>TypeScript implementation</h3>${renderCodeBlocks(lesson.implementation)}</section>
        <section class="callout note"><h3>Trade-offs</h3><p>${mdLite(lesson.tradeoffs)}</p></section>
        <section class="callout warn"><h3>What NOT to do</h3><p>${mdLite(lesson.whatNotToDo)}</p></section>
        <section><h3>Interview angle</h3><p>${mdLite(lesson.interviewAngle)}</p></section>
        <section><h3>Related</h3><p>${mdLite(lesson.relatedBody)}</p></section>
        ${
          mcqItems.length
            ? `<section class="fw-mcqs"><h3>Check your understanding</h3>
          ${mcqItems
            .map(
              (m, i) => `<div class="fw-mcq" data-mcq="${esc(m.id)}">
            <p><strong>Q${i + 1}.</strong> ${esc(m.question)}</p>
            <ol type="A">
              ${m.options.map((o, oi) => `<li><button type="button" class="pw-btn ghost tiny fw-opt" data-i="${oi}">${esc(o)}</button></li>`).join('')}
            </ol>
            <p class="fw-mcq-feedback muted" hidden></p>
          </div>`,
            )
            .join('')}
        </section>`
            : ''
        }
        ${
          exercise
            ? `<section class="callout tip">
          <h3>Coding exercise · ${esc(exercise.id)}</h3>
          <p>${mdLite(exercise.goal)}</p>
          <p><strong>Run:</strong> <code>${esc(exercise.runCommand)}</code></p>
          <p class="muted">Starter + solution live under <code>${esc(exercise.specFile)}</code> (isolated exercises workspace — never touches @bank-demo).</p>
        </section>`
            : ''
        }
        <p><button type="button" class="pw-btn" id="fwMarkDone">Mark lesson complete</button>
           <a class="pw-btn ghost" href="#framework">Back to Framework Academy</a></p>
      </article>
    `;

    mount.querySelectorAll('.fw-mcq').forEach((box) => {
      const mid = box.getAttribute('data-mcq');
      const m = mcqItems.find((x) => x.id === mid);
      if (!m) return;
      box.querySelectorAll('.fw-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-i'));
          const fb = box.querySelector('.fw-mcq-feedback');
          fb.hidden = false;
          if (i === m.answerIndex) {
            fb.textContent = `Correct. ${m.whyCorrect}`;
            fb.className = 'fw-mcq-feedback pass';
          } else {
            fb.textContent = `Not quite. ${m.whyWrong[Math.min(i < m.answerIndex ? i : i - 1, 2)] || m.whyCorrect}`;
            fb.className = 'fw-mcq-feedback fail';
          }
        });
      });
    });

    $('#fwMarkDone', mount)?.addEventListener('click', () => {
      markComplete(lesson.id);
      const hub = $('#fwAcademyMount');
      if (hub) renderStepper(hub);
      $('#fwMarkDone', mount).textContent = 'Completed ✓';
    });
  }

  function boot() {
    const hub = $('#fwAcademyMount');
    if (hub && window.FRAMEWORK_ACADEMY) renderStepper(hub);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.FrameworkAcademy = { showLesson, renderStepper, boot };
})();
