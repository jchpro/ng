import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideRows3, LucideRows4 } from '@lucide/angular';
import { KitDataTable } from './kit-data-table';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * An icon button for the toolbar that switches the rows of the `<kit-data-table>` it is in
 * between the default and the compact height (the table's `density`). Put it in `kitTableActions`.
 */
@Component({
  selector: 'kit-density-toggle',
  imports: [LucideRows3, LucideRows4],
  templateUrl: './kit-density-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitDensityToggle {

  protected readonly labels = inject(KIT_TABLE_LABELS);
  readonly #table = inject(KitDataTable);

  protected readonly compact = computed(() => this.#table.density() === 'compact');

  protected toggle() {
    this.#table.density.set(this.compact() ? 'default' : 'compact');
  }

}
