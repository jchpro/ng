import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KitLoadingBar } from '../loading/kit-loading-bar';
import { KitLoadingService } from '../loading/kit-loading.service';
import { KitShellRoot } from './kit-shell-root.directive';
import { KitShellState } from './kit-shell-state';

/**
 * Admin layout shell — header, collapsible sidenav, main content and an optional footer.
 * Compose it with `<kit-shell-header>`, `<kit-shell-sidenav>` and `<kit-shell-footer>`;
 * anything else projected becomes the main content. Its layout CSS lives in
 * `@jchpro/ngx-kit/styles/shell` and expects an ancestor with `KitShellRoot` applied —
 * normally your app's root component — see docs/layout.md.
 *
 * Also renders the global loading bar, driven by `KitLoadingService`.
 */
@Component({
  selector: 'kit-shell',
  imports: [KitLoadingBar],
  templateUrl: './kit-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KitShellState],
  host: {
    'class': 'kit-shell'
  }
})
export class KitShell {

  protected readonly state = inject(KitShellState);
  protected readonly loading = inject(KitLoadingService);

  constructor() {
    const root = inject(KitShellRoot, { optional: true });
    if (root) {
      return;
    }
    console.warn(
      '<kit-shell> expects an ancestor element with the KitShellRoot directive applied ' +
      '(e.g. `hostDirectives: [KitShellRoot]` on your root app component) so its layout CSS ' +
      'from @jchpro/ngx-kit/styles/shell applies correctly. See docs/layout.md.'
    );
  }

}
