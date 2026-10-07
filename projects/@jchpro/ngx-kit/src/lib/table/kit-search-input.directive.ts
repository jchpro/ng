import { computed, Directive, inject } from '@angular/core';
import { KitDataTable } from './kit-data-table';

/**
 * Binds a native search input to the `state` of the `<kit-data-table>` it is in: the box shows
 * `state.searchText`, typing calls `state.search()` (which debounces) and Enter applies the
 * search at once. Put it on the input inside the `kitTableSearch` element.
 *
 * ```html
 * <div kitTableSearch class="kit-data-table__search">
 *   <svg lucideSearch></svg>
 *   <input kitSearch class="kit-field__control" type="search" aria-label="Search users">
 * </div>
 * ```
 */
@Directive({
  selector: 'input[kitSearch]',
  host: {
    '[value]': 'text()',
    '(input)': 'onInput($event)',
    '(keydown.enter)': 'onEnter()'
  }
})
export class KitSearchInput {

  readonly #table = inject(KitDataTable);

  protected readonly text = computed(() => this.#table.state()?.searchText() ?? '');

  protected onInput(event: Event) {
    this.#table.state()?.search((event.target as HTMLInputElement).value);
  }

  protected onEnter() {
    this.#table.state()?.flushSearch();
  }

}
