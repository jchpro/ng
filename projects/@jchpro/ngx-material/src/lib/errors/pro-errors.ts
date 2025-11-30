import { AfterViewInit, Directive, EmbeddedViewRef, inject, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { Reactive } from '@jchpro/ngx-common';
import { PRO_ERRORS_INTL, ProErrorsIntl } from '../intl/pro-errors-intl';

/**
 * Simplifies displaying a multiple errors message in a form field.
 * Supports messages for custom errors and built-in Angular validators.
 *
 * Translations come from {@link ProErrorsIntl}. Read its docs for more info on how to provide translations for custom errors.
 *
 * @example
 * ```html
 * <mat-form-field>
 *   <mat-label>Your control</mat-label>
 *   <input matInput type="email" [formControl]="formControl">
 *   <mat-error *proError="let message">{{ message }}</mat-error>
 * </mat-form-field>
 * ```
 */
@Directive({
  selector: '[proErrors]'
})
export class ProErrors extends Reactive implements AfterViewInit, OnDestroy {

  readonly #vcr = inject(ViewContainerRef);
  readonly #tRef = inject(TemplateRef<ErrorContext>);
  readonly #intl = inject(PRO_ERRORS_INTL);
  readonly #formField = inject(MatFormField);

  #currentError?: string;
  #viewRef?: EmbeddedViewRef<ErrorContext>;

  constructor() {
    super();
    this.#vcr.clear();
    this.#viewRef = this.#vcr.createEmbeddedView(this.#tRef, {
      $implicit: ''
    });
  }

  ngAfterViewInit() {
    const control = this.#formField._control.ngControl;
    if (!control?.statusChanges) {
      console.warn('No control found for [proError] directive');
      return;
    }
    control.statusChanges
      .pipe(this.observeUntilDestroy())
      .subscribe(() => {
        const errorsObj = control.errors ?? {};
        const firstError = Object.keys(errorsObj)[0];
        if (!firstError) {
          this.#currentError = undefined;
          this.#viewRef!.context.$implicit = '';
          return;
        }
        this.#currentError = firstError;
        this.#attachErrorMessage(firstError, errorsObj);
      });
    this.#observeIntlChanges();
  }

  #attachErrorMessage(errorName: string, errorsObj: Record<string, any>): void {
    if (errorName in this.#intl) {
      const translator = this.#intl[errorName as Exclude<keyof ProErrorsIntl, 'changes' | 'intl'>] as string | ((error: any) => string);
      if (typeof translator === 'function') {
        this.#viewRef!.context.$implicit = translator(errorsObj[errorName]);
      } else if (typeof translator === 'string') {
        this.#viewRef!.context.$implicit = translator;
      } else {
        this.#viewRef!.context.$implicit = `<< INVALID TRANSLATOR TYPE: ${typeof translator} FOR ERROR ${errorName} >>`;
      }
      return;
    }
    if (this.#hasOtherMatErrors) {
      return;
    }
    this.#viewRef!.context.$implicit = `<< UNSUPPORTED ERROR: "${errorName}" >>`;
  }

  #observeIntlChanges(): void {
    this.#intl.changes.asObservable()
      .pipe(this.observeUntilDestroy())
      .subscribe(() => {
        if (!this.#currentError) {
          return;
        }
        this.#attachErrorMessage(this.#currentError, this.#formField._control.ngControl?.errors ?? {});
      });
  }

  get #hasOtherMatErrors(): boolean {
    return this.#formField._errorChildren.length > 1;
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.#vcr.clear();
  }

}

interface ErrorContext {
  $implicit: string;
}
