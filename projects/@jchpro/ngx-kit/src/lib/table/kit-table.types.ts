export type KitSortDirection = 'asc' | 'desc';

/** The column a table is sorted by, as `KitDataTable` holds it and `KitSort` headers read and set it. */
export interface KitTableSort {
  /** The `kitSort` name of the column — what your API's sort parameter expects. */
  field: string;
  direction: KitSortDirection;
}

/** Row height of a table. */
export type KitTableDensity = 'default' | 'compact';

/** What a filter can hold. From a native control it is a string; `null` (or `''`) means "not filtering". */
export type KitTableFilterValue = string | number | boolean | null;

/** The default shape of a table's filters: any name, any value. Pass your own type to `kitTableState<F>()`. */
export type KitTableFilters = Record<string, KitTableFilterValue>;

/** Everything a request for a page of rows depends on, as `KitTableState.params` builds it. */
export interface KitTableParams<F extends object = KitTableFilters> {
  /** The applied search text: trimmed, and delayed while the person is still typing. */
  query: string;
  filters: F;
  sort: KitTableSort | null;
  /** 1-based. */
  page: number;
  pageSize: number;
}

/**
 * Anything with a loading flag, an error and a reload, so `KitDataTable` can follow it:
 * an `httpResource()` or `resource()` fits as is.
 */
export interface KitTableResource {
  isLoading(): boolean;
  error(): unknown;
  reload(): unknown;
}

export interface KitTableStateOptions<F extends object = KitTableFilters> {
  /** Rows per page at the start, and what the URL leaves out. Default 25. */
  pageSize?: number;

  /** Sort at the start. Default: none. */
  sort?: KitTableSort | null;

  /** Every filter the table has, with its starting value (`null` for "not filtering"). */
  filters?: F;

  /** Milliseconds the search waits after the last keystroke before it counts. Default 300; 0 applies at once. */
  searchDebounce?: number;

  /**
   * Keep the state in the URL's query string, so a reload, a shared link and the back button
   * all return to the same view. `true` uses the plain names (`q`, `sort`, `page`, `size`, and
   * each filter under its own name); `{ prefix }` puts a prefix before every name, for a second
   * table on the same route. Opt-in: needs the router, and call `kitTableState` in a component
   * (or anything under a route) so it follows that route.
   *
   * `history: 'push'` makes a change of the page, sort, filters or page size a new history
   * entry, so the back button steps back through them; typing in the search still replaces the
   * entry (one per keystroke would bury the page). Default `'replace'`: the URL follows the
   * state without adding to the history.
   */
  urlSync?: boolean | { prefix?: string; history?: 'replace' | 'push' };
}
