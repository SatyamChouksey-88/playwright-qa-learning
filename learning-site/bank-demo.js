/* Fully functional Bank Demo — login, dashboard, transfer, OTP wire, loan EMI, cards, support
 * Expansions: Clock-friendly OTP expiry, mock API hooks, broken personas, passkey path.
 */
(function () {
  const USERS = {
    apex_user: { pass: 'Password123!', name: 'Apex User', twoFA: false, persona: 'happy' },
    apex_2fa: { pass: 'Password2FA!', name: 'Apex 2FA', twoFA: true, persona: 'happy' },
    apex_locked: { pass: 'Password123!', name: 'Locked User', twoFA: false, persona: 'locked' },
    apex_glitch: { pass: 'Password123!', name: 'Glitch User', twoFA: false, persona: 'glitch' },
  };

  const OTP_TTL_MS = 60_000;

  const state = {
    user: null,
    checking: 4250,
    savings: 18400,
    beneficiaries: [{ name: 'Existing Bene', account: '1234567890', bank: 'Chase Bank' }],
    transactions: [
      { date: '2026-07-20', desc: 'Payroll', cat: 'Income', amount: '+2,400.00' },
      { date: '2026-07-18', desc: 'Groceries', cat: 'Food', amount: '-86.40' },
      { date: '2026-07-15', desc: 'Transfer out', cat: 'Transfer', amount: '-200.00' },
    ],
    tickets: [{ id: 'T-100', subject: 'Welcome', category: 'General', status: 'Closed' }],
    loans: [],
    cardFrozen: false,
    dailyLimit: 1000,
    international: true,
    netWorthHidden: false,
    phone: '+1 (555) 111-2222',
    loginOtp: null,
    wireOtp: null,
    sessionExpiresAt: null,
    passkeyRegistered: false,
  };

  window.BankDemoMocks = window.BankDemoMocks || {};

  const SESSION_KEY = 'pw-bank-demo-session';

  function persistSession() {
    try {
      if (!state.user) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          username: state.user.username,
          name: state.user.name,
          sessionExpiresAt: state.sessionExpiresAt,
          passkeyRegistered: state.passkeyRegistered,
        }),
      );
    } catch (_) {
      /* private mode / file quirks */
    }
  }

  function restoreSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved?.username || !saved?.sessionExpiresAt) return;
      if (Date.now() > saved.sessionExpiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      const base = USERS[saved.username] || USERS.apex_user;
      state.user = { ...base, username: saved.username, name: saved.name || base.name };
      state.sessionExpiresAt = saved.sessionExpiresAt;
      state.passkeyRegistered = !!saved.passkeyRegistered;
    } catch (_) {
      /* ignore corrupt session */
    }
  }

  async function api(path, body) {
    const mock = window.BankDemoMocks[path];
    if (typeof mock === 'function') return mock(body);
    // Prefer real fetch so Playwright page.route / route.fulfill can teach network-layer mocking.
    // Static hosts 404 — fall back to in-memory defaults so file:// and serve keep working.
    if (path === '/api/bank/balance' || path === '/api/bank/session') {
      try {
        const res = await fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body || {}),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        /* offline / file:// */
      }
    }
    if (path === '/api/bank/balance') {
      return { checking: state.checking, savings: state.savings };
    }
    if (path === '/api/bank/session') {
      return { ok: !!state.user, user: state.user?.name || null, expiresAt: state.sessionExpiresAt };
    }
    return { ok: true };
  }

  function money(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function emi(P, annualRate, months) {
    const r = annualRate / 12 / 100;
    if (r === 0) return P / months;
    return (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function issueOtp(kind) {
    const code = kind === 'wire' ? '847291' : '123456';
    const issuedAt = Date.now();
    const expiresAt = issuedAt + OTP_TTL_MS;
    const payload = { code, issuedAt, expiresAt };
    if (kind === 'wire') state.wireOtp = payload;
    else state.loginOtp = payload;
    return payload;
  }

  function otpValid(payload, entered) {
    if (!payload) return { ok: false, reason: 'No OTP issued' };
    if (Date.now() > payload.expiresAt) return { ok: false, reason: 'OTP expired' };
    if (String(entered) !== payload.code) return { ok: false, reason: 'Invalid OTP' };
    return { ok: true };
  }

  function toast(root, msg, ok = true) {
    const t = root.querySelector('.bank-toast');
    if (t) {
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
    }
    t.hidden = false;
    t.textContent = msg;
    t.className = 'bank-toast ' + (ok ? 'ok' : 'bad');
    setTimeout(() => { t.hidden = true; }, 2800);
  }

  function checkingDisplay() {
    if (state.user?.persona === 'glitch' && Math.floor(Date.now() / 1000) % 2 === 0) {
      return money(0);
    }
    return money(state.checking);
  }

  function render(root) {
    if (!state.user) {
      root.innerHTML = `
        <div class="bank-app" id="bank-root">
          <div class="bank-toast" hidden></div>
          <div class="bank-auth" data-testid="auth-screen">
            <h3 class="sub" style="margin-top:0">Apex Trust Bank — Sign In</h3>
            <p class="pw-hint">Demo: <code>apex_user</code> / <code>Password123!</code> · 2FA: <code>apex_2fa</code> / <code>Password2FA!</code> (OTP <code>123456</code>, 60s TTL) · Locked: <code>apex_locked</code> · Glitchy: <code>apex_glitch</code></p>
            <label>Username <input name="username" autocomplete="username" data-testid="bank-username" /></label>
            <label>Password <input name="password" type="password" autocomplete="current-password" data-testid="bank-password" /></label>
            <button type="button" class="pw-btn" data-login data-testid="bank-login">Sign In</button>
            <button type="button" class="pw-btn ghost" data-passkey data-testid="bank-passkey">Sign in with passkey</button>
            <button type="button" class="pw-btn ghost" data-forgot id="forgot-link">Forgot Password?</button>
            <p class="error-message" data-testid="error-alert" hidden></p>
            <div class="otp-dialog" hidden data-testid="otp-dialog">
              <p>Enter OTP (simulated: <span data-testid="otp-hint">123456</span>) · expires <span data-testid="otp-expires">in 60s</span></p>
              <div class="pw-otp">${[0,1,2,3,4,5].map(() => '<input class="otp-input" maxlength="1" inputmode="numeric" />').join('')}</div>
              <button type="button" class="pw-btn" id="verify-2fa" data-testid="verify-2fa">Verify</button>
            </div>
            <div class="reset-box" hidden>
              <label>Reset email <input name="reset-email" type="email" /></label>
              <button type="button" class="pw-btn" id="send-otp">Send OTP</button>
              <p class="otp-sent" hidden>Simulated OTP sent — check alert banner.</p>
            </div>
          </div>
        </div>`;
      bindAuth(root);
      return;
    }

    const net = state.checking + state.savings;
    const sessionNote = state.sessionExpiresAt
      ? `<p class="pw-hint" data-testid="session-expiry">Session expires at ${new Date(state.sessionExpiresAt).toISOString()}</p>`
      : '';
    root.innerHTML = `
      <div class="bank-app" id="bank-root">
        <div class="bank-toast" hidden></div>
        <header class="bank-top">
          <strong>Apex Trust Bank</strong>
          <span id="welcome-banner" data-testid="welcome-banner">Welcome back, ${state.user.name}</span>
          <button type="button" class="pw-btn ghost tiny" data-logout data-testid="bank-logout">Log Out</button>
        </header>
        ${sessionNote}
        <nav class="bank-nav" aria-label="Bank">
          <button type="button" class="pw-btn tiny" data-tab="dash">Dashboard</button>
          <button type="button" class="pw-btn tiny" data-tab="transfers">Transfers</button>
          <button type="button" class="pw-btn tiny" data-tab="loans">Loans</button>
          <button type="button" class="pw-btn tiny" data-tab="cards">Cards</button>
          <button type="button" class="pw-btn tiny" data-tab="support">Support</button>
          <button type="button" class="pw-btn tiny" data-tab="settings">Settings</button>
        </nav>
        <div class="bank-panel" data-panel="dash">
          <div class="pw-row">
            <p>Total Net Worth <button type="button" class="pw-btn tiny toggle-visibility-btn" aria-label="Toggle visibility">👁</button>
              <span class="net-worth-val">${state.netWorthHidden ? '$******' : money(net)}</span></p>
          </div>
          <div class="bank-balances">
            <div data-account="checking" class="card" data-testid="checking-balance"><h4>Checking</h4><p class="balance">${checkingDisplay()}</p></div>
            <div data-account="savings" class="card" data-testid="savings-balance"><h4>Savings</h4><p class="balance">${money(state.savings)}</p></div>
          </div>
          <button type="button" class="pw-btn tiny" data-testid="refresh-balances" data-refresh-bal>Refresh balances (API)</button>
          <pre class="pw-api-out" data-testid="api-balance-out" hidden></pre>
          <h4>Recent Transactions</h4>
          <table class="pw-table" id="transactions-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>${state.transactions.map(t => `<tr><td>${t.date}</td><td>${t.desc}</td><td>${t.cat}</td><td>${t.amount}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="bank-panel hidden" data-panel="transfers">
          <h4>Manage Beneficiaries</h4>
          <button type="button" class="pw-btn" id="add-beneficiary">Add Beneficiary</button>
          <div class="bene-form" hidden>
            <label>Name <input id="bene-name" /></label>
            <label>Account <input id="bene-account" /></label>
            <label>Bank <select id="bene-bank"><option>Chase Bank</option><option>HDFC</option><option>ICICI</option></select></label>
            <button type="button" class="pw-btn" data-save-bene>Save Beneficiary</button>
            <p class="bene-error-alert" hidden></p>
          </div>
          <ul class="bene-list">${state.beneficiaries.map((b, i) => `
            <li class="beneficiary-item" data-i="${i}">
              <span class="bene-name">${b.name}</span> · ${b.account} · ${b.bank}
              <button type="button" class="pw-btn tiny edit-bene">Edit</button>
              <button type="button" class="pw-btn tiny delete-bene">Delete</button>
            </li>`).join('')}</ul>
          <div class="edit-bene-box" hidden>
            <label>Nickname <input id="edit-bene-nickname" /></label>
            <button type="button" class="pw-btn" id="save-bene-changes">Save</button>
          </div>
          <h4>Transfer</h4>
          <label>From <select id="from-acc"><option>Checking</option><option>Savings</option></select></label>
          <label>To <select id="to-acc"><option value="internal">Between My Accounts</option>${state.beneficiaries.map(b => `<option value="ext:${b.account}">${b.name}</option>`).join('')}</select></label>
          <label>Type <select id="transfer-type"><option>Between My Accounts</option><option>External</option></select></label>
          <label>Amount <input id="transfer-amount" type="number" min="1" step="0.01" /></label>
          <button type="button" class="pw-btn" id="exec-transfer">Transfer</button>
          <button type="button" class="pw-btn" id="initiate-wire">Initiate Wire</button>
          <div class="wire-otp" hidden data-testid="wire-otp">
            <p>Wire OTP: <code class="sim-otp" data-testid="wire-otp-code">847291</code></p>
            <input placeholder="OTP" data-testid="wire-otp-input" />
            <button type="button" class="pw-btn" id="submit-otp" data-testid="submit-wire-otp">Submit OTP</button>
          </div>
          <p class="transfer-error-msg" data-testid="transfer-error" hidden></p>
          <p class="transfer-success-msg" data-testid="transfer-success" hidden></p>
        </div>
        <div class="bank-panel hidden" data-panel="loans">
          <h4>EMI calculator</h4>
          <label>Amount <input id="loan-amount" type="number" value="10000" /></label>
          <label>Rate % <input id="loan-rate" type="number" value="8.5" /></label>
          <label>Term (months) <input id="loan-term" type="number" value="36" /></label>
          <button type="button" class="pw-btn" data-calc>Calculate</button>
          <p class="emi-output"></p>
          <h4>Apply</h4>
          <label>Income <input id="app-income" type="number" /></label>
          <label>Amount <input id="app-amount" type="number" /></label>
          <label>Type <select id="app-loan-type"><option>Personal</option><option>Home</option></select></label>
          <button type="button" class="pw-btn" id="submit-loan-app">Submit</button>
          <ul>${state.loans.map(l => `<li>${l.ref} · ${l.type} · ${money(l.amount)} · ${l.status}</li>`).join('')}</ul>
        </div>
        <div class="bank-panel hidden" data-panel="cards">
          <label><input type="checkbox" id="freeze-switch" ${state.cardFrozen ? 'checked' : ''}/> Freeze card</label>
          <label>Daily limit <input type="range" id="limit-slider" min="100" max="5000" value="${state.dailyLimit}" /><span class="limit-display">${money(state.dailyLimit)}</span></label>
          <button type="button" class="pw-btn" id="save-limits">Save limits</button>
          <label><input type="checkbox" id="international-switch" ${state.international ? 'checked' : ''}/> International</label>
          <button type="button" class="pw-btn" id="save-card-settings">Save card settings</button>
          <button type="button" class="pw-btn" id="replace-card">Replace card</button>
          <div class="replace-box" hidden><button type="button" class="pw-btn" id="confirm-order">Confirm order</button></div>
        </div>
        <div class="bank-panel hidden" data-panel="support">
          <label>Subject <input id="ticket-subject" required /></label>
          <label>Category <select id="ticket-category"><option>General</option><option>Fraud</option></select></label>
          <button type="button" class="pw-btn" id="submit-ticket">Create ticket</button>
          <label>Filter <select id="status-filter"><option>All</option><option>Open</option><option>Closed</option></select></label>
          <ul>${state.tickets.map(t => `<li class="ticket-row" data-status="${t.status}">${t.id} · ${t.subject} · ${t.status}</li>`).join('')}</ul>
        </div>
        <div class="bank-panel hidden" data-panel="settings">
          <label>Phone <input id="profile-phone" value="${state.phone}" /></label>
          <button type="button" class="pw-btn" id="save-profile">Save profile</button>
          <h4>Password</h4>
          <label>Current <input id="current-pass" type="password" /></label>
          <label>New <input id="new-pass" type="password" /></label>
          <label>Confirm <input id="confirm-pass" type="password" /></label>
          <button type="button" class="pw-btn" id="update-pass">Update password</button>
          <h4>Passkey</h4>
          <p class="pw-hint" data-testid="passkey-status">${state.passkeyRegistered ? 'Passkey registered for this demo session' : 'No passkey yet'}</p>
          <button type="button" class="pw-btn" data-testid="register-passkey" data-register-passkey>Register demo passkey</button>
        </div>
      </div>`;
    bindApp(root);
    maybeExpireSession(root);
  }

  function maybeExpireSession(root) {
    if (state.sessionExpiresAt && Date.now() > state.sessionExpiresAt) {
      state.user = null;
      state.sessionExpiresAt = null;
      persistSession();
      toast(root, 'Session expired', false);
      render(root);
    }
  }

  function bindAuth(root) {
    const err = root.querySelector('.error-message');
    let pending2fa = null;
    root.querySelector('[data-login]').onclick = () => {
      const u = root.querySelector('[name="username"]').value.trim();
      const p = root.querySelector('[name="password"]').value;
      const user = USERS[u];
      err.hidden = true;
      if (!user || user.pass !== p) {
        err.hidden = false;
        err.textContent = 'Invalid username or password';
        return;
      }
      if (user.persona === 'locked') {
        err.hidden = false;
        err.textContent = 'Account locked — contact support';
        return;
      }
      if (user.twoFA) {
        pending2fa = user;
        const otp = issueOtp('login');
        root.querySelector('.otp-dialog').hidden = false;
        root.querySelector('[data-testid="otp-hint"]').textContent = otp.code;
        root.querySelector('[data-testid="otp-expires"]').textContent = 'at ' + new Date(otp.expiresAt).toISOString();
        return;
      }
      state.user = { ...user, username: u };
      state.sessionExpiresAt = Date.now() + 5 * 60_000;
      persistSession();
      render(root);
    };
    root.querySelector('[data-passkey]').onclick = () => {
      err.hidden = true;
      if (window.__BANK_PASSKEY_OK || state.passkeyRegistered) {
        state.user = { ...USERS.apex_user, username: 'apex_user', name: 'Passkey User' };
        state.sessionExpiresAt = Date.now() + 5 * 60_000;
        persistSession();
        render(root);
        return;
      }
      err.hidden = false;
      err.textContent = 'No passkey registered — use Settings after password login, or set __BANK_PASSKEY_OK in tests';
    };
    root.querySelector('#verify-2fa').onclick = () => {
      const code = [...root.querySelectorAll('.otp-input')].map(i => i.value).join('');
      const check = otpValid(state.loginOtp, code);
      if (!check.ok || !pending2fa) {
        err.hidden = false;
        err.textContent = check.reason || 'Invalid OTP';
        return;
      }
      state.user = { ...pending2fa, username: 'apex_2fa' };
      state.sessionExpiresAt = Date.now() + 5 * 60_000;
      state.loginOtp = null;
      persistSession();
      render(root);
    };
    root.querySelector('#forgot-link').onclick = () => { root.querySelector('.reset-box').hidden = false; };
    root.querySelector('#send-otp').onclick = () => {
      root.querySelector('.otp-sent').hidden = false;
      toast(root, 'Simulated OTP sent to email', true);
    };
    root.querySelectorAll('.otp-input').forEach((inp, i, arr) => {
      inp.setAttribute('inputmode', 'numeric');
      inp.setAttribute('autocomplete', 'one-time-code');
      inp.addEventListener('input', () => { if (inp.value && arr[i + 1]) arr[i + 1].focus(); });
    });
    if (err) err.setAttribute('role', 'alert');
  }

  function bindApp(root) {
    root.querySelector('[data-logout]').onclick = () => {
      state.user = null;
      state.sessionExpiresAt = null;
      persistSession();
      render(root);
    };
    root.querySelectorAll('[data-tab]').forEach(btn => {
      btn.onclick = () => {
        root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== btn.dataset.tab));
      };
    });
    root.querySelector('.toggle-visibility-btn').onclick = () => {
      state.netWorthHidden = !state.netWorthHidden;
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'dash'));
    };
    root.querySelector('[data-refresh-bal]')?.addEventListener('click', async () => {
      const out = root.querySelector('[data-testid="api-balance-out"]');
      const data = await api('/api/bank/balance');
      out.hidden = false;
      out.textContent = JSON.stringify(data);
    });
    root.querySelector('[data-register-passkey]')?.addEventListener('click', () => {
      state.passkeyRegistered = true;
      toast(root, 'Demo passkey registered', true);
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'settings'));
    });

    root.querySelector('#add-beneficiary').onclick = () => { root.querySelector('.bene-form').hidden = false; };
    root.querySelector('[data-save-bene]').onclick = () => {
      const name = root.querySelector('#bene-name').value.trim();
      const account = root.querySelector('#bene-account').value.trim();
      const bank = root.querySelector('#bene-bank').value;
      const errEl = root.querySelector('.bene-error-alert');
      errEl.hidden = true;
      if (state.beneficiaries.some(b => b.account === account)) {
        errEl.hidden = false;
        errEl.textContent = 'Beneficiary with this account number already exists';
        return;
      }
      state.beneficiaries.push({ name, account, bank });
      toast(root, 'Beneficiary added', true);
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'transfers'));
    };
    let editIndex = -1;
    root.querySelectorAll('.edit-bene').forEach(btn => {
      btn.onclick = () => {
        editIndex = Number(btn.closest('.beneficiary-item').dataset.i);
        root.querySelector('.edit-bene-box').hidden = false;
        root.querySelector('#edit-bene-nickname').value = state.beneficiaries[editIndex].name;
      };
    });
    root.querySelector('#save-bene-changes')?.addEventListener('click', () => {
      if (editIndex < 0) return;
      state.beneficiaries[editIndex].name = root.querySelector('#edit-bene-nickname').value.trim();
      toast(root, 'Beneficiary updated', true);
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'transfers'));
    });
    root.querySelectorAll('.delete-bene').forEach(btn => {
      btn.onclick = () => {
        if (!confirm('Delete this beneficiary?')) return;
        const i = Number(btn.closest('.beneficiary-item').dataset.i);
        state.beneficiaries.splice(i, 1);
        toast(root, 'Beneficiary removed', true);
        render(root);
        root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'transfers'));
      };
    });

    const showTransferErr = (msg) => {
      const e = root.querySelector('.transfer-error-msg');
      const s = root.querySelector('.transfer-success-msg');
      s.hidden = true; e.hidden = false; e.textContent = msg;
    };
    const showTransferOk = (msg) => {
      const e = root.querySelector('.transfer-error-msg');
      const s = root.querySelector('.transfer-success-msg');
      e.hidden = true; s.hidden = false; s.textContent = msg;
    };

    root.querySelector('#exec-transfer').onclick = () => {
      const amount = Number(root.querySelector('#transfer-amount').value);
      const from = root.querySelector('#from-acc').value;
      const type = root.querySelector('#transfer-type').value;
      if (!(amount > 0)) { showTransferErr('Amount must be greater than zero'); return; }
      if (type !== 'Between My Accounts') { showTransferErr('Use Initiate Wire for external transfers'); return; }
      const bal = from === 'Checking' ? state.checking : state.savings;
      if (amount > bal) { showTransferErr('Insufficient funds in the source account'); return; }
      if (from === 'Checking') { state.checking -= amount; state.savings += amount; }
      else { state.savings -= amount; state.checking += amount; }
      state.transactions.unshift({ date: new Date().toISOString().slice(0, 10), desc: 'Internal transfer', cat: 'Transfer', amount: money(-amount).replace('$-', '-$') });
      showTransferOk(`Transfer of ${money(amount)} complete`);
      toast(root, 'Transfer success', true);
    };

    let wireAmt = 0, wireBene = '';
    root.querySelector('#initiate-wire').onclick = () => {
      const amount = Number(root.querySelector('#transfer-amount').value);
      const to = root.querySelector('#to-acc').value;
      if (!(amount > 0)) { showTransferErr('Amount must be greater than zero'); return; }
      if (!to.startsWith('ext:')) { showTransferErr('Select an external beneficiary'); return; }
      if (amount > state.checking) { showTransferErr('Insufficient funds in the source account'); return; }
      wireAmt = amount;
      wireBene = state.beneficiaries.find(b => ('ext:' + b.account) === to)?.name || 'beneficiary';
      const otp = issueOtp('wire');
      root.querySelector('.wire-otp').hidden = false;
      root.querySelector('.sim-otp').textContent = otp.code;
    };
    root.querySelector('#submit-otp').onclick = () => {
      const otp = root.querySelector('.wire-otp input').value.trim();
      const check = otpValid(state.wireOtp, otp);
      if (!check.ok) { showTransferErr(check.reason); return; }
      state.checking -= wireAmt;
      showTransferOk(`Wire transfer of ${money(wireAmt)} to ${wireBene} complete`);
      root.querySelector('.wire-otp').hidden = true;
      state.wireOtp = null;
      toast(root, 'Wire complete', true);
    };

    root.querySelector('[data-calc]').onclick = () => {
      const P = Number(root.querySelector('#loan-amount').value);
      const rate = Number(root.querySelector('#loan-rate').value);
      const months = Number(root.querySelector('#loan-term').value);
      const m = emi(P, rate, months);
      root.querySelector('.emi-output').textContent =
        `Monthly EMI: ${money(m)} · Total Interest: ${money(m * months - P)}`;
    };
    root.querySelector('#submit-loan-app').onclick = () => {
      const income = Number(root.querySelector('#app-income').value);
      const amount = Number(root.querySelector('#app-amount').value);
      const type = root.querySelector('#app-loan-type').value;
      const ref = 'LN-' + Math.floor(100000 + Math.random() * 900000);
      const status = income > 0 && amount / income > 5 ? 'Rejected' : 'Under Review';
      state.loans.unshift({ ref, type, amount, status });
      toast(root, status === 'Rejected' ? 'Application rejected' : 'Application submitted', status !== 'Rejected');
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'loans'));
    };

    root.querySelector('#freeze-switch').onchange = (e) => {
      state.cardFrozen = e.target.checked;
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'cards'));
    };
    root.querySelector('#limit-slider').oninput = (e) => {
      root.querySelector('.limit-display').textContent = money(e.target.value);
    };
    root.querySelector('#save-limits').onclick = () => {
      state.dailyLimit = Number(root.querySelector('#limit-slider').value);
      toast(root, 'Limits updated successfully', true);
    };
    root.querySelector('#save-card-settings').onclick = () => {
      state.international = root.querySelector('#international-switch').checked;
      toast(root, 'Card settings saved', true);
    };
    root.querySelector('#replace-card').onclick = () => { root.querySelector('.replace-box').hidden = false; };
    root.querySelector('#confirm-order').onclick = () => {
      toast(root, 'A new card has been ordered. Delivery in 3-5 business days.', true);
    };

    root.querySelector('#submit-ticket').onclick = () => {
      const subject = root.querySelector('#ticket-subject').value.trim();
      if (!subject) { root.querySelector('#ticket-subject').reportValidity(); return; }
      const category = root.querySelector('#ticket-category').value;
      const id = 'T-' + (100 + state.tickets.length + 1);
      state.tickets.unshift({ id, subject, category, status: 'Open' });
      toast(root, 'Ticket created', true);
      render(root);
      root.querySelectorAll('.bank-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== 'support'));
    };
    root.querySelector('#status-filter').onchange = (e) => {
      const v = e.target.value;
      root.querySelectorAll('.ticket-row').forEach(row => {
        row.style.display = v === 'All' || row.dataset.status === v ? '' : 'none';
      });
    };

    root.querySelector('#save-profile').onclick = () => {
      state.phone = root.querySelector('#profile-phone').value;
      toast(root, 'Profile updated successfully', true);
    };
    root.querySelector('#update-pass').onclick = () => {
      const cur = root.querySelector('#current-pass').value;
      const neu = root.querySelector('#new-pass').value;
      const conf = root.querySelector('#confirm-pass').value;
      if (cur !== 'Password123!' && cur !== 'Password2FA!' && cur !== 'NewSecurePass99!') {
        toast(root, 'Current password incorrect', false); return;
      }
      if (!neu || neu !== conf) { toast(root, 'New passwords must match', false); return; }
      toast(root, 'Password changed successfully', true);
    };
  }

  window.BankDemo = {
    mount(host) {
      if (!host) return;
      restoreSession();
      render(host);
    },
    _debugState() {
      return { ...state, user: state.user && { ...state.user } };
    },
  };
})();
