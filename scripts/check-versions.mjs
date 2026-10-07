// Catches version drift between each library's package.json, its changelog and kit's peer range on
// common: `npm run check:versions` (part of `npm test`).
//
// With `--tag <lib>-vX.Y.Z` it instead verifies a release tag before publishing: the version must equal
// the library's package.json version and its changelog entry must be dated (not `Unreleased`).
import { caretSatisfies, compareSemver, isSemver, libs, readPackage, topChangelogEntry } from './lib/libs.mjs';

const problems = [];
const fail = (message) => problems.push(message);

function checkLibrary(lib) {
  const { version } = readPackage(lib);
  const entry = topChangelogEntry(lib);
  if (!isSemver(version)) fail(`${libs[lib].name}: package.json version "${version}" is not X.Y.Z`);
  if (!entry) {
    fail(`${libs[lib].name}: changelog has no "## [X.Y.Z] - Unreleased | YYYY-MM-DD" entry`);
  } else if (entry.released && entry.version !== version) {
    fail(`${libs[lib].name}: newest released changelog entry is ${entry.version}, package.json says ${version}`);
  } else if (!entry.released && compareSemver(entry.version, version) < 0) {
    fail(`${libs[lib].name}: Unreleased changelog entry ${entry.version} is older than package.json ${version}`);
  }
}

function checkKitPeer() {
  const range = readPackage('kit').peerDependencies?.[libs.common.name];
  const { version } = readPackage('common');
  if (!range) return fail(`${libs.kit.name}: no peer dependency on ${libs.common.name}`);
  const ok = caretSatisfies(range, version);
  if (ok === null) fail(`${libs.kit.name}: peer range "${range}" on common is not a plain ^X.Y.Z`);
  else if (!ok) fail(`${libs.kit.name}: peer range "${range}" is not satisfied by common ${version}`);
}

function checkTag(tag) {
  const match = /^([a-z]+)-v(\d+\.\d+\.\d+)$/.exec(tag);
  if (!match || !libs[match[1]]) {
    return fail(`tag "${tag}" is not <${Object.keys(libs).join('|')}>-vX.Y.Z`);
  }
  const [, lib, version] = match;
  const actual = readPackage(lib).version;
  if (actual !== version) fail(`tag says ${version}, ${libs[lib].name} package.json says ${actual}`);
  const entry = topChangelogEntry(lib);
  if (entry?.version !== version || !entry.released) {
    fail(`${libs[lib].name} changelog has no dated "## [${version}] - YYYY-MM-DD" entry on top`);
  }
}

const tagIndex = process.argv.indexOf('--tag');
if (tagIndex !== -1) {
  checkTag(process.argv[tagIndex + 1] ?? '');
} else {
  Object.keys(libs).forEach(checkLibrary);
  checkKitPeer();
}

if (problems.length) {
  problems.forEach((problem) => console.error(`✗ ${problem}`));
  process.exit(1);
}
console.log(tagIndex !== -1 ? 'Release tag matches package.json and changelog.' : 'Versions are consistent.');
