import { Component, Input } from '@angular/core';
import { libraries } from '../libraries';

@Component({
  selector: 'h3[example-title]',
  imports: [],
  templateUrl: './example-title.component.html',
  host: {
    'class': 'flex row m-between x-center'
  }
})
export class ExampleTitleComponent {

  @Input() lib?: keyof typeof libraries;

  protected readonly libraries = libraries;
}
