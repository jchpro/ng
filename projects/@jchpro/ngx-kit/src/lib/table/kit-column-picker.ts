import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideColumns3 } from '@lucide/angular';
import { KitDataTable } from './kit-data-table';
import { KitPopover } from './kit-popover';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * The "Columns" button of a toolbar: opens a list of checkboxes, one per column of the table's
 * `columns` (`kitTableColumns()`), to show and hide them. Put it in `kitTableActions`, before
 * the primary action. Does nothing outside a `<kit-data-table [columns]>`.
 */
@Component({
  selector: 'kit-column-picker',
  imports: [KitPopover, LucideColumns3],
  templateUrl: './kit-column-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitColumnPicker {

  protected readonly labels = inject(KIT_TABLE_LABELS);
  readonly #table = inject(KitDataTable);

  protected readonly open = signal(false);
  protected readonly columns = computed(() => this.#table.columns());

  protected toggle(id: string) {
    this.columns()?.toggle(id);
  }

}
