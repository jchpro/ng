import { Directive } from '@angular/core';

/**
 * Marks the element that owns `<kit-shell>`'s root-level layout CSS (from
 * `@jchpro/ngx-kit/styles/shell`, which targets `.kit-shell-root kit-shell`) — normally your
 * app's root component. Apply it directly (`<app-root kitShellRoot>`) or, so every consumer
 * of your root component gets it "for free," via `hostDirectives: [KitShellRoot]` on the
 * component itself.
 */
@Directive({
  selector: '[kitShellRoot]',
  host: {
    'class': 'kit-shell-root'
  }
})
export class KitShellRoot {
}
