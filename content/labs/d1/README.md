# Lab: Build an agent loop with a prerequisite gate

## Goal

Write the two pieces at the heart of most production agents:

1. **An agent loop** that branches on `stop_reason`, runs every requested tool, returns all results in one user message, reports failing tools as errors, and stops correctly on `end_turn`, `max_tokens`, `refusal`, and a turn limit.
2. **A prerequisite gate** that blocks a risky tool (`approve_expense`) until another tool (`verify_receipt`) has succeeded for the same expense. This turns a business rule into a guarantee instead of a prompt instruction.

This lab covers task statements 1.1, 1.4, and 1.5 in the [Domain 1 walkthrough](#walkthrough-d1).

## Prerequisites

- Node.js 22.18 or later. The lab runs TypeScript directly, with no build step.
- The repository cloned locally. The learner code runs on your machine, never in the browser.
- For the optional live demo only: a Claude API key in your own environment (`ANTHROPIC_API_KEY`) or an `ant auth login` profile. No key is stored in the repository.

## Starter files

All files are in `labs/d1-agent-loop/`:

| File | Purpose |
| --- | --- |
| `src/agent.ts` | **Your work.** `runAgent` and `requirePrerequisite`, with step-by-step instructions in the comments. |
| `tests/agent.test.ts` | The checker. It uses a scripted fake model, so it needs no API key and costs nothing. |
| `demo.ts` | Optional. Runs your code against the real Claude API on two sample expenses. |
| `solution/agent.ts` | A reference solution. Try the lab first. |

## Check your work

```sh
cd labs/d1-agent-loop
npm run check
```

No install is needed for the check. Run `npm install` if you want editor type hints or the live demo.

## Expected output

On the untouched starter, all 11 tests fail and the command exits with code 1:

```text
ℹ tests 11
ℹ pass 0
ℹ fail 11
```

When your implementation is complete, every test passes and the command exits with code 0:

```text
▶ Part 1: runAgent
  ✔ returns the final text when Claude ends its turn
  ✔ runs every requested tool and returns all results in one user message
  ...
▶ Part 2: requirePrerequisite
  ✔ blocks the guarded tool until its prerequisite succeeds for the same id
  ...
ℹ tests 11
ℹ pass 11
ℹ fail 0
```

Each failing test's name says which behavior is missing, such as "does not run tools from a truncated response".

## Optional: run it against Claude

```sh
cd labs/d1-agent-loop
npm install
npm run demo
```

The demo asks Claude to approve two expenses. E1's receipt is valid. E2's receipt is unreadable, so `verify_receipt` fails and your gate must keep `approve_expense` blocked for E2. The demo uses `claude-opus-5-5`, and each run makes a few paid API calls. The request turns on server-side fallbacks (`fallbacks: "default"`), so if Claude declines, the API retries on a fallback model.
