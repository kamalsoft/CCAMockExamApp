# CCA Mock App: Blueprint and Question Guide

Nov 7, 2026

## 1. Exam blueprint template

Copy this into `content/blueprint.md` and fill it from Anthropic's current exam guide. Do not guess any value. Leave a `TODO` where the official source is unavailable.

| Field | Value | Source | Date checked |
| --- | --- | --- | --- |
| Exam name | Claude Certified Architect – Foundations | Anthropic Partner Academy FAQ: https://anthropic-partners.skilljar.com/page/faq-certifications | 2026-11-07 |
| Exam code | CCAR-F | Exam guide v1.0, §3 | 2026-11-07 |
| Question count | 60 items; 4 scenarios drawn from a bank of 6 | Exam guide v1.0, §3 and §5 | 2026-11-07 |
| Time limit (minutes) | 120 | Exam guide v1.0, §3 | 2026-11-07 |
| Passing score | 720 on a 100–1,000 scaled score; pass/fail on the total score only, per-domain percentages are informational | Exam guide v1.0, §3 and §10 | 2026-11-07 |
| Question types | Multiple choice and multiple response; each item states how many responses to select | Exam guide v1.0, §3 | 2026-11-07 |
| Allowed resources during exam | Proctored; no notes, books, phones, or study materials. Permitted items, if any, are set by Pearson VUE | Exam guide v1.0, §13 | 2026-11-07 |
| Eligibility | Employees of Claude Partner Network organizations only; not open to the public | Anthropic Partner Academy FAQ: https://anthropic-partners.skilljar.com/page/faq-certifications | 2026-11-07 |
| Fee | $125 USD; checkout reflects any partner-tier discount | Exam guide v1.0, §3 and §11 | 2026-11-07 |
| Delivery | Pearson VUE, online proctored or at a test center | Exam guide v1.0, §3 and §11 | 2026-11-07 |
| Validity | 12 months; free non-proctored renewal assessment if renewed on time | Exam guide v1.0, §15 | 2026-11-07 |

**Domains and weights**

| Domain ID | Domain name | Weight (%) | Official description | Source URL | Date checked |
| --- | --- | --- | --- | --- | --- |
| d1 | Agentic Architecture & Orchestration | 27 | Task statements 1.1–1.7: agentic loops, coordinator-subagent orchestration, subagent invocation and context passing, workflow enforcement and handoff, Agent SDK hooks, task decomposition, session state and forking. | Exam guide v1.0, §4 and §6 | 2026-11-07 |
| d2 | Tool Design & MCP Integration | 18 | Task statements 2.1–2.5: tool interfaces and descriptions, structured MCP error responses, tool distribution and tool_choice, MCP server integration, built-in tools. | Exam guide v1.0, §4 and §6 | 2026-11-07 |
| d3 | Claude Code Configuration & Workflows | 20 | Task statements 3.1–3.6: CLAUDE.md hierarchy, slash commands and skills, path-specific rules, plan mode vs direct execution, iterative refinement, CI/CD integration. | Exam guide v1.0, §4 and §6 | 2026-11-07 |
| d4 | Prompt Engineering & Structured Output | 20 | Task statements 4.1–4.6: explicit criteria, few-shot prompting, structured output via tool use and JSON schemas, validation and retry loops, batch processing, multi-pass review. | Exam guide v1.0, §4 and §6 | 2026-11-07 |
| d5 | Context Management & Reliability | 15 | Task statements 5.1–5.6: long-conversation context, escalation and ambiguity, multi-agent error propagation, large-codebase context, human review and confidence calibration, provenance in multi-source synthesis. | Exam guide v1.0, §4 and §6 | 2026-11-07 |

The full task-statement titles are in `content/domains.json`. The guide's §6 also lists the knowledge and skills under each task statement; use those when writing questions.

**Sources and open items.** Source: Anthropic, *Claude Certified Architect – Foundations Exam Guide*, version 1.0, effective July 2026, linked from https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification (PDF: https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf). Checked 2026-11-07. The guide says it is subject to change without notice. Domain IDs follow the guide's numbering, which differs from the earlier third-party order (Tool Design is Domain 2, Prompt Engineering is Domain 4). The guide's §17 appendix lists out-of-scope topics; questions must not test them. Its sample questions (§9) are Anthropic's material and must not be copied or paraphrased into the bank.

