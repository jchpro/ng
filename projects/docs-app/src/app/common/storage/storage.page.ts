import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-storage-service',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './storage.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './storage.page.scss'
})
export class StoragePage {

}
