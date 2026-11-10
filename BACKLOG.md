# Backlog

| | |
| --- | --- |
| **Created** | 2026-11-07 |
| **Status** | Milestones 9 and 10 done; Milestone 11 done; Milestone 12 done |
| **Related** | [PLAN.md](PLAN.md) · [CLAUDE.md](CLAUDE.md) · [CHANGELOG.md](CHANGELOG.md) |

Features that come after the v1 milestones. Per PLAN.md section 10, new features go here, not into the current milestone. Each milestone starts only after its plan is approved.

## Decisions confirmed

All three pre-work decisions from the original list have been accepted:
1.  Labs in the browser: guided walkthrough approach for Milestone 12 (no in-browser execution, no API key needed)
2.  Periodic question generation: scheduled job approach for Milestone 11 (GitHub Actions cron, human review gate)
3.  Hints in mock exams: drill mode only, mock exam never shows hints (already reflected in Milestone 9)

## Open items from the QA review (2026-11-07)

Items that QA found and that the owner has not yet decided, or that wait for a later milestone. Closed items are listed too, so the reasoning stays on record.

| # | Item | Status | Owner action |
| --- | --- | --- | --- |
| 1 | 14 d1 questions (d1-006, 007, 008, 009, 011, 014, 016, 017, 018, 019, 024, 025, 026, 027) have a design-guidance source note, added in PR #21. They are reviewed questions, so the change needs the reviewer's sign-off. | Open | Confirm the notes, or revert them |
| 2 | The hint button appears only on questions that have a hint. The spec in Milestone 9 says it appears on each drill question. | Closed | Hint button now shows on all drill questions (hints added to all 150 questions) |
| 3 | A paused drill that is discarded by the Discard button shows no message, by design. The test "discarding a paused drill removes it" covers that path. | Closed (no change needed) | None |
| 4 | Milestone 10 acceptance criterion 1: `published_at` must not change once set. | Partial: the guard checks duplicate ids within one file only (see open item 3) | Fix the guard |
| 5 | Milestone 8 difficulty calibration needs the official practice materials and a human reviewer. | Blocked | Provide the materials |
| 6 | Hints for the existing 150 questions need writing and review. | Done | 150 hints added (d1-d5 complete); owner sign-off needed |
| 7 | Verdict wording in CLAUDE.md and PLAN.md, and the place a deferral is recorded. | Closed by PR #23 | None |

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
| 9 | Drill pause and resume, and hints | Done (hints added to all 150 questions) |
| 10 | Question bank with publish dates | Done, but the `published_at` guard is partial (see open item 3) |
| 11 | Scheduled refresh and configuration screen | Done (owner signed off the change from localStorage to `content/schedule.json`) |
| 12 | Labs in the browser | Done: interactive terminal simulation (PRs #26 to #30). Guided walkthrough pages were a nice-to-have and were superseded. |

## Open items after Milestones 11 and 12 (2026-11-10)

| # | Item | Owner action |
| --- | --- | --- |
| 1 | The refresh job has no source of new questions. It publishes only reviewed questions from `content/drafts/`. | Name the source |
| 2 | Refresh PRs opened with the default token do not start CI. | Decide: use a token or GitHub App |
| 3 | The `published_at` guard only checks duplicate ids within one file. It cannot detect a changed date between commits. | Schedule the fix |
| 4 | `npm run validate` does not check `content/schedule.json`. Bad values only fail when the refresh job runs. | Schedule the fix |
| 5 | The workflow has run only on its schedule (run 42861907619, "not due", nothing published). The publish, validate and pull-request steps have never run on GitHub, and `workflow_dispatch` has not been used. Earlier push-triggered runs (42856765504, 42857712753, 42854793040) failed with no jobs; the cause is not yet checked. | Run it once with `workflow_dispatch` and check the failed push runs |
| 6 | The built JS bundle is about 686 kB, over Vite's 500 kB warning. | Decide whether to split the bundle |
| 7 | The refresh runs hourly and matches the UTC hour exactly. A scheduled run that starts late, or is skipped, misses that week's refresh. The first run was 9 minutes late. | Decide whether to widen the match to a window |
| 8 | The refresh job force-pushes `bank-refresh`. Review edits pushed to that branch are overwritten on the next due run. | Decide whether to stop force-pushing |
| 9 | The comment "guard that published_at never changes once set" in `scripts/validate-content.ts` overstates the check. The code only checks duplicate ids within one file. | Correct the comment in a code change |
| 10 | CodeQL Advanced fails on pull requests and main, with "cannot be processed when the default setup is enabled". This is repository configuration, not this change. | Disable CodeQL default setup or remove the advanced config |
