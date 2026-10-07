import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KitDataTable } from './kit-data-table';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * Page controls for a table: a page-size select, "1–25 of 340", and previous / next (plus first
 * / last when the total is known). It holds no data, you bind the page and size and load the rows.
 * Pages are 1-based. Changing the page size goes back to page 1.
 *
 * Inside a `<kit-data-table [state]>` it binds to the state's page and page size, and takes `total`
 * from the table, so `<kit-paginator />` is all it needs.
 *
 * ```html
 * <kit-paginator [total]="total()" [(page)]="page" [(pageSize)]="pageSize" />
 * ```
 *
 * For an API that doesn't report a total (cursor paging), leave `total` out and bind `hasNext`:
 * the range gives way to "Page 3" and first / last are hidden.
 */
@Component({
  selector: 'kit-paginator',
  imports: [LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight],
  templateUrl: './kit-paginator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-paginator',
    'role': 'navigation',
    '[attr.aria-label]': 'labels().paginator.navigation'
  }
})
export class KitPaginator {

  protected readonly labels = inject(KIT_TABLE_LABELS);
  readonly #table = inject(KitDataTable, { optional: true });

  readonly page = model(1);
  readonly pageSize = model(25);

  /** Number of rows across all pages; `null` when the API doesn't say. Inside a table, the table's `total` unless set. */
  readonly total = input<number | null>(null);

  readonly pageSizes = input<readonly number[]>([10, 25, 50, 100]);

  /** Whether there is a page after this one, for when `total` is `null`. Inside a table, the table's `hasNext` too. */
  readonly hasNext = input(false, { transform: booleanAttribute });

  /** The page, size and total in effect: the table's state if it has one, else this paginator's own. */
  protected readonly currentPage = computed(() => this.#table?.state()?.page() ?? this.page());
  protected readonly currentSize = computed(() => this.#table?.state()?.pageSize() ?? this.pageSize());
  protected readonly currentTotal = computed(() => this.total() ?? this.#table?.total() ?? null);

  protected readonly pageCount = computed(() => {
    const total = this.currentTotal();
    return total === null ? null : Math.max(1, Math.ceil(total / this.currentSize()));
  });

  /** The offered sizes, plus the current one when it isn't among them. */
  protected readonly sizes = computed(() => {
    const sizes = this.pageSizes();
    const current = this.currentSize();
    return sizes.includes(current) ? sizes : [...sizes, current].sort((a, b) => a - b);
  });

  protected readonly summary = computed(() => {
    const { range, page } = this.labels().paginator;
    const total = this.currentTotal();
    if (total === null) {
      return formatKitLabel(page, { page: this.currentPage() });
    }
    const from = total === 0 ? 0 : (this.currentPage() - 1) * this.currentSize() + 1;
    const to = Math.min(this.currentPage() * this.currentSize(), total);
    return formatKitLabel(range, { from, to, total });
  });

  protected readonly canPrevious = computed(() => this.currentPage() > 1);

  protected readonly canNext = computed(() => {
    const pageCount = this.pageCount();
    return pageCount === null ? this.hasNext() || !!this.#table?.hasNext() : this.currentPage() < pageCount;
  });

  protected goTo(page: number) {
    const state = this.#table?.state();
    if (state) {
      state.page.set(page);
      return;
    }
    this.page.set(page);
  }

  protected setPageSize(event: Event) {
    const size = Number((event.target as HTMLSelectElement).value);
    const state = this.#table?.state();
    if (state) {
      // The state goes back to page 1 by itself when the size changes.
      state.pageSize.set(size);
      return;
    }
    this.pageSize.set(size);
    this.page.set(1);
  }

}
