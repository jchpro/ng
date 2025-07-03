import type { NgStyle } from '@angular/common';
import { InjectionToken, Injector, TemplateRef, Type } from '@angular/core';

export interface PicoDialogConfig<D = any> extends PicoDialogGlobalConfig {

  /**
   * Data passed to {@link PicoDialogRef#data}.
   */
  data: D;

  /**
   * Either dialog component class or `TemplateRef` to display as content.
   */
  content: Type<any> | TemplateRef<PicoDialogRef>;

  /**
   * Customer injector passed used during component creation or passed down to template outlet.
   */
  injector?: Injector;
}

export interface PicoDialogGlobalConfig {

  /**
   * Should clicking on overlay close the dialog with `undefined` return value.
   *
   * @default false
   */
  closeOnOverlayClick?: boolean;

  /**
   * Should animate the dialog opening and closing.
   *
   * @default false
   */
  animation?: boolean;

  /**
   * Additional styles to apply on the `<article>` element which hosts the dialog content.
   */
  styles?: NgStyle['ngStyle'];
}

/**
 * Dialog input / output interface reference.
 */
export interface PicoDialogRef<D = any, R = any> {

  /**
   * Data passed to the dialog.
   */
  data: D;

  /**
   * Callback for closing the dialog with result value.
   */
  close: (result: R) => void;
}

export const PICO_DIALOG_REF = new InjectionToken<PicoDialogRef>('PICO_DIALOG_REF');


