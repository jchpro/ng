import { Directive, input } from '@angular/core';

/**
 * Marks an element projected into a kit component as the replacement for one of its built-in
 * icons — an SVG from another icon library, an emoji, an `<img>`, anything. The value names the
 * slot, as documented by the component that offers it:
 *
 * ```html
 * <kit-password-toggle>
 *   <input type="password" />
 *   <span kitIcon="show">👁</span>
 * </kit-password-toggle>
 * ```
 *
 * Picking a different icon from Lucide itself needs no slot, but an icon of another source does.
 */
@Directive({
  selector: '[kitIcon]'
})
export class KitIcon {

  /** The slot this element fills, e.g. `show` or `hide`. */
  readonly slot = input.required<string>({ alias: 'kitIcon' });

}
