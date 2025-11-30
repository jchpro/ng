import { InjectionToken, makeEnvironmentProviders, Signal } from '@angular/core';

export function provideAdminLayoutRules(

  /**
   * All factory functions will be run in the injection context.
   */
  init: {

    /**
     * The returned Signal will be used to determine whether the layout should be mobile.
     */
    readonly mobileLayout: () => Signal<boolean>,

    /**
     *  Config for the sidebar modes and availability.
     */
    readonly sidebar ? : {

      /**
       *  Determines whether the sidebar should be available at all.
       *  @default 'always'
       */
      readonly available?: AdminLayoutOnOffRule;

      /**
       *  Determines whether the sidebar should be in the toggle mode.
       *  The mode is user only when the sidebar is available.
       *  @default 'on_mobile'
       */
      readonly toggleMode?: AdminLayoutOnOffRule;

    }
}) {
  const config: AdminLayoutConfig = {
    mobileLayout: init.mobileLayout,
    sidebarAvailable: initializeOnOffRule(init.mobileLayout, 'always', init.sidebar?.available),
    sidebarToggleMode: initializeOnOffRule(init.mobileLayout, 'on_mobile', init.sidebar?.toggleMode),
  };
  return makeEnvironmentProviders([
    {
      provide: ADMIN_LAYOUT_CONFIG,
      useValue: config
    }
  ]);
}

function initializeOnOffRule(mobileLayout: () => Signal<boolean>,
                             defaults: AdminLayoutOnOffDerivedRule,
                             rule?: AdminLayoutOnOffRule): boolean | (() => Signal<boolean>) {
  if (!rule) {
    if (defaults === 'on_mobile') {
      return mobileLayout;
    }
    return defaults === 'always';
  }
  if (typeof rule === 'function') {
    return rule;
  }
  if (rule === 'on_mobile') {
    return mobileLayout;
  }
  return rule === 'always';
}

export interface AdminLayoutConfig {
  readonly mobileLayout: () => Signal<boolean>;
  readonly sidebarAvailable: boolean | (() => Signal<boolean>);
  readonly sidebarToggleMode: boolean | (() => Signal<boolean>);
}

type AdminLayoutOnOffDerivedRule = 'on_mobile' | 'always' | 'never';

export type AdminLayoutOnOffRule = AdminLayoutOnOffDerivedRule | (() => Signal<boolean>);

export const ADMIN_LAYOUT_CONFIG = new InjectionToken<AdminLayoutConfig>('ADMIN_LAYOUT_CONFIG');
