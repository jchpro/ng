import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, InjectionToken, signal, untracked } from '@angular/core';
import { KitLoadingService } from './kit-loading.service';

export interface KitLoadingOptions {
  /** Milliseconds an operation must last before the bar appears, so quick ones never flash it. */
  showDelay: number;
  /** Milliseconds the bar stays up once shown, so it never blinks out right after appearing. */
  minVisible: number;
}

export const KIT_LOADING_OPTIONS = new InjectionToken<KitLoadingOptions>('KIT_LOADING_OPTIONS', {
  factory: () => ({ showDelay: 150, minVisible: 400 })
});

/**
 * The global loading indicator — rendered by `KitShell` itself, you don't place it yourself.
 * Decorative (`aria-hidden`); the shell's main area carries `aria-busy` for assistive tech.
 * Timing is tunable through `KIT_LOADING_OPTIONS`.
 */
@Component({
  selector: 'kit-loading-bar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-loading-bar',
    'aria-hidden': 'true',
    '[class.kit-loading-bar--visible]': 'visible()'
  }
})
export class KitLoadingBar {

  readonly #loading = inject(KitLoadingService);
  readonly #options = inject(KIT_LOADING_OPTIONS);
  readonly #visible = signal(false);
  #showTimer: ReturnType<typeof setTimeout> | undefined;
  #hideTimer: ReturnType<typeof setTimeout> | undefined;
  #shownAt = 0;

  protected readonly visible = this.#visible.asReadonly();

  constructor() {
    effect(() => {
      const loading = this.#loading.isLoading();
      untracked(() => loading ? this.#onStart() : this.#onStop());
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.#showTimer);
      clearTimeout(this.#hideTimer);
    });
  }

  #onStart() {
    clearTimeout(this.#hideTimer);
    this.#hideTimer = undefined;
    if (this.#visible() || this.#showTimer !== undefined) {
      return;
    }
    this.#showTimer = setTimeout(() => {
      this.#showTimer = undefined;
      this.#shownAt = Date.now();
      this.#visible.set(true);
    }, this.#options.showDelay);
  }

  #onStop() {
    if (this.#showTimer !== undefined) {
      clearTimeout(this.#showTimer);
      this.#showTimer = undefined;
      return;
    }
    if (!this.#visible()) {
      return;
    }
    const remaining = Math.max(0, this.#options.minVisible - (Date.now() - this.#shownAt));
    this.#hideTimer = setTimeout(() => {
      this.#hideTimer = undefined;
      this.#visible.set(false);
    }, remaining);
  }

}
