CCA Mock Exam App: Build Plan
Nov 7, 2026
1. Goal
A web app that prepares learners for the Claude Certified Architect – Foundations (CCA-F) exam. It offers original practice questions, timed mock exams, explanations for every option, domain walkthroughs, and hands-on labs. All questions are original and follow the official exam guide's domains and weights. The app does not reproduce confidential exam content.
2. Scope
In scope (v1):
• Question bank with metadata, reviewed and tagged by domain
• Domain drill mode and timed full mock exam mode
• Explanations for the correct answer and every distractor
• Prep walkthrough pages, one per domain
• Hands-on lab page for each domain, with a runnable starter and an automated checker
• Local progress tracking and readiness indicator
Out of scope (v1):
• User accounts and cloud sync (use local storage first)
• Live model generation of questions at runtime
• Payments, certificates, or proctoring
• Mobile app
3. Tech stack
• Frontend: React, Vite, TypeScript, Tailwind CSS
• Content: JSON files in /content, validated with Zod at build time
• Progress storage: Browser localStorage, behind a small repository interface so it can later move to a backend
• Labs: Python or TypeScript starter projects in /labs, each with a check script that runs tests and prints a pass/fail summary. Learners run labs locally.
• Testing: Vitest for logic, Playwright for end-to-end flows
• Lint and format: ESLint, Prettier, and tsc --noEmit as a required check
4. Repository layout
/content
  domains.json              # domain names, weights, descriptions (from official guide)
  questions/<domain>.json
  walkthroughs/<domain>.md
  labs/<domain>/README.md
/labs
  <domain>-<lab>/           # starter code, tests, check script
/src
  components/
  pages/                    # Home, Drill, Exam, Results, Walkthrough, Lab, Progress
  lib/
    schema.ts               # Zod schemas for questions and domains
    exam.ts                 # mock exam assembly and timing
    scoring.ts              # scoring and readiness logic
    storage.ts              # progress repository
  content/                  # generated index of content (build step)
/scripts
  validate-content.ts
  build-index.ts
/tests
PLAN.md
CLAUDE.md                   # standing instructions for Claude Code
5. Data model
Entity
Fields
Domain
id, name, weight (percent from the official guide), description, walkthroughId, labId
Question
id (<domain>-<nnn>), domain, difficulty (easy, medium, hard), type (single or multi), scenario (optional), question, options (4 to 5, each with a key), answer (array of keys), explanation (correct text plus distractors mapping each wrong key to why it is wrong), concepts, source (original), review_status (draft or reviewed), reviewed_by, reviewed_at
Attempt
id, mode (drill or exam), started_at, finished_at, question_ids, responses, score_by_domain
Progress
Attempts list, per-concept accuracy, lab completion flags, last-seen timestamps
6. Content rules
The script validate-content.ts enforces these rules:
• Every question validates against the schema.
• Every question has an explanation for the correct answer and for every wrong option.
• Only questions with review_status: "reviewed" appear in the app. Drafts are excluded from builds.
• Question IDs are unique.
• Domain counts in a mock exam match the weights in domains.json, within rounding.
• No question quotes or closely paraphrases confidential material or content copied from other exam-prep providers.
• Every factual claim that depends on Anthropic documentation has a source note with the URL and the date checked.
• Claims about APIs, SDK behavior, and features are checked against current official docs before a question is marked reviewed.
7. Feature specifications
Mock exam mode
• Assemble a set that matches the official question count and domain weights.
• Show a visible countdown using the official time limit. Auto-submit at zero.
• Allow flagging and navigating between questions. Show no explanations until submission.
• After submission, show the score, score by domain, and per-question review.
Drill mode
• Choose one or more domains and a difficulty level.
• Show the explanation right after each answer, or at the end, based on a setting.
Explanations
• Show the correct reasoning first, then a short note on each distractor.
• Link each question's concepts to the relevant walkthrough section.
Walkthroughs
• One Markdown page per domain: core concepts, decision rules, common mistakes, and a checklist of what to do without notes.
• Each walkthrough ends with links to its drill and lab.
Labs
• Each lab has a goal, prerequisites, starter files, a check command, and an expected-output description.
• The app shows the lab README and the command to run. It does not run learner code in the browser.
• Labs call the Claude API with a key the learner supplies in their own environment. No key lives in the repo.
Progress and readiness
• Track scores by domain over time.
• Readiness requires at least three full mock exams, a passing score on each, and no domain below its target. Show which condition is unmet.
• Label readiness as an estimate, not a guarantee.
8. Milestones
1. Foundations: Repo setup, schemas, validate-content.ts, and CI running lint, typecheck, and tests.
2. Content pilot: Blueprint from the official guide. Write 30 reviewed questions for one domain with full explanations.
3. Drill mode: Domain selection, answer flow, explanation display, and results.
4. Mock exam mode: Assembly by weight, timer, navigation, auto-submit, and results screen.
5. Walkthrough and lab for the pilot domain: One complete end-to-end example.
6. Replicate across domains: Repeat the content work for the remaining domains.
7. Progress and readiness.
8. Polish and calibration: Accessibility pass, mobile layout, and difficulty review against the official practice materials.
Each milestone ends with a working build and a short changelog entry.
9. Acceptance criteria
• npm run validate passes with zero errors.
• npm test and npm run e2e pass.
• A full mock exam can be taken start to finish, timed, and scored.
• Every question shown has explanations for all options.
• Every lab's check script runs and returns a clear result on a fresh clone.
• No draft content is reachable in the production build.
10. Risks and mitigations
• Incorrect content: Human review gate plus the validation script. Source notes for factual claims.
• Outdated API details: Re-check claims against current docs before each content release, and record the date checked.
• Overreliance on the app: Labs and walkthroughs are required for readiness, not optional.
• Scope creep: Keep v1 to the milestones above. New features go in a backlog file, not into the current milestone.
11. Standing instructions for Claude Code (CLAUDE.md)
• Read PLAN.md before any task, and check the current milestone.
• Make one milestone's changes per branch, with tests passing before each commit.
• Never add a question to content/ without an explanation for every option and an explicit review_status.
• Never invent exam details. If a domain weight or rule is unknown, leave a TODO and flag it in the summary.
• Keep the question bank original. Do not import or paraphrase third-party question sets.
• Run npm run validate after every content change.
• Keep API keys out of the repo. Use environment variables.
12. First session prompt for Claude Code
Read PLAN.md and CLAUDE.md. Start Milestone 1: set up the project with Vite, React, TypeScript, Tailwind, Vitest, and Playwright. Implement the Zod schemas in src/lib/schema.ts for domains and questions, and write scripts/validate-content.ts. Add a sample domains.json with placeholder weights marked TODO. Do not write any questions yet. Report what you built and any open decisions.
The first real content task is the blueprint: domain names and weights copied into domains.json from the official exam guide.