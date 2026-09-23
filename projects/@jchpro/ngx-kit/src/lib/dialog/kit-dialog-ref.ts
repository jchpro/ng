import { DialogRef } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';

/**
 * Handle on a dialog opened by `KitDialogService.open()`. `result` settles once, when the
 * dialog closes: with whatever it was closed with, or `undefined` when dismissed (Escape,
 * backdrop, navigation). It never rejects.
 */
export class KitDialogRef<R = unknown, C = unknown> {

  readonly #ref: DialogRef<R, C>;

  readonly result: Promise<R | undefined>;

  constructor(ref: DialogRef<R, C>) {
    this.#ref = ref;
    this.result = firstValueFrom(ref.closed, { defaultValue: undefined });
  }

  /** The opened component, once it exists. */
  get componentInstance(): C | null {
    return this.#ref.componentInstance;
  }

  close(result?: R) {
    this.#ref.close(result);
  }

}