**Where current docs differ from the guide** (checked 2026-11-07 against https://code.claude.com/docs/en/agent-sdk/subagents and https://code.claude.com/docs/en/agent-sdk/agent-loop). Questions must not depend on these points until the guide is updated:

- The guide calls the subagent tool `Task`. Current docs call it `Agent` (renamed in Claude Code v2.1.63; `Task` still appears in the `system:init` tools list).
- The guide says `allowedTools` must include `Task` for a coordinator to spawn subagents. Current docs say `allowedTools` only auto-approves listed tools; unlisted tools stay available through the permission flow.
- Current docs let subagents spawn their own subagents (default depth 3), and run subagents in the background by default.
- Forced `tool_choice` (`any` or a named `tool`) returns a 400 on Claude Opus 5.5, Claude Sonnet 5.5, Claude Fable 5.1, and Claude Mythos 5.1. Other models, such as Claude Opus 5, accept it. Questions about forced tool use must name a model that supports it, or test the replacement (`auto` plus `strict: true`). Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools (checked 2026-11-07).
- The guide recommends splitting generic tools into purpose-specific ones. Current docs recommend consolidating related operations into fewer tools with an `action` parameter. Both hold: split a tool that hides different input and output contracts; consolidate near-duplicate operations. Questions must make clear which situation applies.
- On macOS, Linux, and WSL, current Claude Code leaves `Glob` and `Grep` out of the default tool set and searches with `find` and `grep` through Bash. The guide treats them as always present. Questions test content search vs file-name search rather than the tool names. Source: https://code.claude.com/docs/en/tools-reference (checked 2026-11-07).
- The guide describes skill `allowed-tools` as restricting tool access. Current docs say it lists tools Claude may use without asking during the turn that invokes the skill: it grants, it doesn't restrict. Restricting needs a forked subagent with a limited tool list, or deny rules. d3-011 tests the current behavior. Source: https://code.claude.com/docs/en/skills (checked 2026-11-07).
- The guide treats `CLAUDE.md` as the way to give CI-invoked Claude Code its project context. Current docs recommend `--bare` for scripted runs (and plan to make it the default for `-p`), and `--bare` skips `CLAUDE.md`. Context then has to be passed explicitly, for example with `--append-system-prompt-file`. d3-029 tests this. Source: https://code.claude.com/docs/en/headless (checked 2026-11-07).
- Custom commands have been merged into skills. `.claude/commands/` files still work and create the same `/name` commands. Source: https://code.claude.com/docs/en/skills (checked 2026-11-07).
- The guide suggests 2–4 few-shot examples. Current docs suggest 3–5. No question depends on the exact count. Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (checked 2026-11-07).
- The guide says the batch API doesn't support multi-turn tool calling within a request. Current docs list multi-turn conversations and tool use (including server tools) as batchable; what doesn't work is executing your own client tools mid-request. d4-026 is written to hold under both. Batches also reject `stream`, fast mode, and `fallbacks`. Source: https://platform.claude.com/docs/en/build-with-claude/batch-processing (checked 2026-11-07).
- Structured outputs reject numeric and string-length schema constraints (such as `minimum`) with a 400 error, and don't guarantee enum capitalization. d4-012 relies on the first point. Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs (checked 2026-11-07).

Rules for this file:

- Weights must sum to 100. The validator fails the build otherwise.
- Each domain ID must match a `domain` value in `domains.json`.
- Re-check the blueprint against the official guide before each content release.

## 2. Question-writing guide

Every question must test a decision, not a fact recall. Ask: what would a practitioner have to choose here, and why?

**Scenario**

- Write 3 to 6 sentences describing a realistic system: its purpose, the Claude features in use, and the constraint that makes the choice matter.
- Include only details the answer depends on. Remove decoration.
- State one clear goal in the final sentence, such as "What should the team change first?"

**Options**

- Use 4 options for single-answer questions. Use 5 only when the content requires it.
- Each distractor must be a plausible mistake that a practitioner could make. Do not use jokes or obviously wrong options.
- Keep option length similar. The correct answer must not be the longest or most detailed option.
- Avoid "all of the above," "none of the above," and absolute words like "always" or "never" unless they are accurate.
- Each option should be independent. Do not write options that only make sense relative to another option.

**Explanations**

- Open the correct explanation with the reason it is right, in one or two sentences.
- For each distractor, state the specific failure: what goes wrong, and under which condition.
- Name the concept being tested in the `concepts` field.
- Cite the source URL in the source register if the answer depends on a documented behavior.

**Difficulty**

- Easy: one concept, the scenario names the relevant feature directly.
- Medium: two concepts combined, the learner must identify which one applies.
- Hard: a tradeoff with two defensible options, where the difference lies in one constraint.

**Forbidden**

- Quoting or paraphrasing confidential exam material or third-party question banks.
- Invented feature names, flags, or API parameters. Verify every name against current docs.
- Answers that depend on information outside the scenario.

## 3. Question template and review checklist

Save each question as one JSON object in the `questions` array of `content/bank/questions.json`. Set `published_at` to the date the question is first published, which is its review date. Use this template:

```json
{
  "id": "d1-001",
  "domain": "d1",
  "difficulty": "medium",
  "type": "single",
  "scenario": "TODO: 3 to 6 sentences",
  "question": "TODO: one clear question",
  "options": [
    { "key": "A", "text": "TODO" },
    { "key": "B", "text": "TODO" },
    { "key": "C", "text": "TODO" },
    { "key": "D", "text": "TODO" }
  ],
  "answer": ["B"],
  "explanation": {
    "correct": "TODO",
    "distractors": { "A": "TODO", "C": "TODO", "D": "TODO" }
  },
  "concepts": ["TODO"],
  "source": "original",
  "sources": ["TODO: URL and date checked"],
  "review_status": "draft",
  "reviewed_by": null,
  "reviewed_at": null,
  "published_at": null
}
```

**Reviewer checklist** (a question moves to `reviewed` only when every box is ticked)

- [ ] The scenario contains only details the answer needs.
- [ ] Exactly one option is correct, or the number of correct options matches `type`.
- [ ] Every distractor is a plausible mistake, and each has a specific explanation.
- [ ] Option lengths are similar, and the answer is not the longest option.
- [ ] Every feature, parameter, and API name appears in current Anthropic docs.
- [ ] Every factual claim has a source URL and a date checked.
- [ ] The question is original and does not reproduce third-party material.
- [ ] The difficulty label matches the rubric in the question-writing guide.
- [ ] `reviewed_by` and `reviewed_at` are filled in.

The validator rejects any question missing an explanation for a wrong option.