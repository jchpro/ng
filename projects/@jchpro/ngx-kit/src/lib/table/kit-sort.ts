import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideArrowDown, LucideArrowUp, LucideArrowUpDown } from '@lucide/angular';
import { KitDataTable } from './kit-data-table';
import { KitSortDirection } from './kit-table.types';

/**
 * A sortable column header: `<th kitSort="name">Name</th>`, inside a `<kit-data-table>`. The
 * label becomes a button, and `aria-sort` follows the table's `sort`. Clicking sorts by this
 * column ascending, then descending, then (with `cycle`) not at all.
 *
 * It only records the choice, in the table's `state` (or its `sort` without one); sorting the rows,
 * locally or by asking the API, is yours.
 */
@Component({
  selector: 'th[kitSort]',
  imports: [LucideArrowDown, LucideArrowUp, LucideArrowUpDown],
  templateUrl: './kit-sort.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-sort]': 'ariaSort()'
  }
})
export class KitSort {

  readonly #table = inject(KitDataTable);

  /** The column name, as your API's sort parameter expects it. */
  readonly field = input.required<string>({ alias: 'kitSort' });

  /** A third click clears the sort instead of going back to ascending. */
  readonly cycle = input(false, { transform: booleanAttribute });

  protected readonly direction = computed<KitSortDirection | null>(() => {
    const sort = this.#table.activeSort();
    return sort?.field === this.field() ? sort.direction : null;
  });

  protected readonly ariaSort = computed(() => {
    const direction = this.direction();
    if (!direction) {
      return 'none';
    }
    return direction === 'asc' ? 'ascending' : 'descending';
  });

  protected toggle() {
    const field = this.field();
    const direction = this.direction();
    if (direction === null) {
      this.#table.setSort({ field, direction: 'asc' });
      return;
    }
    if (direction === 'asc') {
      this.#table.setSort({ field, direction: 'desc' });
      return;
    }
    this.#table.setSort(this.cycle() ? null : { field, direction: 'asc' });
  }

}
