import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

/**
 * The menu panel itself — put it on the root element of the `<ng-template>` that a
 * `kitMenuTriggerFor` points at. Provides `role="menu"` and arrow-key / typeahead navigation
 * (via CDK's `CdkMenu`), and the kit's panel styling. Holds `kitMenuItem`s, plus
 * `<hr class="kit-menu__separator">` between groups of them.
 */
@Directive({
  selector: '[kitMenu]',
  hostDirectives: [CdkMenu],
  host: {
    'class': 'kit-menu'
  }
})
export class KitMenu {
}
