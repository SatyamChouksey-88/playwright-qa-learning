# Playwright QA Learning (all-in-one)

One repo with everything for studying and practicing Playwright.

| Folder | What it is |
|--------|------------|
| [`learning-site/`](./learning-site/) | Offline SPA study guide — locators, XPath, practice labs, 170+ interview Q&A, MCQs |
| [`practice-suite/`](./practice-suite/) | Playwright TypeScript tests against public QA demo sites (drag-drop, upload, alerts, tabs, frames, …) |
| [`interview-qa/`](./interview-qa/) | Markdown interview bank (tiers A–D + practice Q&A index) |

## Quick start

### Learning site (open in browser)
```bash
# open learning-site/index.html
start learning-site/index.html   # Windows
```

### Practice suite
```bash
cd practice-suite
npm install
npx playwright install chromium
npm test
```

### Interview markdown
See [`interview-qa/README.md`](./interview-qa/README.md) and [`interview-qa/playwright-interview-qa.md`](./interview-qa/playwright-interview-qa.md).

## Previously separate repos

This monorepo replaces:
- `SatyamChouksey-88/PlaywrightLearning`
- `SatyamChouksey-88/playwright-practice-suite`
- `SatyamChouksey-88/playwright-interview-qa`
