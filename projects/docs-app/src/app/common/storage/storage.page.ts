import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-storage-service',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './storage.page.html',
  styleUrl: './storage.page.scss'
})
export class StoragePage {

}
