/* Fully functional Bank Demo — login, dashboard, transfer, OTP wire, loan EMI, cards, support */
(function () {
  const USERS = {
    apex_user: { pass: 'Password123!', name: 'Apex User', twoFA: false },
    apex_2fa: { pass: 'Password2FA!', name: 'Apex 2FA', twoFA: true },
  };

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
  };

  function money(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function emi(P, annualRate, months) {
    const r = annualRate / 12 / 100;
    if (r === 0) return P / months;
    return P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  }

  function toast(root, msg, ok = true) {
    const t = root.querySelector('.bank-toast');
    t.hidden = false;
    t.textContent = msg;
    t.className = 'bank-toast ' + (ok ? 'ok' : 'bad');
    setTimeout(() => { t.hidden = true; }, 2800);
  }

  function render(root) {
    if (!state.user) {
      root.innerHTML = `
        <div class="bank-app" id="bank-root">
          <div class="bank-toast" hidden></div>
          <div class="bank-auth" data-testid="auth-screen">
            <h3 class="sub" style="margin-top:0">Apex Trust Bank — Sign In</h3>
            <p class="pw-hint">Demo: <code>apex_user</code> / <code>Password123!</code> · 2FA user: <code>apex_2fa</code> / <code>Password2FA!</code> (OTP <code>123456</code>)</p>
            <label>Username <input name="username" autocomplete="username" /></label>
            <label>Password <input name="password" type="password" autocomplete="current-password" /></label>
            <button type="button" class="pw-btn" data-login>Sign In</button>
            <button type="button" class="pw-btn ghost" data-forgot id="forgot-link">Forgot Password?</button>
            <p class="error-message" data-testid="error-alert" hidden></p>
            <div class="otp-dialog" hidden>
              <p>Enter OTP (simulated: 123456)</p>
              <div class="pw-otp">${[0,1,2,3,4,5].map(() => '<input class="otp-input" maxlength="1" inputmode="numeric" />').join('')}</div>
              <button type="button" class="pw-btn" id="verify-2fa">Verify</button>
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
    root.innerHTML = `
      <div class="bank-app" id="bank-root">
        <div class="bank-toast" hidden></div>
        <header class="bank-top">
          <strong>Apex Trust Bank</strong>
          <span id="welcome-banner">Welcome back, ${state.user.name}</span>
          <button type="button" class="pw-btn ghost tiny" data-logout>Log Out</button>
        </header>
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
            <div data-account="checking" class="card"><h4>Checking</h4><p class="balance">${money(state.checking)}</p></div>
            <div data-account="savings" class="card"><h4>Savings</h4><p class="balance">${money(state.savings)}</p></div>
          </div>
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
            <button type="button" class="pw-btn" id="save-bene-changes">Save Changes</button>
          </div>
          <h4>Transfer</h4>
          <label>Type <select id="transfer-type"><option>Between My Accounts</option><option>External Wire</option></select></label>
          <label>From <select id="from-acc"><option>Checking</option><option>Savings</option></select></label>
          <label>To <select id="to-acc"><option>Savings</option><option>Checking</option>
            ${state.beneficiaries.map(b => `<option value="ext:${b.account}">${b.name}</option>`).join('')}
          </select></label>
          <label>Amount <input id="transfer-amount" type="number" min="0.01" step="0.01" /></label>
          <button type="button" class="pw-btn" id="exec-transfer">Execute Transfer</button>
          <button type="button" class="pw-btn ghost" id="initiate-wire">Initiate Wire</button>
          <p class="transfer-success-msg" hidden></p>
          <p class="transfer-error-msg error-feedback" hidden></p>
          <div class="wire-otp otp-dialog" hidden>
            <p>SMS OTP (simulated shown): <strong class="sim-otp">847291</strong></p>
            <input aria-label="Wire OTP" />
            <button type="button" class="pw-btn" id="submit-otp">Submit</button>
          </div>
        </div>
        <div class="bank-panel hidden" data-panel="loans">
          <h4>Loan calculator</h4>
          <label>Loan Type <select id="loan-type"><option>Personal Loan</option><option>Home Loan</option><option>Car Loan</option></select></label>
          <label>Amount <input id="loan-amount" type="number" value="10000" /></label>
          <label>Rate % <input id="loan-rate" type="number" value="12" step="0.1" /></label>
          <label>Term (months) <input id="loan-term" type="number" value="24" /></label>
          <button type="button" class="pw-btn" data-calc>Calculate EMI</button>
          <p class="emi-output">Monthly EMI: — · Total Interest: —</p>
          <h4>Apply for Loan</h4>
          <label>Full Name <input id="app-name" /></label>
          <label>Annual Income <input id="app-income" type="number" /></label>
          <label>Employment <select id="app-employment"><option>Employed</option><option>Self-employed</option></select></label>
          <label>Loan Type <select id="app-loan-type"><option>Car Loan</option><option>Personal Loan</option><option>Home Loan</option></select></label>
          <label>Amount <input id="app-amount" type="number" /></label>
          <button type="button" class="pw-btn" id="submit-loan-app">Submit Application</button>
          <table class="pw-table"><thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>${state.loans.map(l => `<tr class="${l.status === 'Rejected' ? 'loan-status-rejected' : ''}"><td class="loan-ref-id">${l.ref}</td><td>${l.type}</td><td>${money(l.amount)}</td><td>${l.status}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="bank-panel hidden" data-panel="cards">
          <div class="card-graphic ${state.cardFrozen ? 'frozen' : ''}">
            <p>Gold Visa Debit</p>
            <p class="card-status">${state.cardFrozen ? 'Locked' : 'Active'}</p>
            ${state.cardFrozen ? '<div class="frozen-overlay">FROZEN</div>' : ''}
          </div>
          <label><input type="checkbox" id="freeze-switch" ${state.cardFrozen ? 'checked' : ''} /> Freeze Card</label>
          <label>Daily Purchase Limit <input type="range" id="limit-slider" min="500" max="5000" step="100" value="${state.dailyLimit}" /> <span class="limit-display">${money(state.dailyLimit)}</span></label>
          <button type="button" class="pw-btn" id="save-limits">Save Limits</button>
          <label><input type="checkbox" id="international-switch" ${state.international ? 'checked' : ''} /> International Usage</label>
          <button type="button" class="pw-btn ghost" id="save-card-settings">Save Settings</button>
          <button type="button" class="pw-btn" id="replace-card">Replace Card</button>
          <div class="replace-box" hidden>
            <label>Reason <select id="replace-reason"><option>Damaged</option><option>Lost</option><option>Stolen</option></select></label>
            <button type="button" class="pw-btn" id="confirm-order">Order Replacement</button>
          </div>
        </div>
        <div class="bank-panel hidden" data-panel="support">
          <label>Subject <input id="ticket-subject" required /></label>
          <label>Category <select id="ticket-category"><option>Transactions</option><option>Cards</option><option>General</option></select></label>
          <label>Details <textarea id="ticket-details"></textarea></label>
          <label>Attachment <input id="ticket-file" type="file" /></label>
          <button type="button" class="pw-btn" id="submit-ticket">Submit Ticket</button>
          <label>Status Filter <select id="status-filter"><option value="All">All</option><option>Open</option><option>Closed</option></select></label>
          <table class="pw-table"><thead><tr><th>ID</th><th>Subject</th><th>Category</th><th>Status</th></tr></thead>
          <tbody class="ticket-body">${state.tickets.map(t => `<tr class="ticket-row" data-status="${t.status}"><td>${t.id}</td><td>${t.subject}</td><td>${t.category}</td><td>${t.status}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="bank-panel hidden" data-panel="settings">
          <label>Phone <input id="profile-phone" value="${state.phone}" /></label>
          <button type="button" class="pw-btn" id="save-profile">Update Profile</button>
          <h4>Security Settings</h4>
          <label>Current Password <input id="current-pass" type="password" /></label>
          <label>New Password <input id="new-pass" type="password" /></label>
          <label>Confirm Password <input id="confirm-pass" type="password" /></label>
          <button type="button" class="pw-btn" id="update-pass">Update Password</button>
          <h4>Login Activity</h4>
          <table class="pw-table"><tbody>
            <tr class="activity-log-row"><td>Chrome</td><td>192.168.1.10</td><td>Active now</td></tr>
            <tr class="activity-log-row"><td>Firefox</td><td>10.0.0.8</td><td>Yesterday</td></tr>
          </tbody></table>
        </div>
      </div>`;
    bindApp(root);
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
      if (user.twoFA) {
        pending2fa = user;
        root.querySelector('.otp-dialog').hidden = false;
        return;
      }
      state.user = { ...user, username: u };
      render(root);
    };
    root.querySelector('#verify-2fa').onclick = () => {
      const code = [...root.querySelectorAll('.otp-input')].map(i => i.value).join('');
      if (code !== '123456' || !pending2fa) {
        err.hidden = false;
        err.textContent = 'Invalid OTP';
        return;
      }
      state.user = { ...pending2fa, username: 'apex_2fa' };
      render(root);
    };
    root.querySelector('#forgot-link').onclick = () => {
      root.querySelector('.reset-box').hidden = false;
    };
    root.querySelector('#send-otp').onclick = () => {
      root.querySelector('.otp-sent').hidden = false;
      toast(root, 'Simulated OTP sent to email', true);
    };
    root.querySelectorAll('.otp-input').forEach((inp, i, arr) => {
      inp.addEventListener('input', () => { if (inp.value && arr[i + 1]) arr[i + 1].focus(); });
    });
  }

  function bindApp(root) {
    root.querySelector('[data-logout]').onclick = () => { state.user = null; render(root); };
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

    // beneficiaries
    root.querySelector('#add-beneficiary').onclick = () => { root.querySelector('.bene-form').hidden = false; };
    root.querySelector('[data-save-bene]').onclick = () => {
      const name = root.querySelector('#bene-name').value.trim();
      const account = root.querySelector('#bene-account').value.trim();
      const bank = root.querySelector('#bene-bank').value;
      const err = root.querySelector('.bene-error-alert');
      err.hidden = true;
      if (state.beneficiaries.some(b => b.account === account)) {
        err.hidden = false;
        err.textContent = 'Beneficiary with this account number already exists';
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
      s.hidden = true;
      e.hidden = false;
      e.textContent = msg;
    };
    const showTransferOk = (msg) => {
      const e = root.querySelector('.transfer-error-msg');
      const s = root.querySelector('.transfer-success-msg');
      e.hidden = true;
      s.hidden = false;
      s.textContent = msg;
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
      root.querySelector('.wire-otp').hidden = false;
      root.querySelector('.sim-otp').textContent = '847291';
    };
    root.querySelector('#submit-otp').onclick = () => {
      const otp = root.querySelector('.wire-otp input').value.trim();
      if (otp !== root.querySelector('.sim-otp').textContent) { showTransferErr('Invalid OTP'); return; }
      state.checking -= wireAmt;
      showTransferOk(`Wire transfer of ${money(wireAmt)} to ${wireBene} complete`);
      root.querySelector('.wire-otp').hidden = true;
      toast(root, 'Wire complete', true);
    };

    root.querySelector('[data-calc]').onclick = () => {
      const P = Number(root.querySelector('#loan-amount').value);
      const rate = Number(root.querySelector('#loan-rate').value);
      const months = Number(root.querySelector('#loan-term').value);
      const m = emi(P, rate, months);
      const totalInterest = m * months - P;
      root.querySelector('.emi-output').textContent =
        `Monthly EMI: ${money(m)} · Total Interest: ${money(totalInterest)}`;
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
      if (!subject) {
        root.querySelector('#ticket-subject').reportValidity();
        return;
      }
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
        toast(root, 'Current password incorrect', false);
        return;
      }
      if (!neu || neu !== conf) {
        toast(root, 'New passwords must match', false);
        return;
      }
      toast(root, 'Password changed successfully', true);
    };
  }

  window.BankDemo = {
    mount(host) {
      if (!host) return;
      render(host);
    }
  };
})();
