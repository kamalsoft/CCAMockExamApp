# Lab: Configure Claude Code for a team

## Step 1: Create the project CLAUDE.md

Create `project/CLAUDE.md` that:

1. Imports shared testing standards with `@docs/standards/testing.md` (outside code blocks)
2. Has a `.gitignore` that excludes `CLAUDE.local.md`

**Expected:** Import statement found, gitignore entry present.

- [ ] Step 1 complete

## Step 2: Add path-scoped Terraform rules

Create `.claude/rules/terraform.claude.md` that:

1. Contains conventions for Terraform files
2. Loads for every `.tf` file in `infra/` and `services/*/deploy/`
3. Does NOT load for other file types

**Expected:** Rule matches `.tf` files, excludes other files.

- [ ] Step 2 complete

## Step 3: Configure slash commands

Create two skills in `.claude/skills/`:

1. `release` - runs only when typing `/release`
2. `dep-audit` - runs in a forked subagent (long output stays out of conversation)

**Expected:** Skills load, `/release` works, `/dep-audit` spawns subagent.

- [ ] Step 3 complete

## Step 4: Build CI review script

Create `ci/review.sh` that:

1. Runs Claude Code non-interactively
2. Returns schema-checked JSON findings
3. Pre-approves only the commands it needs

**Expected:** Script runs, outputs valid JSON, no denied commands.

- [ ] Step 4 complete

## Check your work

```sh
cd labs/d3-team-config
npm run check
```

## Expected output (complete)

```text
▶ Instructions
  ✔ CLAUDE.md imports testing standards
  ✔ gitignore excludes local notes
▶ Path-scoped rule
  ✔ Terraform rules load for .tf files
  ✔ Terraform rules don't load for other files
▶ Skills
  ✔ /release command works
  ✔ /dep-audit spawns subagent
▶ CI script
  ✔ review.sh outputs valid JSON
ℹ tests 12
ℹ pass 12
ℹ fail 0
```