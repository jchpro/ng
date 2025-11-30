import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { CustomIconConfig, DEFAULT_PRO_MAT_ICONS_MAPPING, ProMatIconsMapping } from './icons';

export function provideIcons(init?: {

  /**
   * Provide this if you want to use custom mapping to Material icons.
   * Leave fields empty to use the default mapping from {@link DEFAULT_PRO_MAT_ICONS_MAPPING}.
   */
  matMapping?: Partial<ProMatIconsMapping>;

  /**
   * Factory function run in the injection context, which should return a custom icon configuration.
   */
  custom?: () => CustomIconConfig;
}): EnvironmentProviders {
  const config: ProIconConfig = {
    matMapping: { ...DEFAULT_PRO_MAT_ICONS_MAPPING, ...init?.matMapping },
    custom: init?.custom
  };
  return makeEnvironmentProviders([
    {
      provide: PRO_ICON_CONFIG,
      useValue: config
    }
  ]);
}

export interface ProIconConfig {
  readonly matMapping: ProMatIconsMapping;
  readonly custom?: () => CustomIconConfig;
}

export const PRO_ICON_CONFIG = new InjectionToken<ProIconConfig>('PRO_ICON_CONFIG');
