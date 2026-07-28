/* Interactive gap-analysis widgets + page mounter */
(function () {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function mountPages() {
    const pages = window.GAP_PAGES;
    const content = document.getElementById('content');
    const quiz = document.getElementById('quiz');
    if (!pages || !content || !quiz) return;
    pages.forEach((p) => {
      if (document.getElementById(p.id)) return;
      const sec = document.createElement('section');
      sec.id = p.id;
      sec.className = 'page hidden';
      sec.innerHTML = p.html;
      content.insertBefore(sec, quiz);
    });
  }

  function injectNav() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !window.GAP_PAGES) return;
    if (sidebar.querySelector('[data-gap-nav]')) return;
    const details = document.createElement('details');
    details.className = 'nav-group';
    details.open = true;
    details.dataset.gapNav = '1';
    details.dataset.navGroup = 'gap';
    const summary = document.createElement('summary');
    summary.textContent = 'SDET breadth & labs';
    details.appendChild(summary);
    window.GAP_PAGES.forEach((p) => {
      const a = document.createElement('a');
      a.className = 'navlink';
      a.dataset.target = p.id;
      a.textContent = p.nav;
      details.appendChild(a);
    });
    const practice = sidebar.querySelector('[data-nav-group="practice"]');
    if (practice) sidebar.insertBefore(details, practice);
    else sidebar.appendChild(details);
  }

  function widgetBva(host) {
    host.innerHTML = `
      <label>Min <input type="number" data-bva-min value="1" /></label>
      <label>Max <input type="number" data-bva-max value="100" /></label>
      <button type="button" class="pw-btn" data-bva-go>Generate EP + BVA</button>
      <pre data-bva-out class="pw-api-out"></pre>`;
    host.querySelector('[data-bva-go]').onclick = () => {
      const min = Number(host.querySelector('[data-bva-min]').value);
      const max = Number(host.querySelector('[data-bva-max]').value);
      if (!(max > min)) {
        host.querySelector('[data-bva-out]').textContent = 'Max must be > min';
        return;
      }
      const ep = [
        `Invalid below: ${min - 1}`,
        `Valid mid: ${Math.floor((min + max) / 2)}`,
        `Invalid above: ${max + 1}`,
      ];
      const bva = [min - 1, min, min + 1, max - 1, max, max + 1];
      host.querySelector('[data-bva-out]').textContent =
        `EP representatives:\n- ${ep.join('\n- ')}\n\nBVA set:\n${bva.join(', ')}\n\nAutomate critical boundaries in API/unit; thin E2E for user-visible edge messages.`;
    };
  }

  function widgetTrace(host) {
    const items = window.GAP_TRACE_CHECKLIST || [];
    host.innerHTML = `
      <ol class="tight">${items
        .map(
          (t) =>
            `<li><label><input type="checkbox" data-trace-id="${t.id}" /> ${esc(t.text)}</label></li>`,
        )
        .join('')}</ol>
      <p class="pw-hint">Generate a real trace: <code>npx playwright test --project=bank-demo --trace on</code> then open the zip at trace.playwright.dev</p>
      <p data-trace-score class="muted-inline"></p>`;
    const score = () => {
      const n = [...host.querySelectorAll('input:checked')].length;
      host.querySelector('[data-trace-score]').textContent = `Checklist ${n}/${items.length}`;
    };
    host.querySelectorAll('input').forEach((i) => i.addEventListener('change', score));
  }

  function widgetAntipattern(host) {
    const list = window.GAP_ANTIPATTERNS || [];
    let i = 0;
    const paint = () => {
      const a = list[i];
      if (!a) return;
      host.innerHTML = `
        <div class="pillrow"><span class="pill">${i + 1}/${list.length}</span><span class="pill">${esc(a.title)}</span></div>
        <h3 class="sub">Broken snippet</h3>
        <pre><code>${esc(a.bad)}</code></pre>
        <p class="lead">Select every issue you see:</p>
        <div class="pillrow" data-ap-opts></div>
        <button type="button" class="pw-btn" data-ap-check>Check</button>
        <button type="button" class="pw-btn ghost" data-ap-next>Next</button>
        <div data-ap-feedback class="card note" hidden></div>`;
      const opts = ['waitForTimeout', 'missing await', 'floating promise', 'brittle selector', 'shared mutable data', 'no retry', 'isVisible snapshot', 'non-retrying race'];
      const box = host.querySelector('[data-ap-opts]');
      box.innerHTML = opts
        .map((o) => `<label class="pill"><input type="checkbox" value="${esc(o)}" /> ${esc(o)}</label>`)
        .join('');
      host.querySelector('[data-ap-check]').onclick = () => {
        const picked = [...host.querySelectorAll('input:checked')].map((x) => x.value);
        const missing = a.issues.filter((x) => !picked.includes(x));
        const extra = picked.filter((x) => !a.issues.includes(x));
        const fb = host.querySelector('[data-ap-feedback]');
        fb.hidden = false;
        fb.innerHTML = `<strong>${missing.length || extra.length ? 'Review' : 'Solid.'}</strong>
          <p>Expected issues: ${esc(a.issues.join(', '))}</p>
          <pre><code>${esc(a.fix)}</code></pre>
          <p>${esc(a.explain)}</p>`;
      };
      host.querySelector('[data-ap-next]').onclick = () => {
        i = (i + 1) % list.length;
        paint();
      };
    };
    paint();
  }

  function widgetStar(host) {
    const prompts = window.GAP_STAR_PROMPTS || [];
    host.innerHTML = `
      <label>Prompt
        <select data-star-q>${prompts.map((p) => `<option value="${p.id}">${esc(p.q)}</option>`).join('')}</select>
      </label>
      <label>Situation <textarea data-star-s rows="2"></textarea></label>
      <label>Task <textarea data-star-t rows="2"></textarea></label>
      <label>Action <textarea data-star-a rows="3"></textarea></label>
      <label>Result (metric/outcome) <textarea data-star-r rows="2"></textarea></label>
      <button type="button" class="pw-btn" data-star-go>Instant checks</button>
      <div data-star-out class="card note" hidden></div>`;
    host.querySelector('[data-star-go]').onclick = () => {
      const s = host.querySelector('[data-star-s]').value.trim();
      const t = host.querySelector('[data-star-t]').value.trim();
      const a = host.querySelector('[data-star-a]').value.trim();
      const r = host.querySelector('[data-star-r]').value.trim();
      const checks = [];
      if (s.length < 20) checks.push('Situation too thin — add context (team, system, constraint).');
      if (t.length < 10) checks.push('Task unclear — what were you responsible for?');
      if (!/I |we /i.test(a)) checks.push('Action should emphasize what you specifically did.');
      if (!/\d|%|reduced|cut|green|flake|escape|risk/i.test(r))
        checks.push('Result needs evidence (number, risk avoided, flake %, trust restored).');
      if (/gave up|yelled|always right|stubborn/i.test(a + r))
        checks.push('Avoid surrender-or-stubbornness framing — show judgment + shared outcome.');
      const out = host.querySelector('[data-star-out]');
      out.hidden = false;
      out.innerHTML = checks.length
        ? `<strong>Tighten:</strong><ul class="tight">${checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`
        : `<strong>Looks interview-ready.</strong> Practice out loud in under 90 seconds.`;
    };
  }

  function widgetMock(host) {
    const qs = window.GAP_MOCK_QUESTIONS || [];
    let idx = 0;
    let started = 0;
    let scores = [];
    const paint = () => {
      if (idx >= qs.length) {
        const avg = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        host.innerHTML = `<div class="card good"><h3 class="sub">Session complete</h3>
          <p>Average self-score: <strong>${avg}/4</strong> dimensions marked strong.</p>
          <button type="button" class="pw-btn" data-mock-restart>Restart</button></div>`;
        host.querySelector('[data-mock-restart]').onclick = () => {
          idx = 0;
          scores = [];
          started = Date.now();
          paint();
        };
        return;
      }
      const q = qs[idx];
      const elapsed = started ? Math.floor((Date.now() - started) / 1000) : 0;
      host.innerHTML = `
        <div class="pillrow"><span class="pill">Q ${idx + 1}/${qs.length}</span><span class="pill" data-mock-timer>${elapsed}s</span></div>
        <h3 class="sub">${esc(q.q)}</h3>
        <p class="lead"><strong>Follow-ups:</strong> ${q.followUps.map(esc).join(' · ')}</p>
        <textarea data-mock-ans rows="5" placeholder="Speak first, then jot notes…"></textarea>
        <p class="lead">Self-score dimensions you covered well:</p>
        <label><input type="checkbox" value="technical" /> Technical accuracy</label>
        <label><input type="checkbox" value="coverage" /> Test coverage / risk</label>
        <label><input type="checkbox" value="clarity" /> Clarity</label>
        <label><input type="checkbox" value="practices" /> Best practices</label>
        <button type="button" class="pw-btn" data-mock-next>Submit &amp; next</button>
        <div class="card note"><strong>Rubric hints:</strong> ${esc(Object.values(q.rubric).join(' | '))}</div>`;
      if (!started) started = Date.now();
      const tick = setInterval(() => {
        const el = host.querySelector('[data-mock-timer]');
        if (!el) return clearInterval(tick);
        el.textContent = Math.floor((Date.now() - started) / 1000) + 's';
      }, 1000);
      host.querySelector('[data-mock-next]').onclick = () => {
        clearInterval(tick);
        scores.push(host.querySelectorAll('input:checked').length);
        idx += 1;
        paint();
      };
    };
    paint();
  }

  function widgetPostmortems(host) {
    const list = window.GAP_POSTMORTEMS || [];
    host.innerHTML = list
      .map(
        (p) => `
      <div class="card" style="margin-bottom:12px">
        <h3 class="sub" style="margin-top:0">${esc(p.title)}</h3>
        <p class="lead">${esc(p.blurb)}</p>
        <p><strong>Discussion:</strong> ${esc(p.prompt)}</p>
      </div>`,
      )
      .join('');
  }

  function widgetMetrics(host) {
    host.innerHTML = `
      <h3 class="sub" style="margin-top:0">Defect metrics calculator</h3>
      <label>Defects found in test <input type="number" data-m-found value="40" min="0" /></label>
      <label>Defects escaped to prod <input type="number" data-m-esc value="2" min="0" /></label>
      <label>Tests run <input type="number" data-m-run value="100" min="1" /></label>
      <label>Tests passed <input type="number" data-m-pass value="97" min="0" /></label>
      <label>Flaky tests (unique) <input type="number" data-m-flake value="1" min="0" /></label>
      <button type="button" class="pw-btn" data-m-go>Compute</button>
      <pre data-m-out class="pw-api-out"></pre>`;
    host.querySelector('[data-m-go]').onclick = () => {
      const found = Number(host.querySelector('[data-m-found]').value);
      const escN = Number(host.querySelector('[data-m-esc]').value);
      const run = Number(host.querySelector('[data-m-run]').value);
      const pass = Number(host.querySelector('[data-m-pass]').value);
      const flake = Number(host.querySelector('[data-m-flake]').value);
      const totalKnown = found + escN;
      const dre = totalKnown ? ((found / totalKnown) * 100).toFixed(1) : 'n/a';
      const escapeRate = totalKnown ? ((escN / totalKnown) * 100).toFixed(1) : 'n/a';
      const passRate = run ? ((pass / run) * 100).toFixed(1) : 'n/a';
      const flakeRate = run ? ((flake / run) * 100).toFixed(2) : 'n/a';
      host.querySelector('[data-m-out]').textContent =
        `DRE (defect removal efficiency): ${dre}% (target: high)\n` +
        `Escape/leakage rate: ${escapeRate}% (common target: <5%, zero critical)\n` +
        `Pass rate: ${passRate}%\n` +
        `Flakiness rate (unique flaky / run): ${flakeRate}% (industry target often <1%)\n` +
        `Note: pass rate without flake rate misleads leadership.`;
    };
  }

  function widgetBugReport(host) {
    host.innerHTML = `
      <h3 class="sub" style="margin-top:0">Bug-report builder</h3>
      <label>Title <input type="text" data-br-title style="width:100%" placeholder="[Bank] Transfer fails with 500 when amount has trailing space" /></label>
      <label>Steps <textarea data-br-steps rows="3" placeholder="1. Login as…&#10;2. …"></textarea></label>
      <label>Expected <textarea data-br-exp rows="2"></textarea></label>
      <label>Actual <textarea data-br-act rows="2"></textarea></label>
      <label>Environment <input type="text" data-br-env style="width:100%" placeholder="staging, Chromium, build abc123" /></label>
      <button type="button" class="pw-btn" data-br-go>Build markdown</button>
      <pre data-br-out class="pw-api-out"></pre>`;
    host.querySelector('[data-br-go]').onclick = () => {
      const t = host.querySelector('[data-br-title]').value.trim() || '(untitled)';
      const steps = host.querySelector('[data-br-steps]').value.trim() || '(add steps)';
      const exp = host.querySelector('[data-br-exp]').value.trim() || '(expected)';
      const act = host.querySelector('[data-br-act]').value.trim() || '(actual)';
      const env = host.querySelector('[data-br-env]').value.trim() || '(env)';
      const missing = [];
      if (steps.length < 15) missing.push('Steps too thin');
      if (exp.length < 5) missing.push('Expected missing');
      if (act.length < 5) missing.push('Actual missing');
      host.querySelector('[data-br-out]').textContent =
        `## ${t}\n\n**Environment:** ${env}\n\n**Steps:**\n${steps}\n\n**Expected:** ${exp}\n\n**Actual:** ${act}\n\n` +
        (missing.length ? `Checklist: ${missing.join('; ')}` : 'Checklist: looks actionable for a developer.');
    };
  }

  function mountWidgets() {
    document.querySelectorAll('[data-gap-widget]').forEach((host) => {
      const kind = host.dataset.gapWidget;
      if (kind === 'bva') widgetBva(host);
      if (kind === 'trace') widgetTrace(host);
      if (kind === 'antipattern') widgetAntipattern(host);
      if (kind === 'star') widgetStar(host);
      if (kind === 'mock') widgetMock(host);
      if (kind === 'postmortems') widgetPostmortems(host);
      if (kind === 'metrics') widgetMetrics(host);
      if (kind === 'bugreport') widgetBugReport(host);
    });
  }

  window.GapPractice = {
    init() {
      mountPages();
      injectNav();
      mountWidgets();
      // Re-bind nav clicks for dynamically added links
      document.querySelectorAll('.navlink[data-target]').forEach((l) => {
        if (l.dataset.gapBound) return;
        l.dataset.gapBound = '1';
        l.addEventListener('click', () => {
          if (typeof window.showSection === 'function') window.showSection(l.dataset.target);
        });
      });
    },
  };
})();
