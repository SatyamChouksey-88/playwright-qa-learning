---
tier: BDD
tier_key: bddMapping
id: bdd-mapping
title: BDD & Gherkin mapping — when it earns its overhead
lead: Interviewers ask "do you use BDD?" to find out whether you pick tools
  for the team or out of habit. This maps Gherkin onto real Playwright step
  definitions and gives the concrete cost/benefit test, not a religious
  position. Cross-links D20, which covers the organizational decision itself.
difficulty: intermediate
topic: bdd
pw_version_introduced: "1.40"
---

# BDD & Gherkin mapping

Rendered in full on the site as the **BDD & Gherkin mapping** page (`#bdd-mapping`), reachable from the sidebar and search. This file is the durable source for that content — see `learning-site/gap-pages-data.js` (`id: 'bdd-mapping'`) for the rendered version with full Gherkin and `playwright-bdd` code samples.

## Scenario vs Scenario Outline

A **Scenario** is one concrete example. A **Scenario Outline** parameterizes the same steps across an `Examples` table — the Gherkin equivalent of a data-driven/parameterized test. Interviewers use this distinction to check whether you've actually written feature files or only read about them: candidates who haven't often describe Scenario Outline as "just a loop," missing that each row runs as an independently reported scenario (better failure isolation than a `for` loop over the same assertions).

## Gherkin → Playwright step mapping

`playwright-bdd` exists specifically so that Gherkin step definitions can use native Playwright fixtures (page objects, `storageState`, custom fixtures) directly, instead of re-plumbing a `World` object the way plain `cucumber-js` requires. The practical trade-off: `playwright-bdd` couples you more tightly to Playwright (fine if Playwright is your only runner); plain `cucumber-js` + a thin adapter keeps the step layer runner-agnostic if you might swap frameworks later — a real but rarely relevant concern for most teams.

## When BDD earns its overhead vs plain TypeScript

**Earns it:** a non-technical stakeholder (PM, compliance officer, business analyst) actually reads and signs off on `.feature` files as living documentation, and someone owns keeping them synchronized with the step definitions. This is common in regulated domains (banking, healthcare) where a compliance reviewer needs a paper trail independent of code.

**Doesn't earn it:** an all-engineer team adopts Cucumber "because it's more professional" and the Gherkin layer becomes a second language that only QA reads and maintains — at that point it's pure translation overhead: every scenario requires a `.feature` file *and* a step definition *and* the actual Playwright code, three places to keep in sync for the same intent a well-named `test()` block communicates in one file.

**The interview-grade answer** names the actual criterion (who reads the feature files, and do they read them regularly enough to justify the sync cost) rather than a blanket "BDD is good" or "BDD is overhead" — see D20 for the fuller organizational trade-off framework this decision sits inside.

## Common mistake

Adopting BDD as a testing-maturity signal rather than a stakeholder-communication tool, then discovering eighteen months later that the `.feature` files have drifted so far from the step definitions that they're actively misleading documentation — worse than no documentation at all, because they look authoritative.
