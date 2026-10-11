/** Compares plain `X.Y.Z` versions (pre-release suffixes are ignored). Negative when `a` is older than `b`. */
export function compareVersions(a: string, b: string): number {
  const [x, y] = [a, b].map(version => version.split('-')[0].split('.').map(Number));
  for (let i = 0; i < 3; i++) {
    const diff = (x[i] ?? 0) - (y[i] ?? 0);
    if (diff) {
      return diff;
    }
  }
  return 0;
}
