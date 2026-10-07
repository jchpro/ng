// Release tooling for the independently versioned libraries (tags are `<lib>-vX.Y.Z`).
//
//   node scripts/release.mjs prepare <common|kit> <X.Y.Z>   edit files, you commit them via a PR
//   node scripts/release.mjs tag <common|kit>               after the merge, tag main and print the push
//
// `prepare` needs a `## [X.Y.Z] - Unreleased` heading in the library's changelog. It sets package.json's
// version, dates that heading and, when releasing common, moves kit's peer range to ^X.Y.Z (on 0.x a caret
// pins the minor, so a common minor bump would otherwise leave kit's peer unsatisfiable).
// `tag` never pushes: `git push origin <tag>` is what starts the publish workflow.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { changelogPath, isSemver, libs, packagePath, readPackage, topChangelogEntry } from './lib/libs.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const die = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

function replaceOnce(path, pattern, replacement, what) {
  const text = readFileSync(path, 'utf8');
  if (!pattern.test(text)) die(`${what}: pattern not found in ${path.pathname}`);
  writeFileSync(path, text.replace(pattern, replacement));
}

function prepare(lib, version) {
  if (!isSemver(version)) die(`"${version}" is not X.Y.Z`);
  if (git('status', '--porcelain')) die('working tree is not clean');
  const entry = topChangelogEntry(lib);
  if (entry?.version !== version || entry.released) {
    die(`${libs[lib].name} changelog needs "## [${version}] - Unreleased" on top`);
  }
  const date = new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time
  replaceOnce(packagePath(lib), /("version":\s*")[^"]+(")/, `$1${version}$2`, 'version');
  replaceOnce(changelogPath(lib), new RegExp(`^(## \\[${version}\\]) - Unreleased`, 'm'), `$1 - ${date}`, 'changelog');
  if (lib === 'common') {
    const name = libs.common.name.replace('/', '\\/');
    replaceOnce(packagePath('kit'), new RegExp(`("${name}":\\s*")[^"]+(")`), `$1^${version}$2`, 'kit peer range');
  }
  console.log(`Prepared ${libs[lib].name} ${version} (${date}).`);
  console.log('Review `git diff`, then commit via a PR (the changelog and package.json move together).');
  console.log(`After the merge: node scripts/release.mjs tag ${lib}`);
}

function tag(lib) {
  const version = readPackage(lib).version;
  const name = `${lib}-v${version}`;
  const entry = topChangelogEntry(lib);
  if (entry?.version !== version || !entry.released) die(`changelog has no dated entry for ${version}; run prepare first`);
  if (git('status', '--porcelain')) die('working tree is not clean');
  if (git('branch', '--show-current') !== 'main') die('not on main');
  git('fetch', 'origin', 'main');
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) die('main is not at origin/main; pull first');
  if (git('tag', '--list', name)) die(`tag ${name} already exists`);
  git('tag', '-a', name, '-m', `${libs[lib].name} ${version}`);
  console.log(`Created tag ${name}. Publish with:\n  git push origin ${name}`);
}

const [command, lib, version] = process.argv.slice(2);
if (!libs[lib]) die(`usage: release.mjs prepare <${Object.keys(libs).join('|')}> <X.Y.Z> | tag <lib>`);
if (command === 'prepare') prepare(lib, version);
else if (command === 'tag') tag(lib);
else die(`unknown command "${command}"`);
