import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  output,
  runInInjectionContext,
  signal,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { PRO_FILES_INTL } from '../../intl/pro-files-intl';
import { FileSelector, FileSelectorInfoContext } from '../selector/file-selector';
import { validateFiles } from '../validation/validate-files';

/**
 * Drag & drop zone for file selection.
 * Must be bound to a {@link FileSelector} component.
 */
@Component({
  selector: 'pro-file-dropzone',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
  host: {
    '[class.active]': 'active()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
  exportAs: 'proFileDropzone',
  encapsulation: ViewEncapsulation.None
})
export class FileDropzone implements OnInit, OnDestroy {

  readonly for = input.required<FileSelector>();
  readonly invalidFilesDrop = output<void>();

  protected readonly intl = inject(PRO_FILES_INTL);
  protected readonly active = signal(false);
  protected readonly showInfo = signal<boolean | TemplateRef<FileSelectorInfoContext>>(false);

  readonly #injector = inject(Injector);

  ngOnInit() {
    this.for().dropzoneAttached();
    runInInjectionContext(this.#injector, () => {
      effect(() => {
        this.showInfo.set(this.for().showInfo());
      });
    });
  }

  ngOnDestroy() {
    this.for().dropzoneDetached();
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.active.set(true);
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.active.set(false);
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    this.active.set(false);
    if (!event.dataTransfer?.files) {
      return;
    }
    const accept = this.for().accept();
    if (accept && !validateFiles(Array.from(event.dataTransfer.files), accept)) {
      console.warn(`Some of the files didn't match the accept string value "${accept}"`);
      this.invalidFilesDrop.emit();
      return;
    }
    const el = this.for().nativeInput().nativeElement;
    el.files = event.dataTransfer.files;
    el.dispatchEvent(new Event('input'));
  }

}
