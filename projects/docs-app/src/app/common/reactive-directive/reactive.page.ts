import { Component } from '@angular/core';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-reactive-directive',
  imports: [
    LibPageTitle,
    FullRowDirective
  ],
  templateUrl: './reactive.page.html',
})
export class ReactivePage {

}
