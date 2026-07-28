/** Interviewer Mode craft lessons — hiring science, no banned tokens */
export const CRAFT = [
  {
    id: 'IV-CRAFT-001',
    title: 'Structuring a technical round',
    objective: 'Design a timed agenda with clear signals, backup paths, and note-taking slots.',
    concept:
      'A Playwright interview round is a **measurement instrument**, not a trivia quiz. Open with rapport and role context (2 min), state the format ("theory then one live exercise"), run one primary question with follow-ups, reserve 5 minutes for candidate questions, and close with your scoring snapshot before memory fades.',
    why:
      'Unstructured rounds produce noisy scores: strong communicators ramble, quiet candidates get cut off, and interviewers forget evidence. A fixed agenda keeps every candidate comparable and makes debriefs defensible.',
    practice:
      'Before the loop, pick a kit (`IV-KIT-*`) matching level and duration. Write minute budgets on a sticky note: intro 3, core 35, coding 15, wrap 5, buffer 2. During the round, tick boxes in the scoring sheet as evidence appears — do not wait until the end.',
    mistakes:
      'Running three unrelated topics with no depth; skipping the live exercise because "we ran long"; letting the candidate drive entirely; failing to leave 5 minutes for their questions (signals culture).',
    related: ['IV-CRAFT-002', 'IV-KIT-MID-THEORY-45', 'IV-DIAG-ROUND-FLOW'],
  },
  {
    id: 'IV-CRAFT-002',
    title: 'Sequencing and calibration across loops',
    objective: 'Order questions easy→hard within a round and align bar across interviewers before day one.',
    concept:
      'Start with a **warm-up** question the candidate can answer in 3 minutes (validates mic, reduces anxiety), then escalate difficulty. Across the hiring loop, sequence rounds: screening → deep technical → system design → behavioral-technical. **Calibration** means interviewers score the same recorded answer before live loops and agree what "3 vs 4" looks like on each rubric dimension.',
    why:
      'Cold-start hard questions measure nerves, not skill. Mis-calibrated loops hire inconsistent profiles — one interviewer passes everyone, another fails everyone. Schmidt & Hunter (1998) show structured interviews raise validity when raters share anchors.',
    practice:
      'Hold a 60-minute pre-loop session: each interviewer scores two anonymized sample answers using `IV-RUBRIC`. Discuss disagreements until anchors align. Document the hire bar in writing (`## Hire bar` in kits). Re-calibrate when the bar shifts (new team, new stack).',
    mistakes:
      'Each interviewer inventing their own bar; senior interviewer asking architect questions in a fresher loop; changing difficulty mid-round based on gut feel without documenting why.',
    related: ['IV-CRAFT-001', 'IV-CRAFT-008', 'IV-CRAFT-004'],
  },
  {
    id: 'IV-CRAFT-003',
    title: 'Probing without leading',
    objective: 'Use open follow-ups that reveal thinking without supplying the answer.',
    concept:
      'Leading: "You would use storageState, right?" Non-leading: "How would you avoid logging in through the UI on every test?" **Probe ladder**: clarify → mechanism → trade-off → failure mode. Wait 5 seconds after a thin answer before hinting. Echo their words: "You said fixtures — what scope would you pick?"',
    why:
      'Leading questions inflate scores for candidates who nod along and punish honest uncertainty. The signal you want is *how* they reason when stuck, not whether they guessed your preferred keyword.',
    practice:
      'Prepare three follow-ups per question from the question bank (`## Follow-up probes`). If they mention a pattern, ask for a TypeScript sketch. If they mention a tool feature, ask what breaks when misused. Never complete their sentence.',
    mistakes:
      'Teaching during the interview ("the answer is mergeTests"); accepting "I would Google it" without asking what they would search; stacking three questions before they finish the first.',
    related: ['IV-CRAFT-004', 'IV-CRAFT-006'],
  },
  {
    id: 'IV-CRAFT-004',
    title: 'Stuck candidate and the hint ladder',
    objective: 'Rescue a frozen candidate without giving away the score.',
    concept:
      'Every question file includes a **hint ladder** (three tiers). Tier 1 reframes the problem; tier 2 names a category ("think about fixture scope"); tier 3 gives a partial code shape. Document which tier you used in notes — heavy hinting caps the score at 2–3 on Technical depth.',
    why:
      'Completely silent candidates may be nervous, not unqualified. A humane ladder distinguishes "needed structure" from "never knew it." Google re:Work emphasizes structured evaluation with documented evidence, not trick questions.',
    practice:
      'At 90 seconds of silence: "Want me to rephrase?" At 3 minutes: offer Hint 1. If they progress, stop hinting. If still stuck after Hint 3, move on — partial data beats fabricated answers.',
    mistakes:
      'Jumping straight to the model answer; refusing any hints and calling it "rigor"; letting one stuck question consume half the round.',
    related: ['IV-CRAFT-003', 'IV-CRAFT-001'],
  },
  {
    id: 'IV-CRAFT-005',
    title: 'Structured scoring and bias awareness',
    objective: 'Score each rubric dimension independently with behavioral anchors, not a gut hire/no-hire.',
    concept:
      'Use the five dimensions in `IV-RUBRIC`: Technical depth, Problem-solving process, Communication, Code quality, Judgment / trade-offs. Score **after** the round using notes, not vibes. Sackett et al. (2022) remind us that unstructured impressions overweight similarity and confidence; Huffcutt & Arthur (1994) show rater training improves reliability.',
    why:
      'Single-number gut scores correlate with interviewer mood and affinity, not job performance. Dimension scores surface "strong coder, weak communication" profiles for intentional decisions.',
    practice:
      'Fill the scoring table immediately after the candidate leaves. Cite one evidence bullet per dimension ("named worker scope unprompted" = 4 on Technical depth). Never discuss scores with other interviewers until everyone submits.',
    mistakes:
      'Halo effect from one great answer; penalizing accent or pace; comparing to the previous candidate instead of the rubric; changing scores in debrief because others disagreed without new evidence.',
    related: ['IV-CRAFT-002', 'IV-CRAFT-007', 'IV-DIAG-SCORING'],
  },
  {
    id: 'IV-CRAFT-006',
    title: 'Red and green flags in Playwright interviews',
    objective: 'Separate signal from noise when evaluating answers and live coding.',
    concept:
      '**Green flags**: names web-first locators unprompted; triages flakes reproduce→trace→category; distinguishes test vs worker scope; mentions cleanup for routes/mocks; asks clarifying questions before coding. **Red flags**: default to fixed sleeps or forced clicks; cannot explain auto-wait; treats Page objects as assertion containers; "we retry until green" as strategy; dismisses accessibility.',
    why:
      'Flags are pattern shortcuts for note-taking, not automatic rejections. One red flag with strong recovery can still pass; three green flags with no depth may still be a 3.',
    practice:
      'Keep a checklist column on the scoring sheet. When a red flag appears, note the exact quote. Ask one follow-up to see if it is habit or misunderstanding.',
    mistakes:
      'Treating red flags as veto without probing; ignoring green flags because of seniority title; conflating "uses TypeScript" with "writes maintainable tests".',
    related: ['IV-CRAFT-005', 'IV-CRAFT-003'],
  },
  {
    id: 'IV-CRAFT-007',
    title: 'Hire recommendation and record retention',
    objective: 'Write evidence-based recommendations and retain interview records per policy.',
    concept:
      'Recommendation tiers: **Strong hire** (mostly 4s, no red flags), **Hire** (3s with clear strengths), **No hire** (multiple 2s or critical gaps), **Strong no hire** (1s or integrity issues). Each write-up needs: role level, kit used, dimension scores, two evidence bullets, one risk. Retain notes per EEOC guidance — factual, job-related, no protected-class commentary.',
    why:
      'Vague "good culture fit" feedback is legally fragile and useless for calibration. Written evidence supports appeals, bar raises, and post-hire validation studies.',
    practice:
      'Submit within 24 hours. Template: "For Mid SDET: Technical 3 — explained storageState but not rotation; Process 4 — systematic flake triage; … Recommendation: Hire with mentorship on auth fixtures." Store in ATS, not personal chat.',
    mistakes:
      'Scoring before the round ends; sharing notes with hiring manager before debrief; subjective language ("felt junior"); deleting notes after decision.',
    related: ['IV-CRAFT-005', 'IV-CRAFT-008'],
  },
  {
    id: 'IV-CRAFT-008',
    title: 'Co-interviewer roles and debrief',
    objective: 'Split note-taking and probing duties; run a disciplined debrief.',
    concept:
      'Primary interviewer drives questions; secondary captures verbatim quotes and timestamps. Switch roles on alternate loops. Debrief order: primary submits scores silently → secondary → discuss deltas >1 point only → hiring manager decides. If split, schedule follow-up or third interview — never average scores mathematically.',
    why:
      'Single-interviewer loops miss details while typing. Co-interviewer calibration reduces drift and catches leading questions in real time.',
    practice:
      'Pre-brief 5 minutes: who leads, which kit, backup question if short. Post-brief: "What would change your score?" If disagreement persists, cite rubric anchors, not seniority.',
    mistakes:
      'Both interviewers asking different questions simultaneously; secondary silent entire round; debrief becoming advocacy for favorite candidate.',
    related: ['IV-CRAFT-002', 'IV-CRAFT-005', 'IV-CRAFT-007'],
  },
];
