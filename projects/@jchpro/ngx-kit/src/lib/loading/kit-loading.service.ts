import { computed, Injectable, signal } from '@angular/core';
import { defer, finalize, isObservable, Observable } from 'rxjs';

/**
 * App-wide "something is loading" state, rendered by `KitShell` as a thin bar at the top edge
 * of the viewport. Counter-based, so overlapping operations keep it on until the last one ends.
 *
 * Feed it manually with `begin()` / `track()`, or opt in to the automatic sources:
 * `kitLoadingInterceptor` (HTTP) and `provideKitNavigationLoading()` (router).
 */
@Injectable({ providedIn: 'root' })
export class KitLoadingService {

  readonly #pending = signal(0);

  /** `true` while at least one operation is in flight. */
  readonly isLoading = computed(() => this.#pending() > 0);

  /**
   * Marks one operation as started. Call the returned function once it's over — calling it
   * again does nothing, so it's safe in `finally` blocks and teardown paths alike.
   */
  begin(): () => void {
    this.#pending.update(count => count + 1);
    let ended = false;
    return () => {
      if (ended) {
        return;
      }
      ended = true;
      this.#pending.update(count => count - 1);
    };
  }

  /**
   * Tracks a promise from now until it settles, or an observable from subscription until it
   * completes, errors or is unsubscribed. The source's value and errors pass through untouched.
   */
  track<T>(source: Promise<T>): Promise<T>;
  track<T>(source: Observable<T>): Observable<T>;
  track<T>(source: Promise<T> | Observable<T>): Promise<T> | Observable<T> {
    if (!isObservable(source)) {
      const done = this.begin();
      return source.finally(done);
    }
    return defer(() => {
      const done = this.begin();
      return source.pipe(finalize(done));
    });
  }

}
