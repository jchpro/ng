import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, InjectionToken, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { ProIconRenderer } from '../../icons/pro-icon-renderer';
import { PRO_FILES_INTL } from '../../intl/pro-files-intl';

/**
 * Component that allows selecting files from the file system.
 * Wraps the `<input type="file">` element, which it hides and displays two actions buttons:
 * - select button that opens the file system dialog
 * - clear button that clears the selected files.
 */
@Component({
  selector: 'pro-file-selector',
  imports: [
    MatButton,
    ProIconRenderer,
    NgTemplateOutlet
  ],
  templateUrl: './file-selector.html',
  styleUrl: './file-selector.scss',
  exportAs: 'proFileSelector',
})
export class FileSelector {

  readonly #defaults = inject(PRO_FILE_SELECTOR_DEFAULT_CONFIG);

  /**
   * Selected files.
   */
  readonly files = signal<File[]>([]);

  /**
   * Emits when the selected files change.
   */
  readonly filesChange = output<File[]>();

  /**
   * Attribute `accept` of the `<input type="file">` element.
   *
   * @default undefined
   */
  readonly accept = input(this.#defaults.accept);

  /**
   * Attribute `multiple` of the `<input type="file">` element.
   *
   * @default false
   */
  readonly multiple = input<boolean>(this.#defaults.multiple ?? false);

  /**
   * Whether the select button should be disabled.
   */
  readonly selectDisabled = input<boolean>(false);

  /**
   * Appearance of the select button.
   *
   * @default 'filled'
   */
  readonly selectAppearance = input<MatButtonAppearance>(this.#defaults.selectAppearance ?? 'filled');

  /**
   * Alignment of the action buttons.
   *
   * @default 'start'
   */
  readonly align = input<FileSelectorButtonsAlign>(this.#defaults.align ?? 'start');

  /**
   * Whether to show simple info about selected files.
   *   - boolean value either shows the built-in info or not
   *   - `TemplateRef` displays custom template with {@link FileSelectorInfoContext} context.
   *
   * @default 'true'
   */
  readonly showInfo = input<boolean | TemplateRef<FileSelectorInfoContext>>(this.#defaults.showInfo ?? true);

  /**
   * Reference to the underlying `<input type="file">` element.
   */
  readonly nativeInput = viewChild.required<ElementRef<HTMLInputElement>>('nativeInput');

  protected readonly intl = inject(PRO_FILES_INTL);
  protected readonly withDropzone = signal(false);

  clear() {
    this.nativeInput().nativeElement.value = '';
    this.onFileSelect(this.nativeInput().nativeElement);
  }

  dropzoneAttached() {
    this.withDropzone.set(true);
  }

  dropzoneDetached() {
    this.withDropzone.set(false);
  }

  protected onFileSelect(input: HTMLInputElement) {
    this.files.set(Array.from(input.files ?? []));
    this.filesChange.emit(this.files());
  }

}

/**
 * Refer to {@link FileSelector} for field descriptions.
 */
export interface FileSelectorConfig {
  accept?: string;
  multiple?: boolean;
  selectAppearance?: MatButtonAppearance;
  align?: FileSelectorButtonsAlign;
  showInfo?: boolean;
}

export type FileSelectorButtonsAlign  = 'start' | 'end';

export interface FileSelectorInfoContext {
  $implicit: File[];
  multiple: boolean;
}

export const PRO_FILE_SELECTOR_DEFAULT_CONFIG = new InjectionToken<FileSelectorConfig>('PRO_FILE_SELECTOR_DEFAULT_CONFIG', {
  factory: () => ({})
});
