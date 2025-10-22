import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, inject, Signal, signal, ViewEncapsulation } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { Reactive } from '@jchpro/ngx-common';
import { AdminLayoutService } from './admin-layout.service';
import { AdminSidebarContent } from './sidebar/admin-sidebar-content';
import { AdminSidebarToggle } from './toolbar/admin-sidebar-toggle';
import { AdminToolbarEnd } from './toolbar/admin-toolbar-end';
import { AdminToolbarMiddle } from './toolbar/admin-toolbar-middle';
import { AdminToolbarStart } from './toolbar/admin-toolbar-start';

@Component({
  selector: 'pro-admin-layout',
  imports: [
    MatToolbar,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    NgTemplateOutlet,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  exportAs: 'adminLayout',
  host: {
    '[class.sidenav-mode-toggle]': 'sidebarState() === "toggle"',
    '[class.has-middle-toolbar]': '!!toolbarMiddle()',
    '[class.mobile-toolbar-height]': 'service.mobileLayout()',
  },
  encapsulation: ViewEncapsulation.None
})
export class AdminLayout extends Reactive {

  readonly sidebarToggleOpened = signal(false);
  readonly sidebarState: Signal<AdminSidebarState>;

  readonly service = inject(AdminLayoutService);

  protected readonly sidebarContent = contentChild(AdminSidebarContent);
  protected readonly sidebarToggle = contentChild(AdminSidebarToggle);
  protected readonly toolbarStart = contentChild(AdminToolbarStart);
  protected readonly toolbarMiddle = contentChild(AdminToolbarMiddle);
  protected readonly toolbarEnd = contentChild(AdminToolbarEnd);

  constructor() {
    super();
    const { sidebarAvailable, sidebarToggleMode } = this.service;
    this.sidebarState = computed(() => {
      const available = sidebarAvailable();
      if (!available) {
        return 'hidden';
      }
      const toggleMode = sidebarToggleMode();
      if (toggleMode) {
        return 'toggle';
      }
      return 'visible';
    });
  }

  toggleSidenav() {
    this.sidebarToggleOpened.update(opened => !opened);
  }

}

export type AdminSidebarState = 'hidden' | 'visible' | 'toggle';
