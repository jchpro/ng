import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, output, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { LucideX } from '@lucide/angular';
import { KIT_FORM_LABELS } from './kit-form-labels';

/** What a native color input shows when nothing is chosen: it can't be empty. */
const BLACK = '#000000';

let nextId = 0;

/**
 * A color that may be left unset. A native `<input type="color">` always has a color, so for an optional one the form
 * can't tell "black" from "nothing chosen". This shows the swatch dimmed with the "not set" text until a color is
 * picked, then the hex value and, when `clearable`, a button that puts it back to unset. The value is `null` when unset.
 *
 * A Signal Forms control (`FormValueControl<string | null>`), so `[formField]` binds a `string | null` field to it:
 *
 * ```html
 * <label class="kit-field__label" for="accent">Accent color</label>
 * <kit-color-field inputId="accent" clearable [formField]="form.accent" />
 * ```
 *
 * A `<label for>` can't point at a custom element, so `inputId` is put on the swatch inside; without a visible label give
 * it an `ariaLabel`. The texts are in `KIT_FORM_LABELS` (`colorField`), `placeholder` replaces the "not set" one.
 */
@Component({
  selector: 'kit-color-field',
  imports: [LucideX],
  template: `
    <input #swatch class="kit-field__control" type="color"
           [class.kit-color-field__input--unset]="unset()"
           [attr.id]="inputId() || null"
           [attr.name]="name() || null"
           [attr.aria-label]="ariaLabel() || null"
           [attr.aria-describedby]="statusId"
           [attr.aria-invalid]="invalid() ? 'true' : null"
           [value]="value() || black"
           [disabled]="disabled() || readonly()"
           (input)="pick($event)"
           (blur)="touch.emit()">
    @if (unset()) {
      <span class="kit-color-field__unset" [id]="statusId">{{ placeholder() ?? labels().colorField.notSet }}</span>
    } @else {
      <span class="kit-color-field__value" [id]="statusId">{{ value() }}</span>
      @if (clearable() && !disabled() && !readonly()) {
        <button type="button" class="kit-btn kit-btn--ghost kit-btn--icon"
                [attr.aria-label]="labels().colorField.clear" [title]="labels().colorField.clear"
                (click)="clear()">
          <svg lucideX size="16"></svg>
        </button>
      }
    }
  `,
  host: {
    'class': 'kit-color-field'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitColorField implements FormValueControl<string | null> {

  /** The color as `#rrggbb`, or `null` while unset (an empty string counts as unset too). */
  readonly value = model<string | null>(null);

  /** Shows a button that clears the color while one is set. */
  readonly clearable = input(false, { transform: (value: boolean | '') => value === '' || value });

  /** The text of an unset color, instead of the "not set" of the labels. */
  readonly placeholder = input<string>();

  /** The `id` of the swatch, for a `<label for>`. */
  readonly inputId = input<string>();

  /** The accessible name of the swatch, when there is no visible label. */
  readonly ariaLabel = input<string>();

  // The rest of the Signal Forms contract, kept in sync by `[formField]`
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly name = input('');
  readonly touch = output<void>();

  protected readonly labels = inject(KIT_FORM_LABELS);
  protected readonly black = BLACK;
  protected readonly statusId = `kit-color-field-status-${nextId++}`;
  protected readonly unset = computed(() => !this.value());

  protected readonly swatchRef = viewChild.required<ElementRef<HTMLInputElement>>('swatch');

  focus(options?: FocusOptions) {
    this.swatchRef().nativeElement.focus(options);
  }

  protected pick(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected clear() {
    this.value.set(null);
    // The button goes with the value, so keep the focus on the control instead of dropping it
    this.focus();
  }

}
