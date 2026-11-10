# Changelog

## Milestones 11 and 12: close-out and landing page (2026-11-10)

- Home: a name gate, then seven navigation cards. The name is kept in sessionStorage (`cca-user-v1`) and Log out clears it.
- Domain cards on Home open the drill with that domain selected (`#drill?domain=dN`). The domain links show at every width.
- The Question Bank card shows the question count, version and publish date. The Question Bank page (`#bank`) shows the same, with a domain breakdown.
- Refresh schedule in `content/schedule.json`: weekly on a weekday, or monthly on a chosen week and weekday, at a UTC hour.
- The hourly workflow `refresh-bank.yml` publishes reviewed questions from `content/drafts/` when the schedule is due, and opens a pull request. It also runs on demand with `workflow_dispatch`.
- `content/refresh-status.json` records the last publish and its run log. Settings shows the schedule, the next check, and a link to run a refresh on GitHub.
- Light mode only. The theme toggle and theme code are removed.
- Phone checks run at 360px, Google Pixel 7 and iPhone 14 widths.

Corrections to the entries below:
- Milestone 11: settings are no longer stored in localStorage, and "Refresh now" and "Load newer bank" are removed. The `published_at` guard only checks duplicate ids within one file. It does not yet stop a changed `published_at` between commits.
- Milestone 12: the merged implementation is the interactive terminal simulation (PRs #26 to #30). The guided walkthrough description below does not match it. The owner needs to confirm the final wording.

## Milestone 12: Labs in the browser (2026-11-08)

- Add guided browser walkthrough pages for each lab in `content/labs/`
- Each lab page shows numbered steps with expected output, and a checkbox to mark lab complete
- Lab page renders README.md at build time; no code runs in the browser, no API key needed
- Lab completion state saves to localStorage progress via the existing Labs page integration

## Milestone 11: Scheduled bank refresh and configuration screen (2026-11-08)

- Add Settings page with refresh period (weekly/monthly), schedule time, and "Refresh now" action
- Settings persist in localStorage via new `src/lib/settings.ts` repository
- Bank version and publish date shown on Settings page alongside the Progress page
- Add "published_at never changes" guard to `scripts/validate-content.ts` (Milestone 10 AC1 now enforced)
- Add workflow stub `.github/workflows/refresh-bank.yml` for scheduled bank refresh (GitHub Actions cron)
- Wire Settings into navigation; add route parsing for `#settings`
- Add unit tests for settings repository and e2e tests for settings page; mobile check extended to `#settings`

## Follow-ups from the milestone review (2026-11-07)

- PLAN.md and BACKLOG.md match the code: milestone rows 9–12 added, status lines updated, and Milestone 10 notes its deferred publish-date guard.
- Drill: a paused drill whose questions are no longer in the bank shows a message before it is discarded.
- Tests: a 360px no-horizontal-scroll check, a hint validation test, and e2e tests for the bank line on the Progress page and the discarded-drill message.
- The 14 d1 questions that had no sources now carry a design-guidance note, since their claims are design judgement, not documented facts. Their reviewer should confirm this.

## Milestone 10: Question bank with publish dates (2026-11-07)

- Questions now live in one bank, `content/bank/questions.json`, with a version and a publish date. Each question has `published_at`, required once it is reviewed. The per-domain files in `content/questions/` are gone.
- The build serves reviewed questions from the bank and exposes its version and date. The Progress page shows them.
- The validator checks the bank: it needs a version and a date, each reviewed question needs `published_at`, and every domain must exist in `domains.json`.
- The 150 questions are unchanged apart from `published_at`, which is their review date.
- The `published_at` never changes guard is now enforced by the validator.

## Milestone 9: Drill pause, resume, and hints (2026-11-07)

- Drill: pause saves the drill (questions, answers, start time) in progress. A paused drill survives a reload and can be resumed or discarded. Starting a new drill replaces it. Finishing a drill clears it.
- Questions can carry an optional `hint`, shown on demand in drill mode only. The mock exam never shows hints. No question has a hint yet; writing and reviewing hints is a separate content pass.
- Stored progress from before this change loads with no paused drill.

## Milestone 8: Polish and calibration (in progress, 2026-11-07)

- Accessibility: focus moves to each new drill question and into the exam when it starts, and to "Keep working" when the submit dialog opens, so keyboard and screen-reader users aren't dropped to the top of the page.
- Mobile: 16px page gutter on phones, and walkthrough tables scroll sideways instead of squeezing. Checked at 360px wide on every page: no horizontal page scroll.
- Not yet: difficulty calibration against official practice materials. This needs those materials and a human reviewer.

## Milestone 7: Progress and readiness (2026-11-07)

- Progress page: readiness as an estimate, with each condition marked met or not and why; mock exam history with per-domain scores; the five weakest concepts, linked to their walkthrough sections; and a reset that asks for confirmation.
- Readiness: three most recent full 60-question mock exams, each at 75% or more, with every domain at 65% or more; all labs marked complete; all walkthroughs opened. Short exams are recorded but don't count.
- Drills and exams (including timed-out ones) are recorded once each. Lab pages have a completion checkbox, and opening a walkthrough marks it read.
- `src/lib/progress.ts`: a small repository over `localStorage` that validates stored data and starts fresh if it's corrupt or unavailable, so a backend can replace it later.
- Restored three `blueprint.md` notes (few-shot count, batch tool use, schema limits) that were lost while merging Milestone 6.

## Milestone 6: Replicate across domains (2026-11-07)

- Questions, walkthrough, and lab for each of d2–d5, matching the d1 pilot: 120 more original questions with sources checked 2026-11-07, every question concept covered by its domain's walkthrough, and one lab per domain.
- Labs: `d2-tool-errors` (structured MCP errors and bounded retry), `d3-team-config` (Claude Code configuration, checked statically), `d4-extraction-loop` (validation, retry with feedback, batch result pairing), `d5-provenance-review` (provenance-preserving synthesis, calibrated routing, stratified sampling). None needs an API key.
- CI runs every lab's typecheck and tests against its reference solution.
- `blueprint.md` lists every place current docs differ from the exam guide, and the questions that test current behavior.
- Fix: the dev server no longer fails when `content/labs/` contains a non-lab entry such as `.DS_Store`.
- Review: all 150 questions are reviewed. d3–d5 (90) were reviewed by kamalsoft on 2026-11-07, which completes the bank and gives the mock exam its full 60 items. The review fixed two answers that were the longest option, corrected wording, and replaced citations that didn't support their claims.

## Milestone 5: Walkthrough and lab for d1 (2026-11-07)

- `content/walkthroughs/d1.md`: one section per task statement (core concepts, decision rules, common mistakes), a checklist of what to do without notes, and links to the drill and lab. SDK and API facts were checked against current docs on 2026-11-07.
- Concept links: every concept on a question's explanation links to the walkthrough section that explains it. The validator fails if a question uses a concept no section lists, or if a domain's walkthrough or lab file is missing.
- `labs/d1-agent-loop`: build an agent loop and a prerequisite gate. `npm run check` runs 11 tests against a scripted fake model, so it needs no API key or install. An optional `npm run demo` runs the learner's code against Claude (`claude-opus-5-5` with server-side fallbacks).
- Walkthroughs and Labs pages render the Markdown at build time. Navigation now uses URL hashes, so links and the back button work; the drill and exam stay mounted while browsing.
- CI typechecks the lab and runs its tests against the reference solution.
- Fixed: the `virtual:content` type declaration had silently resolved to `any` since Milestone 3, because ambient modules can't import relative types and `skipLibCheck` hid the error. The index is now typed through `src/content.ts`.

## Milestone 4: Mock exam mode (2026-11-07)

- Mock exam page: questions assembled by domain weight (60 items, split 16/11/12/12/9 by largest-remainder rounding), a 120-minute countdown, and automatic submission at zero.
- Navigation with Previous/Next and a question palette showing answered and flagged questions; flag for review; confirmation before submitting, listing unanswered and flagged counts.
- No explanations until submission; results show the overall score, score by domain, unanswered count, and a full review.
- When the bank can't fill a domain's share, the exam uses what exists and the intro lists each short domain. Today only d1 has questions, so exams have 16 items.
- Mode switcher between Domain drill and Mock exam. Both stay mounted, so switching never loses a running exam or its timer.
- Shared `QuestionCard` and `Results` components used by both modes. Answer groups now use a unique name per card, so a drill and an exam showing the same question can't interfere.

## Milestone 3: Drill mode (2026-11-07)

- Drill screen: choose domains and a difficulty, answer one question at a time, and see explanations right after each answer or at the end.
- Results screen: overall score, score by domain, and a per-question review with explanations.
- `scripts/build-index.ts`: a Vite plugin that validates content and serves only reviewed questions to the app. Draft questions are left out of the production bundle, and the build fails on invalid content.
- Drill logic in `src/lib/drill.ts` with unit tests; Playwright tests for full drills in both explanation modes.
- Playwright now runs its own dev server on port 5174, so it never reuses a server on 5173.
- Not yet: links from concepts to walkthrough sections (walkthroughs arrive in Milestone 5) and saved progress (Milestone 7).

## Milestone 2: Content pilot (2026-11-07)

- Blueprint in `content/blueprint.md` and `content/domains.json` filled from the official CCAR-F exam guide v1.0, with sources and the date checked.
- 30 original questions for d1 (Agentic Architecture & Orchestration) in `content/questions/d1.json`, covering task statements 1.1 to 1.7, each with an explanation for every option.
- All 30 reviewed against the blueprint checklist by kamalsoft on 2026-11-07.
- `blueprint.md` records where current Agent SDK docs differ from the exam guide.

## Milestone 1: Foundations (2026-11-07)

- Vite, React 19, TypeScript, and Tailwind CSS app shell.
- Zod schemas for domains and questions in `src/lib/schema.ts`.
- `npm run validate` (`scripts/validate-content.ts`): schema, explanations for every wrong option, unique IDs, domain/file match, weights summing to 100, reviewer details on reviewed questions.
- `content/domains.json` filled from the official CCAR-F exam guide v1.0 (names, weights, task statements).
- Vitest unit tests for the validator and a Playwright smoke test.
- GitHub Actions CI running lint, typecheck, tests, validate, build, and e2e.
