# Playwright QA Learning (all-in-one)

Owned by **[SatyamChouksey-88](https://github.com/SatyamChouksey-88)** — Playwright study site + practice suite + interview bank.

| Folder | What it is |
|--------|------------|
| [`learning-site/`](./learning-site/) | Offline SPA study guide — locators, XPath, practice labs, 170+ interview Q&A, MCQs (`file://` friendly, zero install) |
| [`practice-suite/`](./practice-suite/) | Playwright TypeScript tests — `@external` demo-site specs + (upcoming) deterministic `bank-demo` tier |
| [`interview-qa/`](./interview-qa/) | **Markdown SSOT** for interview tiers A–D (`_meta.yaml` + frontmatter) |
| [`tools/content/`](./tools/content/) | Author-time generator → committed `interview-data.js` + MiniSearch `search-index.js` |
| [`docs/adr/`](./docs/adr/) | Architecture decision records |

## Quick start

### Learning site (readers — zero install)
```bash
start learning-site/index.html   # Windows — opens with zero install
# or: npx serve -l 8080 learning-site
```

Press `/` to search (prebuilt MiniSearch index; works on `file://`).

### Author: regenerate interview + search artifacts
```bash
npm install                 # devDependencies only — not required to open the site
npm run build:content       # write generated files
npm run check:content       # CI gate: fail if generated ≠ committed
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
