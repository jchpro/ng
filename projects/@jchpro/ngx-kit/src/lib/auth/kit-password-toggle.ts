import { ChangeDetectionStrategy, Component, computed, contentChildren, ElementRef, inject, input, signal } from '@angular/core';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { KitIcon } from '../icon/kit-icon.directive';
import { KIT_AUTH_LABELS } from './kit-auth-labels';

/**
 * Adds a show/hide button to the native password input inside it. It only flips the input's
 * `type`, so it works with any way of binding the input — signal forms, reactive forms, none.
 *
 * ```html
 * <kit-password-toggle>
 *   <input class="kit-field__control" type="password" autocomplete="current-password">
 * </kit-password-toggle>
 * ```
 *
 * Replace either built-in icon by projecting an element marked `kitIcon="show"` (the icon of the
 * button while the password is hidden) or `kitIcon="hide"`.
 */
@Component({
  selector: 'kit-password-toggle',
  imports: [LucideEye, LucideEyeOff],
  templateUrl: './kit-password-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-password-toggle'
  }
})
export class KitPasswordToggle {

  readonly #labels = inject(KIT_AUTH_LABELS);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Replaces the accessible name of the button while the password is hidden, over `KIT_AUTH_LABELS`. */
  readonly showLabel = input<string>();

  /** Replaces the accessible name of the button while the password is visible, over `KIT_AUTH_LABELS`. */
  readonly hideLabel = input<string>();

  protected readonly visible = signal(false);

  protected readonly icons = contentChildren(KitIcon, { descendants: false });
  protected readonly customShowIcon = computed(() => this.icons().some(icon => icon.slot() === 'show'));
  protected readonly customHideIcon = computed(() => this.icons().some(icon => icon.slot() === 'hide'));

  protected readonly label = computed(() => this.visible()
    ? this.hideLabel() ?? this.#labels().common.hidePassword
    : this.showLabel() ?? this.#labels().common.showPassword
  );

  protected toggle() {
    const input = this.#host.querySelector('input');
    if (!input) {
      return;
    }
    this.visible.update(visible => !visible);
    input.type = this.visible() ? 'text' : 'password';
  }

}
