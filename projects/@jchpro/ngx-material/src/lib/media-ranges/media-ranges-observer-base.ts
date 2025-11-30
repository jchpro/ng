import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, startWith } from 'rxjs';
import { MediaRangesConfig } from './media-ranges';

/**
 * Base class for media ranges observer. Extends this class and provide your own config.
 *
 * @example
 * ```typescript
 * // It's important to use `const` and `satisfies` to ensure type safety.
 * // You can use predefined ranges like `simpleMediaRanges3` or create your own.
 * const config = {
 *   small: ['(max-width: 599,99px)'], // You can use Breakpoints from CDK layout
 *   large: ['(min-width: 600px)']
 * } as const satisfies MediaRangesConfig;
 *
 * // Pass the config type in the generic and the config itself in the super() call.
 * @Injectable({ providedIn: 'root' })
 * export class MyMediaRangesObserver extends MediaRangesObserverBase<typeof config> {
 *   constructor() {
 *     super(config);
 *   }
 * }
 * ```
 */
export class MediaRangesObserverBase<TConfig extends MediaRangesConfig> {

  protected readonly breakpointObserver = inject(BreakpointObserver);

  constructor(
    protected readonly rangesConfig: TConfig
  ) {
  }

  /**
   * Returns true if any of the passed ranges matches the current viewport.
   */
  isMatched(range: (keyof TConfig) | readonly (keyof TConfig)[]): boolean {
    return this.breakpointObserver.isMatched(this.mapToQueries(range));
  }

  /**
   * Returns observable that emits true if any of the passed ranges matches the current viewport.
   * Note that the observable will emit only future changes, not the current state.
   */
  observeChanges(range: (keyof TConfig) | readonly (keyof TConfig)[]): Observable<boolean> {
    return this.observerQueries(this.mapToQueries(range));
  }

  /**
   * Returns observable that emits true if any of the passed ranges matches the current viewport.
   * Note that the observable will emit the current state and future changes.
   */
  observeState(range: (keyof TConfig) | readonly (keyof TConfig)[]): Observable<boolean> {
    const queries = this.mapToQueries(range);
    return this.observerQueries(queries)
      .pipe(startWith(this.breakpointObserver.isMatched(queries)));
  }

  /**
   * Like `observeState` but returns Signal.
   */
  signalState(range: (keyof TConfig) | readonly (keyof TConfig)[]): Signal<boolean> {
    return toSignal(this.observeState(range), { requireSync: true });
  }

  /**
   * Wrapper around `BreakpointObserver.observe` that returns observable of `BreakpointState.matches`.
   */
  observerQueries(queries: string | readonly string[]): Observable<boolean> {
    return this.breakpointObserver.observe(queries)
       .pipe(map(s => s.matches))
  }

  /**
   * Maps range to media queries from the service config.
   */
  mapToQueries(range: (keyof TConfig) | readonly (keyof TConfig)[]): string[] {
    const uniqueRanges = Array.from(new Set(Array.isArray(range) ? range : [range]));
    return uniqueRanges.map(r => this.rangesConfig[r]).flatMap(c => c);
  }

}
