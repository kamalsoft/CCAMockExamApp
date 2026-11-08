import { useCallback, useState } from 'react'
import type { LabPage } from '../lib/content-index.ts'
import type { Domain } from '../lib/schema.ts'
import { DocIndex } from './Walkthrough.tsx'

// Expected test outputs for each lab (simulated runs)
const labTestOutputs: Record<string, { failing: string[]; passing: string[] }> = {
  'd1': {
    failing: [
      'ℹ tests 11',
      'ℹ pass 0',
      'ℹ fail 11',
      '✖ does not start with a user message',
      '✖ does not append response as assistant message',
      '✖ does not branch on stop_reason correctly',
    ],
    passing: [
      '▶ Part 1: runAgent',
      '  ✔ returns the final text when Claude ends its turn',
      '  ✔ runs every requested tool and returns all results in one user message',
      '  ✔ handles stop_reason correctly',
      '▶ Part 2: requirePrerequisite',
      '  ✔ blocks the guarded tool until its prerequisite succeeds for the same id',
      '  ✔ throws Blocked: error when blocked',
      'ℹ tests 11',
      'ℹ pass 11',
      'ℹ fail 0',
    ],
  },
  'd2': {
    failing: ['ℹ tests 10', 'ℹ pass 0', 'ℹ fail 10'],
    passing: [
      '▶ Part 1: searchCustomers',
      '  ✔ handles missing query validation',
      '  ✔ returns JSON customers array',
      '  ✔ reports errors correctly',
      '▶ Part 2: callWithRetry',
      '  ✔ returns immediately on success',
      '  ✔ retries on transient errors',
      'ℹ tests 10',
      'ℹ pass 10',
      'ℹ fail 0',
    ],
  },
  'd3': {
    failing: ['ℹ tests 12', 'ℹ pass 0', 'ℹ fail 12'],
    passing: [
      '▶ Instructions',
      '  ✔ CLAUDE.md imports testing standards',
      '  ✔ gitignore excludes local notes',
      '▶ Path-scoped rule',
      '  ✔ Terraform rules load for .tf files',
      '  ✔ paths match correctly',
      '▶ Skills',
      '  ✔ /release command works',
      '  ✔ /dep-audit spawns subagent',
      '▶ CI script',
      '  ✔ review.sh outputs valid JSON',
      'ℹ tests 12',
      'ℹ pass 12',
      'ℹ fail 0',
    ],
  },
  'd4': {
    failing: ['ℹ tests 12', 'ℹ pass 0', 'ℹ fail 12'],
    passing: [
      '▶ Part 1: validateInvoice',
      '  ✔ rejects non-object input',
      '  ✔ reports missing required fields',
      '  ✔ validates field types correctly',
      '▶ Part 2: extractWithRetry',
      '  ✔ parses and validates JSON',
      '  ✔ retries on retryable errors',
      '▶ Part 3: pairBatchResults',
      '  ✔ matches by custom_id',
      '  ✔ returns ordered lists',
      'ℹ tests 12',
      'ℹ pass 12',
      'ℹ fail 0',
    ],
  },
  'd5': {
    failing: ['ℹ tests 10', 'ℹ pass 0', 'ℹ fail 10'],
    passing: [
      '▶ Part 1: synthesize',
      '  ✔ groups findings by claim',
      '  ✔ sets status based on value/date',
      '  ✔ returns gaps for failed sources',
      '▶ Part 2: routeForReview',
      '  ✔ routes contradictory evidence to human',
      '  ✔ routes low confidence fields to human',
      '▶ Part 3: stratifiedSample',
      '  ✔ samples from each stratum',
      '  ✔ never duplicates IDs',
      'ℹ tests 10',
      'ℹ pass 10',
      'ℹ fail 0',
    ],
  },
}

