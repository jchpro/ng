import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, Injector, input, linkedSignal,
  model, output, signal, viewChild
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KIT_FORM_LABELS } from './kit-form-labels';

/** One choice of a `<kit-combobox>`: the `value` the control holds, the `label` that is shown, searched and read out. */
export interface KitComboboxOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Below the field, as wide as it is; above it when there is no room. */
const KIT_COMBOBOX_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
];

/** Lower case with the accents stripped, so "zolc" finds "Żółć". `ł` has no decomposition, so it is mapped by hand. */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/gi, 'l').toLowerCase();
}

/** The default `filter`: the query is somewhere in the label, ignoring case and accents. */
export function kitComboboxFilter(option: KitComboboxOption, query: string): boolean {
  return fold(option.label).includes(fold(query.trim()));
}

let nextId = 0;

/**
 * A select with a text field to look the options up: type to narrow the list, pick one. The value is the `value` of the
 * chosen option, `null` while nothing is chosen.
 *
 * ```html
 * <label class="kit-field__label" for="country">Country</label>
 * <kit-combobox inputId="country" [options]="countries" clearable [formField]="form.country" />
 * <kit-field-error [field]="form.country" />
 * ```
 *
 * - **Static options:** `[options]` is the whole list and the component filters it as the person types, with `[filter]`
 *   (default: the query is in the label, ignoring case and accents).
 * - **Lookup on the server:** set `remote`. The component no longer filters; it emits `(search)` with the query, after
 *   `debounce` ms of no typing, and shows whatever the app puts in `[options]`, with `[loading]` while it waits. When the popup
 *   closes after a search, `(search)` emits `''` so the list is whole again next time. The label of the chosen option is
 *   remembered, so it is still shown when a later search no longer lists it. A value set from outside (a saved form) whose
 *   option isn't in `[options]` yet shows no text until it is: put its option in the list, or use `[compareWith]` for objects.
 * - **Keyboard:** the arrows move through the options, Enter chooses, Escape closes and puts the chosen text back, Tab leaves.
 *   While typing the first option is already active, so Enter takes the best match. Home and End stay with the text caret,
 *   as in the WAI-ARIA combobox pattern. With the popup closed, Enter is left to submit a form.
 * - **Never free text:** when the field loses the focus the text goes back to the label of the chosen option; emptied, it clears
 *   the value.
 * - **Screen readers:** the ARIA combobox pattern (`aria-activedescendant`, the focus stays in the text field), and the number
 *   of options is said in a polite live region as the list changes. The texts are in `KIT_FORM_LABELS` (`combobox`).
 *
 * A Signal Forms control (`FormValueControl<T | null>`), so `[formField]` binds a field to it; without Signal Forms it is
 * `[(value)]`. A `<label for>` can't point at a custom element, so `inputId` goes on the text field inside.
 * Needs the overlay styles (`@jchpro/ngx-kit/styles/overlay`) and `styles/combobox`.
 */
