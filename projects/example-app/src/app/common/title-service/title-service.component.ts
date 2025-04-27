import { Component } from '@angular/core';
import { ExampleTitleComponent } from '../../core/example-title/example-title.component';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-title-service',
  imports: [
    ExampleTitleComponent,
    FullRowDirective
  ],
  templateUrl: './title-service.component.html'
})
export class TitleServiceComponent {

}
