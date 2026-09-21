import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-title-service',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './title-service.page.html'
})
export class TitleServicePage {

}