@Component({
  selector: 'kit-combobox',
  imports: [CdkConnectedOverlay, LucideCheck, LucideChevronDown, LucideX],
  hostDirectives: [CdkOverlayOrigin],
  template: `
    <input #field class="kit-field__control kit-combobox__input" type="text" role="combobox" autocomplete="off"
           aria-autocomplete="list" aria-haspopup="listbox"
           [attr.id]="inputId() || null"
           [attr.name]="name() || null"
           [attr.placeholder]="placeholder() || null"
           [attr.aria-label]="ariaLabel() || null"
           [attr.aria-expanded]="open()"
           [attr.aria-controls]="open() && visible().length ? listId : null"
           [attr.aria-activedescendant]="activeId()"
           [attr.aria-invalid]="invalid() ? 'true' : null"
           [value]="text()"
           [disabled]="disabled()"
           [readOnly]="readonly()"
           (input)="onInput($event)"
           (keydown)="onKeydown($event)"
           (focus)="selectText()"
           (click)="onClick()"
           (blur)="onBlur()">
    @if (showClear()) {
      <button type="button" class="kit-combobox__button" tabindex="-1"
              [attr.aria-label]="labels().combobox.clear" [title]="labels().combobox.clear"
              (mousedown)="$event.preventDefault()" (click)="clear()">
        <svg lucideX size="16"></svg>
      </button>
    }
    <button type="button" class="kit-combobox__button" tabindex="-1" [disabled]="disabled() || readonly()"
            [attr.aria-label]="labels().combobox.toggle" [title]="labels().combobox.toggle"
            (mousedown)="$event.preventDefault()" (click)="toggle()">
      <svg lucideChevronDown size="16"></svg>
    </button>
    <span class="kit-combobox__status" role="status">{{ announcement() }}</span>
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="origin"
                 [cdkConnectedOverlayOpen]="open()"
                 [cdkConnectedOverlayPositions]="positions"
                 [cdkConnectedOverlayMinWidth]="width()"
                 (overlayOutsideClick)="onOutsideClick($event)"
                 (detach)="close()">
      <div class="kit-combobox__panel" (mousedown)="$event.preventDefault()">
        @if (visible().length) {
          <div class="kit-combobox__list" role="listbox" [id]="listId" [attr.aria-label]="ariaLabel() || null">
            @for (option of visible(); track $index) {
              <div class="kit-combobox__option" role="option"
                   [id]="optionId($index)"
                   [class.kit-combobox__option--active]="$index === activeIndex()"
                   [attr.aria-selected]="isSelected(option)"
                   [attr.aria-disabled]="option.disabled ? 'true' : null"
                   (click)="choose(option)"
                   (mousemove)="activate($index)">
                <span class="kit-combobox__label">{{ option.label }}</span>
                @if (isSelected(option)) {
                  <svg lucideCheck size="16"></svg>
                }
              </div>
            }
          </div>
        }
        @if (loading()) {
          <div class="kit-combobox__message">{{ labels().combobox.loading }}</div>
        } @else if (!visible().length) {
          <div class="kit-combobox__message">{{ labels().combobox.noResults }}</div>
        }
      </div>
    </ng-template>
  `,
  host: {
    'class': 'kit-combobox'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitCombobox<T = unknown> implements FormValueControl<T | null> {

  /** The `value` of the chosen option, `null` while none is. */
  readonly value = model<T | null>(null);

  /** The choices. With `remote` the app replaces them as the `(search)` answers come in. */
  readonly options = input<readonly KitComboboxOption<T>[]>([]);

  /** Whether an option matches what was typed (not used with `remote`). Default: the query is in the label, ignoring case and accents. */
  readonly filter = input<(option: KitComboboxOption<T>, query: string) => boolean>(kitComboboxFilter);

  /** How two values are told equal, for values that are objects. Default `Object.is`. */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);

  /** The app looks the options up: emit `(search)` and show `[options]` as they are, instead of filtering them here. */
  readonly remote = input(false, { transform: (value: boolean | '') => value === '' || value });

  /** Milliseconds without typing before `(search)` emits. */
  readonly debounce = input(250);

  /** Shows "loading" in the popup while the app waits for a search. */
  readonly loading = input(false, { transform: (value: boolean | '') => value === '' || value });

  /** Shows a button that clears the choice while one is made. */
  readonly clearable = input(false, { transform: (value: boolean | '') => value === '' || value });

  readonly placeholder = input<string>();

  /** The `id` of the text field, for a `<label for>`. */
  readonly inputId = input<string>();

  /** The accessible name of the text field and of the list, when there is no visible label. */
  readonly ariaLabel = input<string>();

  /** The typed text, after `debounce` ms, for a `remote` lookup. Empty when the popup closes after a search. */
  readonly search = output<string>();

  // The rest of the Signal Forms contract, kept in sync by `[formField]`
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly name = input('');
  readonly touch = output<void>();

  protected readonly labels = inject(KIT_FORM_LABELS);
  protected readonly origin = inject(CdkOverlayOrigin);
  protected readonly positions = KIT_COMBOBOX_POSITIONS;
  protected readonly listId = `kit-combobox-list-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly width = signal(0);
  protected readonly announcement = signal('');

  /** What the text field shows once a choice is made, and what it goes back to. */
  readonly #chosen = signal<KitComboboxOption<T> | null>(null);
  readonly #chosenLabel = computed(() => {
    const value = this.value();
    if (value === null) {
      return '';
    }
    const same = (option: KitComboboxOption<T>) => this.compareWith()(option.value, value);
    return (this.options().find(same) ?? (this.#chosen() && same(this.#chosen()!) ? this.#chosen() : null))?.label ?? '';
  });

  /** The text in the field: the chosen label until the person types. */
  protected readonly text = linkedSignal(() => this.#chosenLabel());
  /** Whether the person typed since the popup last closed: only then the list is narrowed. */
  readonly #typed = signal(false);

  protected readonly visible = computed(() => {
    const options = this.options();
    if (this.remote() || !this.#typed()) {
      return options;
    }
    const query = this.text();
    const filter = this.filter();
    return options.filter(option => filter(option, query));
  });

  protected readonly showClear = computed(() => this.clearable() && this.value() !== null && !this.disabled() && !this.readonly());
  protected readonly activeId = computed(() => this.open() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null);

  protected readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #document = inject(DOCUMENT);
  readonly #injector = inject(Injector);
  #timer: ReturnType<typeof setTimeout> | undefined;
  /** Whether a `(search)` went out that hasn't been taken back with an empty one. */
  #searched = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.#timer));
    // What a screen reader hears as the list changes: as the person types, and as a search comes back
    effect(() => {
      const count = this.visible().length;
      const { results, noResults } = this.labels().combobox;
      this.announcement.set(!this.open() || this.loading() ? '' : count ? formatKitLabel(results, { count }) : noResults);
    });
  }

  focus(options?: FocusOptions) {
    this.fieldRef().nativeElement.focus(options);
  }

  protected optionId(index: number) {
    return `${this.listId}-option-${index}`;
  }

  protected isSelected(option: KitComboboxOption<T>) {
    const value = this.value();
    return value !== null && this.compareWith()(option.value, value);
  }

  protected onInput(event: Event) {
    this.text.set((event.target as HTMLInputElement).value);
    this.#typed.set(true);
    this.#open();
    if (this.remote()) {
      this.#scheduleSearch();
    }
    this.#activateFirst();
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.#open();
          this.#activateSelectedOrFirst();
        } else {
          this.#move(event.key === 'ArrowDown' ? 1 : -1);
        }
        break;
      }
      case 'Enter': {
        const option = this.open() ? this.visible()[this.activeIndex()] : undefined;
        if (option) {
          event.preventDefault();
          this.choose(option);
        } else if (this.open()) {
          // Nothing to take: the popup closes and the Enter doesn't submit a form half way through a search
          event.preventDefault();
          this.#revert();
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          // Closes the popup only, not a dialog it is in
          event.preventDefault();
          event.stopPropagation();
          this.#revert();
        }
        break;
      case 'Tab':
        // The blur that follows settles the text
        this.#close();
        break;
    }
  }

  protected onBlur() {
    const text = this.text().trim();
    // Only an emptied field clears the value: a value whose option isn't listed yet shows no text and must stay
    if (!text && this.#typed() && this.value() !== null) {
      this.#setValue(null, null);
    }
    this.#revert();
    this.touch.emit();
  }

  /** The chosen text is selected on entering, so typing replaces it instead of adding to it. */
  protected selectText() {
    this.fieldRef().nativeElement.select();
  }

  protected onClick() {
    if (!this.open()) {
      // After the pointer is up, which would put the caret back
      this.selectText();
      this.show();
    }
  }

  protected show() {
    if (!this.open()) {
      this.#open();
      this.#activateSelectedOrFirst();
    }
  }

  protected toggle() {
    this.focus();
    if (this.open()) {
      this.#revert();
    } else {
      this.show();
    }
  }

  protected clear() {
    this.#setValue(null, null);
    this.text.set('');
    this.#typed.set(false);
    // The button goes with the value, so keep the focus on the field instead of dropping it
    this.focus();
  }

  protected activate(index: number) {
    if (index !== this.activeIndex() && !this.visible()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  protected choose(option: KitComboboxOption<T>) {
    if (option.disabled) {
      return;
    }
    this.#setValue(option.value, option);
    this.#revert();
    this.focus();
  }

  protected onOutsideClick(event: MouseEvent) {
    if (!this.#host.nativeElement.contains(event.target as Node)) {
      this.#revert();
    }
  }

  protected close() {
    this.#close();
  }

  #setValue(value: T | null, option: KitComboboxOption<T> | null) {
    this.#chosen.set(option);
    this.value.set(value);
  }

  #open() {
    if (this.open() || this.disabled() || this.readonly()) {
      return;
    }
    this.width.set(this.#host.nativeElement.offsetWidth);
    this.open.set(true);
  }

  #close() {
    if (this.open()) {
      this.open.set(false);
      this.activeIndex.set(-1);
    }
  }

  /** Closes, puts the chosen label back in the field and, after a search, takes it back so the list is whole next time. */
  #revert() {
    clearTimeout(this.#timer);
    this.#close();
    this.#typed.set(false);
    this.text.set(this.#chosenLabel());
    if (this.#searched) {
      this.#searched = false;
      this.search.emit('');
    }
  }

  #scheduleSearch() {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#searched = true;
      this.search.emit(this.text().trim());
    }, this.debounce());
  }

  #activateFirst() {
    this.#activateAt(this.visible().findIndex(option => !option.disabled));
  }

  #activateSelectedOrFirst() {
    const options = this.visible();
    const selected = options.findIndex(option => this.isSelected(option) && !option.disabled);
    this.#activateAt(selected >= 0 ? selected : options.findIndex(option => !option.disabled));
  }

  #move(step: 1 | -1) {
    const options = this.visible();
    for (let index = this.activeIndex() + step; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) {
        this.#activateAt(index);
        return;
      }
    }
  }

  #activateAt(index: number) {
    this.activeIndex.set(index);
    if (index >= 0) {
      // The option is drawn once the popup has been rendered
      afterNextRender(() => this.#document.getElementById(this.optionId(index))?.scrollIntoView({ block: 'nearest' }), { injector: this.#injector });
    }
  }

}
