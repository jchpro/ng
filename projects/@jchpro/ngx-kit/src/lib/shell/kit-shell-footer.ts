import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The shell's optional footer row. */
@Component({
  selector: 'kit-shell-footer',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-shell-footer',
    'role': 'contentinfo'
  }
})
export class KitShellFooter {
}
