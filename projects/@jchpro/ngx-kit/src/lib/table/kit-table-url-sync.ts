import { effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import type { KitTableState } from './kit-table-state';

/** How many of our own navigations to remember, to tell their echo from a navigation by someone else. */
const REMEMBERED_NAVIGATIONS = 8;

/**
 * Keeps `state` and the query string of the current route in step, both ways. The URL is
 * written with `replaceUrl`, so typing in the search or paging doesn't fill the history; the back
 * button leaves the page, and a navigation from outside (a link with query params, a shared
 * URL) is applied to the state.
 *
 * Needs an injection context under a route; `kitTableState({ urlSync })` calls it.
 */
export function syncKitTableWithUrl(state: KitTableState<object>, prefix: string) {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const queryParams = toSignal(route.queryParamMap, { requireSync: true });
  const names = state.urlParamNames(prefix);
  const pushed: string[] = [];

  const serialize = (get: (name: string) => string | null | undefined) => JSON.stringify(names.map(name => get(name) ?? null));

  // URL -> state. Skipped for the echo of what the state itself navigated to: while typing,
  // an older echo arriving late would overwrite newer input.
  effect(() => {
    const map: ParamMap = queryParams();
    untracked(() => {
      const key = serialize(name => map.get(name));
      const echo = pushed.indexOf(key);
      if (echo >= 0) {
        pushed.splice(echo, 1);
        return;
      }
      pushed.length = 0;
      state.applyUrlParams(name => map.get(name), prefix);
    });
  });

  // State -> URL.
  effect(() => {
    const target = state.toUrlParams(prefix);
    untracked(() => {
      const current = serialize(name => queryParams().get(name));
      const next = serialize(name => target[name]);
      if (current === next) {
        return;
      }
      pushed.push(next);
      pushed.splice(0, pushed.length - REMEMBERED_NAVIGATIONS);
      router.navigate([], {
        relativeTo: route,
        queryParams: target,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  });
}
