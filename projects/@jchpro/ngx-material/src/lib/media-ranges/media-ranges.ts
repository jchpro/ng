import { Breakpoints } from '@angular/cdk/layout';

/**
 * Media ranges configuration, key is your range alias, value is the list of queries.
 */
export type MediaRangesConfig = Record<string, readonly string[]>;

/**
 * Media ranges based on CDK breakpoints:
 *  - xs: < XSmall
 *  - md: Small + Medium
 *  - lg: > Large + XLarge
 */
export const simpleMediaRanges3 = {
  sm: [Breakpoints.XSmall],
  md: [Breakpoints.Small, Breakpoints.Medium],
  lg: [Breakpoints.Large, Breakpoints.XLarge],
} as const satisfies MediaRangesConfig;

/**
 * Media ranges based on CDK breakpoints:
 *  - sm: < XSmall
 *  - md: XSmall + Small
 *  - lg: Large
 *  - xl: > XLarge
 */
export const simpleMediaRanges4 = {
  sm: [Breakpoints.XSmall],
  md: [Breakpoints.Small, Breakpoints.Medium],
  lg: [Breakpoints.Large],
  xl: [Breakpoints.XLarge]
} as const satisfies MediaRangesConfig;

/**
 * Media ranges based on CDK breakpoints, mapped 1 to 1:
 *  - xs: < XSmall
 *  - sm: Small
 *  - md: Medium
 *  - lg: Large
 *  - xl: > XLarge
 */
export const simpleMediaRanges5 = {
  xs: [Breakpoints.XSmall],
  sm: [Breakpoints.Small],
  md: [Breakpoints.Medium],
  lg: [Breakpoints.Large],
  xl: [Breakpoints.XLarge]
} as const satisfies MediaRangesConfig;
