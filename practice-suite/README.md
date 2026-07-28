# Playwright Practice Suite

TypeScript Playwright tests against public QA sandboxes. One real scenario test per site (not title-only checks). Dead / blocked URLs are listed in [SKIPPED.md](./SKIPPED.md).

## Setup

```bash
cd playwright-practice-suite
npm install
npx playwright install chromium
```

## Run

```bash
npm test                 # full suite
npm run test:drag        # one category
npm run test:ui          # Playwright UI mode
npm run report           # last HTML report
```

## Conventions

- Web-first assertions (`expect(locator).toBeVisible()`, `toHaveText`, …)
- No `waitForTimeout`
- Prefer `getByRole` / `getByLabel` / `getByPlaceholder` / stable ids
- Clipboard tests grant `clipboard-read` / `clipboard-write`
- Popup/tab tests use `Promise.all` + `waitForEvent('page')` (or `context.waitForEvent('page')`)

---

## Folder map

### `tests/drag-and-drop/` — HTML5 / jQuery drag-and-drop

| Spec | Site |
|------|------|
| `expandtesting-drag-and-drop.spec.ts` | https://practice.expandtesting.com/drag-and-drop |
| `expandtesting-drag-and-drop-circles.spec.ts` | https://practice.expandtesting.com/drag-and-drop-circles |
| `herokuapp-drag-and-drop.spec.ts` | https://the-internet.herokuapp.com/drag_and_drop |
| `demoqa-droppable.spec.ts` | https://demoqa.com/droppable |
| `demoqa-dragabble.spec.ts` | https://demoqa.com/dragabble |
| `blogspot-drag-and-drop.spec.ts` | https://testautomationpractice.blogspot.com/ |
| `globalsqa-draganddrop.spec.ts` | https://globalsqa.com/demo-site/draganddrop/ |

### `tests/file-upload/` — `setInputFiles`

| Spec | Site |
|------|------|
| `expandtesting-upload.spec.ts` | https://practice.expandtesting.com/upload |
| `herokuapp-upload.spec.ts` | https://the-internet.herokuapp.com/upload |
| `demoqa-upload-download.spec.ts` | https://demoqa.com/upload-download |

### `tests/alerts/` — alert / confirm / prompt via `page.on('dialog')`

| Spec | Site |
|------|------|
| `expandtesting-js-dialogs.spec.ts` | https://practice.expandtesting.com/js-dialogs |
| `herokuapp-javascript-alerts.spec.ts` | https://the-internet.herokuapp.com/javascript_alerts |
| `demoqa-alerts.spec.ts` | https://demoqa.com/alerts |

### `tests/copy-paste/` — clipboard permissions + paste

| Spec | Site |
|------|------|
| `blogspot-copy-paste.spec.ts` | https://testautomationpractice.blogspot.com/ (Copy Text + Clipboard API) |
| `expandtesting-inputs-clipboard.spec.ts` | https://practice.expandtesting.com/inputs |

### `tests/tab-window-switch/` — new window/tab + in-page tabs

| Spec | Site |
|------|------|
| `expandtesting-windows.spec.ts` | https://practice.expandtesting.com/windows |
| `herokuapp-windows.spec.ts` | https://the-internet.herokuapp.com/windows |
| `demoqa-browser-windows.spec.ts` | https://demoqa.com/browser-windows |
| `demoqa-tabs.spec.ts` | https://demoqa.com/tabs (in-page tabs) |

### `tests/scroll-horizontal/` — overflow scroll + range slider

| Spec | Site |
|------|------|
| `expandtesting-scrollbars.spec.ts` | https://practice.expandtesting.com/scrollbars |
| `expandtesting-horizontal-slider.spec.ts` | https://practice.expandtesting.com/horizontal-slider |
| `herokuapp-horizontal-slider.spec.ts` | https://the-internet.herokuapp.com/horizontal_slider |
| `tutorialspoint-horizontal-scroll.spec.ts` | https://www.tutorialspoint.com/selenium/practice/horizontal-scroll.php |

### `tests/scroll-vertical/` — infinite / overflow vertical scroll

| Spec | Site |
|------|------|
| `expandtesting-infinite-scroll.spec.ts` | https://practice.expandtesting.com/infinite-scroll |
| `expandtesting-scrollbars-vertical.spec.ts` | https://practice.expandtesting.com/scrollbars |
| `herokuapp-infinite-scroll.spec.ts` | https://the-internet.herokuapp.com/infinite_scroll |

### `tests/table-and-sorting/` — read, sort, paginate, CRUD

| Spec | Site |
|------|------|
| `expandtesting-tables.spec.ts` | https://practice.expandtesting.com/tables |
| `expandtesting-dynamic-table.spec.ts` | https://practice.expandtesting.com/dynamic-table |
| `expandtesting-dynamic-pagination-table.spec.ts` | https://practice.expandtesting.com/dynamic-pagination-table |
| `herokuapp-tables.spec.ts` | https://the-internet.herokuapp.com/tables |
| `demoqa-webtables.spec.ts` | https://demoqa.com/webtables |
| `letcode-table.spec.ts` | https://letcode.in/table/ |
| `letcode-advancedtable.spec.ts` | https://letcode.in/advancedtable/ |

### `tests/frame-switch/` — iframe / nested / cross-origin

| Spec | Site |
|------|------|
| `expandtesting-iframe.spec.ts` | https://practice.expandtesting.com/iframe |
| `herokuapp-frames.spec.ts` | https://the-internet.herokuapp.com/frames |
| `herokuapp-iframe.spec.ts` | https://the-internet.herokuapp.com/iframe |
| `herokuapp-nested-frames.spec.ts` | https://the-internet.herokuapp.com/nested_frames |
| `demoqa-frames.spec.ts` | https://demoqa.com/frames |
| `demoqa-nestedframes.spec.ts` | https://demoqa.com/nestedframes |
| `letcode-frame.spec.ts` | https://letcode.in/frame/ |
| `letcode-frameui.spec.ts` | https://letcode.in/frameui/ |
| `selectorshub-cross-origin-iframe.spec.ts` | https://selectorshub.com/cross-origin-iframe/ |
| `selectorshub-xpath-practice.spec.ts` | https://selectorshub.com/xpath-practice-page/ |
| `tutorialspoint-frames.spec.ts` | https://www.tutorialspoint.com/selenium/practice/frames.php |
| `tutorialspoint-nestedframes.spec.ts` | https://www.tutorialspoint.com/selenium/practice/nestedframes.php |
| `uivision-frames.spec.ts` | https://ui.vision/demo/webtest/frames/ |

---

## Project layout

```
playwright-practice-suite/
  fixtures/sample-upload.txt
  tests/<category>/<site>.spec.ts
  playwright.config.ts
  SKIPPED.md
  README.md
```

Third-party demos change without notice. If a site redesigns, update the matching spec or move the URL to `SKIPPED.md`.
