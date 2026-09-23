import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * An entry of a `kitMenu` — put it on a `<button>` (an action, handled with `(click)`) or an
 * `<a>` (navigation). Closes the menu when activated. Anything inside is its content, usually
 * an optional icon followed by the label.
 *
 * Bind `[disabled]` rather than writing the native attribute: it works on links too, and is
 * exposed as `aria-disabled`. A disabled item swallows clicks, so neither your `(click)` handler
 * nor a link's navigation runs.
 *
 * Bind `[checked]` to make it a choice: it becomes a `menuitemradio` (or a `menuitemcheckbox`
 * with the `checkbox` attribute) exposing `aria-checked`. The state is yours — keep it in your
 * own signal and show it however you like, usually an icon. Without `[checked]` it's a plain
 * `menuitem`.
 */
@Directive({
  selector: '[kitMenuItem]',
  hostDirectives: [{
    directive: CdkMenuItem,
    inputs: ['cdkMenuItemDisabled: disabled']
  }],
  host: {
    'class': 'kit-menu__item',
    '[class.kit-menu__item--danger]': 'danger()',
    '[attr.role]': 'role()',
    '[attr.aria-checked]': 'checked() ?? null'
  }
})
export class KitMenuItem {

  /** Marks a destructive action (delete, remove…) with the danger color. */
  readonly danger = input(false, { transform: booleanAttribute });

  /** Makes the item a choice and says whether it is the selected one. Left unset, it isn't one. */
  readonly checked = input<boolean | undefined>(undefined);

  /** With `[checked]`: the item is an independent on/off option rather than one of an exclusive group. */
  readonly checkbox = input(false, { transform: booleanAttribute });

  protected readonly role = computed(() => {
    if (this.checked() === undefined) {
      return 'menuitem';
    }
    return this.checkbox() ? 'menuitemcheckbox' : 'menuitemradio';
  });

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly #item = inject(CdkMenuItem);

  constructor() {
    // The CDK only keeps a disabled item from closing the menu, it doesn't stop the click
    // itself. Capture phase, registered at construction: runs before any (click) on the host.
    this.#host.addEventListener('click', this.#swallowClick, { capture: true });
    inject(DestroyRef).onDestroy(() => this.#host.removeEventListener('click', this.#swallowClick, { capture: true }));
  }

  readonly #swallowClick = (event: Event) => {
    if (!this.#item.disabled) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

}
