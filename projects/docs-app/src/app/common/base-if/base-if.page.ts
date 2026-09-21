import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-base-if',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './base-if.page.html'
})
export class BaseIfPage {

}
