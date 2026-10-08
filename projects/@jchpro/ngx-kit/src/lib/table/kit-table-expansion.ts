import { computed, effect, signal, untracked } from '@angular/core';
import type { KitTableState } from './kit-table-state';

export interface KitTableExpansionOptions {
  /** Only one row open at a time: expanding a row collapses the others. */
  single?: boolean;

  /**
   * Collapse every row when anything the rows depend on changes (the page, the sort, the search,
   * a filter, the page size): the rows are different ones then. Without it the expanded keys
   * stay, and a row that comes back is open again.
   */
  state?: KitTableState<object>;
}

/**
 * Which rows of a table show their detail row. Create it with `kitTableExpansion()`, bind a
 * `<kit-expand-toggle>` per row to it and render the detail `<tr>` under the open ones.
 * Rows are told apart by their key, so a refreshed row stays open.
 */
export class KitTableExpansion<T, K = unknown> {

  readonly #keys = signal<ReadonlySet<K>>(new Set());

  /** The keys of the expanded rows. */
  readonly keys = this.#keys.asReadonly();

  /** How many rows are expanded. */
  readonly count = computed(() => this.#keys().size);

  constructor(private readonly key: (row: T) => K, private readonly single = false) {
  }

  isExpanded(row: T): boolean {
    return this.#keys().has(this.key(row));
  }

  /** Opens or closes one row; without `expanded` it flips it. */
  toggle(row: T, expanded = !this.isExpanded(row)) {
    const key = this.key(row);
    if (expanded) {
      this.#keys.set(this.single ? new Set([key]) : new Set(this.#keys()).add(key));
      return;
    }
    const keys = new Set(this.#keys());
    keys.delete(key);
    this.#keys.set(keys);
  }

  collapseAll() {
    if (this.#keys().size) {
      this.#keys.set(new Set());
    }
  }

}

/**
 * Creates the expanded rows of a table, see `KitTableExpansion`. `key` gives a row's identity, e.g. its id.
 *
 * ```ts
 * protected readonly expansion = kitTableExpansion((user: User) => user.id, { state: this.state });
 * ```
 *
 * Call it in an injection context when passing a `state`.
 */
export function kitTableExpansion<T, K = unknown>(key: (row: T) => K, options: KitTableExpansionOptions = {}): KitTableExpansion<T, K> {
  const expansion = new KitTableExpansion<T, K>(key, options.single);
  const state = options.state;
  if (state) {
    effect(() => {
      state.params();
      untracked(() => expansion.collapseAll());
    });
  }
  return expansion;
}
