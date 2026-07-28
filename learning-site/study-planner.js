/** Study Planner (PL-*) — 7-day crash + 30-day full plans from readiness data. */
(function () {
  const PLAN_KEY = 'pqa.plan.v1';

  function loadPlan() {
    try {
      return JSON.parse(localStorage.getItem(PLAN_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function savePlan(plan) {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  }

  async function generatePlan(mode, budgetMin = 60) {
    const readiness = await window.ReadinessEngine?.overallReadiness?.();
    const weak = (readiness?.topics || [])
      .filter((t) => !t.insufficient)
      .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
      .slice(0, 8);
    const skills = window.SKILL_MODULES || { lessons: [] };
    const days = mode === 'crash' ? 7 : 30;
    const items = [];
    for (const t of weak) {
      const lessons = skills.lessons.filter((l) => l.topic === t.topic);
      lessons.forEach((l) => items.push({ kind: 'lesson', id: l.id, title: l.title, minutes: l.estMinutes || 15, topic: t.topic }));
    }
    items.push({ kind: 'review', id: 'fsrs', title: 'FSRS due review', minutes: 15, topic: 'review' });
    if (mode === 'crash') items.push({ kind: 'mock', id: 'mock-quick', title: 'Quick mock exam', minutes: 35, topic: 'mock' });
    else items.push({ kind: 'mock', id: 'mock-full', title: 'Full mock exam (weekly)', minutes: 90, topic: 'mock' });

    const plan = { mode, budgetMin, days: [], generated: Date.now() };
    let idx = 0;
    for (let d = 0; d < days; d += 1) {
      const dayItems = [];
      let used = 0;
      while (idx < items.length && used + items[idx].minutes <= budgetMin) {
        dayItems.push(items[idx]);
        used += items[idx].minutes;
        idx = (idx + 1) % items.length;
      }
      if (!dayItems.length && items.length) {
        dayItems.push(items[idx % items.length]);
        idx += 1;
      }
      plan.days.push({ day: d + 1, items: dayItems });
    }
    const existing = loadPlan();
    plan.completed = existing.completed || {};
    savePlan(plan);
    return plan;
  }

  function renderPlanner(root) {
    root.innerHTML = `
      <div class="pl-controls">
        <label>Plan <select id="plMode"><option value="crash">7-day crash</option><option value="full">30-day full</option></select></label>
        <label>Daily budget (min) <select id="plBudget"><option value="30">30</option><option value="60" selected>60</option><option value="90">90</option></select></label>
        <button type="button" class="pw-btn" id="plGenerate">Generate plan</button>
        <button type="button" class="pw-btn ghost" id="plPrint">Print</button>
      </div>
      <div id="plCalendar" class="pl-calendar"></div>
    `;
    $('#plGenerate', root)?.addEventListener('click', async () => {
      const mode = $('#plMode', root).value === 'crash' ? 'crash' : 'full';
      const budget = Number($('#plBudget', root).value);
      const plan = await generatePlan(mode, budget);
      renderCalendar(root, plan);
    });
    $('#plPrint', root)?.addEventListener('click', () => window.print());
    const saved = loadPlan();
    if (saved.days?.length) renderCalendar(root, saved);
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function renderCalendar(root, plan) {
    const cal = $('#plCalendar', root);
    if (!cal) return;
    cal.innerHTML = plan.days
      .map(
        (d) => `<article class="pl-day">
        <h3>Day ${d.day}</h3>
        <ul>${d.items
          .map((it) => {
            const done = plan.completed?.[`${d.day}-${it.id}`];
            return `<li><label><input type="checkbox" data-day="${d.day}" data-id="${it.id}" ${done ? 'checked' : ''}/> ${it.title} (${it.minutes}m)</label></li>`;
          })
          .join('')}</ul>
      </article>`,
      )
      .join('');
    cal.querySelectorAll('input[type=checkbox]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const p = loadPlan();
        p.completed = p.completed || {};
        p.completed[`${cb.dataset.day}-${cb.dataset.id}`] = cb.checked;
        savePlan(p);
        if (cb.checked) window.Gamification?.onQualityAction?.('plan-item');
      });
    });
  }

  function boot() {
    const root = document.getElementById('plannerMount');
    if (root) renderPlanner(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.StudyPlanner = { generatePlan, boot };
})();
