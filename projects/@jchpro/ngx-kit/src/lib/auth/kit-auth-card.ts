import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';

/**
 * The shell of every auth view: a centered-width card with an optional logo, the heading, an
 * optional description, a live region for an error and a footer. The form itself is the content.
 *
 * Slots, as attributes on projected elements: `kitAuthLogo` (above the heading) and
 * `kitAuthFooter` (below the form: a link to another view, terms). Anything else is the body.
 * Put `[kitBusy]` on the card to cover it while a request is out. Centering it on the page is
 * `.kit-auth-page`, on a wrapper. Styles come from `@jchpro/ngx-kit/styles/auth`.
 */
@Component({
  selector: 'kit-auth-card',
  imports: [LucideCircleAlert],
  templateUrl: './kit-auth-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-auth-card'
  }
})
export class KitAuthCard {

  /** The page's `<h1>`. */
  readonly heading = input.required<string>();

  readonly description = input<string>();

  /**
   * A failure to show above the form, e.g. wrong credentials. The region it lives in is always
   * in the DOM and a `role="alert"`, so setting it is announced.
   */
  readonly error = input<string | null>();

}
