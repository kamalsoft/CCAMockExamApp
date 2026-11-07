#!/usr/bin/env bash
# Reviews the pull request diff and prints findings as JSON for the CI script to post.
set -euo pipefail

SCHEMA='{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"file":{"type":"string"},"line":{"type":"integer"},"issue":{"type":"string"}},"required":["file","line","issue"]}}},"required":["findings"]}'

git diff origin/main...HEAD | claude -p "Review this diff for bugs and security issues." \
  --output-format json \
  --json-schema "$SCHEMA" \
  --allowedTools "Read,Bash(npm test *)" \
  | jq '.structured_output'
