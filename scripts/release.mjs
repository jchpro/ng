// Release tooling for the independently versioned libraries (tags are `<lib>-vX.Y.Z`).
//
// Manual flow, no GitHub CLI needed:
//   node scripts/release.mjs prepare <common|kit> <X.Y.Z>   edit files, you commit them via a PR
//   node scripts/release.mjs tag <common|kit>               after the merge, tag main and print the push
//
// Automated flow, needs `gh` (logged in):
//   node scripts/release.mjs start  <lib> <X.Y.Z>           prepare on a release branch, push, open the PR
//   node scripts/release.mjs finish <lib> [X.Y.Z]           wait for the PR's checks, squash-merge, tag the
//                                                           merge commit, push the tag, watch the publish
//   node scripts/release.mjs ship   <lib> <X.Y.Z>           start, then finish
//   flags: --yes (don't ask before pushing the tag), --dry-run (check the preconditions, print the plan)
//
// `prepare` needs a `## [X.Y.Z] - Unreleased` heading in the library's changelog. It sets package.json's
// version, dates that heading and, when releasing common, moves kit's peer range to ^X.Y.Z (on 0.x a caret
// pins the minor, so a common minor bump would otherwise leave kit's peer unsatisfiable).
// `tag` never pushes: `git push origin <tag>` is what starts the publish workflow.
//
// `finish` can be run again after an interruption or a failed check: it works out where things stand from
// the pull request (the release branch is `release/<lib>-vX.Y.Z`; without a version it takes it from the
// branch you are on, or from package.json on main after the merge). It never uses `--admin`. Pushing the
// tag is the one step that can't be undone (npm doesn't allow reusing a version), so it asks first.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { changelogPath, isSemver, libs, packagePath, readPackage, topChangelogEntry } from './lib/libs.mjs';

const run = (command, args, input) => execFileSync(command, args, { encoding: 'utf8', input }).trim();
const git = (...args) => run('git', args);
const gh = (...args) => run('gh', args);
const succeeds = (command, ...args) => {
  try {
    run(command, args);
    return true;
  } catch {
    return false;
  }
};
/** Runs a command with its output going straight to the terminal; whether it succeeded. */
const live = (command, ...args) => spawnSync(command, args, { stdio: 'inherit' }).status === 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const die = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const [command, lib, versionArg] = args.filter((arg) => !arg.startsWith('--'));
const yes = flags.has('--yes');
const dryRun = flags.has('--dry-run');

const releaseBranch = (lib, version) => `release/${lib}-v${version}`;
const tagName = (lib, version) => `${lib}-v${version}`;

function replaceOnce(path, pattern, replacement, what) {
  const text = readFileSync(path, 'utf8');
  if (!pattern.test(text)) die(`${what}: pattern not found in ${path.pathname}`);
  writeFileSync(path, text.replace(pattern, replacement));
}

function assertUnreleased(lib, version) {
  if (!isSemver(version)) die(`"${version}" is not X.Y.Z`);
  const entry = topChangelogEntry(lib);
  if (entry?.version !== version || entry.released) {
    die(`${libs[lib].name} changelog needs "## [${version}] - Unreleased" on top`);
  }
}

function assertReleased(lib, version) {
  const entry = topChangelogEntry(lib);
  if (readPackage(lib).version !== version || entry?.version !== version || !entry.released) {
    die(`${libs[lib].name} ${version} is not prepared on this commit (package.json and a dated changelog entry); run prepare first`);
  }
}

function assertUpToDateMain() {
  if (git('status', '--porcelain')) die('working tree is not clean');
  if (git('branch', '--show-current') !== 'main') die('not on main');
  git('fetch', 'origin', 'main');
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) die('main is not at origin/main; pull first');
}

function requireGh() {
  if (!succeeds('gh', '--version')) {
    die('the GitHub CLI (gh) is not installed; use the manual flow (prepare, tag), see releasing.md');
  }
  if (!succeeds('gh', 'auth', 'status')) die('gh is not logged in; run `gh auth login`');
}

