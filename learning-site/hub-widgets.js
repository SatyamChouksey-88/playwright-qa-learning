/* Combined Elements Hub — missing advanced widgets from practice-site analysis */
(function () {
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function status(box, msg, ok) {
    let s = box.querySelector('.pw-status');
    if (!s) { s = document.createElement('p'); s.className = 'pw-status'; box.appendChild(s); }
    s.textContent = msg;
    s.classList.toggle('ok', !!ok);
    s.classList.toggle('bad', ok === false);
  }

  const builders = {
    'hub-locator'(host) {
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Practise every locator strategy on one target set.</p>
        <p id="loc-by-id" data-testid="specific-test-id" class="unique-class-locator" aria-label="unique-aria-target" name="locator-name">Find me by id / class / testid / aria</p>
        <input placeholder="Find by placeholder" />
        <button type="button" class="pw-btn" id="exact-text-target">ExactTextTarget</button>
        <ul id="xpath-tree"><li>Level 1<ul><li>Level 2<ul><li id="deep-target">Deep Target</li><li>Sibling</li></ul></li></ul></li></ul>
        <button type="button" class="pw-btn ghost" data-hint>Show Playwright hints</button>
        <pre class="pw-hints" hidden></pre>
      </div>`));
      host.querySelector('[data-hint]').onclick = () => {
        const pre = host.querySelector('.pw-hints');
        pre.hidden = false;
        pre.textContent = `page.locator('#loc-by-id')
page.locator('.unique-class-locator')
page.getByTestId('specific-test-id')
page.getByLabel('unique-aria-target')
page.getByPlaceholder('Find by placeholder')
page.getByRole('button', { name: 'ExactTextTarget' })
page.locator('#deep-target')`;
        status(host, 'Hints revealed', true);
      };
    },

    'hub-toast'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-row">
          <button type="button" class="pw-btn" data-t="success">Success toast</button>
          <button type="button" class="pw-btn ghost" data-t="error">Error toast</button>
          <button type="button" class="pw-btn ghost" data-t="info">Info toast</button>
        </div>
        <div class="pw-toast-stack" aria-live="polite"></div>
      </div>`));
      const stack = host.querySelector('.pw-toast-stack');
      host.querySelectorAll('[data-t]').forEach(btn => {
        btn.onclick = () => {
          const t = el(`<div class="pw-toast ${btn.dataset.t}" role="status">${btn.dataset.t} notification</div>`);
          stack.appendChild(t);
          status(host, `${btn.dataset.t} toast shown`, true);
          setTimeout(() => t.remove(), 2500);
        };
      });
    },

    'hub-listbox'(host) {
      host.appendChild(el(`<div class="pw-app pw-listbox">
        <div>
          <h4>Available</h4>
          <select multiple size="5" aria-label="Available" id="avail">
            <option>Selenium</option><option>Playwright</option><option>Cypress</option><option>Appium</option>
          </select>
        </div>
        <div class="pw-row" style="flex-direction:column">
          <button type="button" class="pw-btn tiny" data-to>→</button>
          <button type="button" class="pw-btn tiny" data-from>←</button>
        </div>
        <div>
          <h4>Chosen</h4>
          <select multiple size="5" aria-label="Chosen" id="chosen"></select>
        </div>
      </div>`));
      const avail = host.querySelector('#avail');
      const chosen = host.querySelector('#chosen');
      const move = (from, to) => {
        [...from.selectedOptions].forEach(o => to.add(new Option(o.text, o.value)));
        [...from.selectedOptions].forEach(o => o.remove());
        status(host, `Chosen: ${[...chosen.options].map(o => o.text).join(', ') || '(none)'}`, true);
      };
      host.querySelector('[data-to]').onclick = () => move(avail, chosen);
      host.querySelector('[data-from]').onclick = () => move(chosen, avail);
    },

    'hub-autocomplete'(host) {
      const fruits = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Orange'];
      host.appendChild(el(`<div class="pw-app">
        <label>Type fruit <input aria-label="Type fruit" autocomplete="off" /></label>
        <ul class="pw-suggest" role="listbox" hidden></ul>
        <p class="pw-picked" hidden></p>
      </div>`));
      const input = host.querySelector('input');
      const list = host.querySelector('.pw-suggest');
      const picked = host.querySelector('.pw-picked');
      input.oninput = () => {
        const q = input.value.toLowerCase();
        const hits = fruits.filter(f => f.toLowerCase().includes(q)).slice(0, 6);
        list.hidden = !q || !hits.length;
        list.innerHTML = hits.map(f => `<li role="option">${f}</li>`).join('');
        list.querySelectorAll('[role="option"]').forEach(li => {
          li.onclick = () => {
            input.value = li.textContent;
            list.hidden = true;
            picked.hidden = false;
            picked.textContent = `Selected: ${li.textContent}`;
            status(host, `Selected ${li.textContent}`, true);
          };
        });
      };
    },

    'hub-dependent'(host) {
      const map = { India: ['Mumbai', 'Delhi', 'Bengaluru'], USA: ['NYC', 'Austin', 'Seattle'], UK: ['London', 'Manchester'] };
      host.appendChild(el(`<div class="pw-app">
        <label>Country <select aria-label="Country"><option value="">Select Country</option>
          <option>India</option><option>USA</option><option>UK</option></select></label>
        <label>City <select aria-label="City" disabled><option value="">Select city</option></select></label>
      </div>`));
      const country = host.querySelector('[aria-label="Country"]');
      const city = host.querySelector('[aria-label="City"]');
      country.onchange = () => {
        const cities = map[country.value] || [];
        city.disabled = !cities.length;
        city.innerHTML = '<option value="">Select city</option>' + cities.map(c => `<option>${c}</option>`).join('');
        status(host, cities.length ? `Cities loaded for ${country.value}` : 'Pick a country', !!cities.length);
      };
      city.onchange = () => status(host, `City: ${city.value}`, !!city.value);
    },

    'hub-delayed-btn'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-start>Enable btn in 3s</button>
        <button type="button" class="pw-btn" id="wait-for-me" disabled>Wait For Me</button>
      </div>`));
      host.querySelector('[data-start]').onclick = () => {
        const b = host.querySelector('#wait-for-me');
        b.disabled = true;
        b.textContent = 'Wait For Me';
        status(host, 'Waiting 3s…', true);
        setTimeout(() => {
          b.disabled = false;
          status(host, 'Button enabled — click it', true);
        }, 3000);
      };
      host.querySelector('#wait-for-me').onclick = () => status(host, 'Delayed button clicked', true);
    },

    'hub-double-click'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" id="dbl">Double Click Me</button>
        <p class="pw-dbl" hidden>Double-clicked!</p>
      </div>`));
      host.querySelector('#dbl').ondblclick = () => {
        host.querySelector('.pw-dbl').hidden = false;
        status(host, 'Double-click registered', true);
      };
    },

    'hub-stale'(host) {
      let v = 1;
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Hold a reference, then Replace — classic stale-element scenario.</p>
        <div id="stale-target" data-version="1">Original Element — v1</div>
        <button type="button" class="pw-btn" data-replace>Replace Element in DOM</button>
      </div>`));
      host.querySelector('[data-replace]').onclick = () => {
        v++;
        const old = host.querySelector('#stale-target');
        const neu = el(`<div id="stale-target" data-version="${v}">Replaced Element — v${v}</div>`);
        old.replaceWith(neu);
        status(host, `DOM node replaced (v${v}) — old ElementHandle would be stale`, true);
      };
    },

    'hub-flaky'(host) {
      let attempts = 0, pass = 0, fail = 0;
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">~50% random fail — practise retries.</p>
        <button type="button" class="pw-btn" data-run>Run Flaky Action</button>
        <button type="button" class="pw-btn ghost" data-reset>Reset</button>
        <p class="pw-flaky-stats">Attempts: 0 · Pass: 0 · Fail: 0</p>
      </div>`));
      const stats = host.querySelector('.pw-flaky-stats');
      const paint = () => { stats.textContent = `Attempts: ${attempts} · Pass: ${pass} · Fail: ${fail}`; };
      host.querySelector('[data-run]').onclick = () => {
        attempts++;
        const ok = Math.random() >= 0.5;
        if (ok) pass++; else fail++;
        paint();
        status(host, ok ? 'Pass' : 'Fail (retry in real tests)', ok);
      };
      host.querySelector('[data-reset]').onclick = () => { attempts = pass = fail = 0; paint(); status(host, 'Reset', true); };
    },

    'hub-network'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-row">
          <button type="button" class="pw-btn tiny" data-d="500">Fast 0.5s</button>
          <button type="button" class="pw-btn tiny" data-d="2000">Medium 2s</button>
          <button type="button" class="pw-btn tiny" data-d="4000">Slow 4s</button>
          <button type="button" class="pw-btn tiny ghost" data-err>Simulate Error</button>
        </div>
        <div data-testid="spinner" class="pw-spinner" hidden>Loading…</div>
        <div class="pw-api-out" role="status">Idle</div>
      </div>`));
      const spin = host.querySelector('[data-testid="spinner"]');
      const out = host.querySelector('.pw-api-out');
      const run = async (ms, err) => {
        spin.hidden = false;
        out.textContent = 'Loading…';
        await new Promise(r => setTimeout(r, ms));
        spin.hidden = true;
        if (err) {
          out.textContent = 'Error: network failed (500)';
          status(host, 'Error path', false);
        } else {
          out.textContent = `OK — responded in ${ms}ms`;
          status(host, 'API response ready', true);
        }
      };
      host.querySelectorAll('[data-d]').forEach(b => b.onclick = () => run(Number(b.dataset.d), false));
      host.querySelector('[data-err]').onclick = () => run(800, true);
    },

    'hub-keyboard'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Press Enter to Submit <input aria-label="Press Enter to Submit" /></label>
        <label>Tab target <input aria-label="Tab target" /></label>
        <p class="pw-keys">Last key: none</p>
        <p class="pw-arrow">Arrow counter: 0</p>
      </div>`));
      let arrow = 0;
      const keys = host.querySelector('.pw-keys');
      const arrowEl = host.querySelector('.pw-arrow');
      host.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('keydown', e => {
          keys.textContent = `Last key: ${e.key}`;
          if (e.key === 'Enter' && inp.getAttribute('aria-label') === 'Press Enter to Submit') {
            status(host, 'Enter submitted', true);
          }
          if (e.key === 'ArrowUp') { arrow++; arrowEl.textContent = `Arrow counter: ${arrow}`; }
          if (e.key === 'ArrowDown') { arrow--; arrowEl.textContent = `Arrow counter: ${arrow}`; }
        });
      });
    },

    'hub-dynamic-list'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-row">
          <button type="button" class="pw-btn" data-add>Add Item</button>
          <button type="button" class="pw-btn ghost" data-clear>Clear All</button>
        </div>
        <ul class="pw-dyn-list" data-testid="dyn-list"></ul>
        <p class="pw-count">Items: 0</p>
      </div>`));
      const list = host.querySelector('.pw-dyn-list');
      const count = host.querySelector('.pw-count');
      const paint = () => {
        count.textContent = `Items: ${list.children.length}`;
        status(host, `List length ${list.children.length}`, true);
      };
      host.querySelector('[data-add]').onclick = () => {
        const n = list.children.length + 1;
        const li = el(`<li>Item ${n} <button type="button" data-del>Remove</button></li>`);
        li.querySelector('[data-del]').onclick = () => { li.remove(); paint(); };
        list.appendChild(li);
        paint();
      };
      host.querySelector('[data-clear]').onclick = () => { list.innerHTML = ''; paint(); };
    },

    'hub-select-all'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label><input type="checkbox" id="sel-all" /> Select All</label>
        <label><input type="checkbox" class="fruit" value="Apple" /> Apple</label>
        <label><input type="checkbox" class="fruit" value="Banana" /> Banana</label>
        <label><input type="checkbox" class="fruit" value="Cherry" /> Cherry</label>
        <label><input type="checkbox" id="reveal-cb" /> Reveal hidden element</label>
        <p id="secret-text" hidden>🎯 Hidden element revealed!</p>
      </div>`));
      const all = host.querySelector('#sel-all');
      const fruits = [...host.querySelectorAll('.fruit')];
      all.onchange = () => { fruits.forEach(f => { f.checked = all.checked; }); status(host, `Select all = ${all.checked}`, true); };
      fruits.forEach(f => f.onchange = () => {
        all.checked = fruits.every(x => x.checked);
        status(host, `Selected: ${fruits.filter(x => x.checked).map(x => x.value).join(', ') || 'none'}`, true);
      });
      host.querySelector('#reveal-cb').onchange = (e) => {
        host.querySelector('#secret-text').hidden = !e.target.checked;
        status(host, e.target.checked ? 'Secret revealed' : 'Secret hidden', true);
      };
    },

    'hub-hidden'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" style="display:none" id="hidden-display">Hidden display:none</button>
        <button type="button" class="pw-btn" style="visibility:hidden" id="hidden-vis">Hidden visibility</button>
        <button type="button" class="pw-btn" data-reveal>Reveal Hidden Elements</button>
        <p class="pw-hidden-state">Elements exist in DOM but may not be actionable.</p>
      </div>`));
      host.querySelector('[data-reveal]').onclick = () => {
        host.querySelector('#hidden-display').style.display = 'inline-flex';
        host.querySelector('#hidden-vis').style.visibility = 'visible';
        status(host, 'Hidden buttons revealed', true);
      };
    },

    'hub-progress'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-start>Start Progress</button>
        <div class="pw-progress"><div class="pw-progress-fill" style="width:0%"></div></div>
        <p class="pw-pct">0%</p>
      </div>`));
      host.querySelector('[data-start]').onclick = async () => {
        const fill = host.querySelector('.pw-progress-fill');
        const pct = host.querySelector('.pw-pct');
        for (let i = 0; i <= 100; i += 10) {
          fill.style.width = i + '%';
          pct.textContent = i + '%';
          await new Promise(r => setTimeout(r, 150));
        }
        status(host, 'Progress complete 100%', true);
      };
    },

    'hub-notifications'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-go>Show notification message</button>
        <div class="pw-note-msg" role="alert" hidden></div>
      </div>`));
      const msgs = ['Action successful', 'Please try again', 'Saved draft', 'New message arrived'];
      host.querySelector('[data-go]').onclick = () => {
        const box = host.querySelector('.pw-note-msg');
        box.hidden = false;
        box.textContent = msgs[Math.floor(Math.random() * msgs.length)];
        status(host, `Notification: ${box.textContent}`, true);
      };
    },

    'hub-dynamic-id'(host) {
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Button id changes every click — don’t hardcode dynamic IDs.</p>
        <button type="button" class="pw-btn" id="btn-${Date.now()}" data-stable="action">Click me (stable: data-stable)</button>
      </div>`));
      const rebind = (btn) => {
        btn.onclick = () => {
          const neu = el(`<button type="button" class="pw-btn" id="btn-${Date.now()}" data-stable="action">Click me (stable: data-stable)</button>`);
          btn.replaceWith(neu);
          rebind(neu);
          status(host, 'ID changed — use getByRole / data-stable', true);
        };
      };
      rebind(host.querySelector('[data-stable="action"]'));
    },

    'hub-disappear'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-show>Show disappearing button</button>
        <div class="pw-disappear-slot"></div>
      </div>`));
      host.querySelector('[data-show]').onclick = () => {
        const slot = host.querySelector('.pw-disappear-slot');
        slot.innerHTML = `<button type="button" class="pw-btn ghost" id="vanish">I will disappear</button>`;
        const b = slot.querySelector('#vanish');
        b.onclick = () => { b.remove(); status(host, 'Element disappeared from DOM', true); };
        status(host, 'Element appeared', true);
      };
    },

    'hub-color-range'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Color <input type="color" aria-label="Color" value="#38bdf8" /></label>
        <label>Range <input type="range" min="0" max="100" value="40" aria-label="Range" /></label>
        <span class="pw-range-val">40</span>
      </div>`));
      const range = host.querySelector('[aria-label="Range"]');
      const val = host.querySelector('.pw-range-val');
      range.oninput = () => { val.textContent = range.value; status(host, `Range=${range.value}`, true); };
      host.querySelector('[aria-label="Color"]').oninput = (e) => status(host, `Color=${e.target.value}`, true);
    },

    'hub-masked'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Phone mask <input aria-label="Masked" placeholder="(___) ___-____" maxlength="14" /></label>
      </div>`));
      const input = host.querySelector('input');
      input.oninput = () => {
        let d = input.value.replace(/\D/g, '').slice(0, 10);
        let out = d;
        if (d.length > 6) out = `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
        else if (d.length > 3) out = `(${d.slice(0, 3)}) ${d.slice(3)}`;
        else if (d.length) out = `(${d}`;
        input.value = out;
        status(host, `Masked value: ${out}`, true);
      };
    }
  };

  window.HUB_WIDGETS = {
    catalog: [
      { id: 'hub-locator', name: 'Locator strategies', level: 'Beginner', goal: 'Locate one target via id, class, testid, aria, role, placeholder, nested tree.' },
      { id: 'hub-select-all', name: 'Select-all checkboxes', level: 'Beginner', goal: 'Toggle select-all and reveal a hidden element.' },
      { id: 'hub-listbox', name: 'List box transfer', level: 'Beginner', goal: 'Move options between Available and Chosen lists.' },
      { id: 'hub-autocomplete', name: 'Autocomplete', level: 'Intermediate', goal: 'Type and pick a suggestion from the listbox.' },
      { id: 'hub-dependent', name: 'Dependent dropdown', level: 'Intermediate', goal: 'Pick country, then city options load.' },
      { id: 'hub-toast', name: 'Toasts / notifications', level: 'Intermediate', goal: 'Trigger toasts and assert role=status text.' },
      { id: 'hub-notifications', name: 'Dynamic notification', level: 'Intermediate', goal: 'Assert a random notification message.' },
      { id: 'hub-double-click', name: 'Double click', level: 'Beginner', goal: 'Register a double-click action.' },
      { id: 'hub-delayed-btn', name: 'Delayed enable', level: 'Intermediate', goal: 'Wait until button enables after 3s, then click.' },
      { id: 'hub-progress', name: 'Progress bar', level: 'Intermediate', goal: 'Wait until progress reaches 100%.' },
      { id: 'hub-network', name: 'Network delay / error', level: 'Advanced', goal: 'Handle spinner + fast/slow/error API simulation.' },
      { id: 'hub-stale', name: 'Stale element', level: 'Advanced', goal: 'See DOM node replacement (why locators > handles).' },
      { id: 'hub-flaky', name: 'Flaky action', level: 'Advanced', goal: 'Random pass/fail — reason for retries.' },
      { id: 'hub-keyboard', name: 'Keyboard actions', level: 'Intermediate', goal: 'Enter submit + arrow counter.' },
      { id: 'hub-dynamic-list', name: 'Dynamic list', level: 'Intermediate', goal: 'Add/remove items; assert count.' },
      { id: 'hub-hidden', name: 'Hidden elements', level: 'Intermediate', goal: 'Reveal display:none / visibility:hidden controls.' },
      { id: 'hub-dynamic-id', name: 'Dynamic ID', level: 'Advanced', goal: 'Survive changing ids with stable attributes.' },
      { id: 'hub-disappear', name: 'Disappearing elements', level: 'Intermediate', goal: 'Appear then remove from DOM.' },
      { id: 'hub-color-range', name: 'Color & range', level: 'Beginner', goal: 'Set color and range values.' },
      { id: 'hub-masked', name: 'Masked input', level: 'Intermediate', goal: 'Type digits into a masked phone field.' },
    ],
    mount(root) {
      if (!root) return;
      root.querySelectorAll('[data-widget]').forEach(node => {
        node.innerHTML = '';
        const fn = builders[node.dataset.widget];
        if (fn) fn(node);
        else node.innerHTML = '<div class="pw-app"><p class="pw-hint">Widget missing.</p></div>';
      });
    }
  };
})();
