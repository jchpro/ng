import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { LucideX } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KIT_FORM_LABELS } from './kit-form-labels';

/**
 * A list of short texts: type a value, press Enter, get a removable chip. The value is a `string[]`.
 *
 * ```html
 * <label class="kit-field__label" for="tasks">Tasks</label>
 * <kit-chip-input inputId="tasks" ariaLabel="Tasks" [formField]="form.tasks" />
 * <kit-field-error [field]="form.tasks" />
 * ```
 *
 * - **Adding:** Enter and the comma (`separators`) turn the typed text into a chip. Pasting text with line breaks, or with a
 *   separator in it, adds one chip per piece. The text is trimmed and an empty one is not added. With `addOnBlur` the text left in
 *   the field when it loses the focus is added too, so it isn't lost when the person goes straight for the save button.
 *   An Enter with nothing typed is not taken, so it still submits a form.
 * - **Removing:** a chip's button, or Backspace in an empty field, which removes the last one.
 * - **No validation here.** The list is the form's: a duplicate, a limit on the number of chips, a text that is too long are
 *   validators on the field, shown under the chips by `<kit-field-error>`. The component only trims and drops empty texts,
 *   and never refuses a chip, since one that vanishes without a word is worse than a message. `maxlength` limits what is typed,
 *   a longer piece that is pasted is added as it is.
 * - **Screen readers:** each add and removal is said in a polite live region, the chips are a list, and a chip's button is named
 *   with its text ("Remove Write the intro"). The texts are in `KIT_FORM_LABELS` (`chipInput`).
 *
 * A Signal Forms control (`FormValueControl<string[]>`), so `[formField]` binds a `string[]` field to it; without Signal Forms
 * it is `[(value)]`. A `<label for>` can't point at a custom element, so `inputId` goes on the text field inside.
 */
@Component({
  selector: 'kit-chip-input',
  imports: [LucideX],
  template: `
    <input #field class="kit-field__control" type="text" autocomplete="off"
           [attr.id]="inputId() || null"
           [attr.name]="name() || null"
           [attr.placeholder]="placeholder() || null"
           [attr.maxlength]="maxlength() ?? null"
           [attr.aria-label]="ariaLabel() || null"
           [attr.aria-invalid]="invalid() ? 'true' : null"
           [disabled]="disabled()"
           [readOnly]="readonly()"
           (keydown)="onKeydown($event)"
           (paste)="onPaste($event)"
           (blur)="onBlur()">
    <ul class="kit-chips" role="list" [attr.aria-label]="ariaLabel() || null">
      @for (chip of value(); track $index) {
        <li class="kit-chip">
          {{ chip }}
          @if (!disabled() && !readonly()) {
            <button type="button" class="kit-chip__remove" [attr.aria-label]="removeLabel(chip)" (click)="remove($index)">
              <svg lucideX size="12"></svg>
            </button>
          }
        </li>
      }
    </ul>
    <span class="kit-chip-input__status" role="status">{{ announcement() }}</span>
  `,
  host: {
    'class': 'kit-chip-input'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitChipInput implements FormValueControl<string[]> {

  /** The chips. */
  readonly value = model<string[]>([]);

  /**
   * The keys (`KeyboardEvent.key`) that turn the typed text into a chip, and, when they are one character long, the
   * characters that split a pasted text (line breaks always do). Default Enter and the comma.
   */
  readonly separators = input<readonly string[]>(['Enter', ',']);

  /** Adds the text left in the field when it loses the focus. */
  readonly addOnBlur = input(false, { transform: (value: boolean | '') => value === '' || value });

  readonly placeholder = input<string>();

  /** The most characters that can be typed in one chip. */
  readonly maxlength = input<number>();

  /** The `id` of the text field, for a `<label for>`. */
  readonly inputId = input<string>();

  /** The accessible name of the text field and of the list, when there is no visible label. */
  readonly ariaLabel = input<string>();

  // The rest of the Signal Forms contract, kept in sync by `[formField]`
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly name = input('');
  readonly touch = output<void>();

  protected readonly labels = inject(KIT_FORM_LABELS);
  protected readonly announcement = signal('');

  protected readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(options?: FocusOptions) {
    this.fieldRef().nativeElement.focus(options);
  }

  protected removeLabel(chip: string) {
    return formatKitLabel(this.labels().chipInput.remove, { value: chip });
  }

  protected onKeydown(event: KeyboardEvent) {
    const field = this.fieldRef().nativeElement;
    if (event.isComposing) {
      return;
    }
    if (this.separators().includes(event.key)) {
      if (field.value.trim()) {
        event.preventDefault();
        this.#add([field.value]);
      } else if (event.key !== 'Enter') {
        // Not typed into an empty field either, an Enter is left to submit the form
        event.preventDefault();
      }
    } else if (event.key === 'Backspace' && !field.value && this.value().length) {
      event.preventDefault();
      this.#removeAt(this.value().length - 1);
    }
  }

  protected onPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text') ?? '';
    const characters = this.separators().filter(key => key.length === 1).map(key => key.replace(/[\\\]^-]/g, '\\$&'));
    const pieces = text.split(new RegExp(`[\\r\\n${characters.join('')}]+`));
    if (pieces.length > 1) {
      // Pasted into the text, at the caret or over a selection: what was before it goes with the first piece, what was after it with the last
      event.preventDefault();
      const field = this.fieldRef().nativeElement;
      const before = field.value.slice(0, field.selectionStart ?? field.value.length);
      const after = field.value.slice(field.selectionEnd ?? field.value.length);
      pieces[0] = before + pieces[0];
      pieces[pieces.length - 1] += after;
      this.#add(pieces);
    }
  }

  protected onBlur() {
    const field = this.fieldRef().nativeElement;
    if (this.addOnBlur() && field.value.trim()) {
      this.#add([field.value]);
    }
    this.touch.emit();
  }

  protected remove(index: number) {
    this.#removeAt(index);
    // The button goes with the chip: the focus stays in the control instead of falling to the page
    this.focus();
  }

  #add(texts: string[]) {
    const added = texts.map(text => text.trim()).filter(Boolean);
    this.fieldRef().nativeElement.value = '';
    if (added.length) {
      this.value.update(chips => [...chips, ...added]);
      this.announcement.set(formatKitLabel(this.labels().chipInput.added, { value: added.join(', ') }));
    }
  }

  #removeAt(index: number) {
    const removed = this.value()[index];
    this.value.update(chips => chips.filter((_, i) => i !== index));
    this.announcement.set(formatKitLabel(this.labels().chipInput.removed, { value: removed }));
  }

}
