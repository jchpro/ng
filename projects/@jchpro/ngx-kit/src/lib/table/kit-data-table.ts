import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model, output } from '@angular/core';
import { LucideCircleAlert, LucideInbox } from '@lucide/angular';
import { KitBusy } from '../loading/kit-busy.directive';
import { KIT_TABLE_LABELS } from './kit-table-labels';
import { KitTableSort } from './kit-table.types';

/**
 * The frame around a data table: a toolbar, the scroll region for your own `<table class="kit-table">`,
 * and a footer for the paginator. It lays the parts out and shows the loading, empty and error
 * states; the rows, the request and the paging are yours.
 *
 * ```html
 * <kit-data-table [loading]="busy()" [empty]="!rows().length" [(sort)]="sort">
 *   <div kitTableSearch class="kit-data-table__search">…</div>
 *   <button kitTableActions class="kit-btn kit-btn--primary">Add</button>
 *
 *   <table class="kit-table">
 *     <thead><tr><th kitSort="name">Name</th></tr></thead>
 *     <tbody>@for (row of rows(); track row.id) { <tr><td>{{ row.name }}</td></tr> }</tbody>
 *   </table>
 *
 *   <kit-paginator [total]="total()" [(page)]="page" [(pageSize)]="pageSize" />
 * </kit-data-table>
 * ```
 *
 * Slots, by attribute: `kitTableSearch`, `kitTableFilters` (toolbar, left), `kitTableActions`
 * (toolbar, right), `kitTableChips` (the applied filters), `kitTableEmpty` (replaces the default
 * empty state). A `<kit-paginator>` goes to the footer by itself.
 */
@Component({
  selector: 'kit-data-table',
  imports: [KitBusy, LucideCircleAlert, LucideInbox],
  templateUrl: './kit-data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-data-table'
  }
})
export class KitDataTable {

  protected readonly labels = inject(KIT_TABLE_LABELS);

  /** The sorted column, set by the `kitSort` headers inside; `null` is unsorted. */
  readonly sort = model<KitTableSort | null>(null);

  /** While true the table is dimmed under a spinner and can't be reached by pointer or keyboard. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** A message (or `true` for the default) replaces the table with an error and a retry button. */
  readonly error = input<string | boolean | null>(null);

  /** The request succeeded with no rows. Ignored while loading or in error. */
  readonly empty = input(false, { transform: booleanAttribute });

  /** The empty result comes from a search or filters, so the empty state offers to clear them. */
  readonly filtered = input(false, { transform: booleanAttribute });

  /** Accessible name of the scroll region. */
  readonly label = input<string>();

  /** The retry button of the error state was pressed. */
  readonly retry = output<void>();

  /** The "Clear filters" button of the filtered empty state was pressed. */
  readonly clearFilters = output<void>();

  protected readonly errorMessage = computed(() => {
    const error = this.error();
    return typeof error === 'string' ? error : null;
  });

  protected readonly state = computed<'error' | 'empty' | 'filtered' | null>(() => {
    if (this.error()) {
      return 'error';
    }
    if (!this.empty() || this.loading()) {
      return null;
    }
    return this.filtered() ? 'filtered' : 'empty';
  });

}
