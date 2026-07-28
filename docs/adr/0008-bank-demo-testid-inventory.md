# ADR-0008: Bank Demo `data-testid` inventory (regression contract)

## Status
Accepted — this file IS the regression contract. Any change to `learning-site/bank-demo.js` markup must keep every id below present, unchanged, and structurally reachable the same way.

## Full inventory (verbatim, from `learning-site/bank-demo.js`)

| `data-testid` | Element | Notes |
|---|---|---|
| `auth-screen` | `.bank-auth` container | asserted by `visual.spec.ts`, `site-smoke.spec.ts`, `a11y.spec.ts` |
| `bank-username` | username `<input>` | asserted by `a11y.spec.ts` |
| `bank-password` | password `<input>` | asserted by `a11y.spec.ts` |
| `bank-login` | sign-in `<button>` | asserted by `a11y.spec.ts` |
| `bank-passkey` | "Sign in with passkey" `<button>` | used by passkey-flow specs |
| `error-alert` | `<p class="error-message">`, `role="alert"` semantics live in CSS/ARIA, hidden by default | |
| `otp-dialog` | OTP dialog container, hidden by default | |
| `otp-hint` | `<span>` showing the simulated OTP code | mutated at runtime via `querySelector('[data-testid="otp-hint"]')` |
| `otp-expires` | `<span>` showing OTP expiry | mutated at runtime |
| `verify-2fa` | OTP verify `<button>` (`id="verify-2fa"` ALSO present — do not remove the `id`, some code may reference it) | |
| `welcome-banner` | `<span id="welcome-banner">` | asserted by `auth.spec.ts`, `a11y.spec.ts`, `authed-dashboard.spec.ts`; text is `Welcome back, {name}` |
| `bank-logout` | logout `<button>` | |
| `session-expiry` | `<p>` shown only when a session exists | conditional render |
| `checking-balance` | checking account `<div class="card">` | asserted by `authed-dashboard.spec.ts` |
| `savings-balance` | savings account `<div class="card">` | |
| `refresh-balances` | "Refresh balances (API)" `<button>` | also carries `data-refresh-bal` |
| `api-balance-out` | `<pre>` output panel, hidden by default | mutated at runtime via `querySelector('[data-testid="api-balance-out"]')` |
| `wire-otp` | wire-transfer OTP container, hidden by default | |
| `wire-otp-code` | `<code class="sim-otp">` simulated wire OTP | |
| `wire-otp-input` | wire OTP `<input>` | |
| `submit-wire-otp` | submit wire OTP `<button>` (`id="submit-otp"` also present) | |
| `transfer-error` | `<p class="transfer-error-msg">`, hidden by default | |
| `transfer-success` | `<p class="transfer-success-msg">`, hidden by default | |
| `passkey-status` | `<p class="pw-hint">` passkey registration status | |
| `register-passkey` | "Register demo passkey" `<button>` | also carries `data-register-passkey` |

## Currently asserted by the Playwright suite (subset in active use)
`auth-screen`, `bank-username`, `bank-password`, `bank-login`, `welcome-banner`, `checking-balance` (from `a11y.spec.ts`, `visual.spec.ts`, `authed-dashboard.spec.ts`, `site-smoke.spec.ts`). The remaining ids above are not currently asserted by name but are part of the DOM contract other/future specs may rely on and must not be removed or renamed.

## Rule going forward
Any redesign pass touching `learning-site/bank-demo.js` or its container markup in `index.html` (`#bank-demo` section) may change **CSS classes for styling and visual presentation only**. It must not rename, remove, or reorder any `data-testid`, must not remove the plain `id` attributes noted above, and must not change which parent/child structure the `querySelector('[data-testid="…"]')` runtime lookups rely on. Run `cd practice-suite && npm run test:bank-demo` after any touch near this file.
