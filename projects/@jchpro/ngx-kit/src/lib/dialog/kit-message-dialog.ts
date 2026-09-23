import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideDynamicIcon,
  LucideIcon,
  LucideInfo,
  LucideOctagonAlert,
  LucideTriangleAlert
} from '@lucide/angular';
import { KitDialogClose } from './kit-dialog-close.directive';
import { KitDialogTitle } from './kit-dialog-title.directive';
import { KitDialogTone } from './kit-dialog.types';

/** What `KitDialogService` hands to `KitMessageDialog` — labels already resolved. */
export interface KitMessageDialogData {
  tone: KitDialogTone;
  title: string;
  message: string;
  confirmLabel: string;
  /** Without one the dialog is an alert, a single button. */
  cancelLabel?: string;
}

const TONE_ICONS: Record<KitDialogTone, LucideIcon> = {
  info: LucideInfo,
  success: LucideCircleCheck,
  warning: LucideTriangleAlert,
  danger: LucideOctagonAlert,
  error: LucideCircleX
};

/**
 * The body of `KitDialogService.alert()` and `confirm()`: tone icon, title, message and one or
 * two buttons. Closes with `true` on the confirming button and `false` on the other; a
 * destructive (`danger`) confirmation starts with focus on the cancelling button.
 */
@Component({
  selector: 'kit-message-dialog',
  imports: [KitDialogTitle, KitDialogClose, LucideDynamicIcon],
  templateUrl: './kit-message-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"kit-dialog kit-dialog--" + data.tone'
  }
})
export class KitMessageDialog {

  protected readonly data = inject<KitMessageDialogData>(DIALOG_DATA);
  protected readonly icon = TONE_ICONS[this.data.tone];
  protected readonly isDanger = this.data.tone === 'danger';

}
