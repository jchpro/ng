import { Directive, HostBinding, Input } from "@angular/core";
import { PicoDirective } from '../../core/pico.directive';

/**
 * Attaches relevant attributes in order display simple text tooltip.
 *
 * Pico.css reference: https://picocss.com/docs/tooltip
 */
@Directive({
  selector: '[picoTooltip]'
})
export class PicoTooltipDirective extends PicoDirective {

  /**
   * Required tooltip text.
   */
  @Input({ required: true }) picoTooltip!: string;

  /**
   * Optional tooltip placement.
   *
   * @default 'bottom'
   */
  @Input() @HostBinding('attr.data-placement') tooltipPlacement = this.config.tooltipPlacement;

  /**
   * Disables showing the tooltip.
   */
  @Input() tooltipDisabled = false;

  @HostBinding('attr.data-tooltip') protected get boundAttr(): string | undefined {
    if (this.tooltipDisabled) {
      return;
    }
    return this.picoTooltip;
  }

}

export type PicoTooltipPlacement = 'bottom' | 'left' | 'right' | 'top';
