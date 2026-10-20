// Shared bits of the release tooling (`check-versions.mjs`, `release.mjs`): where each library lives,
// and reading / parsing its version, changelog and peer range.
import { readFileSync } from 'node:fs';

export const root = new URL('../../', import.meta.url);

// Short name (the tag prefix, `<name>-vX.Y.Z`) -> package folder. Publish order: common before kit.
export const libs = {
  common: { name: '@jchpro/ngx-common', dir: 'projects/@jchpro/ngx-common' },
  kit: { name: '@jchpro/ngx-kit', dir: 'projects/@jchpro/ngx-kit' },
};

export const packagePath = (lib) => new URL(`${libs[lib].dir}/package.json`, root);
export const changelogPath = (lib) => new URL(`${libs[lib].dir}/changelog.md`, root);

export const readPackage = (lib) => JSON.parse(readFileSync(packagePath(lib), 'utf8'));

export const isSemver = (value) => /^\d+\.\d+\.\d+$/.test(value);

export function compareSemver(a, b) {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i];
  }
  return 0;
}

// A peer range between our own libraries is plain `^X.Y.Z` clauses joined by `||`, e.g. `^0.8.0 || ^0.9.0`: the lowest
// version that has what is used, then every later minor that works too (on 0.x a caret pins the minor, so each one is
// a clause of its own). Anything else is flagged, not guessed at.
const CARET = /^\^(\d+\.\d+\.\d+)$/;

export const peerClauses = (range) => range.split('||').map((clause) => clause.trim());

// true / false, or null when the range is not made of plain caret clauses.
export function caretSatisfies(range, version) {
  const clauses = peerClauses(range).map((clause) => CARET.exec(clause)?.[1]);
  if (clauses.includes(undefined)) return null;
  const [vMajor, vMinor] = version.split('.').map(Number);
  return clauses.some((clause) => {
    const [major, minor] = clause.split('.').map(Number);
    if (compareSemver(version, clause) < 0) return false;
    // Caret on 0.x pins the minor, on 1+ it pins the major.
    return major > 0 ? vMajor === major : vMajor === 0 && vMinor === minor;
  });
}

// The range a release of the dependency needs: the same one when it already admits `version`, else with a `|| ^version`
// clause added. Never moves the lowest version, that is for whoever starts using something newer.
export function admitVersion(range, version) {
  return caretSatisfies(range, version) === false ? `${range} || ^${version}` : range;
}

// The newest changelog entry: `## [X.Y.Z] - Unreleased` or `## [X.Y.Z] - YYYY-MM-DD`.
export function topChangelogEntry(lib) {
  const text = readFileSync(changelogPath(lib), 'utf8');
  const match = /^## \[(\d+\.\d+\.\d+)\] - (Unreleased|\d{4}-\d{2}-\d{2})\s*$/m.exec(text);
  return match ? { version: match[1], released: match[2] !== 'Unreleased', date: match[2] } : null;
}
