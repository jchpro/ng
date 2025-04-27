import { Component } from '@angular/core';
import { ExampleTitleComponent } from '../../core/example-title/example-title.component';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-router-events-service',
  imports: [
    ExampleTitleComponent,
    FullRowDirective
  ],
  templateUrl: './router-events-service.component.html'
})
export class RouterEventsServiceComponent {

}
