import { ComponentPortal } from '@angular/cdk/portal';
import { GlobalPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { inject, Injectable } from '@angular/core';
import { KitToastContainer } from './kit-toast-container';
import { KitToastStore } from './kit-toast-store';
import { KitToastKind, KitToastOptions, KitToastPosition, KitToastRef } from './kit-toast.types';

/**
 * Non-blocking messages ("Saved.", "Deleted. Undo"), where a dialog would be too much.
 *
 * ```ts
 * toasts.success('Saved.');
 * const reason = await toasts.info('Item deleted', { action: 'Undo' }).closed;   // 'timeout' | 'dismissed' | 'action'
 * toasts.error('Could not save.', { duration: 8000 });
 * ```
 *
 * - **How long.** Successes stay 4 s and information 5 s; an error stays until it is closed, as a message that goes away
 *   by itself is one that can be missed. A toast with an action stays at least 8 s. `provideKitToasts()` changes these
 *   for the app, `duration` on a call for that toast (`null`: until closed).
 * - **Hover and focus pause the clock**, and it goes on from what was left (at least a second) afterwards.
 * - **Announced:** successes and information politely (`role="status"`), errors at once (`role="alert"`). Escape closes
 *   the toast that has the focus. Texts are in `KIT_TOAST_LABELS`.
 * - More than `max` (5) at once: the rest wait for room, in order.
 *
 * Needs `@jchpro/ngx-kit/styles/overlay` and the toast styles (`primitives`, or `styles/toast`) in the global styles.
 */
@Injectable({
  providedIn: 'root'
})
export class KitToastService {

  readonly #overlay = inject(Overlay);
  readonly #store = inject(KitToastStore);
  #overlayRef: OverlayRef | undefined;

  success(message: string, options?: KitToastOptions): KitToastRef {
    return this.#show('success', message, options);
  }

  error(message: string, options?: KitToastOptions): KitToastRef {
    return this.#show('error', message, options);
  }

  info(message: string, options?: KitToastOptions): KitToastRef {
    return this.#show('info', message, options);
  }

  /** Closes every toast, the ones still waiting included. */
  dismissAll() {
    this.#store.dismissAll();
  }

  #show(kind: KitToastKind, message: string, options: KitToastOptions | undefined): KitToastRef {
    const ref = this.#store.show(kind, message, options);
    this.#ensureContainer();
    return ref;
  }

  #ensureContainer() {
    if (!this.#overlayRef) {
      const strategy = this.#overlay.position().global();
      this.#place(strategy, this.#store.position);
      this.#overlayRef = this.#overlay.create({ positionStrategy: strategy, panelClass: 'kit-toasts-panel' });
      this.#overlayRef.attach(new ComponentPortal(KitToastContainer));
      // The live regions are in the page now, give them a moment before the first message goes in
      setTimeout(() => this.#store.markReady(), 50);
    }
    // A toast is above a dialog that opened after the container did
    const host = this.#overlayRef.hostElement;
    if (host.parentElement?.lastElementChild !== host) {
      host.parentElement?.appendChild(host);
    }
  }

  #place(strategy: GlobalPositionStrategy, position: KitToastPosition) {
    const [vertical, horizontal] = position.split('-') as ['top' | 'bottom', 'start' | 'center' | 'end'];
    const edge = '16px';
    vertical === 'top' ? strategy.top(edge) : strategy.bottom(edge);
    horizontal === 'center' ? strategy.centerHorizontally() : horizontal === 'start' ? strategy.left(edge) : strategy.right(edge);
  }

}
