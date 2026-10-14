import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck, LucideDynamicIcon, LucideInfo, LucideX } from '@lucide/angular';
import { KIT_TOAST_LABELS } from './kit-toast-labels';
import { KitToastEntry, KitToastStore } from './kit-toast-store';
import { KitToastKind } from './kit-toast.types';

/**
 * The toasts on the screen, opened in an overlay by `KitToastService`. Two live regions that are in the page before
 * anything is put in them: the polite one for successes and information, the assertive `alert` one for errors.
 */
@Component({
  selector: 'kit-toast-container',
  imports: [NgTemplateOutlet, LucideDynamicIcon, LucideX],
  template: `
    <section class="kit-toasts" [attr.aria-label]="labels().region">
      <div class="kit-toasts__list" role="status" aria-live="polite" aria-relevant="additions">
        @for (toast of polite(); track toast.id) {
          <ng-container [ngTemplateOutlet]="toastTemplate" [ngTemplateOutletContext]="{ $implicit: toast }" />
        }
      </div>
      <div class="kit-toasts__list" role="alert">
        @for (toast of alerts(); track toast.id) {
          <ng-container [ngTemplateOutlet]="toastTemplate" [ngTemplateOutletContext]="{ $implicit: toast }" />
        }
      </div>
    </section>

    <ng-template #toastTemplate let-toast>
      <div class="kit-toast" [class]="'kit-toast kit-toast--' + toast.kind"
           (mouseenter)="store.hold(toast)" (mouseleave)="store.release(toast)"
           (focusin)="store.hold(toast)" (focusout)="onFocusOut($event, toast)"
           (keydown.escape)="store.dismiss(toast)">
        <svg class="kit-toast__icon" [lucideIcon]="iconFor(toast.kind)" aria-hidden="true"></svg>
        <span class="kit-toast__message">{{ toast.message }}</span>
        @if (toast.action) {
          <button type="button" class="kit-btn kit-btn--ghost kit-toast__action" (click)="store.act(toast)">{{ toast.action }}</button>
        }
        <button type="button" class="kit-btn kit-btn--ghost kit-btn--icon kit-toast__dismiss"
                [attr.aria-label]="labels().dismiss" [title]="labels().dismiss" (click)="store.dismiss(toast)">
          <svg lucideX size="16"></svg>
        </button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitToastContainer {

  protected readonly store = inject(KitToastStore);
  protected readonly labels = inject(KIT_TOAST_LABELS);

  readonly #icons = {
    success: LucideCircleCheck,
    error: LucideCircleAlert,
    info: LucideInfo
  } satisfies Record<KitToastKind, unknown>;

  protected iconFor(kind: KitToastKind) {
    return this.#icons[kind];
  }

  protected readonly polite = computed(() => this.store.visible().filter(toast => toast.kind !== 'error'));
  protected readonly alerts = computed(() => this.store.visible().filter(toast => toast.kind === 'error'));

  /** The focus moving between the buttons of one toast doesn't let go of it. */
  protected onFocusOut(event: FocusEvent, toast: KitToastEntry) {
    const target = event.currentTarget as HTMLElement;
    if (!target.contains(event.relatedTarget as Node | null)) {
      this.store.release(toast);
    }
  }

}
