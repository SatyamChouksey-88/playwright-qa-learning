# InnerHTML audit (Stage 5)

Scope: learning-site `*.js` uses `innerHTML` for curriculum widgets (quiz, interview cards, bank-demo SPA, search results).

## Policy
- Prefer `textContent` for untrusted strings.
- Search results escape via `escHtml` before interpolation.
- Bank Demo / practice widgets are **first-party authored** HTML — treat as trusted templates, not user CMS input.
- Do not introduce `eval` on user strings.

## Follow-ups
- Continue splitting `app.js` into `js/nav.js`, `js/search.js`, `js/quiz.js` incrementally without breaking `file://`.
- FSRS / storage modules already extracted (`fsrs-app.js`, `storage.js`).
