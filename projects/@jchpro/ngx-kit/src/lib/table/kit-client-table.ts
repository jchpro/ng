import { computed, Signal } from '@angular/core';
import type { KitTableState } from './kit-table-state';
import { KitTableParams } from './kit-table.types';

export interface KitClientTableOptions<T, F extends object> {
  /**
   * The text of a row the search looks in, e.g. `user => [user.name, user.email]`. A row matches
   * when every word of the search is found (anywhere, ignoring case and accents) in that text.
   * Default: no search, the query is ignored.
   */
  search?: (row: T) => string | null | undefined | readonly (string | number | null | undefined)[];

  /**
   * How each filter narrows the rows: `(row, value) => boolean`, called only for a filter that has
   * a value. A filter without one here compares the row's property of the same name with the
   * value (as strings).
   */
  filters?: { [K in keyof F]?: (row: T, value: NonNullable<F[K]>) => boolean };

  /**
   * What to sort by for a column: `{ seats: user => user.seats }`. A column without one sorts by the
   * row's property of the same name. Numbers, dates, booleans and (natural-order, case-insensitive)
   * strings compare as such; empty values go last whichever way it sorts.
   */
  sort?: Record<string, (row: T) => unknown>;
}

/** The rows of the current page, and how many rows match across all pages. */
export interface KitClientTableView<T> {
  rows: T[];
  total: number;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Lower case, accents stripped: "Zażółć" and "zazolc" find each other where Unicode decomposes. */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }
  return collator.compare(String(a), String(b));
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

/**
 * Filters, sorts and pages `rows` the way `params` ask: the same request a server would answer,
 * for data you already have in memory. Pure, so it also works inside a `resource()` loader or
 * a test.
 */
export function applyKitTableParams<T, F extends object>(
  rows: readonly T[],
  params: KitTableParams<F>,
  options: KitClientTableOptions<T, F> = {}
): KitClientTableView<T> {
  let matching = [...rows];

  const words = fold(params.query).split(/\s+/).filter(Boolean);
  const search = options.search;
  if (search && words.length) {
    matching = matching.filter(row => {
      const text = search(row);
      const haystack = fold(Array.isArray(text) ? text.filter(part => !isEmpty(part)).join(' ') : String(text ?? ''));
      return words.every(word => haystack.includes(word));
    });
  }

  for (const [name, value] of Object.entries(params.filters)) {
    if (isEmpty(value)) {
      continue;
    }
    const filter = options.filters?.[name as keyof F] as ((row: T, value: unknown) => boolean) | undefined;
    matching = matching.filter(row => filter
      ? filter(row, value)
      : String((row as Record<string, unknown>)[name]) === String(value));
  }

  const sort = params.sort;
  if (sort) {
    const factor = sort.direction === 'asc' ? 1 : -1;
    const accessor = options.sort?.[sort.field] ?? ((row: T) => (row as Record<string, unknown>)[sort.field]);
    matching.sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (isEmpty(left) || isEmpty(right)) {
        return Number(isEmpty(left)) - Number(isEmpty(right));
      }
      return factor * compareValues(left, right);
    });
  }

  const start = (params.page - 1) * params.pageSize;
  return { rows: matching.slice(start, start + params.pageSize), total: matching.length };
}

/**
 * Filters, sorts and pages an in-memory list by a table's `state`, for a table without a server
 * behind it. The signals follow both the rows and the state.
 *
 * ```ts
 * protected readonly view = kitClientTable(this.users, this.state, {
 *   search: user => [user.name, user.email],
 *   filters: { role: (user, role) => user.role === role }
 * });
 * ```
 * ```html
 * <kit-data-table [state]="state" [total]="view.total()" [empty]="!view.total()"> … @for (user of view.rows(); track user.id) …
 * ```
 */
export function kitClientTable<T, F extends object>(
  rows: Signal<readonly T[]>,
  state: KitTableState<F>,
  options: KitClientTableOptions<T, F> = {}
): { rows: Signal<T[]>; total: Signal<number> } {
  const view = computed(() => applyKitTableParams(rows(), state.params(), options));
  return {
    rows: computed(() => view().rows),
    total: computed(() => view().total)
  };
}
