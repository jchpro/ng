import { ChangeDetectionStrategy, Component, input, output, TemplateRef, viewChild } from '@angular/core';
import { RouterLinkActive, UrlTree } from '@angular/router';
import { LucideIcon } from '@lucide/angular';

export type KitShellNavItemLink = readonly any[] | string | UrlTree;

/** Same type as `RouterLinkActive`'s own `routerLinkActiveOptions`, which it's passed to as is. */
export type KitShellNavItemLinkActiveOptions = RouterLinkActive['routerLinkActiveOptions'];

/**
 * A single entry for `KitShellNavSection` (and, later, the shell header's top navigation).
 * Renders nothing itself — it's a pure data holder. Whichever container it's projected into
 * reads `link`/`disabled`/`icon` and renders `content` (the item's projected body) through its
 * own `<a>`/`<button>` markup, so layout and link/disabled handling stay centralized in one
 * place instead of duplicated per item.
 */
@Component({
  selector: 'kit-shell-nav-item',
  template: `<ng-template #content><ng-content></ng-content></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'style': 'display: none'
  }
})
export class KitShellNavItem {

  readonly link = input<KitShellNavItemLink>();
  /** How the link decides it's active (e.g. `{ exact: true }`), passed through as `routerLinkActiveOptions`. */
  readonly linkActiveOptions = input<KitShellNavItemLinkActiveOptions>();
  readonly disabled = input(false);
  readonly icon = input<LucideIcon>();

  /** Fires on click — only meaningful, and only ever rendered as clickable, when `link` isn't set. */
  readonly linkClick = output<void>();

  readonly content = viewChild.required(TemplateRef);

}
