// ---------------------------------------------------------------------------
// The build stamp Settings names, and the reason an unchanged app publishes
// nothing new.
//
// It is the date and short SHA of the LAST COMMIT THAT CHANGED A FILE THE
// PRODUCTION BUILD READS — never HEAD and never the build clock. A push that
// touches only records, docs, tests or other scripts therefore builds the
// same stamp, the build is byte-identical, the service worker is unchanged,
// and no device is told "A new version is ready." with nothing behind it.
//
// One list, read by vite.config.ts and by tests/app-version.test.ts alike.
// ---------------------------------------------------------------------------

import { execFileSync } from 'node:child_process';

/** Every path the production build reads, as git pathspecs from the repository root. */
export const BUILD_INPUTS = [
  'src/',
  'public/',
  'index.html',
  'vite.config.ts',
  'scripts/app-version.mjs',
  'tsconfig*.json',
  'package.json',
  'package-lock.json',
];

/** An explicit stamp wins — for the tests and for the owner's preview checks. */
export const VERSION_OVERRIDE = 'PC_APP_VERSION';

/**
 * `YYYY-MM-DD·sha` of the last commit touching `BUILD_INPUTS` (HEAD's when the
 * history is shallow and cannot answer), or the override, or `dev` without git.
 */
export function appVersion({ cwd = process.cwd(), env = process.env } = {}) {
  if (env[VERSION_OVERRIDE]) return env[VERSION_OVERRIDE];
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    const shallow = git('rev-parse', '--is-shallow-repository') === 'true';
    // A fixed 7-character SHA: git's own abbreviation grows with the repository,
    // which would change the stamp of a commit that did not change.
    const line = shallow
      ? git('log', '-1', '--format=%cs %H', 'HEAD')
      : git('log', '-1', '--format=%cs %H', 'HEAD', '--', ...BUILD_INPUTS);
    const [date, sha] = line.split(' ');
    return date && sha ? `${date}·${sha.slice(0, 7)}` : 'dev';
  } catch {
    return 'dev';
  }
}
