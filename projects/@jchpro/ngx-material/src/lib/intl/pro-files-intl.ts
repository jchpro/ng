import { InjectionToken, signal } from '@angular/core';
import { ProBaseLabelsIntl } from './pro-base-intl';

/**
 * Translations for {@link FileSelector} and {@link FileDropzone}.
 */
export class ProFilesIntl extends ProBaseLabelsIntl<ProFilesLabels> {

  readonly labels = signal({
    selectLabel: 'Select files...',
    clearLabel: 'Clear files',
    dropzoneMainLabel: 'Drag and drop files here',
    dropzoneDropNowLabel: 'Drop now!',
    selectionInfo: (files: File[]) => {
      if (files.length === 0) {
        return 'No files selected';
      }
      if (files.length === 1) {
        return `File "${files[0].name}" selected`;
      }
      return `${files.length} files selected`;
    }
  })

}

export interface ProFilesLabels {

  /**
   * Label for the select button.
   */
  selectLabel: string;

  /**
   * Label for the clear button.
   */
  clearLabel: string;

  /**
   * Main label of the dropzone.
   */
  dropzoneMainLabel: string;

  /**
   * "Drop now!" call to action of the dropzone.
   */
  dropzoneDropNowLabel: string;

  /**
   * Information about the selected files.
   */
  selectionInfo: (files: File[]) => string;
}

export const PRO_FILES_INTL = new InjectionToken<ProFilesIntl>('PRO_FILES_INTL', {
  factory: () => new ProFilesIntl()
});

export function provideFilesIntl(intlFactory: () => ProFilesIntl): any {
  return {
    provide: PRO_FILES_INTL,
    useFactory: intlFactory
  }
}
