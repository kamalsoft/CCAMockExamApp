# Changelog

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