function applyVersion(lib, version) {
  const date = new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time
  replaceOnce(packagePath(lib), /("version":\s*")[^"]+(")/, `$1${version}$2`, 'version');
  replaceOnce(changelogPath(lib), new RegExp(`^(## \\[${version}\\]) - Unreleased`, 'm'), `$1 - ${date}`, 'changelog');
  if (lib === 'common') {
    const name = libs.common.name.replace('/', '\\/');
    replaceOnce(packagePath('kit'), new RegExp(`("${name}":\\s*")[^"]+(")`), `$1^${version}$2`, 'kit peer range');
  }
  return date;
}

function prepare(lib, version) {
  if (git('status', '--porcelain')) die('working tree is not clean');
  assertUnreleased(lib, version);
  const date = applyVersion(lib, version);
  console.log(`Prepared ${libs[lib].name} ${version} (${date}).`);
  console.log('Review `git diff`, then commit via a PR (the changelog and package.json move together).');
  console.log(`After the merge: node scripts/release.mjs tag ${lib}`);
}

function createTag(lib, version, ref = 'HEAD') {
  const name = tagName(lib, version);
  git('tag', '-a', name, ref, '-m', `${libs[lib].name} ${version}`);
  return name;
}

function tag(lib) {
  const version = readPackage(lib).version;
  const name = tagName(lib, version);
  assertReleased(lib, version);
  assertUpToDateMain();
  if (git('tag', '--list', name)) die(`tag ${name} already exists`);
  createTag(lib, version);
  console.log(`Created tag ${name}. Publish with:\n  git push origin ${name}`);
}

/** The changelog entry of a version, to describe the release in the pull request. */
function releaseNotes(lib, version) {
  const text = readFileSync(changelogPath(lib), 'utf8');
  const heading = new RegExp(`^## \\[${version}\\].*$`, 'm').exec(text);
  const rest = text.slice(heading.index + heading[0].length);
  const next = rest.search(/^## \[/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

async function start(lib, version) {
  requireGh();
  assertUpToDateMain();
  assertUnreleased(lib, version);
  const branch = releaseBranch(lib, version);
  if (git('branch', '--list', branch) || git('ls-remote', '--heads', 'origin', branch)) {
    die(`branch ${branch} already exists; continue it with \`finish ${lib} ${version}\``);
  }
  const title = `chore: ${lib === 'kit' ? 'Kit' : 'Common'} ${version} release`;
  if (dryRun) {
    console.log(`Would create ${branch}, prepare ${libs[lib].name} ${version}, commit "${title}", push it and open a PR.`);
    return;
  }
  git('checkout', '-b', branch);
  const date = applyVersion(lib, version);
  git('add', '--update');
  git('commit', '-m', title);
  console.log(`Prepared ${libs[lib].name} ${version} (${date}) on ${branch}.`);
  if (!live('git', 'push', '--set-upstream', 'origin', branch)) die(`could not push ${branch}`);
  const body = `Release of ${libs[lib].name} ${version}.\n\n${releaseNotes(lib, version)}\n`;
  const url = gh('pr', 'create', '--base', 'main', '--head', branch, '--title', title, '--body-file', '-').split('\n').pop();
  console.log(`Opened ${url}`);
}

const findPr = (branch) => JSON.parse(gh('pr', 'list', '--head', branch, '--state', 'all', '--limit', '1',
  '--json', 'number,state,url,mergeCommit'))[0];

const hasChecks = (pr) => {
  try {
    return JSON.parse(gh('pr', 'checks', String(pr.number), '--json', 'name')).length > 0;
  } catch {
    return false; // `gh` fails while the PR has no checks yet
  }
};

async function waitForChecks(pr) {
  // Right after the PR is opened its checks aren't registered yet.
  for (let attempt = 0; attempt < 24 && !hasChecks(pr); attempt++) await sleep(5000);
  if (!hasChecks(pr)) die(`${pr.url} has no checks after 2 minutes; look at it, then run finish again`);
  console.log(`Waiting for the checks of ${pr.url}`);
  if (!live('gh', 'pr', 'checks', String(pr.number), '--watch', '--fail-fast', '--interval', '10')) {
    die('a check failed; fix it on the release branch, push, and run finish again');
  }
}

async function confirmPush(name) {
  if (yes) return true;
  if (!process.stdin.isTTY) die('not a terminal: pass --yes to push the tag without asking');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Push ${name}? It starts the npm publish, and a published version can't be reused. [y/N] `);
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function watchPublish(lib, name, version) {
  const workflow = `publish-${lib}.yaml`;
  let id = '';
  for (let attempt = 0; attempt < 12 && !id; attempt++) {
    await sleep(5000);
    id = gh('run', 'list', '--workflow', workflow, '--branch', name, '--limit', '1', '--json', 'databaseId', '--jq', '.[0].databaseId');
    if (id === 'null') id = ''; // no run yet
  }
  if (!id) die(`no ${workflow} run appeared for ${name}; check the Actions tab`);
  if (!live('gh', 'run', 'watch', id, '--exit-status')) {
    die(`the publish failed; fix the cause and re-run the job from the Actions tab (run ${id})`);
  }
  console.log(`Published ${libs[lib].name} ${version}: https://www.npmjs.com/package/${libs[lib].name}/v/${version}`);
}

async function finish(lib, version) {
  requireGh();
  const branch = releaseBranch(lib, version);
  let pr = findPr(branch);
  if (!pr) die(`no pull request for ${branch}; run \`start ${lib} ${version}\` first`);
  if (pr.state === 'CLOSED') die(`${pr.url} was closed without merging`);
  const name = tagName(lib, version);
  if (dryRun) {
    console.log(`${pr.url} is ${pr.state}. Would ${pr.state === 'OPEN' ? 'wait for its checks, squash-merge it, then ' : ''}tag ${name} on the merge commit, ask, push it and watch the publish.`);
    return;
  }

  if (pr.state === 'OPEN') {
    await waitForChecks(pr);
    if (!live('gh', 'pr', 'merge', String(pr.number), '--squash', '--delete-branch')) die(`could not merge ${pr.url}`);
  }
  for (let attempt = 0; attempt < 12 && !(pr.state === 'MERGED' && pr.mergeCommit); attempt++) {
    await sleep(5000);
    pr = findPr(branch);
  }
  if (!pr.mergeCommit) die(`${pr.url} is not merged yet; run finish again in a moment`);

  if (git('status', '--porcelain')) die('working tree is not clean');
  if (git('branch', '--show-current') !== 'main') git('checkout', 'main');
  git('pull', '--ff-only', 'origin', 'main');
  const merge = pr.mergeCommit.oid;
  if (!succeeds('git', 'merge-base', '--is-ancestor', merge, 'HEAD')) die(`main does not contain the merge commit ${merge}`);
  assertReleased(lib, version);

  if (git('ls-remote', '--tags', 'origin', name)) die(`tag ${name} is already on origin; nothing left to do`);
  if (!git('tag', '--list', name)) createTag(lib, version, merge);
  if (git('rev-list', '-n', '1', name) !== merge) die(`local tag ${name} is not on the merge commit; delete it and run finish again`);

  if (!(await confirmPush(name))) {
    console.log(`Not pushed. When ready: git push origin ${name}`);
    return;
  }
  if (!live('git', 'push', 'origin', name)) die(`could not push ${name}`);
  await watchPublish(lib, name, version);
}

/** The version to finish: given, else from the release branch checked out, else main's after the merge. */
function inferVersion(lib) {
  if (versionArg) return versionArg;
  const onBranch = new RegExp(`^release/${lib}-v(\\d+\\.\\d+\\.\\d+)$`).exec(git('branch', '--show-current'));
  return onBranch ? onBranch[1] : readPackage(lib).version;
}

const usage = `usage: release.mjs prepare <lib> <X.Y.Z> | tag <lib> | start <lib> <X.Y.Z> | finish <lib> [X.Y.Z] | ship <lib> <X.Y.Z>  [--yes] [--dry-run]  (lib: ${Object.keys(libs).join('|')})`;
if (!libs[lib]) die(usage);
if (['prepare', 'start', 'ship'].includes(command) && !isSemver(versionArg ?? '')) die(`"${versionArg}" is not X.Y.Z`);

if (command === 'prepare') prepare(lib, versionArg);
else if (command === 'tag') tag(lib);
else if (command === 'start') await start(lib, versionArg);
else if (command === 'finish') await finish(lib, inferVersion(lib));
else if (command === 'ship') {
  await start(lib, versionArg);
  if (!dryRun) await finish(lib, versionArg);
} else die(`unknown command "${command}"\n${usage}`);
