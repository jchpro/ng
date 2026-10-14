import { Directive, ElementRef, inject, output, signal } from '@angular/core';

/** Whether `file` is allowed by an `accept` attribute: extensions (`.png`), MIME types (`image/png`), wildcards (`image/*`). */
export function kitAcceptsFile(file: File, accept: string): boolean {
  const tokens = accept.split(',').map(token => token.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some(token => token.startsWith('.')
    ? name.endsWith(token)
    : token.endsWith('/*') ? type.startsWith(token.slice(0, -1)) : type === token);
}

/**
 * Drag and drop for the `kit-dropzone` look: put it on the element that holds an `<input type="file">` (the `<label
 * class="kit-dropzone">`). A click and the keyboard are the input's own; this adds files dropped on the zone.
 *
 * ```html
 * <label class="kit-dropzone" kitDropzone (files)="upload($event)" (rejected)="tell($event)">
 *   <input class="kit-dropzone__input" type="file" accept="image/*" multiple>
 *   <span class="kit-dropzone__title">Drop images here or click to choose</span>
 * </label>
 * ```
 *
 * - `(files)` emits the files chosen, by drop or by the picker. They are in the input too, so a form that reads
 *   the input, or its `change` event, sees them as with a plain file input.
 * - Files that the input's `accept` doesn't allow, and all but the first one when it isn't `multiple`, aren't taken:
 *   they are left out of the input and emitted by `(rejected)`, so the page can say why.
 * - `dragging` is true while files are dragged over the zone; the zone gets `kit-dropzone--active` for it.
 *
 * A disabled input takes no drops.
 */
@Directive({
  selector: '[kitDropzone]',
  exportAs: 'kitDropzone',
  host: {
    'class': 'kit-dropzone',
    '[class.kit-dropzone--active]': 'dragging()',
    '(dragenter)': 'onDragEnter($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
    '(change)': 'onChange($event)'
  }
})
export class KitDropzone {

  /** The files chosen, by drop or by the picker. */
  readonly files = output<File[]>();

  /** The files that weren't taken: outside `accept`, or more than one for an input that isn't `multiple`. */
  readonly rejected = output<File[]>();

  readonly #dragging = signal(false);

  /** True while files are dragged over the zone. */
  readonly dragging = this.#dragging.asReadonly();

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  // dragenter and dragleave fire for every child the pointer crosses, so count them
  #depth = 0;
  // Our own `change` events, which the host listener must not take for the picker's
  #silent = false;

  protected onDragEnter(event: DragEvent) {
    if (!this.#accepts(event)) {
      return;
    }
    event.preventDefault();
    this.#depth++;
    this.#dragging.set(true);
  }

  protected onDragOver(event: DragEvent) {
    if (!this.#accepts(event)) {
      return;
    }
    // Without this the browser doesn't allow the drop
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  protected onDragLeave(event: DragEvent) {
    if (!this.#accepts(event)) {
      return;
    }
    this.#depth = Math.max(0, this.#depth - 1);
    if (!this.#depth) {
      this.#dragging.set(false);
    }
  }

  protected onDrop(event: DragEvent) {
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    const input = this.#input();
    if (!this.#accepts(event) || !input || input.disabled) {
      return;
    }
    // The browser would open the file otherwise
    event.preventDefault();
    this.#depth = 0;
    this.#dragging.set(false);
    if (dropped.length) {
      this.#take(input, dropped, true);
    }
  }

  protected onChange(event: Event) {
    const input = event.target;
    if (this.#silent || !(input instanceof HTMLInputElement) || input.type !== 'file') {
      return;
    }
    this.#take(input, Array.from(input.files ?? []), false);
  }

  #accepts(event: DragEvent): boolean {
    return !!event.dataTransfer?.types.includes('Files') && !this.#input()?.disabled;
  }

  #input(): HTMLInputElement | null {
    return this.#host.querySelector<HTMLInputElement>('input[type="file"]');
  }

  #take(input: HTMLInputElement, list: File[], dropped: boolean) {
    let accepted = list.filter(file => kitAcceptsFile(file, input.accept));
    let rejected = list.filter(file => !accepted.includes(file));
    if (!input.multiple && accepted.length > 1) {
      rejected = [...rejected, ...accepted.slice(1)];
      accepted = accepted.slice(0, 1);
    }
    // Put the files in the input, so it holds exactly what was taken, and tell whoever listens to it, as the
    // picker would. A drop on an input that isn't `multiple` with nothing taken leaves the old choice alone.
    if (dropped ? accepted.length : rejected.length) {
      const transfer = new DataTransfer();
      accepted.forEach(file => transfer.items.add(file));
      input.files = transfer.files;
      if (dropped) {
        this.#silent = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        this.#silent = false;
      }
    }
    if (dropped ? accepted.length : true) {
      this.files.emit(accepted);
    }
    if (rejected.length) {
      this.rejected.emit(rejected);
    }
  }

}
