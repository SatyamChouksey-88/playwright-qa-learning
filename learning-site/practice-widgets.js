/* Live interactive challenges mounted into UI Practice Lab + Mini-app cards */
(function () {
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function status(box, msg, ok) {
    let s = box.querySelector('.pw-status');
    if (!s) {
      s = document.createElement('p');
      s.className = 'pw-status';
      box.appendChild(s);
    }
    s.textContent = msg;
    s.classList.toggle('ok', !!ok);
    s.classList.toggle('bad', ok === false);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function openHtmlTab(title, bodyHtml) {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>body{font-family:system-ui;padding:24px;background:#0f172a;color:#e2e8f0}
      button{padding:8px 14px;border-radius:8px;border:0;background:#38bdf8;cursor:pointer;font-weight:600}</style></head>
      <body>${bodyHtml}</body></html>`;
    const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
  }

  const builders = {
    /* ---------- UI Practice Lab ---------- */
    'pg-input'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Email <input type="email" id="pw-email" name="email" placeholder="you@example.com" /></label>
        <div class="pw-row">
          <button type="button" class="pw-btn" data-act="fill">Fill demo</button>
          <button type="button" class="pw-btn ghost" data-act="clear">Clear</button>
        </div>
      </div>`));
      const input = host.querySelector('#pw-email');
      host.querySelector('[data-act="fill"]').onclick = () => { input.value = 'ada@example.com'; status(host, 'Filled ada@example.com', true); };
      host.querySelector('[data-act="clear"]').onclick = () => { input.value = ''; status(host, 'Cleared', true); };
      input.addEventListener('input', () => status(host, `Value: ${input.value || '(empty)'}`, true));
    },

    'pg-buttons'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" id="pw-save">Save</button>
        <button type="button" class="pw-btn" id="pw-busy" disabled>Saving…</button>
        <button type="button" class="pw-btn ghost" id="pw-enable">Enable busy button</button>
      </div>`));
      host.querySelector('#pw-save').onclick = () => status(host, 'Save clicked', true);
      host.querySelector('#pw-enable').onclick = () => {
        const b = host.querySelector('#pw-busy');
        b.disabled = false;
        b.textContent = 'Save now';
        status(host, 'Busy button enabled — click it', true);
      };
      host.querySelector('#pw-busy').onclick = () => status(host, 'Busy button clicked after enable', true);
    },

    'pg-forms'(host) {
      host.appendChild(el(`<form class="pw-app" id="pw-form">
        <label>Name <input name="name" required /></label>
        <label>Email <input name="email" type="email" required /></label>
        <button type="submit" class="pw-btn">Submit</button>
        <div role="alert" class="pw-alert" hidden></div>
      </form>`));
      const form = host.querySelector('#pw-form');
      const alert = host.querySelector('.pw-alert');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (!fd.get('name') || !fd.get('email')) {
          alert.hidden = false;
          alert.textContent = 'Please fill all fields';
          status(host, 'Validation failed', false);
          return;
        }
        alert.hidden = false;
        alert.textContent = 'Success — form submitted';
        status(host, 'Success path', true);
      };
    },

    'pg-dropdowns'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Country (native)
          <select aria-label="Country">
            <option value="">Select…</option>
            <option value="in">India</option>
            <option value="us">USA</option>
            <option value="uk">UK</option>
          </select>
        </label>
        <div class="pw-combo">
          <button type="button" class="pw-btn" role="combobox" aria-expanded="false" aria-label="City">City ▾</button>
          <ul role="listbox" class="pw-list" hidden>
            <li role="option">Mumbai</li>
            <li role="option">Delhi</li>
            <li role="option">Bengaluru</li>
          </ul>
        </div>
      </div>`));
      const sel = host.querySelector('select');
      sel.onchange = () => status(host, `Native: ${sel.selectedOptions[0]?.text || ''}`, true);
      const combo = host.querySelector('[role="combobox"]');
      const list = host.querySelector('[role="listbox"]');
      combo.onclick = () => {
        list.hidden = !list.hidden;
        combo.setAttribute('aria-expanded', String(!list.hidden));
      };
      list.querySelectorAll('[role="option"]').forEach(opt => {
        opt.onclick = () => {
          combo.textContent = opt.textContent + ' ▾';
          list.hidden = true;
          status(host, `Custom: ${opt.textContent}`, true);
        };
      });
    },

    'pg-table'(host) {
      const people = shuffle([
        { name: 'Ada Lovelace', role: 'Analyst' },
        { name: 'Alan Turing', role: 'Engineer' },
        { name: 'Grace Hopper', role: 'Lead' },
      ]);
      const rows = people.map(p => `<tr><td>${p.name}</td><td>${p.role}</td><td><button type="button" class="pw-btn tiny" data-name="${p.name}">Edit</button></td></tr>`).join('');
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Find <strong>Ada Lovelace</strong> and click Edit (row order changes on reset).</p>
        <table class="pw-table"><thead><tr><th>Name</th><th>Role</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        <button type="button" class="pw-btn ghost" data-reset>Shuffle rows</button>
      </div>`));
      const bind = () => host.querySelectorAll('[data-name]').forEach(btn => {
        btn.onclick = () => status(host, `Edit clicked for ${btn.dataset.name}`, btn.dataset.name === 'Ada Lovelace');
      });
      bind();
      host.querySelector('[data-reset]').onclick = () => { host.innerHTML = ''; builders['pg-table'](host); };
    },

    'pg-alerts'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-alert>Show alert</button>
        <button type="button" class="pw-btn" data-confirm>Delete (confirm)</button>
        <button type="button" class="pw-btn ghost" data-prompt>Prompt name</button>
      </div>`));
      host.querySelector('[data-alert]').onclick = () => { alert('Hello from alert'); status(host, 'Alert shown', true); };
      host.querySelector('[data-confirm]').onclick = () => {
        const ok = confirm('Delete this item?');
        status(host, ok ? 'Confirm accepted' : 'Confirm dismissed', ok);
      };
      host.querySelector('[data-prompt]').onclick = () => {
        const v = prompt('Your name?', 'Ada');
        status(host, v == null ? 'Prompt cancelled' : `Prompt: ${v}`, v != null);
      };
    },

    'pg-radio'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label><input type="checkbox" id="pw-sub" /> Subscribe</label>
        <fieldset>
          <legend>Plan</legend>
          <label><input type="radio" name="plan" value="free" /> Plan: Free</label>
          <label><input type="radio" name="plan" value="pro" /> Plan: Pro</label>
        </fieldset>
      </div>`));
      host.querySelectorAll('input').forEach(i => i.addEventListener('change', () => {
        const sub = host.querySelector('#pw-sub').checked;
        const plan = host.querySelector('input[name="plan"]:checked')?.value || 'none';
        status(host, `Subscribe=${sub}, plan=${plan}`, true);
      }));
    },

    'pg-date'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Start date <input type="date" aria-label="Start date" /></label>
        <div class="pw-cal" role="group" aria-label="Calendar">
          <button type="button" class="pw-btn tiny">26</button>
          <button type="button" class="pw-btn tiny">27</button>
          <button type="button" class="pw-btn tiny">28</button>
          <button type="button" class="pw-btn tiny">29</button>
        </div>
      </div>`));
      const input = host.querySelector('input[type="date"]');
      input.onchange = () => status(host, `Date filled: ${input.value}`, true);
      host.querySelectorAll('.pw-cal button').forEach(b => {
        b.onclick = () => {
          input.value = `2026-07-${b.textContent}`;
          status(host, `Picked day ${b.textContent}`, true);
        };
      });
    },

    'pg-links'(host) {
      host.appendChild(el(`<div class="pw-app">
        <a href="#playground" class="pw-link" data-docs>Docs</a>
        <a href="#miniapps" class="pw-link">Mini-apps</a>
        <a href="#quiz" class="pw-link">Quiz</a>
      </div>`));
      host.querySelector('[data-docs]').onclick = (e) => {
        e.preventDefault();
        status(host, 'Docs link activated (hash would be #playground/docs-like)', true);
        location.hash = 'cheatsheet';
      };
    },

    'pg-tabs'(host) {
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Opens a new browser tab — practise waitForEvent('page').</p>
        <a href="#" class="pw-btn" id="pw-open-report" target="_blank" rel="noopener">Open report</a>
      </div>`));
      host.querySelector('#pw-open-report').onclick = (e) => {
        e.preventDefault();
        openHtmlTab('Report', '<h1>Report</h1><p>New tab content for Playwright practice.</p>');
        status(host, 'New tab opened', true);
      };
    },

    'pg-waits'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" id="pw-load">Load</button>
        <div data-testid="spinner" class="pw-spinner" hidden>Loading…</div>
        <ul id="pw-wait-list"></ul>
      </div>`));
      host.querySelector('#pw-load').onclick = async () => {
        const spin = host.querySelector('[data-testid="spinner"]');
        const list = host.querySelector('#pw-wait-list');
        list.innerHTML = '';
        spin.hidden = false;
        status(host, 'Fetching…', true);
        await new Promise(r => setTimeout(r, 900));
        spin.hidden = true;
        ['Alpha', 'Beta', 'Gamma'].forEach(t => {
          const li = document.createElement('li');
          li.textContent = t;
          list.appendChild(li);
        });
        status(host, 'Data loaded — spinner hidden', true);
      };
    },

    'pg-multiselect'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Tags
          <select aria-label="Tags" multiple size="4">
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
            <option value="c">Gamma</option>
          </select>
        </label>
      </div>`));
      const sel = host.querySelector('select');
      sel.onchange = () => {
        const vals = [...sel.selectedOptions].map(o => o.value);
        status(host, `Selected: ${vals.join(', ') || '(none)'}`, vals.length > 0);
      };
    },

    'pg-upload'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Upload <input type="file" aria-label="Upload" accept="image/*,.pdf,.txt" /></label>
        <p class="pw-file-name" hidden></p>
      </div>`));
      const input = host.querySelector('input[type="file"]');
      const name = host.querySelector('.pw-file-name');
      input.onchange = () => {
        const f = input.files?.[0];
        name.hidden = !f;
        name.textContent = f ? `Selected: ${f.name}` : '';
        status(host, f ? `File: ${f.name}` : 'No file', !!f);
      };
    },

    'pg-dnd'(host) {
      host.appendChild(el(`<div class="pw-app pw-dnd">
        <div class="pw-col" data-col="todo"><h4>Todo</h4><div class="pw-card" draggable="true" data-testid="card-1">Card 1</div></div>
        <div class="pw-col" data-col="done" data-testid="column-done"><h4>Done</h4></div>
      </div>`));
      const card = host.querySelector('[data-testid="card-1"]');
      card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', 'card-1'));
      host.querySelectorAll('.pw-col').forEach(col => {
        col.addEventListener('dragover', e => e.preventDefault());
        col.addEventListener('drop', e => {
          e.preventDefault();
          col.appendChild(card);
          status(host, `Dropped into ${col.dataset.col}`, col.dataset.col === 'done');
        });
      });
    },

    'pg-iframe'(host) {
      const inner = encodeURIComponent('<!doctype html><button id="ok">OK</button><script>document.getElementById("ok").onclick=()=>parent.postMessage("iframe-ok","*")</script>');
      host.appendChild(el(`<div class="pw-app">
        <iframe title="Practice frame" src="data:text/html;charset=utf-8,${inner}" style="width:100%;height:80px;border:1px solid var(--border);border-radius:8px;background:#fff"></iframe>
      </div>`));
      const onMsg = (e) => {
        if (e.data === 'iframe-ok') status(host, 'Clicked OK inside iframe', true);
      };
      window.addEventListener('message', onMsg);
      host._cleanup = () => window.removeEventListener('message', onMsg);
    },

    'pg-shadow'(host) {
      const wrap = el('<div class="pw-app"><div id="pw-shadow-host"></div></div>');
      host.appendChild(wrap);
      const shadowHost = wrap.querySelector('#pw-shadow-host');
      const root = shadowHost.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>button{padding:8px 12px;border-radius:8px;border:0;background:#38bdf8;cursor:pointer;font-weight:600}</style>
        <button type="button">Shadow action</button>`;
      root.querySelector('button').onclick = () => status(host, 'Clicked inside open Shadow DOM', true);
    },

    'pg-modal'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-open>Open modal</button>
        <div class="pw-modal-backdrop" hidden>
          <div role="dialog" aria-modal="true" aria-label="Confirm">
            <p>Save changes?</p>
            <button type="button" class="pw-btn" data-save>Save</button>
            <button type="button" class="pw-btn ghost" data-close>Close</button>
          </div>
        </div>
      </div>`));
      const backdrop = host.querySelector('.pw-modal-backdrop');
      host.querySelector('[data-open]').onclick = () => { backdrop.hidden = false; };
      host.querySelector('[data-close]').onclick = () => { backdrop.hidden = true; status(host, 'Modal closed', true); };
      host.querySelector('[data-save]').onclick = () => { backdrop.hidden = true; status(host, 'Save inside dialog', true); };
    },

    'pg-scroll'(host) {
      const items = Array.from({ length: 40 }, (_, i) => `<div class="pw-scroll-item" data-n="${i + 1}">Item ${i + 1}</div>`).join('');
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Scroll until Item 25 is visible.</p>
        <div class="pw-scroll-box">${items}</div>
      </div>`));
      const box = host.querySelector('.pw-scroll-box');
      box.onscroll = () => {
        const target = host.querySelector('[data-n="25"]');
        const r = target.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        const visible = r.top >= b.top && r.bottom <= b.bottom;
        if (visible) status(host, 'Item 25 is visible', true);
      };
    },

    'pg-annotations'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" title="More info" aria-describedby="pw-tip" id="pw-tip-btn">Info</button>
        <div role="tooltip" id="pw-tip" class="pw-tooltip" hidden>Tooltip: helpful annotation</div>
      </div>`));
      const btn = host.querySelector('#pw-tip-btn');
      const tip = host.querySelector('#pw-tip');
      const show = () => { tip.hidden = false; status(host, 'Tooltip visible', true); };
      const hide = () => { tip.hidden = true; };
      btn.onmouseenter = show;
      btn.onfocus = show;
      btn.onmouseleave = hide;
      btn.onblur = hide;
    },

    'pg-bank'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-login">
          <label>Username <input aria-label="Username" value="demo" /></label>
          <label>Password <input aria-label="Password" type="password" value="demo" /></label>
          <button type="button" class="pw-btn" data-login>Log in</button>
        </div>
        <div class="pw-dash" hidden>
          <p>Welcome, demo</p>
          <label>Amount <input aria-label="Amount" type="number" value="100" /></label>
          <button type="button" class="pw-btn" data-transfer>Transfer</button>
          <button type="button" class="pw-btn ghost" data-logout>Logout</button>
        </div>
      </div>`));
      const login = host.querySelector('.pw-login');
      const dash = host.querySelector('.pw-dash');
      host.querySelector('[data-login]').onclick = () => {
        login.hidden = true;
        dash.hidden = false;
        status(host, 'Logged in', true);
      };
      host.querySelector('[data-transfer]').onclick = () => status(host, 'Transfer submitted', true);
      host.querySelector('[data-logout]').onclick = () => {
        dash.hidden = true;
        login.hidden = false;
        status(host, 'Logged out', true);
      };
    },

    'pg-ui'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" id="continue-btn" data-testid="continue-btn">Continue</button>
        <button type="button" class="pw-btn ghost" id="continue">Alt Continue</button>
      </div>`));
      host.querySelectorAll('button').forEach(b => {
        b.onclick = () => status(host, `Clicked: ${b.textContent}`, true);
      });
    },

    /* ---------- Mini-apps ---------- */
    'ma-dynamic-table'(host) {
      const heroes = shuffle([
        { hero: 'Spider-Man', real: 'Peter Parker' },
        { hero: 'Iron Man', real: 'Tony Stark' },
        { hero: 'Captain America', real: 'Steve Rogers' },
        { hero: 'Black Widow', real: 'Natasha Romanoff' },
      ]);
      const rows = heroes.map(h => `<tr><td>${h.hero}</td><td>${h.real}</td></tr>`).join('');
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Find <strong>Spider-Man</strong> and note his real name (rows shuffle).</p>
        <table class="pw-table" role="table"><thead><tr><th>Hero</th><th>Real name</th></tr></thead><tbody>${rows}</tbody></table>
        <button type="button" class="pw-btn ghost" data-shuffle>Shuffle</button>
        <button type="button" class="pw-btn" data-check>I found it</button>
      </div>`));
      host.querySelector('[data-shuffle]').onclick = () => { host.innerHTML = ''; builders['ma-dynamic-table'](host); };
      host.querySelector('[data-check]').onclick = () => {
        const row = [...host.querySelectorAll('tbody tr')].find(tr => tr.textContent.includes('Spider-Man'));
        const real = row?.cells[1]?.textContent;
        status(host, real === 'Peter Parker' ? 'Correct: Peter Parker' : 'Check again', real === 'Peter Parker');
      };
    },

    'ma-otp'(host) {
      const code = '123456';
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Enter OTP <strong>${code}</strong> (one digit per box).</p>
        <div class="pw-otp" role="group" aria-label="Verification code">
          ${[0,1,2,3,4,5].map(i => `<input maxlength="1" inputmode="numeric" aria-label="Digit ${i + 1}" />`).join('')}
        </div>
        <button type="button" class="pw-btn" data-verify>Verify</button>
      </div>`));
      const inputs = [...host.querySelectorAll('.pw-otp input')];
      inputs.forEach((inp, i) => {
        inp.addEventListener('input', () => {
          if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
        });
      });
      host.querySelector('[data-verify]').onclick = () => {
        const val = inputs.map(i => i.value).join('');
        const ok = val === code;
        status(host, ok ? 'Success — account verified' : 'Invalid code', ok);
      };
    },

    'ma-tags'(host) {
      host.appendChild(el(`<div class="pw-app">
        <input type="text" placeholder="Add a tag" aria-label="Add a tag" />
        <div class="pw-tags" data-testid="tags"></div>
      </div>`));
      const input = host.querySelector('input');
      const box = host.querySelector('.pw-tags');
      const renderStatus = () => status(host, `Tag count: ${box.children.length}`, true);
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const v = input.value.trim();
        if (!v) return;
        const tag = el(`<span class="tag" data-tag="${v}">${v} <button type="button" aria-label="Remove ${v}">×</button></span>`);
        tag.querySelector('button').onclick = () => { tag.remove(); renderStatus(); };
        box.appendChild(tag);
        input.value = '';
        renderStatus();
      });
    },

    'ma-multilevel'(host) {
      host.appendChild(el(`<div class="pw-app pw-menu">
        <button type="button" class="pw-btn" aria-haspopup="true">Products</button>
        <ul class="pw-submenu" role="menu" hidden>
          <li role="none"><button type="button" role="menuitem">Category ▸</button>
            <ul class="pw-submenu nested" role="menu" hidden>
              <li role="none"><a role="menuitem" href="#miniapps">Widget Item</a></li>
            </ul>
          </li>
        </ul>
        <p class="pw-picked" hidden></p>
      </div>`));
      const rootBtn = host.querySelector('.pw-btn');
      const menu = host.querySelector('.pw-submenu');
      const nested = host.querySelector('.nested');
      const cat = host.querySelector('[role="menuitem"]');
      rootBtn.onmouseenter = () => { menu.hidden = false; };
      host.querySelector('.pw-menu').onmouseleave = () => { menu.hidden = true; nested.hidden = true; };
      cat.onmouseenter = () => { nested.hidden = false; };
      host.querySelector('a[role="menuitem"]').onclick = (e) => {
        e.preventDefault();
        const p = host.querySelector('.pw-picked');
        p.hidden = false;
        p.textContent = 'Opened: Widget Item';
        status(host, 'Menu item selected', true);
      };
    },

    'ma-sortable'(host) {
      const order = ['Banana', 'Apple', 'Cherry'];
      const correct = ['Apple', 'Banana', 'Cherry'];
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Drag into alphabetical order, then Verify.</p>
        <ul class="pw-sort">${order.map(t => `<li class="sortable-item" draggable="true">${t}</li>`).join('')}</ul>
        <button type="button" class="pw-btn" data-verify>Verify</button>
      </div>`));
      const list = host.querySelector('.pw-sort');
      let dragEl = null;
      list.querySelectorAll('li').forEach(li => {
        li.addEventListener('dragstart', () => { dragEl = li; });
        li.addEventListener('dragover', e => e.preventDefault());
        li.addEventListener('drop', () => {
          if (dragEl && dragEl !== li) {
            const items = [...list.children];
            const from = items.indexOf(dragEl);
            const to = items.indexOf(li);
            if (from < to) li.after(dragEl); else li.before(dragEl);
          }
        });
      });
      host.querySelector('[data-verify]').onclick = () => {
        const got = [...list.children].map(li => li.textContent);
        const ok = got.join() === correct.join();
        list.querySelectorAll('li').forEach(li => {
          li.classList.toggle('text-green', ok);
          li.dataset.ok = ok ? 'true' : 'false';
        });
        status(host, ok ? 'All green — correct order' : 'Not alphabetical yet', ok);
      };
    },

    'ma-new-tab'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-open>Open new tab</button>
      </div>`));
      host.querySelector('[data-open]').onclick = () => {
        openHtmlTab('New Tab Challenge', '<h1>Welcome to the new tab</h1><p>Assert this text with Playwright.</p>');
        status(host, 'New tab opened', true);
      };
    },

    'ma-popup'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-open>Open pop-up</button>
        <p class="pw-main-msg" hidden>Success — received from pop-up</p>
      </div>`));
      host.querySelector('[data-open]').onclick = () => {
        const w = window.open('', 'pwpopup', 'width=420,height=260');
        if (!w) { status(host, 'Pop-up blocked — allow pop-ups', false); return; }
        w.document.open();
        w.document.write('<!doctype html><title>Pop-Up</title><body style="font-family:system-ui;padding:20px">');
        w.document.write('<h2>Pop-up window</h2><button id="ok">Click me</button>');
        w.document.write('<script>document.getElementById("ok").onclick=function(){try{opener.postMessage("popup-done","*")}catch(e){} window.close()}</script>');
        w.document.write('</body>');
        w.document.close();
        status(host, 'Pop-up opened — click button inside', true);
      };
      const onMsg = (e) => {
        if (e.data === 'popup-done') {
          const msg = host.querySelector('.pw-main-msg');
          if (msg) msg.hidden = false;
          status(host, 'Success — received from pop-up', true);
        }
      };
      window.addEventListener('message', onMsg);
      host._cleanup = () => window.removeEventListener('message', onMsg);
    },

    'ma-nested-iframe'(host) {
      const innerDoc = `<button id="go">Click me</button><script>document.getElementById('go').onclick=()=>parent.parent.postMessage('nested-ok','*')</script>`;
      const outerDoc = `<iframe name="inner" title="inner" srcdoc="${innerDoc.replace(/"/g, '&quot;')}" style="width:90%;height:70px;border:1px solid #ccc"></iframe>`;
      host.appendChild(el(`<div class="pw-app">
        <iframe name="outer" title="outer" srcdoc="${outerDoc.replace(/"/g, '&quot;')}" style="width:100%;height:110px;border:1px solid var(--border);border-radius:8px;background:#fff"></iframe>
      </div>`));
      const onMsg = (e) => {
        if (e.data === 'nested-ok') status(host, 'Success — nested iframe button clicked', true);
      };
      window.addEventListener('message', onMsg);
      host._cleanup = () => window.removeEventListener('message', onMsg);
    },

    'ma-shadow'(host) {
      const wrap = el('<div class="pw-app"><div id="shadow-progress"></div><p class="pw-pct" hidden>95%</p></div>');
      host.appendChild(wrap);
      const root = wrap.querySelector('#shadow-progress').attachShadow({ mode: 'open' });
      root.innerHTML = `<button type="button">Boost progress</button>`;
      root.querySelector('button').onclick = () => {
        wrap.querySelector('.pw-pct').hidden = false;
        status(host, 'Progress is 95%', true);
      };
    },

    'ma-stars'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-stars" role="radiogroup" aria-label="Rating">
          ${[1,2,3,4,5].map(n => `<button type="button" role="radio" aria-label="${n} star" data-value="${n}">★</button>`).join('')}
        </div>
        <p class="pw-rate-text">Rating: 0</p>
      </div>`));
      host.querySelectorAll('[role="radio"]').forEach(btn => {
        btn.onclick = () => {
          const n = btn.dataset.value;
          host.querySelectorAll('[role="radio"]').forEach((b, i) => {
            b.classList.toggle('on', i < Number(n));
            b.setAttribute('aria-checked', String(i + 1 === Number(n)));
          });
          host.querySelector('.pw-rate-text').textContent = `Rating: ${n}`;
          status(host, `Rated ${n}`, true);
        };
      });
    },

    'ma-covered'(host) {
      host.appendChild(el(`<div class="pw-app pw-covered">
        <button type="button" class="pw-btn" data-secret>Secret button</button>
        <div class="overlay cover">
          <p>Covering overlay</p>
          <button type="button" class="pw-btn ghost" data-close>Close</button>
        </div>
        <p class="pw-hidden-msg" hidden>Hidden message unlocked</p>
      </div>`));
      const overlay = host.querySelector('.overlay');
      host.querySelector('[data-close]').onclick = () => { overlay.remove(); status(host, 'Overlay closed — now click secret', true); };
      host.querySelector('[data-secret]').onclick = () => {
        if (host.querySelector('.overlay')) {
          status(host, 'Button covered — close overlay first (or use force in tests)', false);
          return;
        }
        host.querySelector('.pw-hidden-msg').hidden = false;
        status(host, 'Hidden message unlocked', true);
      };
    },

    'ma-upload'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Upload image <input type="file" accept="image/*" aria-label="Upload" /></label>
        <p class="pw-file-name" hidden></p>
      </div>`));
      const input = host.querySelector('input');
      const name = host.querySelector('.pw-file-name');
      input.onchange = () => {
        const f = input.files?.[0];
        name.hidden = !f;
        name.textContent = f ? f.name : '';
        status(host, f ? `Uploaded name: ${f.name}` : 'No file', !!f);
      };
    },

    'ma-download'(host) {
      host.appendChild(el(`<div class="pw-app">
        <a class="pw-btn" download="practice-note.txt" href="">Download file</a>
      </div>`));
      const a = host.querySelector('a');
      const blob = new Blob(['Playwright practice download'], { type: 'text/plain' });
      a.href = URL.createObjectURL(blob);
      a.onclick = () => status(host, 'Download started: practice-note.txt', true);
    },

    'ma-onboarding'(host) {
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-after">Main page message — welcome aboard</p>
        <div class="pw-modal-backdrop">
          <div role="dialog" aria-modal="true" aria-label="Onboarding">
            <p>Welcome! Take the tour?</p>
            <button type="button" class="pw-btn" data-close>Got it</button>
          </div>
        </div>
      </div>`));
      const backdrop = host.querySelector('.pw-modal-backdrop');
      host.querySelector('[data-close]').onclick = () => {
        backdrop.hidden = true;
        status(host, 'Modal closed — main message visible', true);
      };
    },

    'ma-budget'(host) {
      const key = 'pw-budget-demo';
      const load = () => JSON.parse(localStorage.getItem(key) || '[]');
      const save = (rows) => localStorage.setItem(key, JSON.stringify(rows));
      host.appendChild(el(`<div class="pw-app">
        <label>Description <input aria-label="Description" /></label>
        <label>Amount <input aria-label="Amount" type="number" /></label>
        <button type="button" class="pw-btn" data-add>Add income</button>
        <ul class="pw-budget-list"></ul>
        <p class="pw-total">Total: 0</p>
        <button type="button" class="pw-btn ghost" data-reload>Simulate reload</button>
      </div>`));
      const list = host.querySelector('.pw-budget-list');
      const totalEl = host.querySelector('.pw-total');
      const paint = () => {
        const rows = load();
        list.innerHTML = rows.map((r, i) => `<li>${r.d}: ${r.a} <button type="button" data-del="${i}">Remove</button></li>`).join('');
        const total = rows.reduce((s, r) => s + Number(r.a), 0);
        totalEl.textContent = `Total: ${total}`;
        list.querySelectorAll('[data-del]').forEach(btn => {
          btn.onclick = () => {
            const rows2 = load();
            rows2.splice(Number(btn.dataset.del), 1);
            save(rows2);
            paint();
          };
        });
        status(host, `Records: ${rows.length}, total ${total}`, true);
      };
      host.querySelector('[data-add]').onclick = () => {
        const d = host.querySelector('[aria-label="Description"]').value.trim() || 'Item';
        const a = host.querySelector('[aria-label="Amount"]').value || '0';
        const rows = load();
        rows.push({ d, a });
        save(rows);
        paint();
      };
      host.querySelector('[data-reload]').onclick = () => paint();
      paint();
    },

    'ma-context-menu'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-ctx-target" tabindex="0">Right-click this area</div>
        <ul class="pw-ctx-menu" role="menu" hidden>
          <li role="menuitem" data-item="Share">Share ▸</li>
          <li role="menuitem" data-item="Copy">Copy</li>
          <li role="menuitem" data-item="Twitter" class="sub">Twitter</li>
        </ul>
        <p class="pw-ctx-msg" hidden></p>
      </div>`));
      const target = host.querySelector('.pw-ctx-target');
      const menu = host.querySelector('.pw-ctx-menu');
      const msg = host.querySelector('.pw-ctx-msg');
      target.oncontextmenu = (e) => {
        e.preventDefault();
        menu.hidden = false;
      };
      menu.querySelectorAll('[role="menuitem"]').forEach(item => {
        item.onclick = () => {
          menu.hidden = true;
          msg.hidden = false;
          msg.textContent = `Selected: ${item.dataset.item}`;
          status(host, `Selected: ${item.dataset.item}`, true);
        };
      });
    },

    'ma-hover'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-poster" role="img" aria-label="Movie poster">🎬 Movie</div>
        <p class="pw-price" hidden>Price: $12.99</p>
      </div>`));
      const poster = host.querySelector('.pw-poster');
      const price = host.querySelector('.pw-price');
      poster.onmouseenter = () => { price.hidden = false; status(host, 'Price visible on hover', true); };
      poster.onmouseleave = () => { price.hidden = true; };
    },

    'ma-geo'(host) {
      host.appendChild(el(`<div class="pw-app">
        <p class="pw-hint">Simulate Cupertino coords (−122.03118, 37.33182).</p>
        <button type="button" class="pw-btn" data-loc>Get location</button>
        <p class="pw-city" hidden></p>
      </div>`));
      host.querySelector('[data-loc]').onclick = () => {
        const city = host.querySelector('.pw-city');
        city.hidden = false;
        city.textContent = 'Cupertino';
        status(host, 'Location: Cupertino', true);
      };
    },

    'ma-nav-menu'(host) {
      host.appendChild(el(`<nav class="pw-app" aria-label="Practice nav">
        <a href="#" data-page="Home">Home</a>
        <a href="#" data-page="About">About</a>
        <a href="#" data-page="Contact">Contact</a>
      </nav>`));
      host.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
          e.preventDefault();
          openHtmlTab(a.dataset.page, `<h1>${a.dataset.page}</h1><p>Content for ${a.dataset.page}</p>`);
          status(host, `Opened ${a.dataset.page}`, true);
        };
      });
    },

    'ma-redirect'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-start>Start redirect chain</button>
        <p class="pw-redir">Step: start</p>
      </div>`));
      const p = host.querySelector('.pw-redir');
      host.querySelector('[data-start]').onclick = async () => {
        p.textContent = 'Step: second';
        status(host, 'At second', true);
        await new Promise(r => setTimeout(r, 600));
        p.textContent = 'Step: third / final';
        status(host, 'Reached final redirect', true);
      };
    },

    'ma-fetch'(host) {
      host.appendChild(el(`<div class="pw-app">
        <button type="button" class="pw-btn" data-load>Load posts</button>
        <div class="pw-posts"></div>
      </div>`));
      host.querySelector('[data-load]').onclick = async () => {
        const box = host.querySelector('.pw-posts');
        box.textContent = 'Loading…';
        await new Promise(r => setTimeout(r, 700));
        box.innerHTML = ['Post one', 'Post two', 'Post three'].map(t => `<article>${t}</article>`).join('');
        status(host, 'Posts loaded', true);
      };
    },

    'ma-qr'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Text <input aria-label="Text" value="Playwright rocks" /></label>
        <button type="button" class="pw-btn" data-gen>Generate</button>
        <canvas width="120" height="120" aria-label="QR preview" hidden></canvas>
      </div>`));
      host.querySelector('[data-gen]').onclick = () => {
        const canvas = host.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const text = host.querySelector('input').value || 'QR';
        canvas.hidden = false;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#0f172a';
        for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
          if ((x + y + text.length) % 3 === 0) ctx.fillRect(x * 12, y * 12, 10, 10);
        }
        status(host, 'QR image generated (visual assert target)', true);
      };
    },

    'ma-changeable-iframe'(host) {
      let secs = 53;
      const doc = `<!doctype html><html><body style="font-family:system-ui;padding:12px">
        <p>Countdown: <span id="t">${secs}</span>s</p>
        <p id="msg"></p>
        <script>
          let s=${secs};
          const t=document.getElementById('t');
          const m=document.getElementById('msg');
          setInterval(()=>{s--; if(s<0)s=0; t.textContent=s; if(s===0)m.textContent='The journey is over';},1000);
        </script></body></html>`;
      host.appendChild(el(`<div class="pw-app">
        <iframe title="Countdown frame" srcdoc="${doc.replace(/"/g, '&quot;')}" style="width:100%;height:100px;border:1px solid var(--border);border-radius:8px;background:#fff"></iframe>
        <p class="pw-hint">Assert ~53s remaining, then final message.</p>
      </div>`));
      status(host, 'Countdown iframe running', true);
    },

    'ma-slider'(host) {
      host.appendChild(el(`<div class="pw-app">
        <label>Rating <input type="range" min="0" max="100" value="0" aria-label="Rating" /></label>
        <span class="pw-slider-val">0</span>
        <button type="button" class="pw-btn" data-submit>Submit feedback</button>
      </div>`));
      const slider = host.querySelector('input');
      const val = host.querySelector('.pw-slider-val');
      slider.oninput = () => { val.textContent = slider.value; };
      host.querySelector('[data-submit]').onclick = () => {
        const ok = slider.value === '50';
        status(host, ok ? 'Thank you — feedback submitted at 50' : `Submitted at ${slider.value} (try 50)`, ok);
      };
    },

    'ma-auth'(host) {
      const storeKey = 'pw-auth-users';
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-auth-reg">
          <h4>Register</h4>
          <label>Email <input aria-label="Email" type="email" data-reg-email /></label>
          <label>Password <input aria-label="Password" type="password" data-reg-pass /></label>
          <button type="button" class="pw-btn" data-reg>Register</button>
        </div>
        <div class="pw-auth-login">
          <h4>Login</h4>
          <label>Email <input aria-label="Email" type="email" data-login-email /></label>
          <label>Password <input aria-label="Password" type="password" data-login-pass /></label>
          <button type="button" class="pw-btn" data-login>Log in</button>
        </div>
        <p class="pw-welcome" hidden>Welcome — dashboard</p>
      </div>`));
      host.querySelector('[data-reg]').onclick = () => {
        const email = host.querySelector('[data-reg-email]').value.trim();
        const pass = host.querySelector('[data-reg-pass]').value;
        if (!email || !pass) { status(host, 'Need email + password', false); return; }
        const users = JSON.parse(localStorage.getItem(storeKey) || '{}');
        users[email] = pass;
        localStorage.setItem(storeKey, JSON.stringify(users));
        status(host, 'Registered — now log in', true);
      };
      host.querySelector('[data-login]').onclick = () => {
        const email = host.querySelector('[data-login-email]').value.trim();
        const pass = host.querySelector('[data-login-pass]').value;
        const users = JSON.parse(localStorage.getItem(storeKey) || '{}');
        const ok = users[email] === pass;
        host.querySelector('.pw-welcome').hidden = !ok;
        status(host, ok ? 'Welcome — login success' : 'Invalid credentials', ok);
      };
    },

    'ma-jira'(host) {
      host.appendChild(el(`<div class="pw-app">
        <div class="pw-row">
          <input aria-label="Title" placeholder="Issue title" />
          <button type="button" class="pw-btn" data-add>Create</button>
          <input placeholder="Filter" aria-label="Filter" data-filter />
        </div>
        <div class="pw-board">
          <div class="pw-col" data-col="todo"><h4>Todo</h4></div>
          <div class="pw-col" data-col="doing"><h4>In Progress</h4></div>
          <div class="pw-col" data-col="done"><h4>Done</h4></div>
        </div>
      </div>`));
      const todo = host.querySelector('[data-col="todo"]');
      host.querySelector('[data-add]').onclick = () => {
        const title = host.querySelector('[aria-label="Title"]').value.trim() || `Bug ${Date.now()}`;
        const card = el(`<div class="pw-card" draggable="true">${title}<button type="button" data-del>Delete</button></div>`);
        card.querySelector('[data-del]').onclick = () => { card.remove(); status(host, 'Deleted', true); };
        card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', '1'));
        todo.appendChild(card);
        status(host, `Created: ${title}`, true);
      };
      host.querySelectorAll('.pw-col').forEach(col => {
        col.addEventListener('dragover', e => e.preventDefault());
        col.addEventListener('drop', e => {
          e.preventDefault();
          const card = host.querySelector('.pw-card:active, .pw-card');
          // find dragging via last dragstart
        });
      });
      let dragging = null;
      host.addEventListener('dragstart', e => {
        if (e.target.classList.contains('pw-card')) dragging = e.target;
      });
      host.querySelectorAll('.pw-col').forEach(col => {
        col.addEventListener('drop', e => {
          e.preventDefault();
          if (dragging) {
            col.appendChild(dragging);
            status(host, `Moved to ${col.dataset.col}`, true);
            dragging = null;
          }
        });
      });
      host.querySelector('[data-filter]').oninput = (e) => {
        const q = e.target.value.toLowerCase();
        host.querySelectorAll('.pw-card').forEach(c => {
          c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      };
    },
  };

  function mount(root) {
    if (!root) return;
    root.querySelectorAll('[data-widget]').forEach(node => {
      if (typeof node._cleanup === 'function') node._cleanup();
      const id = node.dataset.widget;
      node.innerHTML = '';
      const fn = builders[id];
      if (fn) fn(node);
      else {
        node.innerHTML = `<div class="pw-app"><p class="pw-hint">Interactive demo coming soon for this challenge.</p></div>`;
      }
    });
  }

  window.PracticeWidgets = { mount, builders };
})();
