# PlaywrightLearning

A self-contained study site for **Playwright + TypeScript** — theory, copy-paste examples, a cheat sheet, interview Q&A, and a scored quiz. No build step and no npm dependencies for the site itself.

**Live site:** [https://avinash258.github.io/PlaywrightLearning/](https://avinash258.github.io/PlaywrightLearning/)

## Quick start

Open `index.html` in a browser, or serve the folder locally:

```bash
# Node (recommended)
npx serve -l 8080 .

# Python
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Deep links use the URL hash, e.g. `index.html#sharding` or `https://avinash258.github.io/PlaywrightLearning/#fixtures`.

## What's inside

| Section | Topics |
|---|---|
| **Getting started** | Overview, learning roadmap, install & setup, first test, TypeScript essentials |
| **Core API** | Locators, actions, assertions, auto-waiting & timeouts, frames / tabs / dialogs |
| **Structure** | Hooks, fixtures, `playwright.config.ts`, Page Object Model, data-driven testing |
| **Advanced** | Auth & storage state, API testing, network mocking, visual & a11y, debugging, **sharding**, CI/CD & Docker, best practices |
| **Practice** | Cheat sheet, **UI Practice Lab** (21 elements), **Practice Q&A** (24), anti-patterns, flake playbook, 117 interview scenarios, random drill, 30-question quiz |

Each topic pairs short **theory** (why it works) with runnable **examples**.

## Features

- Full-text search across every section — press `/`
- Keyboard help — press `?`
- Copy button on every code block
- Dark / light theme (saved in `localStorage`)
- Study checklist + interview “practiced” progress (local only)
- Interview filter / expand-collapse / unpracticed filter on tier pages
- Random interview drill
- Prev/next section bar + back-to-top
- Scored quiz with explanations and a progress bar
- Responsive layout (sidebar collapses on mobile)
- Hash-based navigation for sharing specific topics

## Project files

| File | Purpose |
|---|---|
| `index.html` | All content sections |
| `styles.css` | Theme, layout, and components |
| `app.js` | Navigation, search, highlighting, quiz, interview, drill, progress |
| `quiz-data.js` | Quiz questions and explanations |
| `playground-data.js` | UI practice elements + practice Q&A |
| `interview-data.js` | Scenario-based interview bank (117 questions, 4 tiers) |
| `interview/*.md` | Markdown export of the interview bank |
| `.nojekyll` | Lets GitHub Pages serve the site as plain static files |

## Customize the quiz

Append objects to the array in `quiz-data.js`:

```js
{
  q: "Question text?",
  options: ["A", "B", "C", "D"],
  answer: 2,          // 0-based index of the correct option
  explain: "Why this is the answer."
}
```

## Learn path (suggested)

1. Overview checklist → setup → first test → locators
2. Actions, assertions, auto-waiting
3. Fixtures, config, Page Object Model
4. Auth, API, mocking, sharding, CI
5. Anti-patterns → Flake playbook
6. Interview hub → Tier A→D → Random drill → Quiz

## Practice deep links

| Hash | Content |
|---|---|
| `#playground` | UI Practice Lab — challenges + Show solution |
| `#playground-qa` | Practice-element interview Q&A |
| `#miniapps` | Mini-app challenges + Show solution |
| `#miniapps-qa` | Mini-app interview Q&A |
| `#mistakes` | Anti-patterns & interview red flags |
| `#flake` | Flake triage playbook |
| `#interview` | Hub + recommendations + progress |
| `#interview-tier-a` | Tier A — Beginner (25) |
| `#interview-tier-b` | Tier B — Intermediate (30) |
| `#interview-tier-c` | Tier C — Senior (27) |
| `#interview-tier-d` | Tier D — Architect (35) |
| `#drill` | Random interview drill |
| `#quiz` | 30-question scored quiz |

Legacy hashes (`#interview-junior`, `#interview-mid`, `#interview-senior`, `#interview-architect`, `#interview-stuck`) redirect to the matching tier or hub.

## License

Study / reference material — use and adapt freely for learning.
