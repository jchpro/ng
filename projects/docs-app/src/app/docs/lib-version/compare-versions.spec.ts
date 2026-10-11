import { compareVersions } from './compare-versions';

describe('compareVersions', () => {

  it('should be zero for equal versions', () => {
    expect(compareVersions('0.5.0', '0.5.0')).toBe(0);
  });

  it('should compare numerically, not as text', () => {
    expect(compareVersions('0.10.0', '0.9.0')).toBeGreaterThan(0);
    expect(compareVersions('0.9.0', '0.10.0')).toBeLessThan(0);
  });

  it('should order by major, then minor, then patch', () => {
    expect(compareVersions('1.0.0', '0.99.99')).toBeGreaterThan(0);
    expect(compareVersions('0.5.1', '0.5.0')).toBeGreaterThan(0);
  });

});
