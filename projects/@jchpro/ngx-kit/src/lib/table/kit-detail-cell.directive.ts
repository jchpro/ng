import { afterRenderEffect, Directive, ElementRef, inject } from '@angular/core';
import { KitDataTable } from './kit-data-table';

/**
 * The cell of a detail row, `<td kitDetail>`: it spans every column that is shown, and follows
 * the table's `columns` when the person hides or shows one. Put it in a
 * `<tr class="kit-table__detail">` under the row it belongs to.
 *
 * ```html
 * @if (expansion.isExpanded(user)) {
 *   <tr class="kit-table__detail"><td kitDetail>…</td></tr>
 * }
 * ```
 */
@Directive({
  selector: 'td[kitDetail]'
})
export class KitDetailCell {

  readonly #table = inject(KitDataTable, { optional: true });
  readonly #cell = inject<ElementRef<HTMLTableCellElement>>(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect(() => {
      // Read so a column shown or hidden runs this again, after the header has updated.
      this.#table?.columns()?.hidden();
      const header = this.#cell.closest('table')?.tHead?.rows[0];
      const shown = header ? Array.from(header.cells).filter(cell => !cell.hidden).length : 1;
      this.#cell.colSpan = Math.max(1, shown);
    });
  }

}
