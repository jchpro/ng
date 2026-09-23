import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { KitShellState } from './kit-shell-state';

/**
 * The shell's sidenav. Docked (always visible, part of the layout) on wide viewports;
 * off-canvas overlay — with a focus trap and Escape-to-close — below the configured
 * breakpoint. Any click inside closes it while in overlay mode, so selecting a nav link
 * also dismisses it.
 *
 * Focus capture/restore on open/close is driven here rather than via `CdkTrapFocus`'s own
 * `autoCapture`: that only fires on the directive's `ngAfterContentInit`/`ngOnDestroy`, but
 * this sidenav stays mounted across opens/closes — only its `enabled` input changes.
 */
@Component({
  selector: 'kit-shell-sidenav',
  imports: [CdkTrapFocus],
  templateUrl: './kit-shell-sidenav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-shell-sidenav',
    'role': 'navigation',
    '[class.kit-shell-sidenav--overlay]': 'state.sidenavMode() === "overlay"',
    '[class.kit-shell-sidenav--open]': 'isOpenOverlay()',
    '[attr.aria-hidden]': 'isHiddenOverlay() ? "true" : null',
    '[attr.inert]': 'isHiddenOverlay() ? "" : null',
    '(keydown.escape)': 'state.closeSidenav()',
    '(click)': 'onClick()'
  }
})
export class KitShellSidenav {

  protected readonly state = inject(KitShellState);

  protected readonly isOpenOverlay = computed(() => this.state.sidenavMode() === 'overlay' && this.state.sidenavOpen());
  protected readonly isHiddenOverlay = computed(() => this.state.sidenavMode() === 'overlay' && !this.state.sidenavOpen());

  // Angular's signal-query functions need a real TS accessibility modifier, not an ES `#private` field.
  private trap = viewChild.required(CdkTrapFocus);
  #previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.isOpenOverlay()) {
        this.#previouslyFocused = document.activeElement as HTMLElement;
        this.trap().focusTrap?.focusInitialElementWhenReady();
        return;
      }
      this.#previouslyFocused?.focus();
      this.#previouslyFocused = null;
    });
  }

  protected onClick() {
    if (this.state.sidenavMode() !== 'overlay') {
      return;
    }
    this.state.closeSidenav();
  }

}
