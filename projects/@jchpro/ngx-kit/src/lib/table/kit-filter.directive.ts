import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';
import { KitDataTable } from './kit-data-table';
import { KitTableState } from './kit-table-state';

/**
 * Binds a native `<select>` (or input) to one filter of the `state` of the `<kit-data-table>` it
 * is in: the control shows `state.filters()[name]` and a change sets it. An option with value
 * `""` is "no filter". Values from a native control are strings.
 *
 * ```html
 * <div kitTableFilters class="kit-data-table__filters">
 *   <select kitFilter="role" class="kit-field__control" aria-label="Role">
 *     <option value="">All roles</option>
 *     <option value="admin">Admin</option>
 *   </select>
 * </div>
 * ```
 */
@Directive({
  selector: 'select[kitFilter], input[kitFilter]',
  host: {
    '(change)': 'onChange()'
  }
})
export class KitFilter {

  readonly #table = inject(KitDataTable);
  readonly #element = inject<ElementRef<HTMLSelectElement | HTMLInputElement>>(ElementRef).nativeElement;

  /** The filter's name in the state's `filters`. */
  readonly name = input.required<string>({ alias: 'kitFilter' });

  constructor() {
    // After render: a select's options are rendered after the select itself, and `value` only
    // sticks once the option it names exists.
    afterRenderEffect(() => {
      const value = (this.#table.state()?.filters() as Record<string, unknown> | undefined)?.[this.name()];
      this.#element.value = value === null || value === undefined ? '' : String(value);
    });
  }

  protected onChange() {
    const state = this.#table.state() as KitTableState<Record<string, unknown>> | undefined;
    state?.setFilter(this.name(), this.#element.value);
  }

}
