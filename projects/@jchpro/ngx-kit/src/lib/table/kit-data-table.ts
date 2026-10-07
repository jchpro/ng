import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model, output } from '@angular/core';
import { LucideCircleAlert, LucideInbox } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KitBusy } from '../loading/kit-busy.directive';
import { KitTableColumns } from './kit-columns';
import { KitTableSelectionLike } from './kit-table-selection';
import { KitTableState } from './kit-table-state';
import { KIT_TABLE_LABELS } from './kit-table-labels';
import { KitTableDensity, KitTableResource, KitTableSort } from './kit-table.types';

/**
 * The frame around a data table: a toolbar, the scroll region for your own `<table class="kit-table">`,
 * and a footer for the paginator. It lays the parts out and shows the loading, empty and error
 * states; the rows and the request are yours.
 *
 * ```html
 * <kit-data-table [state]="state" [resource]="users" [total]="users.value()?.total" [empty]="!users.value()?.items.length">
 *   <div kitTableSearch class="kit-data-table__search"><svg lucideSearch></svg><input kitSearch class="kit-field__control" type="search"></div>
 *   <button kitTableActions class="kit-btn kit-btn--primary">Add</button>
 *
 *   <table class="kit-table">
 *     <thead><tr><th kitSort="name">Name</th></tr></thead>
 *     <tbody>@for (user of users.value()?.items; track user.id) { <tr><td>{{ user.name }}</td></tr> }</tbody>
 *   </table>
 *
 *   <kit-paginator />
 * </kit-data-table>
 * ```
 *
 * Give it a `kitTableState()` and the search input (`kitSearch`), filters (`kitFilter`), sort
 * headers and paginator inside bind to it by themselves. Without one they work on their own
 * bindings: `[(sort)]` here, `[(page)]` on the paginator.
 *
 * Slots, by attribute: `kitTableSearch`, `kitTableFilters` (toolbar, left), `kitTableActions`
 * (toolbar, right), `kitTableBulk` (actions of the bar shown while rows are selected),
 * `kitTableChips` (the applied filters), `kitTableEmpty` (replaces the default empty state, must
 * not be inside an `@if`). A `<kit-paginator>` goes to the footer by itself.
 */
@Component({
  selector: 'kit-data-table',
  imports: [KitBusy, LucideCircleAlert, LucideInbox],
  templateUrl: './kit-data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-data-table',
    '[class.kit-data-table--compact]': 'density() === "compact"',
    '[class.kit-data-table--selecting]': 'selecting()'
  }
})
export class KitDataTable {

  protected readonly labels = inject(KIT_TABLE_LABELS);

  /** The table's `kitTableState()`: the search, filters, sort and paging the parts inside bind to. */
  readonly state = input<KitTableState<object>>();

  /**
   * An `httpResource()` (or anything shaped like one) that loads the rows: while it loads the
   * table shows as loading, if it fails the error state, and "retry" reloads it.
   */
  readonly resource = input<KitTableResource>();

  /** Number of rows across all pages, for the paginator inside; `null` when the API doesn't say. */
  readonly total = input<number | null | undefined>(null);

  /**
   * The sorted column, set by the `kitSort` headers inside; `null` is unsorted. Only used
   * without a `state`, which holds the sort itself.
   */
  readonly sort = model<KitTableSort | null>(null);

  /** While true the table is dimmed under a spinner and can't be reached by pointer or keyboard. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** A message (or `true` for the default) replaces the table with an error and a retry button. */
  readonly error = input<string | boolean | null>(null);

  /** The request succeeded with no rows. Ignored while loading or in error. */
  readonly empty = input(false, { transform: booleanAttribute });

  /**
   * The empty result comes from a search or filters, so the empty state offers to clear them.
   * Follows the `state` by itself.
   */
  readonly filtered = input(false, { transform: booleanAttribute });

  /**
   * The table's `kitTableSelection()`. While it holds rows the toolbar gives way to a bar with
   * the count, a "Clear selection" button and your `kitTableBulk` actions.
   */
  readonly selection = input<KitTableSelectionLike>();

  /** The table's `kitTableColumns()`: which columns the `kitCol` headers and cells show. */
  readonly columns = input<KitTableColumns>();

  /** Row height: `compact` for dense lists. The `<kit-density-toggle>` sets it. */
  readonly density = model<KitTableDensity>('default');

  /** Accessible name of the scroll region. */
  readonly label = input<string>();

  /** The retry button of the error state was pressed (the `resource`, if any, is reloaded too). */
  readonly retry = output<void>();

  /** The "Clear filters" button of the filtered empty state was pressed (the `state`'s are cleared too). */
  readonly clearFilters = output<void>();

  /** The sort in effect: the `state`'s, or this table's own `sort`. */
  readonly activeSort = computed(() => {
    const state = this.state();
    return state ? state.sort() : this.sort();
  });

  protected readonly selecting = computed(() => (this.selection()?.count() ?? 0) > 0);

  protected readonly selectedLabel = computed(() =>
    formatKitLabel(this.labels().bulk.selected, { count: this.selection()?.count() ?? 0 })
  );

  protected readonly isLoading = computed(() => this.loading() || !!this.resource()?.isLoading());

  protected readonly errorMessage = computed(() => {
    const error = this.error();
    return typeof error === 'string' ? error : null;
  });

  protected readonly viewState = computed<'error' | 'empty' | 'filtered' | null>(() => {
    if (this.error() || this.#resourceFailed()) {
      return 'error';
    }
    if (!this.empty() || this.isLoading()) {
      return null;
    }
    return this.filtered() || this.state()?.filtered() ? 'filtered' : 'empty';
  });

  /** Called by `KitSort`: sets the sort on the `state`, or on this table's own `sort`. */
  setSort(sort: KitTableSort | null) {
    const state = this.state();
    if (state) {
      state.sort.set(sort);
      return;
    }
    this.sort.set(sort);
  }

  protected onClearSelection() {
    this.selection()?.clear();
  }

  protected onRetry() {
    this.resource()?.reload();
    this.retry.emit();
  }

  protected onClearFilters() {
    this.state()?.clearFilters();
    this.clearFilters.emit();
  }

  /** A failed resource, unless it is loading again (a retry clears the error screen at once). */
  #resourceFailed(): boolean {
    const resource = this.resource();
    return !!resource && !resource.isLoading() && !!resource.error();
  }

}
