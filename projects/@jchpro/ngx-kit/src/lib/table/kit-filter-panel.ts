import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideListFilter } from '@lucide/angular';
import { KitDataTable } from './kit-data-table';
import { KitPopover } from './kit-popover';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * The "Filters" button of a toolbar with more filters than fit inline: it opens a panel holding
 * the filter controls you put inside, with a count of the filters applied on the button and a
 * "Reset filters" at the bottom (of those filters only, when `filters` names them). For up to
 * three simple filters, put the selects straight in `kitTableFilters` instead.
 *
 * ```html
 * <kit-filter-panel kitTableFilters [filters]="['status', 'plan']">
 *   <div class="kit-field">
 *     <label class="kit-field__label" for="status">Status</label>
 *     <select id="status" kitFilter="status" class="kit-field__control">…</select>
 *   </div>
 * </kit-filter-panel>
 * ```
 *
 * In a `<kit-data-table [state]>` the controls bind with `kitFilter` and the button counts the
 * state's applied filters (`filters` limits the count to the ones inside the panel, when others
 * sit inline).
 */
@Component({
  selector: 'kit-filter-panel',
  imports: [KitPopover, LucideListFilter],
  templateUrl: './kit-filter-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitFilterPanel {

  protected readonly labels = inject(KIT_TABLE_LABELS);
  readonly #table = inject(KitDataTable, { optional: true });

  /** The names of the filters in the panel, to count only those on the button. Default: all. */
  readonly filters = input<readonly string[]>();

  protected readonly open = signal(false);

  protected readonly applied = computed(() => {
    const names = this.filters();
    const active = this.#table?.state()?.activeFilters() ?? [];
    return names ? active.filter(filter => names.includes(filter.key)).length : active.length;
  });

  /** Resets the panel's own filters (`filters`), or all of them when none are named. */
  protected reset() {
    const state = this.#table?.state();
    const names = this.filters();
    if (!names) {
      state?.resetFilters();
      return;
    }
    names.forEach(name => state?.clearFilter(name));
  }

}
