import { computed, Directive, inject, input } from '@angular/core';
import { KitDataTable } from './kit-data-table';

/**
 * Marks a header or cell as part of a column the person can hide: `<th kitCol="role">` and
 * `<td kitCol="role">`. It is hidden while the `columns` of the `<kit-data-table>` it is in say
 * so; without `columns` (or for a name they don't define) it is always shown.
 */
@Directive({
  selector: 'th[kitCol], td[kitCol]',
  host: {
    '[attr.hidden]': 'hidden() ? "" : null'
  }
})
export class KitCol {

  readonly #table = inject(KitDataTable);

  /** The column's `id` in the `kitTableColumns()` definitions. */
  readonly id = input.required<string>({ alias: 'kitCol' });

  protected readonly hidden = computed(() => !(this.#table.columns()?.isVisible(this.id()) ?? true));

}
