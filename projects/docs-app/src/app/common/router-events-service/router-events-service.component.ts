import { Component } from '@angular/core';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-router-events-service',
  imports: [
    LibPageTitle,
    FullRowDirective
  ],
  templateUrl: './router-events-service.component.html'
})
export class RouterEventsServiceComponent {

}
