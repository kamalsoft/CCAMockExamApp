# Backlog

| | |
| --- | --- |
| **Created** | 2026-11-07 |
| **Status** | Milestones 9–12 planned; no work started |
| **Related** | [PLAN.md](PLAN.md) · [CLAUDE.md](CLAUDE.md) · [CHANGELOG.md](CHANGELOG.md) |

Features that come after the v1 milestones. Per PLAN.md section 10, new features go here, not into the current milestone. Each milestone starts only after its plan is approved.

## Decisions needed before work starts

Three requests conflict with PLAN.md or CLAUDE.md. Each needs a decision from you.

1. **Labs in the browser (Milestone 12).** PLAN.md section 7 says: "The app does not run learner code in the browser," and labs use the learner's own API key from their environment. Running lab code in the browser would reverse both rules. Entering an API key in the browser would also break "keep API keys out of the app bundle". *Recommendation:* keep labs local, and add an in-browser guided walkthrough (step-by-step, checks shown as expected output) that needs no key. Change PLAN.md if you want real in-browser execution.

2. **Periodic question generation (Milestone 11).** PLAN.md puts "Live model generation of questions at runtime" out of scope, and the app has no server. Every question also needs human review before it's served (PLAN.md section 6). *Recommendation:* a scheduled job, run outside the app, produces a batch of draft questions that go through the same review gate. The app only serves reviewed questions, and it records each one's publish date. The configuration screen then controls which bank refresh is shown. Automatic, unreviewed generation would break the content rules.

3. **Hints in mock exams (Milestone 9).** A hint that points at the answer undermines a timed exam. *Recommendation:* hints in drill mode only. The mock exam shows none until submission, as PLAN.md section 7 already requires.

## Milestone 9: Drill pause and resume, and hints

**Goal:** Learners can pause a drill and come back to it later, and get a hint on any drill question.

**Deliverables**
- Pause button on the drill. It saves the current set, responses and position, and returns to setup. A "Resume drill" option appears until the drill is finished or discarded.
- Saved drill survives a page reload (localStorage, behind the progress repository).
- Optional `hint` field on each question (schema and validator update). The hint points at the reasoning without naming the answer. A "Show hint" button appears on each drill question.
- Hints are written for existing questions in a separate pass, reviewed like any content change.

**Acceptance criteria**
- Pause then reload then resume restores the same question, answers and position.
- A finished or discarded drill can't be resumed.
- Hints never appear in the mock exam.
- Validation passes with the new optional field; questions without a hint still validate.

**Depends on:** nothing. Can start after approval.

## Milestone 10: Question bank with publish dates

**Goal:** Questions live in a Question Bank, each with the date it was published, and the app reads from the bank.

**Deliverables**
- A bank file, `content/bank/`, that holds every reviewed question with `published_at` and a bank version.
- The build reads the bank in place of the per-domain files. The validator checks the bank.
- The bank records when each question was first published, so it stays stable across refreshes.
- The app shows the bank version and publish date on the Progress page (small, text only).

**Acceptance criteria**
- A question's `published_at` never changes once set, even when it's refreshed.
- `npm run validate` rejects a bank entry without a `published_at` or review fields.
- The existing 150 questions all appear, unchanged in content.

**Depends on:** Milestone 9 is not required. Decision: whether the bank replaces `content/questions/` (recommended) or sits beside it.

## Milestone 11: Scheduled refresh and configuration screen

**Goal:** The bank refreshes on a schedule the learner sets, and the app switches to the newest bank.

**Deliverables**
- A scheduled refresh job, run outside the app (for example, a GitHub Actions cron), that builds the next bank from reviewed drafts only.
- A configuration screen, with a refresh period (for example, weekly or monthly), a schedule time, and a "refresh now" action.
- The app compares its bank version with the latest one and offers to load the newer bank. The learner's progress is kept.
- Settings are saved in localStorage.

**Acceptance criteria**
- A bank with an unreviewed question is never published.
- Switching banks keeps all recorded attempts and progress.
- If the schedule can't run, the app keeps the current bank and says so.
- The configuration screen works with localStorage unavailable (settings reset, app still works).

**Depends on:** Milestone 10. Decision 2 above must be approved first.

## Milestone 12: Labs in the browser

**Goal:** Learners can work through each lab from the browser.

**Deliverables** (scope depends on decision 1)
- *Recommended:* a guided lab page for each domain: numbered steps, the expected output for each check, and a "mark step done" control. No code runs in the browser and no key is needed.
- Alternative, only if approved: in-browser code execution for the lab starters. This needs a sandbox, a PLAN.md change, and a key-handling design.

**Acceptance criteria**
- Each of the five labs has every step listed, and the steps match its README.
- Step progress is saved with the lab completion flag.
- No API key is requested or stored by the recommended option.

**Depends on:** decision 1 above.

## Suggested order

9 → 10 → 11 → 12. Milestone 12 is independent and can move earlier if decision 1 is settled.

## Status of each milestone

| # | Milestone | Status |
| --- | --- | --- |
| 9 | Drill pause and resume, and hints | Done (see CHANGELOG); no hint content yet |
| 10 | Question bank with publish dates | Planned, approved |
| 11 | Scheduled refresh and configuration screen | Planned, approved; decision 2 accepted |
| 12 | Labs in the browser | Planned, approved; decision 1 accepted |
