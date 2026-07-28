# Skipped URLs

Probed on **2026-07-28**. These are **not** included as runnable tests so they cannot fail the suite.

| URL | Reason |
|-----|--------|
| https://demo.seleniumeasy.com/drag-and-drop-demo.html | DNS failure (`ERR_NAME_NOT_RESOLVED`) — host no longer resolves |
| https://codepen.io/shaikmaqsood/pen/XmydxJ | HTTP **403** / Cloudflare interstitial (`Just a moment...`) — blocked for automation |
| https://album.alexflueras.ro/index.php | DNS failure (`ERR_NAME_NOT_RESOLVED`) |
| https://stepcampus.in/playground | HEAD returned 200, but Chromium navigation aborted / redirected to `chrome-error://` — unstable for CI |
| https://sqengineer.com/practice-sites/ | Live (200) but is a **link directory**, not a scenario sandbox — no dedicated interaction test added |

## Soft-skips inside specs (still in suite)

These tests run when the host cooperates; otherwise they `test.skip` so the suite stays green:

| Spec | When it skips |
|------|----------------|
| `tests/tab-window-switch/herokuapp-windows.spec.ts` | Heroku Application Error / missing link |
| `tests/table-and-sorting/demoqa-webtables.spec.ts` | `.rt-tbody` never hydrates (ads / bot wall) |
| `tests/table-and-sorting/herokuapp-tables.spec.ts` | Heroku Application Error / `#table1` missing |

## Notes

- **Copy/paste:** CodePen was the only dedicated “copy button” demo in the list; with it blocked, clipboard coverage uses Blogspot **Copy Text** + ExpandTesting **inputs** with `clipboard-read` / `clipboard-write` permissions.
- **UI.Vision frames** (`https://ui.vision/demo/webtest/frames/`) stayed in `tests/frame-switch/` after a live check — re-skip if it flakes in your network.
- Re-check skipped hosts periodically; demos come and go.
