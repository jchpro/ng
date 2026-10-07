import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, LucideMenu } from '@lucide/angular';
import { KIT_SHELL_LABELS } from './kit-shell-labels';
import { KitShellNavItem } from './kit-shell-nav-item';
import { KitShellState } from './kit-shell-state';

/**
 * The shell's header row. Automatically renders a sidenav-toggle button when the sidenav
 * is in overlay (mobile) mode; anything projected renders alongside it.
 *
 * Any `KitShellNavItem`s projected in render as top navigation — the same items used for a
 * `KitShellNavSection`, rendered horizontally here instead. They stay inline in this row while
 * the sidenav is docked, and move to a second row below it once the sidenav collapses to
 * overlay — the same breakpoint, there's no separate one for this. Keep it to 3-4 items so that
 * second row stays fully visible on mobile.
 *
 * Nav items render right after whatever's marked `kit-shell-header-leading` (typically your
 * brand/logo) and before everything else projected in — so e.g. a trailing spacer + actions
 * still end up pushed to the far end of the row, with nav in between.
 */
@Component({
  selector: 'kit-shell-header',
  imports: [LucideMenu, NgTemplateOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './kit-shell-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-shell-header',
    'role': 'banner'
  }
})
export class KitShellHeader {

  readonly #labels = inject(KIT_SHELL_LABELS);

  /** Replaces the sidenav toggle's accessible name for this header, over `KIT_SHELL_LABELS`. */
  readonly toggleNavigationLabel = input<string>();

  protected readonly state = inject(KitShellState);
  protected readonly navItems = contentChildren(KitShellNavItem);
  protected readonly toggleLabel = computed(() => this.toggleNavigationLabel() ?? this.#labels().toggleNavigation);

}
