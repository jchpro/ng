import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * Page controls for a table: a page-size select, "1–25 of 340", and previous / next (plus first
 * / last when the total is known). It holds no data, you bind the page and size and load the rows.
 * Pages are 1-based. Changing the page size goes back to page 1.
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

  readonly page = model(1);
  readonly pageSize = model(25);

  /** Number of rows across all pages; `null` when the API doesn't say. */
  readonly total = input<number | null>(null);

  readonly pageSizes = input<readonly number[]>([10, 25, 50, 100]);

  /** Whether there is a page after this one, for when `total` is `null`. */
  readonly hasNext = input(false, { transform: booleanAttribute });

  protected readonly pageCount = computed(() => {
    const total = this.total();
    return total === null ? null : Math.max(1, Math.ceil(total / this.pageSize()));
  });

  /** The offered sizes, plus the current one when it isn't among them. */
  protected readonly sizes = computed(() => {
    const sizes = this.pageSizes();
    const current = this.pageSize();
    return sizes.includes(current) ? sizes : [...sizes, current].sort((a, b) => a - b);
  });

  protected readonly summary = computed(() => {
    const { range, page } = this.labels().paginator;
    const total = this.total();
    if (total === null) {
      return formatKitLabel(page, { page: this.page() });
    }
    const from = total === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
    const to = Math.min(this.page() * this.pageSize(), total);
    return formatKitLabel(range, { from, to, total });
  });

  protected readonly canPrevious = computed(() => this.page() > 1);

  protected readonly canNext = computed(() => {
    const pageCount = this.pageCount();
    return pageCount === null ? this.hasNext() : this.page() < pageCount;
  });

  protected goTo(page: number) {
    this.page.set(page);
  }

  protected setPageSize(event: Event) {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
  }

}
