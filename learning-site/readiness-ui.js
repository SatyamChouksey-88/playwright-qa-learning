/** Readiness page UI (RS-1) */
(function () {
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  async function renderReadiness(root) {
    root.innerHTML = '<p class="muted">Computing readiness…</p>';
    const data = await window.ReadinessEngine?.overallReadiness?.();
    if (!data) return;
    const weak = data.weak || [];
    root.innerHTML = `
      <div class="rs-hero">
        <div class="stat-xl">${data.percent}<small>Interview readiness</small></div>
        <p class="pill rs-band rs-band-${data.band}">${data.band}</p>
      </div>
      <section class="callout note">
        <h3>How this score is computed</h3>
        <p>Per topic: <strong>50%</strong> recency-weighted MCQ accuracy (EWMA α=0.2) + <strong>30%</strong> mean FSRS retrievability + <strong>20%</strong> exercise completion. Topics with &lt;3 attempts show "insufficient data". Overall = attempt-weighted mean. Bands: ≥80% ready, 50–79% developing, &lt;50% weak.</p>
      </section>
      ${
        weak.length
          ? `<section><h3>Weakest topics — study next</h3><ul>${weak
              .map(
                (t) =>
                  `<li><strong>${esc(t.topic)}</strong> (${Math.round((t.mastery || 0) * 100)}%) — <a href="#skills" data-go="skills">Skills</a></li>`,
              )
              .join('')}</ul></section>`
          : ''
      }
      <section><h3>All topics</h3>
        <table class="rs-table"><thead><tr><th>Topic</th><th>Score</th><th>Band</th><th>Attempts</th></tr></thead>
        <tbody>${(data.topics || [])
          .map(
            (t) =>
              `<tr><td>${esc(t.topic)}</td><td>${t.insufficient ? '—' : Math.round((t.mastery || 0) * 100) + '%'}</td><td>${t.insufficient ? 'insufficient data' : t.band}</td><td>${t.attempts || 0}</td></tr>`,
          )
          .join('')}</tbody></table>
      </section>
      <section class="gm-panel">
        <h3>Streaks &amp; badges</h3>
        <p class="muted">Quality-gated streak (${window.Gamification?.loadStreak?.().count || 0} days). No leaderboards.</p>
        <div id="gmBadgesMount"></div>
      </section>
    `;
    window.Gamification?.renderBadges?.(root.querySelector('#gmBadgesMount'));
  }

  async function updateDashboardTile() {
    const el = document.querySelector('[data-dash="readiness"]');
    if (!el || !window.ReadinessEngine) return;
    const data = await window.ReadinessEngine.overallReadiness();
    el.textContent = `${data.percent}%`;
    el.dataset.band = data.band;
  }

  function boot() {
    const root = document.getElementById('readinessMount');
    if (root) renderReadiness(root);
    updateDashboardTile();
    window.addEventListener('pqa:readiness-updated', () => {
      if (root) renderReadiness(root);
      updateDashboardTile();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ReadinessUI = { renderReadiness, updateDashboardTile, boot };
})();
