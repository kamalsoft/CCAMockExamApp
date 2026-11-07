# Development Principles & Guidelines

This document outlines the core principles and operational framework for all engineering tasks. Adherence to these principles ensures high code quality, predictable execution, and minimal tech debt.

---

## Core Principles

### 1. Think Before Coding
> *Never write code without a fully realized plan and clear context.*

#### Guidelines
* **Analyze Context First:** Read all relevant code, configuration, and documentation before formulating a solution. Map out dependencies and entry points.
* **Identify Edge Cases:** Brainstorm edge cases, failure modes, error paths, and state transitions early.
* **Architect the Solution:** Draft a mental or written blueprint of the changes. Understand *why* the bug exists or *why* the new feature requires a specific approach.
* **Validate Assumptions:** Explicitly list and verify all assumptions regarding existing contracts, third-party library behavior, and environment constraints.

---

### 2. Simplicity First
> *Choose the simplest viable solution. Avoid over-engineering and premature optimization.*

#### Guidelines
* **YAGNI (You Aren't Gonna Need It):** Implement only what is necessary to satisfy current requirements. Do not add speculative abstraction layers, unused configurations, or unrequested features.
* **Readable Over Clever:** Write clear, self-documenting code. Favor standard language constructs and idioms over obscure, highly condensed single-liners.
* **Minimize Dependencies:** Do not introduce third-party libraries or external modules for functionality that can be cleanly implemented natively in a few lines.
* **Flat Over Nested:** Keep logic flows shallow, modular, and easy to trace. Avoid deep nesting and complex conditional branching.

---

### 3. Surgical Changes
> *Make precise, targeted edits. Leave surrounding unrelated code untouched.*

#### Guidelines
* **Minimal Blast Radius:** Limit scope strictly to what is required to achieve the goal. Do not refactor unrelated files, clean up arbitrary formatting, or reorder code during a functional change.
* **Respect Existing Conventions:** Match local variable naming, formatting, error-handling patterns, and architecture style.
* **Atomic Edits:** Each logical change should stand on its own. Prefer small, discrete edits that are easily reviewable and reversible.
* **Preserve History:** Avoid mass line deletions or full-file rewrites unless explicitly mandated, as this obscures `git blame` and context history.

---

### 4. Goal-Driven Execution
> *Maintain laser focus on the acceptance criteria and verify outcomes rigorously.*

#### Guidelines
* **Define "Done" Upfront:** Clearly identify the explicit acceptance criteria before starting work.
* **Traceable Implementation:** Ensure every change directly maps back to a requirement or bug fix step.
* **Rigorously Test & Verify:** Validate changes through tests or manual verification steps. Confirm both the happy path and edge/failure cases work as expected.
* **No Scope Creep:** Keep task boundaries intact. If peripheral bugs or improvement opportunities are discovered, log them separately rather than expanding current scope.

---
## General Guidance    
* **Stack and commands:** Vite, React 19, TypeScript, Tailwind CSS, Zod, Vitest, and Playwright, with the repository’s npm run lint, npm run typecheck, npm test, npm run e2e, and npm run validate scripts.

* **Architecture:** A static client-side app with no server. Content is JSON in /content, validated with Zod at build time; progress lives in browser localStorage behind a small repository interface.
* **Security and privacy:** Keep API keys out of the repo and the app bundle; labs read the learner's key from their own environment variables. Do not send learner data anywhere.

* **Testing and changes:** Follow existing patterns, add behavior-focused tests for changed behavior, and run the narrowest relevant check.

* **Plan:** Read PLAN.md before any task and work only within the current milestone. Check the installed library docs before using unfamiliar APIs.
---
## Standard Workflow Matrix

| Step | Phase | Action |
| :--- | :--- | :--- |
| 1 | **Context Gathering** | Search codebase, map flow, and clarify all inputs/outputs. |
| 2 | **Design & Plan** | Outline minimal changes required; verify against edge cases. |
| 3 | **Surgical Edit** | Apply minimal code adjustments following surrounding conventions. |
| 4 | **Verification** | Test happy path and edge cases; verify acceptance criteria are satisfied. |
| 5 | **General Guidance** | Ensure the project rules are followed |