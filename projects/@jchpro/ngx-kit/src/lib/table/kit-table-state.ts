import { computed, DestroyRef, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { syncKitTableWithUrl } from './kit-table-url-sync';
import { KitTableFilters, KitTableParams, KitTableSort, KitTableStateOptions } from './kit-table.types';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SEARCH_DEBOUNCE = 300;

/** A filter that is currently narrowing the rows. */
export interface KitTableActiveFilter {
  key: string;
  value: unknown;
}

/**
 * The state of one data table: the search text, the filters, the sort and the page, as signals,
 * and `params` — everything a request for a page of rows depends on. Create it with
 * `kitTableState()`; pass it to `<kit-data-table [state]>` and the search input, filters, sort
 * headers and paginator inside bind themselves.
 *
 * Whatever narrows or reorders the rows (search, filters, sort, page size) takes the table back to
 * page 1. The state holds no rows and makes no request: feed `params` to your API.
 */
export class KitTableState<F extends object = KitTableFilters> {

  readonly #defaultFilters: F;
  readonly #defaultSort: KitTableSort | null;
  readonly #defaultPageSize: number;
  readonly #debounce: number;
  #searchTimer: ReturnType<typeof setTimeout> | undefined;

  /** What the search input shows: updates with every keystroke. */
  readonly searchText = signal('');

  /** The search that counts: `searchText` trimmed, after the debounce. Use this one in requests. */
  readonly query = signal('');

  readonly filters: WritableSignal<F>;
  readonly sort: WritableSignal<KitTableSort | null>;
  readonly pageSize: WritableSignal<number>;

  /** 1-based. Goes back to 1 whenever the query, a filter, the sort or the page size changes. */
  readonly page: WritableSignal<number>;

  /** Everything the rows depend on. Changes whenever any of it does: feed it to a `resource()`. */
  readonly params: Signal<KitTableParams<F>>;

  /** Rows to skip for the current page, for APIs that page by offset. */
  readonly offset: Signal<number>;

  /** The filters that are not "empty" (`null`, `undefined` or `''`), e.g. to render a chip each. */
  readonly activeFilters: Signal<KitTableActiveFilter[]>;

  /** Whether the search or any filter is narrowing the rows. */
  readonly filtered: Signal<boolean>;

  constructor(options: KitTableStateOptions<F> = {}, destroyRef?: DestroyRef) {
    this.#defaultFilters = options.filters ?? ({} as F);
    this.#defaultSort = options.sort ?? null;
    this.#defaultPageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    this.#debounce = options.searchDebounce ?? DEFAULT_SEARCH_DEBOUNCE;

    this.filters = signal(this.#defaultFilters);
    this.sort = signal(this.#defaultSort);
    this.pageSize = signal(this.#defaultPageSize);
    this.page = linkedSignal({
      source: () => [this.query(), this.filters(), this.sort(), this.pageSize()],
      computation: () => 1
    });

    this.params = computed(() => ({
      query: this.query(),
      filters: this.filters(),
      sort: this.sort(),
      page: this.page(),
      pageSize: this.pageSize()
    }));
    this.offset = computed(() => (this.page() - 1) * this.pageSize());
    this.activeFilters = computed(() => Object.entries(this.filters())
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({ key, value }))
    );
    this.filtered = computed(() => this.query() !== '' || this.activeFilters().length > 0);

    destroyRef?.onDestroy(() => this.#clearSearchTimer());
  }

  /**
   * The search input's text changed. `searchText` follows at once, `query` after the debounce
   * (at once for an empty text, so clearing the box is instant).
   */
  search(text: string) {
    this.searchText.set(text);
    this.#clearSearchTimer();
    if (this.#debounce <= 0 || text.trim() === '') {
      this.query.set(text.trim());
      return;
    }
    this.#searchTimer = setTimeout(() => this.query.set(text.trim()), this.#debounce);
  }

  /** Apply the search text now, without waiting for the debounce (e.g. on Enter). */
  flushSearch() {
    this.#clearSearchTimer();
    this.query.set(this.searchText().trim());
  }

  /** Sets one filter. `''` and `null` both mean "not filtering" and are stored as `null`. */
  setFilter<K extends keyof F>(key: K, value: F[K] | '') {
    const stored = (value === '' ? null : value) as F[K];
    this.filters.update(filters => ({ ...filters, [key]: stored }));
  }

  /** Empties the search and every filter. The sort and page size stay. */
  clearFilters() {
    this.#clearSearchTimer();
    this.searchText.set('');
    this.query.set('');
    this.resetFilters();
  }

  /** Empties every filter but not the search, e.g. for a "Reset" inside a filters popover. */
  resetFilters() {
    this.filters.update(filters => Object.fromEntries(Object.keys(filters).map(key => [key, null])) as F);
  }

  /** Empties one filter by name, e.g. from the chip of an applied filter (`activeFilters` keys are plain strings). */
  clearFilter(key: string) {
    this.filters.update(filters => key in filters ? { ...filters, [key]: null } : filters);
  }

  /** The query-string names this state uses under `prefix`, in a fixed order. */
  urlParamNames(prefix = ''): string[] {
    return [...['q', 'sort', 'page', 'size'].map(name => prefix + name), ...Object.keys(this.#defaultFilters).map(name => prefix + name)];
  }

  /**
   * The state as query-string values, left out (`null`) when equal to the starting state so a
   * fresh table has a clean URL. A value that was cleared but starts non-empty is written as an
   * explicit empty one (`sort=none`, `status=`), so the choice survives a reload.
   */
  toUrlParams(prefix = ''): Record<string, string | null> {
    const params: Record<string, string | null> = {
      [prefix + 'q']: this.query() || null,
      [prefix + 'sort']: this.#sortToUrl(),
      [prefix + 'page']: this.page() > 1 ? String(this.page()) : null,
      [prefix + 'size']: this.pageSize() === this.#defaultPageSize ? null : String(this.pageSize())
    };
    const filters = this.filters() as Record<string, unknown>;
    const defaults = this.#defaultFilters as Record<string, unknown>;
    for (const key of Object.keys(defaults)) {
      const value = emptyToNull(filters[key]);
      const initial = emptyToNull(defaults[key]);
      params[prefix + key] = value === initial ? null : value === null ? '' : String(value);
    }
    return params;
  }

  /**
   * Takes the state from query-string values (a missing one means the starting value). Only
   * writes what differs, so applying the state's own URL back changes nothing.
   */
  applyUrlParams(get: (name: string) => string | null, prefix = '') {
    const query = get(prefix + 'q') ?? '';
    const sort = this.#sortFromUrl(get(prefix + 'sort'));
    const size = Number(get(prefix + 'size'));
    const pageSize = Number.isInteger(size) && size > 0 ? size : this.#defaultPageSize;
    const page = Number(get(prefix + 'page'));

    const defaults = this.#defaultFilters as Record<string, unknown>;
    const filters: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      const raw = get(prefix + key);
      filters[key] = raw === null ? defaults[key] : raw === '' ? null : parseLike(raw, defaults[key]);
    }

    this.#clearSearchTimer();
    if (this.query() !== query) {
      this.query.set(query);
    }
    if (this.searchText().trim() !== query) {
      this.searchText.set(query);
    }
    if (JSON.stringify(this.sort()) !== JSON.stringify(sort)) {
      this.sort.set(sort);
    }
    if (this.pageSize() !== pageSize) {
      this.pageSize.set(pageSize);
    }
    if (JSON.stringify(this.filters()) !== JSON.stringify(filters)) {
      this.filters.set(filters as F);
    }
    // Last: setting any of the above sends the page back to 1.
    const nextPage = Number.isInteger(page) && page > 1 ? page : 1;
    if (this.page() !== nextPage) {
      this.page.set(nextPage);
    }
  }

  #sortToUrl(): string | null {
    const sort = this.sort();
    if (JSON.stringify(sort) === JSON.stringify(this.#defaultSort)) {
      return null;
    }
    if (!sort) {
      return 'none';
    }
    return (sort.direction === 'desc' ? '-' : '') + sort.field;
  }

  #sortFromUrl(value: string | null): KitTableSort | null {
    if (value === null || value === '') {
      return this.#defaultSort;
    }
    if (value === 'none') {
      return null;
    }
    return value.startsWith('-') ? { field: value.slice(1), direction: 'desc' } : { field: value, direction: 'asc' };
  }

  #clearSearchTimer() {
    clearTimeout(this.#searchTimer);
    this.#searchTimer = undefined;
  }

}

function emptyToNull(value: unknown): unknown {
  return value === undefined || value === '' ? null : value;
}

/** A query-string value as the type of the filter's starting value: a number, a boolean, or the string. */
function parseLike(raw: string, initial: unknown): unknown {
  if (typeof initial === 'number') {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? initial : parsed;
  }
  if (typeof initial === 'boolean') {
    return raw === 'true';
  }
  return raw;
}

/**
 * Creates the state of a data table, see `KitTableState`. Call it in an injection context (a
 * field of a component, say).
 *
 * ```ts
 * protected readonly state = kitTableState({
 *   pageSize: 25,
 *   sort: { field: 'name', direction: 'asc' },
 *   filters: { role: null as string | null },
 *   urlSync: true
 * });
 * protected readonly users = httpResource<Page<User>>(() => ({ url: '/api/users', params: toApi(this.state.params()) }));
 * ```
 */
export function kitTableState<F extends object = KitTableFilters>(options: KitTableStateOptions<F> = {}): KitTableState<F> {
  const state = new KitTableState<F>(options, inject(DestroyRef));
  if (options.urlSync) {
    syncKitTableWithUrl(state, typeof options.urlSync === 'object' ? options.urlSync.prefix ?? '' : '');
  }
  return state;
}
