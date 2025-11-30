import { TemplateRef } from '@angular/core';
import type { MatButtonAppearance } from '@angular/material/button';
import { RenderableContent } from '@jchpro/ngx-common';
import { ProIcon } from '../icons/icons';
import { DynamicDisabledState, DynamicLabel, DynamicResult } from './common';

// Common

/**
 * Configurable common dialog data
 */
export interface CommonDialogData {

  /**
   * Title of the dialog.
   */
  title: DynamicLabel;

  /**
   * Content of the dialog.
   */
  content: RenderableContent;

  /**
   * Context object to be passed to the template.
   */
  templateContext?: any;

  /**
   * Buttons to be displayed in the dialog actions section.
   */
  buttons: CommonDialogButton[];

  /**
   * Whether the primary button should be disabled.
   */
  primaryDisabled?: DynamicDisabledState;

  /**
   * Handler for (ngSubmit) event on the dialog form.
   * Passing this automatically wraps content and actions with <form> element.
   */
  ngFormSubmit?: () => void;
}

export interface CommonDialogButton {

  /**
   * Label of the button.
   */
  label: DynamicLabel;

  /**
   * Role of the button.
   *   - primary: primary action button, marked as `submit` in form dialogs
   *   - secondary: usually to dismiss the primary action
   */
  role?: CommonDialogButtonRole;

  /**
   * Result of the button click, which will be passed to `DialogRef#close`.
   */
  result: DynamicResult;

  /**
   * Icon to be displayed next to the label.
   */
  icon?: ProIcon | TemplateRef<any>;

  /**
   * Overrides the appearance, which normally is defined by the `role`.
   */
  appearance?: MatButtonAppearance;
}

export type CommonDialogButtonRole = 'primary' | 'secondary';

// Info dialog data

/**
 * Simple information dialog with one OK button.
 */
export interface InfoDialogData extends Pick<Partial<CommonDialogData>, 'title' | 'content' | 'templateContext'> {

  /**
   * Content of the dialog, required.
   */
  content: RenderableContent;

  /**
   * Override the OK button, pass either label or full button configuration.
   */
  button?: DynamicLabel | CommonDialogButton;
}

export interface ConfirmDialogData extends Pick<Partial<CommonDialogData>, 'title' | 'content' | 'templateContext'> {

  /**
   * Content of the dialog, required.
   */
  content: RenderableContent;

  /**
   * Button set configuration; can be one of predefined ones or custom.
   * Please note that for the best experience, your custom buttons should return `true` or `false` as a result.
   *
   * @default 'yes_no'
   */
  buttons?: ConfirmDialogButtonSet | CommonDialogButton[];

}

export type ConfirmDialogButtonSet = 'yes_no' | 'confirm_cancel';
