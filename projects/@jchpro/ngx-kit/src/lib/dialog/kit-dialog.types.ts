import { Injector } from '@angular/core';

/**
 * Accent of a dialog: the icon color and, for `danger`, the confirm button. `danger` is for
 * a destructive action about to happen ("delete this user?"), `error` for something that
 * just failed.
 */
export type KitDialogTone = 'info' | 'success' | 'warning' | 'danger' | 'error';

/** Width of a dialog: 400px, 520px or 720px, always capped to the viewport minus a margin. */
export type KitDialogSize = 'sm' | 'md' | 'lg';

export interface KitDialogConfig<D = unknown> {
  /** Handed to the dialog component through `DIALOG_DATA`. */
  data?: D;
  /** `md` by default. */
  size?: KitDialogSize;
  /** `alertdialog` for something that needs an answer or acknowledgement; `dialog` by default. */
  role?: 'dialog' | 'alertdialog';
  /** Stops Escape and backdrop clicks from closing the dialog; only your own buttons do. */
  disableClose?: boolean;
  /** Extra class(es) for the dialog's overlay pane, on top of the kit's own. */
  panelClass?: string | string[];
  /** Where focus goes on open: the CDK's `AutoFocusTarget`, or a selector. First tabbable by default. */
  autoFocus?: 'first-tabbable' | 'first-heading' | 'dialog' | string;
  /** Injector for the dialog component, e.g. to give it scoped providers. */
  injector?: Injector;
}

export interface KitMessageOptions {
  /** Plain text, line breaks (`\n`) are kept. */
  message: string;
  /** Replaces the default title for the tone. */
  title?: string;
  /** `info` for `alert()`, and for `confirm()` too. */
  tone?: KitDialogTone;
}

export interface KitAlertOptions extends KitMessageOptions {
  /** Which default label the single button gets, `ok` by default. */
  buttons?: 'ok' | 'close';
  /** Replaces the default label of the button. */
  buttonLabel?: string;
}

export interface KitConfirmOptions extends KitMessageOptions {
  /** Which default labels the two buttons get, `ok-cancel` by default. */
  buttons?: 'ok-cancel' | 'yes-no';
  /** Replaces the default label of the confirming button. */
  confirmLabel?: string;
  /** Replaces the default label of the cancelling button. */
  cancelLabel?: string;
}
