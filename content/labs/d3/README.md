# Lab: Configure Claude Code for a team

## Goal

Set up Claude Code for a small billing service so that the whole team gets the same behavior:

1. **Instructions:** a project `CLAUDE.md` that imports the shared testing standards with `@`, and a `.gitignore` that keeps personal `CLAUDE.local.md` notes out of the repository.
2. **A path-scoped rule:** Terraform conventions in `.claude/rules/` that load for every `.tf` file (in `infra/` and in `services/*/deploy/`) and for nothing else.
3. **Two skills:** a `release` skill that only runs when a developer types `/release`, and a `dep-audit` skill that runs in a forked subagent so its long output stays out of the conversation.
4. **A CI review script:** `ci/review.sh` runs Claude Code non-interactively, returns schema-checked JSON findings, and pre-approves only the commands it needs.

This lab covers task statements 3.1, 3.2, 3.3, and 3.6 in the [Domain 3 walkthrough](#walkthrough-d3).

## Prerequisites

- Node.js 22.18 or later.
- The repository cloned locally. The checker reads your files; it needs no API key and doesn't run Claude Code.

## Starter files

All files are in `labs/d3-team-config/`:

| Path | Purpose |
| --- | --- |
| `project/` | **Your work.** A small billing service with standards in `docs/standards/`, Terraform in `infra/` and `services/billing/deploy/`, and an empty `ci/` folder. Add the configuration files here. |
| `tests/config.test.ts` | The checker. It parses your frontmatter and scripts the way the docs describe. |
| `solution/project/` | A reference configuration. Try the lab first. |

Files you'll create in `project/`:

- `CLAUDE.md`
- `.claude/rules/<name>.md`
- `.claude/skills/release/SKILL.md`
- `.claude/skills/dep-audit/SKILL.md`
- `ci/review.sh`

You'll also edit `project/.gitignore`.

## Check your work

```sh
cd labs/d3-team-config
npm run check
```

No install is needed.

## Expected output

On the untouched starter, all 6 checks fail with a message naming what's missing, and the command exits with code 1:

```text
ℹ tests 6
ℹ pass 0
ℹ fail 6
```

When your configuration is complete, every check passes and the command exits with code 0:

```text
▶ Instructions
  ✔ CLAUDE.md imports the testing standards with an @ path that resolves
  ✔ .gitignore keeps CLAUDE.local.md out of the repository
▶ Path-scoped rule
  ✔ a rule in .claude/rules/ loads for every Terraform file and nothing else
▶ Skills
  ✔ release runs only when a developer invokes it
  ✔ dep-audit runs in a forked subagent so its output stays out of the conversation
▶ CI review script
  ✔ ci/review.sh runs non-interactively with schema-checked JSON and scoped permissions
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

## Watch out for

- **Quote your globs.** `paths: [**/*.tf]` isn't valid YAML, because an unquoted `*` starts an alias. Claude Code then ignores the frontmatter and loads the rule everywhere. The checker rejects unquoted patterns for the same reason.
- **Don't bypass permissions in CI.** Pre-approve the exact commands with `--allowedTools`, such as `"Bash(npm test *)"`.
- **Optional live check:** open `project/` in Claude Code and run `/memory` to see the instruction files. The Terraform rule should load only when Claude opens a `.tf` file.
