---
id: IV-CRAFT-006
type: iv-craft
title: Red and green flags in Playwright interviews
objective: Separate signal from noise when evaluating answers and live coding.
---

## Concept

**Green flags**: names web-first locators unprompted; triages flakes reproduce→trace→category; distinguishes test vs worker scope; mentions cleanup for routes/mocks; asks clarifying questions before coding. **Red flags**: default to fixed sleeps or forced clicks; cannot explain auto-wait; treats Page objects as assertion containers; "we retry until green" as strategy; dismisses accessibility.

## Why it matters

Flags are pattern shortcuts for note-taking, not automatic rejections. One red flag with strong recovery can still pass; three green flags with no depth may still be a 3.

## Practice

Keep a checklist column on the scoring sheet. When a red flag appears, note the exact quote. Ask one follow-up to see if it is habit or misunderstanding.

## Common mistakes

Treating red flags as veto without probing; ignoring green flags because of seniority title; conflating "uses TypeScript" with "writes maintainable tests".

## Related

- IV-CRAFT-005
- IV-CRAFT-003
