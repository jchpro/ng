import { Directive, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reactive } from '@jchpro/ngx-common';
import { defer, finalize, Observable } from 'rxjs';

/**
 * Base class for dialog components.
 *
 * @typeParam D - Type of the data passed to the dialog.
 * @typeParam R - Type of the result returned by the dialog.
 * @typeParam C - Type of the component that the dialog is opened from.
 */
@Directive()
export class DialogBase<D = any, R = any, C = any> extends Reactive {

  /**
   * Data passed to the dialog.
   *
   * @protected
   */
  protected readonly data = inject<D>(MAT_DIALOG_DATA);

  /**
   * Reference to the dialog.
   *
   * @protected
   */
  protected readonly dialogRef = inject(MatDialogRef<C, R>);

  /**
   * Signal which indicates whether the dialog is currently loading, meaning an async operation is in progress.
   * This state can be used to lock the action buttons or display some loading indicator.
   *
   * @protected
   */
  protected readonly isLoading = signal(false);

  /**
   * Pipe which handles switching the loading state before and after the async operation.
   * It calls `beforeAsync` method so you can perform any initialization before the async operation starts.
   *
   * @protected
   */
  protected asyncWithLoadingState<T>(options?: {

    /**
     * Whether to disable closing the dialog while the async operation is in progress.
     *
     * @default true
     */
    disableClose?: boolean;
  }) {
    const disableClose = options?.disableClose ?? true;
    const initialDisableClose = this.dialogRef.disableClose;
    return (source: Observable<T>) => defer(() => {
      this.isLoading.set(true);
      if (disableClose) {
        this.dialogRef.disableClose = true;
      }
      this.beforeAsync();
      return source;
    })
      .pipe(finalize(() => {
        this.isLoading.set(false);
        this.dialogRef.disableClose = initialDisableClose;
      }));
  }

  /**
   * Perform any initialization before the async operation starts here.
   */
  protected beforeAsync() {
  }

}
