import { computed, effect, signal, untracked } from '@angular/core';
import type { KitTableState } from './kit-table-state';

/** What `KitDataTable` needs of a selection to show its bar: how many rows, and a way to empty it. */
export interface KitTableSelectionLike {
  count(): number;
  clear(): void;
}

export interface KitTableSelectionOptions {
  /**
   * Empty the selection when the state's search or filters change, so a bulk action never
   * reaches rows the person can no longer see. Paging, sorting and the page size keep it.
   */
  state?: KitTableState<object>;
}

/**
 * The selected rows of a table, kept as the keys of the rows (so a selection survives paging and
 * sorting, and a refreshed row stays selected). Create it with `kitTableSelection()`, bind the
 * row checkboxes to it, and pass it to `<kit-data-table [selection]>` for the bulk-action bar.
 */
export class KitTableSelection<T, K = unknown> {

  readonly #keys = signal<ReadonlySet<K>>(new Set());

  /** The keys of the selected rows. */
  readonly keys = this.#keys.asReadonly();

  /** How many rows are selected, across all pages. */
  readonly count = computed(() => this.#keys().size);

  constructor(private readonly key: (row: T) => K) {
  }

  isSelected(row: T): boolean {
    return this.#keys().has(this.key(row));
  }

  /** Selects or deselects one row; without `selected` it flips it. */
  toggle(row: T, selected = !this.isSelected(row)) {
    this.#update(keys => selected ? keys.add(this.key(row)) : keys.delete(this.key(row)));
  }

  /** Selects the rows, e.g. the ones on the page. */
  select(rows: readonly T[]) {
    this.#update(keys => rows.forEach(row => keys.add(this.key(row))));
  }

  deselect(rows: readonly T[]) {
    this.#update(keys => rows.forEach(row => keys.delete(this.key(row))));
  }

  /** The header checkbox: selects all of `rows`, or, when they all are selected already, deselects them. */
  toggleAll(rows: readonly T[]) {
    if (this.allSelected(rows)) {
      this.deselect(rows);
      return;
    }
    this.select(rows);
  }

  /** Whether every one of `rows` is selected (false for no rows). */
  allSelected(rows: readonly T[]): boolean {
    return rows.length > 0 && rows.every(row => this.isSelected(row));
  }

  /** Whether some but not all of `rows` are selected: the header checkbox's indeterminate state. */
  someSelected(rows: readonly T[]): boolean {
    return !this.allSelected(rows) && rows.some(row => this.isSelected(row));
  }

  clear() {
    if (this.#keys().size) {
      this.#keys.set(new Set());
    }
  }

  #update(change: (keys: Set<K>) => unknown) {
    const keys = new Set(this.#keys());
    change(keys);
    this.#keys.set(keys);
  }

}

/**
 * Creates the selection of a table, see `KitTableSelection`. `key` gives a row's identity, e.g. its id.
 *
 * ```ts
 * protected readonly selection = kitTableSelection((user: User) => user.id, { state: this.state });
 * ```
 *
 * Call it in an injection context when passing a `state`.
 */
export function kitTableSelection<T, K = unknown>(key: (row: T) => K, options: KitTableSelectionOptions = {}): KitTableSelection<T, K> {
  const selection = new KitTableSelection<T, K>(key);
  const state = options.state;
  if (state) {
    effect(() => {
      state.query();
      state.filters();
      untracked(() => selection.clear());
    });
  }
  return selection;
}
