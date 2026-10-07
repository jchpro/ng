import { Component, signal } from '@angular/core';
import { KitMenu, KitMenuItem, KitMenuTrigger } from '@jchpro/ngx-kit';
import {
  LucideChevronDown,
  LucideCopy,
  LucideEllipsisVertical,
  LucideExternalLink,
  LucidePencil,
  LucideTrash
} from '@lucide/angular';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-menu',
  imports: [
    LibPageTitle,
    CodeExample,
    KitMenuTrigger,
    KitMenu,
    KitMenuItem,
    LucideChevronDown,
    LucideCopy,
    LucideEllipsisVertical,
    LucideExternalLink,
    LucidePencil,
    LucideTrash
  ],
  templateUrl: './menu.page.html'
})
export class MenuPage {

  protected readonly lastAction = signal('none yet');

}
