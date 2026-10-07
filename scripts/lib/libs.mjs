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

// Only the plain `^X.Y.Z` form is used between our own libraries; anything else is flagged, not guessed at.
export function caretSatisfies(range, version) {
  const match = /^\^(\d+\.\d+\.\d+)$/.exec(range);
  if (!match) return null;
  const [major, minor] = match[1].split('.').map(Number);
  const [vMajor, vMinor] = version.split('.').map(Number);
  if (compareSemver(version, match[1]) < 0) return false;
  // Caret on 0.x pins the minor, on 1+ it pins the major.
  return major > 0 ? vMajor === major : vMajor === 0 && vMinor === minor;
}

// The newest changelog entry: `## [X.Y.Z] - Unreleased` or `## [X.Y.Z] - YYYY-MM-DD`.
export function topChangelogEntry(lib) {
  const text = readFileSync(changelogPath(lib), 'utf8');
  const match = /^## \[(\d+\.\d+\.\d+)\] - (Unreleased|\d{4}-\d{2}-\d{2})\s*$/m.exec(text);
  return match ? { version: match[1], released: match[2] !== 'Unreleased', date: match[2] } : null;
}
