import { effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import type { KitTableState } from './kit-table-state';

/** How many of our own navigations to remember, to tell their echo from a navigation by someone else. */
const REMEMBERED_NAVIGATIONS = 8;

/**
 * Keeps `state` and the query string of the current route in step, both ways. By default the URL
 * is written with `replaceUrl`, so typing in the search or paging doesn't fill the history and the
 * back button leaves the page; with `history: 'push'` a change other than the search text adds a
 * history entry. A navigation from outside (a link with query params, the back button, a shared
 * URL) is applied to the state.
 *
 * Needs an injection context under a route; `kitTableState({ urlSync })` calls it.
 */
export function syncKitTableWithUrl(state: KitTableState<object>, prefix: string, history: 'replace' | 'push' = 'replace') {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const queryParams = toSignal(route.queryParamMap, { requireSync: true });
  const names = state.urlParamNames(prefix);
  const pushed: string[] = [];
  const queryName = prefix + 'q';
  let lastTarget: Record<string, string | null> | undefined;

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
      const previous = lastTarget;
      lastTarget = target;
      const current = serialize(name => queryParams().get(name));
      const next = serialize(name => target[name]);
      if (current === next) {
        return;
      }
      pushed.push(next);
      pushed.splice(0, pushed.length - REMEMBERED_NAVIGATIONS);
      // Only the search text changed (typing): never worth a history entry of its own.
      const onlySearch = !!previous && names.every(name => name === queryName || (previous[name] ?? null) === (target[name] ?? null));
      router.navigate([], {
        relativeTo: route,
        queryParams: target,
        queryParamsHandling: 'merge',
        replaceUrl: history === 'replace' || onlySearch
      });
    });
  });
}
