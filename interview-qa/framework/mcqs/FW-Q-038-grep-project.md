---
id: FW-Q-038
type: framework-mcq
topic: framework
subtopic: projects
difficulty: intermediate
stage: 2
answerIndex: 0
lesson: FW-L-210
---

## Question

How combine projects with tag tiers?

## Options

1. Project grep: /@smoke/ for PR smoke project
2. Put tags only in README
3. Use grep only outside Playwright
4. Tags replace test titles entirely

## Correct answer

Project grep: /@smoke/ for PR smoke project

## Why correct

Named projects encode browser + tag slice for CI jobs.

## Why the others are wrong

- Option 2: Tags must drive runner.
- Option 3: Playwright grep is first-class.
- Option 4: Titles still human-readable.
