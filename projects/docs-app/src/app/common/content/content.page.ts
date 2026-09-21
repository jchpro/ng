import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-content',
  imports: [
    LibPageTitle,
    CodeCopyDirective,
    CodeExample
  ],
  templateUrl: './content.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content.page.scss',
})
export class ContentPage {
}
