import { InjectionToken, Provider } from '@angular/core';

export type KitToastKind = 'success' | 'error' | 'info';

/** Why a toast went away: its time ran out, it was closed (by the person or by `dismiss()`), or its action was pressed. */
export type KitToastCloseReason = 'timeout' | 'dismissed' | 'action';

export type KitToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface KitToastOptions {
  /**
   * How long the toast stays, in milliseconds, instead of the default of its kind. `null` keeps it until it is
   * closed. Pass a positive number: there is no "instant", a toast the person can't read isn't one.
   */
  duration?: number | null;
  /** The label of a button on the toast ("Undo"). Pressing it closes the toast with `'action'`, see `closed`. */
  action?: string;
}

export interface KitToastRef {
  /** Resolves when the toast goes away, with why. */
  readonly closed: Promise<KitToastCloseReason>;
  /** Closes the toast now. Does nothing once it is closed. */
  dismiss(): void;
}

/** App-wide settings of the toasts, see `provideKitToasts`. The closest wins: these, then the call's own options. */
export interface KitToastConfig {
  /** How long each kind stays, in milliseconds, `null` for until closed. Defaults: success 4000, info 5000, error `null`. */
  durations?: Partial<Record<KitToastKind, number | null>>;
  /** The least a toast with an action stays, when its time comes from `durations` (a duration passed to the call is kept). Default 8000. */
  actionMinDuration?: number;
  /** How many toasts show at once, the rest wait their turn. Default 5. */
  max?: number;
  /** Where on the screen. Default `bottom-end`. */
  position?: KitToastPosition;
}

export const KIT_TOAST_DEFAULTS = {
  durations: { success: 4000, info: 5000, error: null } as Record<KitToastKind, number | null>,
  actionMinDuration: 8000,
  max: 5,
  position: 'bottom-end' as KitToastPosition
};

export const KIT_TOAST_CONFIG = new InjectionToken<KitToastConfig>('KIT_TOAST_CONFIG', {
  factory: () => ({})
});

/** App-wide settings of the toasts: how long each kind stays, how many show at once, where. Every part is optional. */
export function provideKitToasts(config: KitToastConfig): Provider {
  return { provide: KIT_TOAST_CONFIG, useValue: config };
}
