import { computed, Directive, input, WritableSignal } from '@angular/core';

/**
 * One checkbox of a group bound to an array: it is checked while `kitCheckValue` is in the array, and
 * changing it adds the value to the array or removes it. The array is replaced, never mutated.
 *
 * ```html
 * @for (role of roles; track role) {
 *   <label class="kit-check">
 *     <input class="kit-check__input" type="checkbox" [kitCheckGroup]="selected" [kitCheckValue]="role"> {{ role }}
 *   </label>
 * }
 * ```
 *
 * `kitCheckGroup` is any writable signal of an array: a `signal<string[]>()`, or the `value` of a Signal Forms
 * field, `[kitCheckGroup]="form.roles().value"`. Values are compared with `===`.
 */
@Directive({
  selector: 'input[kitCheckGroup]',
  host: {
    '[checked]': 'checked()',
    '(change)': 'onChange($event)'
  }
})
export class KitCheckGroup<T = string> {

  readonly group = input.required<WritableSignal<readonly T[]>>({ alias: 'kitCheckGroup' });
  readonly value = input.required<T>({ alias: 'kitCheckValue' });

  protected readonly checked = computed(() => this.group()().includes(this.value()));

  protected onChange(event: Event) {
    const value = this.value();
    const on = (event.target as HTMLInputElement).checked;
    this.group().update(items => on
      ? items.includes(value) ? items : [...items, value]
      : items.filter(item => item !== value));
  }

}
