import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';

/** Below the button, aligned to its start; falls back to its end edge, then to above. */
const KIT_POPOVER_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 }
];

/**
 * A button that opens a panel of arbitrary content (fields, checkboxes) in an overlay, anchored
 * to it: the base of the filters popover and the column picker, usable for any toolbar control
 * that needs more than a menu. Unlike a menu it stays open while you use what is inside; it
 * closes on Escape (focus returns to the button), on a click outside, or via `[(open)]`.
 *
 * ```html
 * <kit-popover label="Options" [(open)]="open">
 *   <svg kitPopoverIcon lucideSettings></svg>
 *   …content…
 *   <button kitPopoverFooter class="kit-btn kit-btn--ghost" (click)="open.set(false)">Done</button>
 * </kit-popover>
 * ```
 *
 * Requires the overlay styles, `@jchpro/ngx-kit/styles/overlay`.
 */
@Component({
  selector: 'kit-popover',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus],
  templateUrl: './kit-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-popover'
  }
})
export class KitPopover {

  /** The button's text. */
  readonly label = input.required<string>();

  /** Accessible name of the panel, the label if unset. */
  readonly title = input<string>();

  /** A count shown on the button, e.g. the filters applied; hidden for 0 and `null`. */
  readonly badge = input<number | null>(null);

  readonly open = model(false);

  protected readonly positions = KIT_POPOVER_POSITIONS;

  protected readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  protected toggle() {
    this.open.update(open => !open);
  }

  protected onOutsideClick(event: MouseEvent) {
    // A click on the button itself is its own toggle.
    if (this.button().nativeElement.contains(event.target as Node)) {
      return;
    }
    this.open.set(false);
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }
    event.preventDefault();
    this.open.set(false);
    this.button().nativeElement.focus();
  }

}
