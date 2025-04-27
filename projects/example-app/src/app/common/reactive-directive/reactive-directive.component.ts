import { Component } from '@angular/core';
import { ExampleTitleComponent } from '../../core/example-title/example-title.component';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-reactive-directive',
  imports: [
    ExampleTitleComponent,
    FullRowDirective
  ],
  templateUrl: './reactive-directive.component.html',
})
export class ReactiveDirectiveComponent {

}
