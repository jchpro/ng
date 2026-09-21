import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, startWith } from 'rxjs';

const MEDIA_RANGES = {
  sm: [Breakpoints.XSmall],
  md: [Breakpoints.Small, Breakpoints.Medium],
  lg: [Breakpoints.Large],
  xl: [Breakpoints.XLarge]
} as const;

type MediaRange = keyof typeof MEDIA_RANGES;

@Injectable({
  providedIn: 'root',
})
export class MediaRangesService {

  #breakpointObserver = inject(BreakpointObserver);

  /**
   * Like `observeState` but returns Signal.
   */
  signalState(range: MediaRange | readonly MediaRange[]): Signal<boolean> {
    return toSignal(this.#observeState(range), { requireSync: true });
  }

  #observeState(range: MediaRange | readonly MediaRange[]): Observable<boolean> {
    const queries = this.#mapToQueries(range);
    return this.#breakpointObserver.observe(queries)
      .pipe(
        map(s => s.matches),
        startWith(this.#breakpointObserver.isMatched(queries))
      );
  }

  #mapToQueries(range: MediaRange | readonly MediaRange[]): string[] {
    const ranges: readonly MediaRange[] = Array.isArray(range) ? range : [range];
    const uniqueRanges = Array.from(new Set(ranges));
    return uniqueRanges.map(r => MEDIA_RANGES[r]).flatMap(c => c);
  }

}
