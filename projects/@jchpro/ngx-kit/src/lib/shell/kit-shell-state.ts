import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Injectable, InjectionToken, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

export type KitShellSidenavMode = 'docked' | 'overlay';

/**
 * Media query below which the sidenav switches from docked (always visible, part of the
 * layout) to overlay (off-canvas, opened on demand) mode. Defaults to 768px.
 */
export const KIT_SHELL_MOBILE_QUERY = new InjectionToken<string>('KIT_SHELL_MOBILE_QUERY', {
  factory: () => '(max-width: 768px)'
});

/**
 * Per-`KitShell`-instance state, provided by `KitShell` itself. Inject it from any descendant
 * (including your own routed content) for custom control beyond the shell's default markup.
 */
@Injectable()
export class KitShellState {

  #breakpoints = inject(BreakpointObserver);
  #mobileQuery = inject(KIT_SHELL_MOBILE_QUERY);
  #isMobile = toSignal(
    this.#breakpoints.observe(this.#mobileQuery).pipe(
      map(state => state.matches),
      startWith(this.#breakpoints.isMatched(this.#mobileQuery))
    ),
    { requireSync: true }
  );
  #sidenavOpen = signal(false);

  readonly sidenavMode: Signal<KitShellSidenavMode> = computed(() => this.#isMobile() ? 'overlay' : 'docked');
  readonly sidenavOpen = this.#sidenavOpen.asReadonly();

  openSidenav() {
    this.#sidenavOpen.set(true);
  }

  closeSidenav() {
    this.#sidenavOpen.set(false);
  }

  toggleSidenav() {
    this.#sidenavOpen.update(open => !open);
  }

}
