import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

// LAB_SOLUTION=1 checks the reference solution instead of your project.
const lab = dirname(dirname(fileURLToPath(import.meta.url)))
const root = join(lab, process.env.LAB_SOLUTION ? 'solution/project' : 'project')
const path = (p: string) => join(root, p)
const read = (p: string) => {
  assert.ok(existsSync(path(p)), `missing ${p}`)
  return readFileSync(path(p), 'utf8')
}

// The YAML between the leading --- markers, as raw text.
function frontmatter(file: string): string {
  const match = read(file).match(/^---\n([\s\S]*?)\n---/)
  assert.ok(match, `${file} has no YAML frontmatter between --- markers at the top`)
  return match[1]
}
const field = (yaml: string, key: string) => yaml.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim()

// Reads `paths` as Claude Code would, but only accepts quoted patterns: an unquoted * breaks YAML parsing.
function pathsOf(yaml: string): string[] {
  const inline = field(yaml, 'paths')
  if (inline) {
    try {
      return JSON.parse(inline)
    } catch {
      assert.fail(`paths must be a list of quoted patterns, like paths: ["**/*.tf"]. Got: ${inline}`)
    }
  }
  const block = yaml.match(/^paths:\s*\n((?:\s+-.*\n?)+)/m)?.[1] ?? ''
  return block.split('\n').filter(Boolean).map((line) => {
    const m = line.match(/^\s+-\s*"(.*)"\s*$/)
    assert.ok(m, `quote each pattern in the paths list. Got: ${line.trim()}`)
    return m[1]
  })
}

function globToRegExp(glob: string): RegExp {
  let re = ''
  let i = 0
  while (i < glob.length) {
    if (glob.startsWith('**/', i)) {
      re += '(?:.*/)?' // any number of directories, including none
      i += 3
    } else if (glob.startsWith('**', i)) {
      re += '.*'
      i += 2
    } else {
      const c = glob[i]
      if (c === '*') re += '[^/]*'
      else if (c === '?') re += '[^/]'
      else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
      i += 1
    }
  }
  return new RegExp(`^${re}$`)
}
const matchesAny = (patterns: string[], file: string) => patterns.some((p) => globToRegExp(p).test(file))

describe('Instructions', () => {
  test('CLAUDE.md imports the testing standards with an @ path that resolves', () => {
    const text = read('CLAUDE.md').replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
    const imports = [...text.matchAll(/(?:^|\s)@([^\s]+)/g)].map((m) => m[1])
    const standards = imports.find((i) => i.endsWith('docs/standards/testing.md'))
    assert.ok(standards, 'import docs/standards/testing.md with @path syntax, outside backticks and code blocks')
    assert.ok(existsSync(join(root, standards)), `@${standards} does not resolve relative to CLAUDE.md`)
  })

  test('.gitignore keeps CLAUDE.local.md out of the repository', () => {
    const lines = read('.gitignore').split('\n').map((l) => l.trim())
    assert.ok(lines.includes('CLAUDE.local.md') || lines.includes('/CLAUDE.local.md'), 'add CLAUDE.local.md to .gitignore')
  })
})

describe('Path-scoped rule', () => {
  test('a rule in .claude/rules/ loads for every Terraform file and nothing else', () => {
    const dir = path('.claude/rules')
    assert.ok(existsSync(dir), 'missing .claude/rules/')
    const rules = readdirSync(dir).filter((f) => f.endsWith('.md'))
    const terraform = rules.find((f) => /^paths:/m.test(frontmatter(`.claude/rules/${f}`)))
    assert.ok(terraform, 'add a rule file with paths frontmatter')
    const patterns = pathsOf(frontmatter(`.claude/rules/${terraform}`))
    for (const file of ['infra/main.tf', 'services/billing/deploy/main.tf']) {
      assert.ok(matchesAny(patterns, file), `${JSON.stringify(patterns)} should match ${file}`)
    }
    assert.ok(!matchesAny(patterns, 'src/index.ts'), `${JSON.stringify(patterns)} should not match src/index.ts`)
  })
})

describe('Skills', () => {
  test('release runs only when a developer invokes it', () => {
    const yaml = frontmatter('.claude/skills/release/SKILL.md')
    assert.ok(field(yaml, 'description'), 'give the skill a description')
    assert.equal(field(yaml, 'disable-model-invocation'), 'true', 'stop Claude from invoking it on its own')
  })

  test('dep-audit runs in a forked subagent so its output stays out of the conversation', () => {
    const yaml = frontmatter('.claude/skills/dep-audit/SKILL.md')
    assert.ok(field(yaml, 'description'), 'give the skill a description')
    assert.equal(field(yaml, 'context'), 'fork')
  })
})

describe('CI review script', () => {
  test('ci/review.sh runs non-interactively with schema-checked JSON and scoped permissions', () => {
    const script = read('ci/review.sh')
    assert.match(script, /\bclaude\b[\s\S]*(\s-p\b|--print\b)/, 'run claude with -p')
    assert.match(script, /--output-format[ =]json\b/, 'ask for --output-format json')
    assert.match(script, /--json-schema\b/, 'constrain the findings with --json-schema')
    assert.match(script, /structured_output/, 'read the findings from structured_output')
    assert.match(script, /--allowedTools[ =]["'][^"']*Bash\(npm test \*\)/, 'pre-approve only the test command, e.g. "Bash(npm test *)"')
    assert.doesNotMatch(script, /bypassPermissions|--dangerously-skip-permissions/, 'do not bypass permissions in CI')
  })
})
