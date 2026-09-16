import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The CI invariant, checked as an invariant rather than as a command string:
 * every GitHub Actions workflow that runs this repository's test suite must
 * provide, BEFORE it runs, every browser engine the suite can drive. The
 * harness (tests/practiceBrowser.ts) refuses to skip a missing engine by
 * design, so an engine CI does not install is a hard red check.
 *
 * "Runs the suite" is deliberately a SET of command shapes, not the single
 * literal `npm test`: prismatica-gate.yml never writes `npm test` — it runs
 * `npx --yes prismatica@x.y.z gate`, which runs this repository's own checks.
 * A predicate anchored on `npm test` alone would silently exempt the exact
 * workflow whose failing job this lane exists to fix. It is still DISCOVERY,
 * never a list of workflow filenames: a future workflow running the suite by
 * either shape is covered with no edit here.
 */
const REQUIRED_ENGINES = ['chromium', 'webkit'] as const

const SUITE_COMMANDS = [/\bnpm\s+(?:run\s+)?test\b/, /\bprismatica(?:@\S+)?\s+gate\b/]

/** `playwright install …` / `playwright@1.2.3 install …` — the version group is what breaks pinning. */
const PLAYWRIGHT_INSTALL = /\bplaywright(@\S+)?\s+install\b([^\n]*)/g

export type WorkflowAudit = {
  /** Does this workflow execute the repository's test suite at all? */
  runsSuite: boolean
  /** Required engines NOT installed earlier in the file than the suite step. */
  missing: string[]
  /** Any `playwright@<version> install` — an independently versioned install, which unpins the browser revisions. */
  versionedInstalls: string[]
  /** Does it install Playwright browsers at all, versioned or not? */
  installsPlaywright: boolean
}

/**
 * Exported so the discriminating check can run it against synthetic workflow
 * text, independently of the real files — that is what makes the check above
 * non-vacuous.
 */
export function auditWorkflow(rawText: string): WorkflowAudit {
  // Comments quote `npm test` and the install command in prose; matching
  // inside one would put the suite step before its own install step.
  const text = rawText
    .split('\n')
    .map((line) => (line.trim().startsWith('#') ? '' : line))
    .join('\n')

  const suiteAt = SUITE_COMMANDS.map((re) => text.search(re))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0]

  const versionedInstalls: string[] = []
  const installedBefore = new Set<string>()
  let installsPlaywright = false
  for (const match of text.matchAll(PLAYWRIGHT_INSTALL)) {
    installsPlaywright = true
    if (match[1]) versionedInstalls.push(match[0].trim())
    if (suiteAt === undefined || (match.index ?? 0) >= suiteAt) continue
    for (const engine of REQUIRED_ENGINES) {
      if (new RegExp(`\\b${engine}\\b`).test(match[2])) installedBefore.add(engine)
    }
  }

  if (suiteAt === undefined) {
    return { runsSuite: false, missing: [], versionedInstalls, installsPlaywright }
  }
  return {
    runsSuite: true,
    missing: REQUIRED_ENGINES.filter((e) => !installedBefore.has(e)),
    versionedInstalls,
    installsPlaywright,
  }
}

const WORKFLOW_DIR = join(process.cwd(), '.github', 'workflows')

function auditAll() {
  return readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, ...auditWorkflow(readFileSync(join(WORKFLOW_DIR, name), 'utf8')) }))
}

describe('CI browser setup', () => {
  it('every workflow that runs the test suite installs both browser engines before it', () => {
    const audited = auditAll()
    const suiteWorkflows = audited.filter((w) => w.runsSuite)

    // A scanner that silently matches nothing must not pass as a clean result.
    expect(suiteWorkflows.length).toBeGreaterThan(0)

    // Both engines, installed earlier in the same file than the suite step.
    expect(suiteWorkflows.filter((w) => w.missing.length > 0)).toEqual([])

    // The predicate's own blind spot, closed without naming a single file: a
    // workflow that bothers to install Playwright browsers is running the
    // suite. If SUITE_COMMANDS ever stops recognising one of the shapes — the
    // gate runs the checks through `prismatica gate`, never `npm test` — that
    // workflow surfaces here instead of quietly dropping out of the audit.
    expect(audited.filter((w) => w.installsPlaywright && !w.runsSuite)).toEqual([])
  })

  it('a workflow that runs the suite without every engine is reported, not passed over', () => {
    const workflow = (install: string) => `
jobs:
  check:
    steps:
      - run: npm ci
      - run: ${install}
      - run: npm test
`
    expect(auditWorkflow(workflow('npx playwright install --with-deps chromium')).missing).toEqual([
      'webkit',
    ])
    expect(
      auditWorkflow(workflow('npx playwright install --with-deps chromium webkit')).missing,
    ).toEqual([])

    // Ordering matters too: an install that lands after the suite step is no install at all.
    expect(
      auditWorkflow(`
jobs:
  check:
    steps:
      - run: npm test
      - run: npx playwright install --with-deps chromium webkit
`).missing,
    ).toEqual(['chromium', 'webkit'])
  })

  it("the install resolves the repository's own pinned Playwright, never an independently versioned one", () => {
    for (const workflow of auditAll()) {
      expect([workflow.name, workflow.versionedInstalls]).toEqual([workflow.name, []])
    }

    // The check can fail: an independently versioned install is reported.
    expect(
      auditWorkflow('      - run: npx playwright@1.63.0 install --with-deps chromium webkit\n      - run: npm test\n')
        .versionedInstalls,
    ).toEqual(['playwright@1.63.0 install --with-deps chromium webkit'])
  })
})
