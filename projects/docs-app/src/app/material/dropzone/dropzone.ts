import { Component } from '@angular/core';
import { FileDropzone, FileSelector } from '@jchpro/ngx-material';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-dropzone',
  imports: [
    LibPageTitle,
    FileSelector,
    FileDropzone,
    CodeExample,
    CodeCopyDirective
  ],
  templateUrl: './dropzone.html',
  styleUrl: './dropzone.scss',
})
export class Dropzone {

}
