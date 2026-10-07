import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-shell',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './shell.page.html'
})
export class ShellPage {

}
