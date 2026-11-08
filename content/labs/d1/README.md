# Lab: Build an agent loop with a prerequisite gate

## Step 1: Set up the agent loop

Implement `runAgent` that:

1. Starts with a user message containing the prompt
2. Sends to Claude and appends the response's content as the assistant message
3. Branches on `stop_reason`:
   - `"tool_use"`: run every `tool_use` block, append ONE user message with all `tool_result` blocks
   - `"end_turn"` or `"stop_sequence"`: return status "done"
   - `"max_tokens"` or `"model_context_window_exceeded"`: return "truncated", don't run tools
   - `"refusal"`: return "refusal"
   - `"pause_turn"`: send again without adding anything
4. After `maxTurns` calls without finishing, return "turn_limit"

**Expected test output after Step 1:**
```text
▶ Part 1: runAgent
  ✖ does not start with a user message
  ✖ does not append response as assistant message
  ... (other failures)
```

- [ ] Step 1 complete

## Step 2: Implement prerequisite gate

Implement `requirePrerequisite` that:

- Blocks a tool until its prerequisite has succeeded for the same input key
- Throws an error starting with "Blocked:" when blocked
- Passes through all other calls unchanged

**Expected test output after Step 2 (all 11 tests pass):**
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

- [ ] Step 2 complete

## Prerequisites

- Node.js 22.18 or later. Run the lab locally.
- The repository cloned locally. The lab runs on your machine, never in the browser.
- For the optional live demo: a Claude API key in your environment (`ANTHROPIC_API_KEY`). No key is stored in the repo.

## Check your work

```sh
cd labs/d1-agent-loop
npm run check
```

No install needed. Run `npm install` for the live demo.

## Expected output (when complete)

```text
▶ Part 1: runAgent
  ✔ returns the final text when Claude ends its turn
  ✔ runs every requested tool and returns all results in one user message
  ✔ runs every requested tool and returns all results in one user message
  ...
ℹ tests 11
ℹ pass 11
ℹ fail 0
```

## Optional: run against Claude

For a paid demo, `npm run demo` runs your code against `claude-opus-5-5` with server-side fallbacks.