import { computed, InjectionToken, isSignal, Provider, signal, Signal } from '@angular/core';

/** Any part of a feature's labels — the rest stays as the defaults. Nested groups work the same way. */
export type KitLabelsOverride<T> = {
  [K in keyof T]?: T[K] extends object ? KitLabelsOverride<T[K]> : T[K];
};

/** Merges `override` over `defaults`, group by group, so a partial override keeps everything else. */
export function mergeKitLabels<T extends object>(defaults: T, override: KitLabelsOverride<T> | undefined): T {
  const merged = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const defaultValue = defaults[key];
    const overrideValue = override?.[key];
    if (overrideValue === undefined) {
      continue;
    }
    merged[key] = typeof defaultValue === 'object' && defaultValue !== null
      ? mergeKitLabels(defaultValue, overrideValue as KitLabelsOverride<typeof defaultValue>)
      : overrideValue;
  }
  return merged as T;
}

/**
 * Provider for a feature's labels token: `labels` merged over `defaults`, from a plain value or
 * from a signal (re-merged as it changes). Shared by every feature's `provideKitXLabels`.
 */
export function provideKitLabelsFor<T extends object>(
  token: InjectionToken<Signal<T>>,
  defaults: T,
  labels: KitLabelsOverride<T> | Signal<KitLabelsOverride<T>>
): Provider {
  return {
    provide: token,
    useValue: isSignal(labels)
      ? computed(() => mergeKitLabels(defaults, labels()))
      : signal(mergeKitLabels(defaults, labels)).asReadonly()
  };
}

/** Replaces each `{name}` in `template` with its value, e.g. the `{from}` of a paginator range. */
export function formatKitLabel(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((message, [name, value]) => message.replaceAll(`{${name}}`, String(value)), template);
}
