# Playwright QA Learning (all-in-one)

Owned by **[SatyamChouksey-88](https://github.com/SatyamChouksey-88)** — Playwright study site + practice suite + interview bank.

| Folder | What it is |
|--------|------------|
| [`learning-site/`](./learning-site/) | Offline SPA study guide — locators, XPath, practice labs, 170+ interview Q&A, MCQs (`file://` friendly, zero install) |
| [`practice-suite/`](./practice-suite/) | Playwright TypeScript tests — `@external` demo-site specs + (upcoming) deterministic `bank-demo` tier |
| [`interview-qa/`](./interview-qa/) | Markdown interview bank (tiers A–D + practice Q&A index) |

## Quick start

### Learning site
```bash
start learning-site/index.html   # Windows — opens with zero install
# or: npx serve -l 8080 learning-site
```

### Practice suite
```bash
cd practice-suite
npm install
npx playwright install chromium
npm test                         # all tests
npx playwright test --grep @external   # third-party demo hosts only
```

### Interview markdown
See [`interview-qa/README.md`](./interview-qa/README.md).

## GitHub

- Monorepo: https://github.com/SatyamChouksey-88/playwright-qa-learning
- Live site (when Pages enabled): https://satyamchouksey-88.github.io/playwright-qa-learning/learning-site/
