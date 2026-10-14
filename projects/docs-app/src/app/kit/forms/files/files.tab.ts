import { Component, signal } from '@angular/core';
import { KitDropzone } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-files',
  imports: [
    CodeExample,
    KitDropzone
  ],
  templateUrl: './files.tab.html',
  styleUrl: '../../specimens.scss'
})
export class FilesTab {

  protected readonly images = signal<File[]>([]);
  protected readonly refused = signal<File[]>([]);
  protected readonly contract = signal<File | null>(null);
  protected readonly contractRefused = signal<File[]>([]);

  protected names(files: File[]) {
    return files.map(file => file.name).join(', ') || 'nothing';
  }

}
