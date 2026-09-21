import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-router-events',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './router-events.page.html'
})
export class RouterEventsPage {

}
