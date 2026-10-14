import { Component, signal } from '@angular/core';
import { KitMenu, KitMenuItem, KitMenuTrigger } from '@jchpro/ngx-kit';
import { LucideDownload, LucideEllipsisVertical, LucidePlus } from '@lucide/angular';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-page-header',
  imports: [
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
