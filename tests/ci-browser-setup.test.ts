import { execFile } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createNetServer, type AddressInfo, type Server, type Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
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

// ---------------------------------------------------------------------------
// The runner itself: every workflow that runs the suite is bounded in time,
// fails over from a dead package mirror, runs one Node major, runs once per
// kind of ref, and gives way to a newer run. All of it DISCOVERED from the
// workflow files — a suite workflow is one whose job runs a suite command —
// with a synthetic negative beside each check so none of them passes vacuously.
//
// The workflows are read by indentation, not by a YAML library: the files are
// plain block YAML, and a reader this small has nothing to drift from GitHub's.
// ---------------------------------------------------------------------------

type Block = { key: string; indent: number; lines: string[] }

/** Comment lines and trailing comments removed; blank lines dropped. */
function meaningful(text: string): string[] {
  return text
    .split('\n')
    .filter((l) => !l.trim().startsWith('#') && l.trim() !== '')
    .map((l) => l.replace(/\s+#\s[^'"]*$/, '').replace(/\s+$/, ''))
}

const indentOf = (line: string) => line.length - line.trimStart().length

/** The `key:` children directly under `lines` at their first indent, each with its own lines. */
function children(lines: string[]): Block[] {
  const out: Block[] = []
  const indent = lines.length ? indentOf(lines[0]) : 0
  for (const line of lines) {
    if (indentOf(line) === indent && /^\s*[\w$.-]+:/.test(line)) {
      out.push({ key: line.trim().split(':')[0], indent, lines: [line] })
    } else out.at(-1)?.lines.push(line)
  }
  return out
}

/** The lines under a block's own key line. */
const body = (b: Block | undefined) => (b ? b.lines.slice(1) : [])
const child = (lines: string[], key: string) => children(lines).find((c) => c.key === key)
/** `key: value` on a block's own line, unquoted. */
const scalar = (lines: string[], key: string) =>
  child(lines, key)?.lines[0].split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '')

/** Each `- ` item of a list, with its lines. */
function items(lines: string[]): string[][] {
  const out: string[][] = []
  const indent = lines.length ? indentOf(lines[0]) : 0
  for (const line of lines) {
    if (indentOf(line) === indent && line.trimStart().startsWith('- ')) out.push([line])
    else out.at(-1)?.push(line)
  }
  return out
}

/** A step's own fields, as though its `- ` were not there. */
const stepFields = (step: string[]) => {
  const [first, ...rest] = step
  const indent = indentOf(first) + 2
  return [' '.repeat(indent) + first.trimStart().slice(2), ...rest]
}

/** The values of a flow list (`[a, b]`) or a block list under a key. */
function listValues(b: Block | undefined): string[] {
  if (!b) return []
  const inline = b.lines[0].split(':').slice(1).join(':').trim()
  if (inline.startsWith('[')) return inline.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
  if (inline) return [inline.replace(/^['"]|['"]$/g, '')]
  return body(b).map((l) => l.trim().replace(/^- /, '').replace(/^['"]|['"]$/g, ''))
}

type RefKind = 'pull_request' | 'push:main' | 'push:branch'

export type RunnerAudit = {
  runsSuite: boolean
  /** The kinds of ref a run of this workflow checks. */
  refKinds: RefKind[]
  dispatch: boolean
  /** The concurrency group, if any, and whether it cancels a superseded run. */
  concurrency: { group: string; cancels: boolean } | null
  suiteJobs: {
    name: string
    timeoutMinutes: number | null
    nodeVersion: string | null
    /** The browser-install step's own bound, null if it has none. */
    installTimeout: number | null
    /** A step BEFORE the browser install that probes the image's mirror+file list with a bounded fetch. */
    failoverBeforeInstall: boolean
    /** A dispatch-only drill that blackholes the Azure mirror before the install. */
    drill: boolean
    /** Each step's own text, comments removed. */
    steps: string[]
  }[]
}

/** The probe reads the image's own mirror list; an apt timeout alone was disproved by the drill. */
const MIRROR_PROBE = /mirror\\?\+file:/

export function auditRunner(rawText: string): RunnerAudit {
  const top = children(meaningful(rawText))
  const on = top.find((b) => b.key === 'on' || b.key === '"on"' || b.key === 'true')
  const events = on ? (body(on).length ? children(body(on)) : listValues(on).map((key) => ({ key, indent: 0, lines: [key] }))) : []
  const refKinds: RefKind[] = []
  let dispatch = false
  for (const e of events) {
    if (e.key === 'pull_request' || e.key === 'pull_request_target') refKinds.push('pull_request')
    if (e.key === 'workflow_dispatch') dispatch = true
    if (e.key === 'push') {
      const only = listValues(child(body(e), 'branches'))
      const ignored = listValues(child(body(e), 'branches-ignore'))
      if (only.length) {
        if (only.includes('main')) refKinds.push('push:main')
        if (only.some((b) => b !== 'main')) refKinds.push('push:branch')
      } else {
        if (!ignored.includes('main')) refKinds.push('push:main')
        refKinds.push('push:branch')
      }
    }
  }

  const concurrencyOf = (lines: string[]) => {
    const c = child(lines, 'concurrency')
    if (!c) return null
    const group = body(c).length ? (scalar(body(c), 'group') ?? '') : (scalar(lines, 'concurrency') ?? '')
    return { group, cancels: body(c).length > 0 && scalar(body(c), 'cancel-in-progress') === 'true' }
  }

  const suiteJobs: RunnerAudit['suiteJobs'] = []
  let jobConcurrency: RunnerAudit['concurrency'] = null
  for (const job of children(body(top.find((b) => b.key === 'jobs')))) {
    const fields = body(job)
    const stepList = items(body(child(fields, 'steps'))).map(stepFields)
    const text = stepList.map((s) => s.join('\n'))
    if (!text.some((t) => SUITE_COMMANDS.some((re) => re.test(t)))) continue
    jobConcurrency ??= concurrencyOf(fields)
    const install = text.findIndex((t) => /\bplaywright(@\S+)?\s+install\b/.test(t))
    const before = install < 0 ? [] : text.slice(0, install)
    const minutes = (lines: string[]) => {
      const v = scalar(lines, 'timeout-minutes')
      return v && /^\d+$/.test(v) ? Number(v) : null
    }
    const setupNode = stepList.find((s) => /uses:\s*actions\/setup-node@/.test(s.join('\n')))
    suiteJobs.push({
      name: job.key,
      timeoutMinutes: minutes(fields),
      nodeVersion: setupNode ? (scalar(body(child(setupNode, 'with')), 'node-version') ?? null) : null,
      installTimeout: install < 0 ? null : minutes(stepList[install]),
      failoverBeforeInstall: before.some((t) => MIRROR_PROBE.test(t) && /\bcurl\b[^\n]*--max-time \d+/.test(t)),
      drill: before.some(
        (t) =>
          /if:.*github\.event_name == 'workflow_dispatch'.*inputs\.\w+/.test(t) &&
          /azure\.archive\.ubuntu\.com/.test(t) &&
          /\/etc\/hosts/.test(t),
      ),
      steps: text,
    })
  }
  return {
    runsSuite: suiteJobs.length > 0,
    refKinds,
    dispatch,
    concurrency: concurrencyOf(top.flatMap((b) => b.lines)) ?? jobConcurrency,
    suiteJobs,
  }
}

function runners() {
  return readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(WORKFLOW_DIR, name), 'utf8') }))
    .map(({ name, text }) => ({ name, ...auditRunner(text) }))
    .filter((w) => w.runsSuite)
}

/** What is wrong with one suite workflow's bounds and failover; empty when nothing is. */
function boundsProblems(w: RunnerAudit & { name: string }): string[] {
  return w.suiteJobs.flatMap((j) => [
    ...(j.timeoutMinutes === null || j.timeoutMinutes > 60 ? [`${w.name}/${j.name}: no job timeout-minutes (at most 60)`] : []),
    ...(j.installTimeout === null ? [`${w.name}/${j.name}: browser install has no timeout-minutes`] : []),
    ...(!j.failoverBeforeInstall ? [`${w.name}/${j.name}: no apt mirror failover before the browser install`] : []),
  ])
}

const PROBE_STEP = `      - run: grep -rhoE 'mirror\\+file:[^ ]+' /etc/apt/sources.list.d/ && curl -fsS --max-time 5 "$url"`

const SUITE_JOB = (extra: { top?: string; job?: string; before?: string; node?: string } = {}) => `
name: synthetic
on:
  push:
    branches-ignore: [main]
${extra.top ?? ''}
jobs:
  check:
    runs-on: ubuntu-latest
${extra.job ?? '    timeout-minutes: 20'}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${extra.node ?? '24'}
${extra.before ?? PROBE_STEP}
      - run: npx playwright install --with-deps chromium webkit
        timeout-minutes: 10
      - run: npm test
`

describe('the runner around the suite', () => {
  it('every workflow that runs the test suite bounds its time and fails over from a dead package mirror', () => {
    const suite = runners()
    expect(suite.length).toBeGreaterThan(0)
    expect(suite.flatMap(boundsProblems)).toEqual([])
    // The failover is PROVEN on the real runner image by a drill CI offers —
    // dispatch only, before the install, never on an ordinary run.
    expect(suite.filter((w) => w.refKinds.includes('push:branch') && w.dispatch && w.suiteJobs.some((j) => j.drill)).map((w) => w.name)).toHaveLength(1)

    // Synthetic workflows missing any of these are reported.
    const problems = (text: string) => boundsProblems({ name: 'synthetic.yml', ...auditRunner(text) })
    expect(problems(SUITE_JOB())).toEqual([])
    expect(problems(SUITE_JOB({ job: '' }))).toEqual(['synthetic.yml/check: no job timeout-minutes (at most 60)'])
    expect(problems(SUITE_JOB({ job: '    timeout-minutes: 360' }))).toEqual(['synthetic.yml/check: no job timeout-minutes (at most 60)'])
    expect(problems(SUITE_JOB({ before: '' }))).toEqual(['synthetic.yml/check: no apt mirror failover before the browser install'])
    // apt's own timeouts are not failover: the drill hung behind them exactly as the incident did.
    expect(
      problems(SUITE_JOB({ before: `      - run: printf 'Acquire::http::Timeout "10";' | sudo tee /etc/apt/apt.conf.d/99-mirror-failover` })),
    ).toEqual(['synthetic.yml/check: no apt mirror failover before the browser install'])
    // A probe with no bound of its own could hang where apt did.
    expect(problems(SUITE_JOB({ before: PROBE_STEP.replace('--max-time 5 ', '') }))).toEqual([
      'synthetic.yml/check: no apt mirror failover before the browser install',
    ])
    expect(
      problems(SUITE_JOB().replace('install --with-deps chromium webkit\n        timeout-minutes: 10', 'install --with-deps chromium webkit')),
    ).toEqual(['synthetic.yml/check: browser install has no timeout-minutes'])
    // Failover configured AFTER the install protects nothing.
    expect(
      problems(
        SUITE_JOB({ before: '' }).replace('      - run: npm test', `${PROBE_STEP}\n      - run: npm test`),
      ),
    ).toEqual(['synthetic.yml/check: no apt mirror failover before the browser install'])
    // A drill that runs on every push, or blackholes nothing, is not the drill.
    const drill = (condition: string, command: string) =>
      auditRunner(SUITE_JOB({ before: `      - if: ${condition}\n        run: ${command}` })).suiteJobs[0].drill
    expect(drill("github.event_name == 'workflow_dispatch' && inputs.dead_mirror_drill", "echo '10.255.255.1 azure.archive.ubuntu.com' | sudo tee -a /etc/hosts")).toBe(true)
    expect(drill('always()', "echo '10.255.255.1 azure.archive.ubuntu.com' | sudo tee -a /etc/hosts")).toBe(false)
    expect(drill("github.event_name == 'workflow_dispatch' && inputs.dead_mirror_drill", 'echo nothing')).toBe(false)
  })

  it('every workflow that runs the test suite uses one Node major', () => {
    const major = (v: string | null) => (v === null ? null : Number(v.split('.')[0]))
    const offMajor = (w: RunnerAudit & { name: string }) =>
      w.suiteJobs.filter((j) => major(j.nodeVersion) !== 24).map((j) => `${w.name}/${j.name}: node ${j.nodeVersion}`)
    const suite = runners()
    expect(suite.length).toBeGreaterThan(1)
    expect(suite.flatMap(offMajor)).toEqual([])
    // A synthetic workflow on another major is reported.
    expect(offMajor({ name: 'synthetic.yml', ...auditRunner(SUITE_JOB({ node: '22' })) })).toEqual(['synthetic.yml/check: node 22'])
    expect(offMajor({ name: 'synthetic.yml', ...auditRunner(SUITE_JOB({ node: '24.3' })) })).toEqual([])
  })

  it('the suite runs once per ref kind and superseded runs are cancelled', () => {
    const duplicates = (ws: (RunnerAudit & { name: string })[]) =>
      (['pull_request', 'push:main', 'push:branch'] as RefKind[])
        .map((kind) => [kind, ws.filter((w) => w.refKinds.includes(kind)).map((w) => w.name)] as const)
        .filter(([, names]) => names.length > 1)
    const uncancelled = (ws: (RunnerAudit & { name: string })[]) =>
      ws.filter((w) => !w.concurrency?.cancels || !w.concurrency.group.includes('${{ github.workflow }}')).map((w) => w.name)

    const suite = runners()
    expect(suite.length).toBeGreaterThan(1)
    expect(duplicates(suite)).toEqual([])
    expect(uncancelled(suite)).toEqual([])
    // On a pull request the Gate — and only the Gate — runs the suite; CI
    // runs on branch pushes and on dispatch.
    const gate = suite.filter((w) => w.suiteJobs.some((j) => j.steps.some((s) => SUITE_COMMANDS[1].test(s))))
    expect(suite.filter((w) => w.refKinds.includes('pull_request')).map((w) => w.name)).toEqual(gate.map((w) => w.name))
    expect(gate).toHaveLength(1)
    const ci = suite.filter((w) => w.refKinds.includes('push:branch'))
    expect(ci.map((w) => [w.refKinds, w.dispatch])).toEqual([[['push:branch'], true]])

    // Synthetic duplicates and an unkeyed group are reported.
    const named = (name: string, text: string) => ({ name, ...auditRunner(text) })
    const prToo = named('ci.yml', SUITE_JOB().replace('on:\n', 'on:\n  pull_request:\n'))
    const gateLike = named('gate.yml', SUITE_JOB().replace('  push:\n    branches-ignore: [main]\n', '  pull_request:\n'))
    expect(duplicates([prToo, gateLike])).toEqual([['pull_request', ['ci.yml', 'gate.yml']]])
    const bareOn = named('bare.yml', SUITE_JOB().replace('on:\n  push:\n    branches-ignore: [main]\n', 'on: [push, pull_request]\n'))
    expect(bareOn.refKinds).toEqual(['push:main', 'push:branch', 'pull_request'])
    const keyed = named('keyed.yml', SUITE_JOB({ top: 'concurrency:\n  group: ${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true' }))
    const unkeyed = named('unkeyed.yml', SUITE_JOB({ top: 'concurrency:\n  group: pages\n  cancel-in-progress: true' }))
    const kept = named('kept.yml', SUITE_JOB({ top: 'concurrency:\n  group: ${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: false' }))
    expect(uncancelled([keyed, unkeyed, kept, named('none.yml', SUITE_JOB())])).toEqual(['unkeyed.yml', 'kept.yml', 'none.yml'])
  })

  it('the deploy check runs exactly the steps CI proves on every push', () => {
    // CI's check minus its dispatch-only drill; deploy's check minus its upload.
    const proven = (w: RunnerAudit) =>
      w.suiteJobs[0].steps.filter((s) => !/github\.event_name == 'workflow_dispatch'/.test(s) && !/upload-pages-artifact/.test(s))
    const suite = runners()
    const ci = suite.filter((w) => w.refKinds.includes('push:branch'))
    const deploy = suite.filter((w) => w.refKinds.includes('push:main'))
    expect([ci.length, deploy.length]).toEqual([1, 1])
    expect(proven(deploy[0])).toEqual(proven(ci[0]))
    // Every step that matters is in the comparison: setup, install, lint, test, build.
    expect(proven(ci[0]).join('\n')).toMatch(/setup-node[\s\S]*npm ci[\s\S]*playwright install[\s\S]*npm run lint[\s\S]*npm test[\s\S]*npm run build/)

    // A synthetic divergence is reported.
    const text = readFileSync(join(WORKFLOW_DIR, deploy[0].name), 'utf8')
    expect(proven(auditRunner(text.replace(/node-version: \d+/, 'node-version: 18')))).not.toEqual(proven(ci[0]))
    expect(proven(auditRunner(text.replace('      - run: npm run lint\n', '')))).not.toEqual(proven(ci[0]))
  })
})

// ---------------------------------------------------------------------------
// The probe itself, RUN: the one step every suite workflow carries, executed by
// bash against mirrors on this machine — one that accepts a connection and never
// answers (the drill's blackhole, and the 2026-10-07 incident), one that refuses,
// one without the suite, and live ones. Every /etc path is redirected into a
// scratch root and `sudo` is a shim, so running it here or inside CI changes
// nothing real.
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile)

describe('the apt mirror probe', () => {
  it('leaves an unreachable mirror out within its own bound and keeps every other line exactly', async () => {
    const probes = runners().flatMap((w) => w.suiteJobs.map((j) => j.steps.find((s) => MIRROR_PROBE.test(s))))
    // One probe, word for word, in every suite workflow, so running it once runs them all.
    expect(probes.length).toBeGreaterThan(2)
    expect(new Set(probes).size).toBe(1)
    const step = probes[0]!.split('\n')
    const script = step.slice(step.findIndex((l) => /^\s*run: \|$/.test(l)) + 1)
    const bound = Number(/--max-time (\d+)/.exec(probes[0]!)?.[1])
    expect(bound).toBeGreaterThan(0)

    const root = mkdtempSync(join(tmpdir(), 'mirror-probe-'))
    const etc = join(root, 'etc')
    const list = join(etc, 'apt', 'apt-mirrors.txt')
    const code = script
      .map((l) => l.slice(indentOf(script[0])))
      .join('\n')
      .replaceAll('/etc/', `${etc}/`)
    expect(code.replaceAll(`${etc}/`, '')).not.toContain('/etc/')
    const bin = join(root, 'bin')
    mkdirSync(bin)
    writeFileSync(join(bin, 'sudo'), '#!/bin/sh\nexec "$@"\n')
    chmodSync(join(bin, 'sudo'), 0o755)
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` }
    const bash = (source: string) => execFileAsync('bash', ['-e', '-c', source], { env })
    expect((await bash('command -v sudo')).stdout.trim()).toBe(join(bin, 'sudo'))

    const live = createHttpServer((req, res) => {
      res.statusCode = /^\/(ubuntu|mirror)\/dists\/noble\/InRelease$/.test(req.url ?? '') ? 200 : 404
      res.end()
    })
    const held: Socket[] = []
    const hung = createNetServer((socket) => void held.push(socket))
    const refused = createNetServer()
    const listen = (s: Server) =>
      new Promise<number>((resolve) => s.listen(0, '127.0.0.1', () => resolve((s.address() as AddressInfo).port)))
    const [livePort, hungPort, refusedPort] = await Promise.all([listen(live), listen(hung), listen(refused)])
    await new Promise((resolve) => refused.close(resolve))
    const at = (port: number, path: string) => `http://127.0.0.1:${port}/${path}/`

    const fixture = (mirrors: string, uris = `mirror+file:${list}`) => {
      rmSync(etc, { recursive: true, force: true })
      mkdirSync(join(etc, 'apt', 'sources.list.d'), { recursive: true })
      writeFileSync(join(etc, 'os-release'), 'NAME="Ubuntu"\nVERSION_CODENAME=noble\n')
      writeFileSync(list, mirrors)
      // Two stanzas naming one list, as the image's ubuntu.sources does.
      for (const suites of ['noble noble-updates', 'noble-security'])
        writeFileSync(join(etc, 'apt', 'sources.list.d', `${suites.split(' ')[0]}.sources`), `Types: deb\nURIs: ${uris}\nSuites: ${suites}\n`)
    }

    try {
      fixture(
        [
          "# the image's own comment",
          `${at(hungPort, 'ubuntu')}\tpriority:1`,
          `${at(livePort, 'ubuntu')}\tpriority:2`,
          at(refusedPort, 'ubuntu'),
          at(livePort, 'missing'),
          at(livePort, 'mirror'),
          '',
        ].join('\n'),
      )
      const started = Date.now()
      const { stdout } = await bash(code)
      const elapsed = Date.now() - started
      expect(readFileSync(list, 'utf8')).toBe(
        ["# the image's own comment", `${at(livePort, 'ubuntu')}\tpriority:2`, at(livePort, 'mirror'), ''].join('\n'),
      )
      for (const dead of [at(hungPort, 'ubuntu'), at(refusedPort, 'ubuntu'), at(livePort, 'missing')])
        expect(stdout).toContain(`::warning::apt mirror ${dead} did not answer within ${bound} s; left out of ${list}`)
      // The hung mirror really hung (the fixture is the blackhole, not a refusal) and cost
      // one bounded wait, never two: the ceiling sits just under a second wait, which
      // leaves bash and the four other fetches seconds of room on a loaded runner.
      expect(elapsed).toBeGreaterThanOrEqual((bound - 0.5) * 1000)
      expect(elapsed).toBeLessThan((2 * bound - 0.5) * 1000)

      // When no mirror answers, the list stays as it was: the step bound, not an empty list, is the guarantee.
      const deadOnly = `${at(refusedPort, 'ubuntu')}\tpriority:1\n`
      fixture(deadOnly)
      expect((await bash(code)).stdout).toContain(`::warning::no mirror in ${list} answered; it is left as it was`)
      expect(readFileSync(list, 'utf8')).toBe(deadOnly)

      // An image without a mirror list is reported, never failed.
      fixture(`${at(livePort, 'ubuntu')}\n`, 'http://archive.ubuntu.com/ubuntu/')
      expect((await bash(code)).stdout).toContain('::warning::apt sources list no mirror+file failover on this image')
    } finally {
      for (const socket of held) socket.destroy()
      await Promise.all([live, hung].map((s) => new Promise((resolve) => s.close(resolve))))
      rmSync(root, { recursive: true, force: true })
    }
  })
})
