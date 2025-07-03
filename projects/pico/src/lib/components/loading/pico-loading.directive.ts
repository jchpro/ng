import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, HostBinding, Input } from '@angular/core';
import { PicoDirective } from '../../core/pico.directive';

/**
 * Attaches relevant attribute in order display simple spinner icon to indicate loading state.
 *
 * Pico.css reference: https://picocss.com/docs/loading
 */
@Directive({
  selector: '[picoLoading]'
})
export class PicoLoadingDirective extends PicoDirective {

  /**
   * Whether to display the loading indicator.
   */
  @Input({ required: true, transform: coerceBooleanProperty }) picoLoading!: boolean;

  @HostBinding('attr.aria-busy') protected get boundAttr(): string | undefined {
    return this.picoLoading ? 'true' : undefined;
  }


}
