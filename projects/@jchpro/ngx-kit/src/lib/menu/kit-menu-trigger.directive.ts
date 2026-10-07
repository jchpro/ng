import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Directive, inject } from '@angular/core';

/** Below the trigger, aligned to its start; falls back to its end edge, then to above. */
const KIT_MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 }
];

/**
 * Opens the `<ng-template>` it points at as a menu in an overlay, anchored to the host element.
 * Host-directive wrapper over CDK's `CdkMenuTrigger`, so focus, keyboard and ARIA all come
 * from the CDK; this only renames the API and sets the kit's default positioning.
 *
 * ```html
 * <button class="kit-btn kit-btn--ghost" [kitMenuTriggerFor]="menu">Actions</button>
 * <ng-template #menu>
 *   <div kitMenu>…</div>
 * </ng-template>
 * ```
 *
 * Requires the overlay styles, `@jchpro/ngx-kit/styles/overlay`.
 */
@Directive({
  selector: '[kitMenuTriggerFor]',
  hostDirectives: [{
    directive: CdkMenuTrigger,
    inputs: [
      'cdkMenuTriggerFor: kitMenuTriggerFor',
      'cdkMenuPosition: kitMenuPosition',
      'cdkMenuTriggerData: kitMenuTriggerData'
    ],
    outputs: [
      'cdkMenuOpened: kitMenuOpened',
      'cdkMenuClosed: kitMenuClosed'
    ]
  }]
})
export class KitMenuTrigger {

  constructor() {
    inject(CdkMenuTrigger).menuPosition = KIT_MENU_POSITIONS;
  }

}
