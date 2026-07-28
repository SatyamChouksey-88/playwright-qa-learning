# Interview Q&A (markdown SSOT)

Owned by **[SatyamChouksey-88](https://github.com/SatyamChouksey-88)**.

**Edit these files** — then regenerate site artifacts:

```bash
npm install          # author machine only
npm run build:content
```

| File | Role |
|------|------|
| `_meta.yaml` | Hub copy, recommendations, tier metadata |
| `01-junior.md` … `04-architect.md` | Tier A–D scenarios (YAML frontmatter + Ideal/Stuck) |
| `scenario-based-question-bank.md` | **Generated** consolidated mirror |
| `06`–`08` practice labs | Separate practice notes (not yet in the JS generator) |

Generated outputs (committed): `learning-site/interview-data.js`, `learning-site/interview/*.md`, `learning-site/search-index.js`.

Staleness gate: `npm run check:content` (also runs in GitHub Actions).

Also available inside the learning site: https://github.com/SatyamChouksey-88/playwright-qa-learning/tree/main/learning-site
