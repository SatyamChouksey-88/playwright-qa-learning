---
tier: CID
tier_key: ciDeepDive
id: ci-deep-dive
title: CI/CD deep dive — four providers, one pipeline shape
lead: The existing #ci curriculum section covers GitHub Actions and Docker in
  depth. This extends it with equivalent minimal pipelines for Jenkins, Azure
  DevOps, and GitLab CI, presented as compare-and-contrast — the pipeline
  shape (install → browsers → shard → artifacts → merge) never changes;
  only the YAML dialect and secret-injection syntax do.
difficulty: senior
topic: ci-cd
pw_version_introduced: "1.40"
---

# CI/CD deep dive

Rendered on the site inside the existing **CI/CD & Docker** section (`#ci`) as a "same pipeline, four CI providers" comparison block, immediately after the GitHub Actions example. This file is the durable source; see `learning-site/index.html` (`#ci` section) for the rendered Jenkinsfile, Azure Pipelines, and GitLab CI snippets alongside the existing GitHub Actions one.

## The shape that doesn't change

1. Checkout, install Node, `npm ci`.
2. `npx playwright install --with-deps` (or use the `mcr.microsoft.com/playwright` Docker image, which already has browsers baked in and skips this step entirely).
3. Run sharded (`--shard=i/n`), one job/matrix-leg per shard.
4. Upload each shard's blob report as an artifact, always (not just on failure — a merged report needs every shard).
5. A separate downstream job downloads all shard artifacts and runs `npx playwright merge-reports --reporter html` to produce one navigable report.

## What actually differs across providers

- **Secret injection syntax:** GitHub Actions `${{ secrets.X }}`, Jenkins `credentials('x')` bound to an env var, Azure DevOps `$(x)` pipeline variables (marked secret in the UI), GitLab CI/CD variables (masked + protected).
- **Matrix/parallel syntax:** GitHub `strategy.matrix`, Jenkins declarative `matrix` block, Azure `strategy.matrix`, GitLab `parallel.matrix`.
- **Artifact APIs:** `actions/upload-artifact` vs `archiveArtifacts` vs `PublishPipelineArtifact@1` vs GitLab's built-in `artifacts:` keyword.

## Docker image usage

`mcr.microsoft.com/playwright:vX.Y.Z-noble` ships Node, browsers, and OS dependencies pre-baked, version-pinned to match `@playwright/test`. Two failure modes to know: (1) using `npx playwright install` *and* the pre-baked image is redundant and slower; (2) letting the image tag drift from `package.json`'s `@playwright/test` version causes exactly the "works in one CI run, breaks in the next" symptom covered in PF11 (flake wave after a browser engine update) — pin both together and bump them in the same PR.

## Browser caching (non-Docker path)

If not using the official image, cache `~/.cache/ms-playwright` (Linux/macOS runners) keyed on the Playwright version in the lockfile, so `playwright install --with-deps` becomes a cache hit on unchanged dependencies instead of a multi-minute download every run.

## Sharding and artifact upload

Sharding trades total wall-clock time for parallel job count; the returns diminish once per-shard startup overhead (checkout, install, browser download/cache-restore) becomes comparable to the shard's actual test runtime — 4–8 shards is a reasonable starting point for most suites before profiling further. Always upload artifacts with `if: always()` (or the provider's equivalent), not `if: failure()` — a merged report needs the passing shards' data too, and a common early mistake is only capturing failure artifacts and then being unable to produce a full merged report on green runs.
