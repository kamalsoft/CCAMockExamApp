# Changelog

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
