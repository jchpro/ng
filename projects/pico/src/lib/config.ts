import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { PicoDialogGlobalConfig } from './components/modal/pico-dialog';
import { PicoTooltipPlacement } from './components/tooltip/pico-tooltip.directive';

/**
 * Use to optionally provide default Pico config globally.
 */
export function providePicoConfig(init: PicoConfigInit): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PICO_CONFIG,
      useValue: new PicoConfig(init)
    }
  ]);
}

/**
 * Initialization object for Pico configuration.
 */
export interface PicoConfigInit {

  /**
   * Default tooltip placement.
   *
   * @default 'bottom'
   */
  tooltipPlacement?: PicoTooltipPlacement;

  /**
   * Default dialog config.
   */
  dialog?: PicoDialogGlobalConfig;
}

export const PICO_CONFIG = new InjectionToken<PicoConfig>('PICO_CONFIG', {
  factory: () => new PicoConfig()
});

export class PicoConfig implements Required<PicoConfigInit> {

  public readonly tooltipPlacement: PicoTooltipPlacement;
  public readonly dialog: PicoDialogGlobalConfig;

  constructor(init?: PicoConfigInit) {
    this.tooltipPlacement = init?.tooltipPlacement ?? 'bottom';
    this.dialog = init?.dialog ?? {
      closeOnOverlayClick: false,
      animation: false,
    };
  }

}
