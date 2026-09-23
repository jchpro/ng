import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Local loading state for a single element. While `kitBusy` is true:
 *
 * - on a button (`<button>`, `<a>`, `.kit-btn`) the label is swapped for a spinner at the same
 *   width, and clicks are swallowed — the element stays focusable, unlike with `disabled`;
 * - on anything else (a card, a panel, a form) a scrim and spinner cover it and its content is
 *   made `inert`, so neither pointer nor keyboard can reach it.
 *
 * Styles come from `@jchpro/ngx-kit/styles/loading`.
 */
@Directive({
  selector: '[kitBusy]',
  host: {
    '[class.kit-busy]': 'busy()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
    '[attr.inert]': 'busy() && !isControl ? "" : null'
  }
})
export class KitBusy {

  readonly busy = input(false, { alias: 'kitBusy', transform: booleanAttribute });

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly isControl = this.#host.matches('button, a, [role="button"], .kit-btn');

  constructor() {
    // Capture phase, registered at construction: runs before any (click) handler on the host.
    this.#host.addEventListener('click', this.#swallowClick, { capture: true });
    inject(DestroyRef).onDestroy(() => this.#host.removeEventListener('click', this.#swallowClick, { capture: true }));
  }

  readonly #swallowClick = (event: Event) => {
    if (!this.busy()) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

}
