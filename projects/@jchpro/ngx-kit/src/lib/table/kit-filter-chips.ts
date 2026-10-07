import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KitDataTable } from './kit-data-table';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * The applied filters of a `<kit-data-table [state]>` as chips, one per filter, each removing
 * its filter, plus a "Clear all". Nothing is drawn while no filter is applied. Put it in the
 * `kitTableChips` slot; `labels` gives each filter the name it shows.
 *
 * ```html
 * <kit-filter-chips kitTableChips [labels]="{ role: 'Role', status: 'Status' }" />
 * ```
 *
 * The chip shows the filter's value as it is stored; `formatValue` turns it into something
 * readable (a code into its name, say). The search text is not a filter and gets no chip.
 */
@Component({
  selector: 'kit-filter-chips',
  imports: [LucideX],
  templateUrl: './kit-filter-chips.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-filter-chips'
  }
})
export class KitFilterChips {

  protected readonly tableLabels = inject(KIT_TABLE_LABELS);
  readonly #table = inject(KitDataTable);

  /** The name to show for each filter, by the filter's name in the state; the name itself if missing. */
  readonly labels = input<Readonly<Record<string, string>>>({});

  /** The text to show for a filter's value; `String(value)` by default. */
  readonly formatValue = input<(name: string, value: unknown) => string>((_name, value) => String(value));

  protected readonly chips = computed(() => (this.#table.state()?.activeFilters() ?? []).map(filter => {
    const text = `${this.labels()[filter.key] ?? filter.key}: ${this.formatValue()(filter.key, filter.value)}`;
    return {
      key: filter.key,
      text,
      removeLabel: formatKitLabel(this.tableLabels().toolbar.removeFilter, { filter: text })
    };
  }));

  protected remove(key: string) {
    this.#table.state()?.clearFilter(key);
  }

  protected clearAll() {
    this.#table.state()?.resetFilters();
  }

}
