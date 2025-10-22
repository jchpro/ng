import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout, AdminSidebarContent, AdminSidebarToggle, AdminToolbarEnd, AdminToolbarMiddle, AdminToolbarStart } from '@jchpro/ngx-admin';
import { COMMON_LIB } from '../common/docs';
import { DocsMenu } from './menu/docs-menu';
import { DocsThemeSelector } from './theme-selector/docs-theme-selector';

@Component({
  selector: 'app-docs',
  imports: [
    AdminLayout,
    AdminToolbarStart,
    AdminToolbarMiddle,
    AdminToolbarEnd,
    AdminSidebarToggle,
    AdminSidebarContent,
    FaIconComponent,
    NgTemplateOutlet,
    MatButton,
    RouterOutlet,
    DocsMenu,
    DocsThemeSelector,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './docs.html',
  styleUrl: './docs.scss'
})
export class Docs {

  protected readonly faBars = faBars;
  protected readonly libs = [
    COMMON_LIB
  ];

}
