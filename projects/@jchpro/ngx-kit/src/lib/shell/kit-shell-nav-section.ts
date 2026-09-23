import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChildren, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { KitShellNavItem } from './kit-shell-nav-item';

let nextId = 0;

/**
 * A titled, optionally-disabled group of `KitShellNavItem`s for `kit-shell-sidenav`. Renders
 * each item's link/button, icon and disabled state itself — see `KitShellNavItem` — so apps
 * only ever declare the items and their own active/disabled logic, never the chrome around them.
 */
@Component({
  selector: 'kit-shell-nav-section',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './kit-shell-nav-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-shell-nav-section'
  }
})
export class KitShellNavSection {

  readonly title = input.required<string>();
  readonly disabled = input(false);

  protected readonly items = contentChildren(KitShellNavItem, { descendants: true });
  protected readonly titleId = `kit-shell-nav-section-title-${nextId++}`;

  protected isDisabled(item: KitShellNavItem) {
    return item.disabled() || this.disabled();
  }

}
