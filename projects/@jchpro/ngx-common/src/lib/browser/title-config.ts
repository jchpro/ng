import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

/**
 * Configuration for the {@link TitleService}, optional.
 */
export interface TitleConfig {

  /**
   * If enabled, the service will observe `NavigationEnd` event and try to resolve
   * title assuming the data object implements {@link RouteTitleData} and set it.
   *
   * @default false
   */
  observeRouteData?: boolean;

  /**
   * Allows formating the title, great for adding postfixes, prefixes, etc.
   */
  formatFn?: (dynamic: string) => string;
}

/**
 * Holder of the view title for usage in routing data.
 */
export interface RouteTitleData {
  title?: string;
}


/**
 * Injection token for providing {@link TitleConfig}, please use {@link provideBrowserTitle}.
 */
export const BROWSER_TITLE_CONFIG = new InjectionToken<TitleConfig>('BROWSER_TITLE_CONFIG');

/**
 * Provides a {@link TitleService} configuration.
 */
export function provideBrowserTitle(config?: TitleConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: BROWSER_TITLE_CONFIG,
    useValue: config ?? {}
  }]);
}
