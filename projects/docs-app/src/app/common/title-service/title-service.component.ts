import { Component } from '@angular/core';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-title-service',
  imports: [
    LibPageTitle,
    FullRowDirective
  ],
  templateUrl: './title-service.component.html'
})
export class TitleServiceComponent {

}