export function Lab({ labs, domains, domainId, completed, onCompletedChange }: {
  labs: LabPage[]
  domains: Domain[]
  domainId?: string
  completed: Record<string, boolean>
  onCompletedChange: (domainId: string, done: boolean) => void
}) {
  const lab = labs.find((l) => l.domainId === domainId)
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [outputStage, setOutputStage] = useState<'idle' | 'running' | 'passed'>('idle')

  const runCommand = useCallback(() => {
    if (!command.trim() || !lab) return

    const outputs = labTestOutputs[lab.domainId]
    const labId = lab.labId

    // Simulate terminal output based on command
    if (command === 'npm run check') {
      setOutput(['> npm run check\n'])
      setOutputStage('running')
      // Show failing tests first
      setTimeout(() => {
        setOutput(prev => [...prev, ...outputs.failing])
      }, 300)
      // Auto-advance to passing after 2 seconds to simulate test execution
      setTimeout(() => {
        setOutput(outputs.passing.map(line => '> ' + line))
        setOutputStage('passed')
      }, 2000)
    } else if (command === 'npm run start') {
      setOutput([
        '> npm run start',
        '',
        '▶ Starting the agent loop...',
        '',
        '✓ Agent started successfully',
        '',
        `Lab: ${labId} is ready. Run 'npm run check' to verify.`,
      ])
    } else if (command === 'cat solution/agent.ts') {
      setOutput([
        '> cat solution/agent.ts',
        '',
        '// Solution code for the agent loop lab',
        'export function runAgent(input: AgentInput): AgentResult {',
        '  // Implementation here',
        '}',
      ])
    } else if (command === 'ls -la') {
      setOutput([
        '> ls -la',
        '',
        'total 24',
        'drwxr-xr-x  3 user  staff   96 Nov  8 10:00 .',
        'drwxr-xr-x  5 user  staff  160 Nov  8 10:00 ..',
        'drwxr-xr-x  3 user  staff   96 Nov  8 10:00 src',
        '-rw-r--r-- 1 user  staff  512 Nov  8 10:00 package.json',
        'drwxr-xr-x 3 user  staff   96 Nov  8 10:00 solution',
      ])
    } else {
      setOutput([
        `> ${command}`,
        '',
        `sh: ${command}: command not found`,
      ])
    }
  }, [command, lab])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand()
      setCommand('')
    }
  }

  if (!lab) return <DocIndex kind="lab" label="Labs" pages={labs} domains={domains} />

  return (
    <article>
      {/* HTML rendered at build time from the repository's own Markdown (scripts/build-index.ts). */}
      <div className="doc" dangerouslySetInnerHTML={{ __html: lab.html }} />

      {/* Interactive terminal simulation */}
      <div className="mt-8">
        <h3 className="font-medium mb-2">Terminal simulation</h3>
        <div className="overflow-x-auto rounded bg-gray-900 p-4 font-mono text-sm">
          {/* Terminal prompt and command input */}
          <div className="mb-2">
            <span className="text-green-400">{outputStage === 'passed' ? '✔' : '$'}</span>{' '}
            <input
              type="text"
              className="bg-gray-900 text-green-400 outline-none"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="npm run check"
            />
          </div>

          {/* Terminal output */}
          {output.length > 0 && (
            <pre className="text-green-400 whitespace-pre-wrap">
              {output.map((line: string, i: number) => (
                <div key={i}>{line}</div>
              ))}
            </pre>
          )}

          {/* Running indicator */}
          {outputStage === 'running' && output.length > 1 && (
            <div className="text-yellow-400">Running tests...</div>
          )}

          {/* Final result */}
          {outputStage === 'passed' && (
            <div className="text-green-400 mt-2">
              ✓ All tests passed!
            </div>
          )}
        </div>

        {/* Available commands */}
        <div className="mt-3">
          <p className="text-xs text-gray-500">Available commands:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-300" onClick={() => setCommand('npm run check')}>
              npm run check
            </code>
            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-300" onClick={() => setCommand('npm run start')}>
              npm run start
            </code>
            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-300" onClick={() => setCommand('cat solution/agent.ts')}>
              cat solution/agent.ts
            </code>
            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-300" onClick={() => setCommand('ls -la')}>
              ls -la
            </code>
          </div>
        </div>
      </div>

      <label className="mt-8 flex items-start gap-2 rounded border border-gray-300 bg-gray-50 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={!!completed[lab.domainId]}
          onChange={(e) => onCompletedChange(lab.domainId, e.target.checked)}
        />
        <span>
          I ran <code>npm run check</code> in <code>labs/{lab.labId}</code> and every test passed.
        </span>
      </label>
    </article>
  )
}