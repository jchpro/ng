import { computed, linkedSignal, resource, ResourceRef, Signal } from '@angular/core';
import type { KitTableState } from './kit-table-state';
import { KitTableParams } from './kit-table.types';

/** What a loader answers with: the rows of one page, and how many rows there are across all pages. */
export interface KitPage<T> {
  items: T[];
  total: number;
}

/** The rows of a data table that are loaded page by page, see `kitPagedList()`. */
export interface KitPagedList<T> {
  /** For `<kit-data-table [resource]>`: loading, error and retry. Its `value()` throws while it is in error, use `rows`. */
  resource: ResourceRef<KitPage<T> | undefined>;

  /**
   * The rows of the current page. They stay while the next page loads (so the table doesn't blink empty)
   * and after a load fails (the error state covers them).
   */
  rows: Signal<T[]>;

  /** The number of rows across all pages, from the last page that loaded; `null` until one has. For `<kit-data-table [total]>`. */
  total: Signal<number | null>;

  /** The last load succeeded and found no rows. For `<kit-data-table [empty]>`. */
  empty: Signal<boolean>;

  /**
   * Call it after a row was removed: loads the page again, or the one before it when the removed row was
   * the only one of the last page (that page doesn't exist any more, and the paginator won't go back by itself).
   */
  reloadAfterRemoval(): void;
}

/**
 * The rows of a data table that pages on the server: `loader` is called with the table's `params`
 * whenever the `state` changes. It answers with `{ items, total }`, which fits any API (a total in a
 * header or in the body); `abortSignal` aborts the request of a load that was superseded.
 * Call it in an injection context.
 *
 * ```ts
 * protected readonly state = kitTableState();
 * protected readonly users = kitPagedList(this.state, async ({ page, pageSize, query }, abortSignal) => {
 *   const response = await fetch(`/api/users?page=${page}&size=${pageSize}&q=${query}`, { signal: abortSignal });
 *   return { items: await response.json(), total: Number(response.headers.get('X-Total-Count')) };
 * });
 * ```
 * ```html
 * <kit-data-table [state]="state" [resource]="users.resource" [total]="users.total()" [empty]="users.empty()">
 *   … @for (user of users.rows(); track user.id) …
 * ```
 */
export function kitPagedList<T, F extends object>(
  state: KitTableState<F>,
  loader: (params: KitTableParams<F>, abortSignal: AbortSignal) => Promise<KitPage<T>>
): KitPagedList<T> {
  const list = resource({
    params: () => state.params(),
    loader: ({ params, abortSignal }) => loader(params, abortSignal)
  });
  // Reading the value of a resource in error throws, and while the next page loads it is undefined:
  // either way what the last page gave is kept. A page that is never read has nothing to keep.
  const page = linkedSignal<KitPage<T> | undefined, KitPage<T> | undefined>({
    source: () => list.hasValue() ? list.value() : undefined,
    computation: (value, previous) => value ?? previous?.value
  });
  const rows = computed(() => page()?.items ?? []);
  const total = computed(() => page()?.total ?? null);

  return {
    resource: list,
    rows,
    total,
    empty: computed(() => list.hasValue() && list.value().items.length === 0),
    reloadAfterRemoval() {
      const lastPage = Math.max(1, Math.ceil((total() ?? 0) / state.pageSize()));
      if (rows().length === 1 && state.page() > 1 && state.page() >= lastPage) {
        state.page.update(current => current - 1);
        return;
      }
      list.reload();
    }
  };
}
