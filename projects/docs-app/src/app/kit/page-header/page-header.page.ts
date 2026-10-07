import { Component, signal } from '@angular/core';
import { KitMenu, KitMenuItem, KitMenuTrigger } from '@jchpro/ngx-kit';
import { LucideDownload, LucideEllipsisVertical, LucidePlus } from '@lucide/angular';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-page-header',
  imports: [
    LibPageTitle,
    CodeExample,
    KitMenuTrigger,
    KitMenu,
    KitMenuItem,
    LucideDownload,
    LucideEllipsisVertical,
    LucidePlus
  ],
  templateUrl: './page-header.page.html',
  styleUrl: './page-header.page.scss'
})
export class PageHeaderPage {

  protected readonly lastAction = signal('none yet');

}
