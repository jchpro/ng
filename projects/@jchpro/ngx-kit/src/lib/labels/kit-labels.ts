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
 * Where a feature's labels come from: a plain (partial) value, a signal of one (re-merged as it changes),
 * or a factory returning that signal, run in an injection context so it can `inject()` a service.
 */
export type KitLabelsSource<O> = O | Signal<O> | (() => Signal<O>);

/**
 * Runs the factory of a `KitLabelsSource` (call it in an injection context), or returns the value or
 * signal as is. A signal is a function too, so it's told apart with `isSignal`.
 */
export function resolveKitLabelsSource<O>(source: KitLabelsSource<O>): O | Signal<O> {
  return typeof source === 'function' && !isSignal(source) ? (source as () => Signal<O>)() : source as O | Signal<O>;
}

/**
 * Provider for a feature's labels token: `labels` merged over `defaults`, from a plain value, from a
 * signal (re-merged as it changes) or from a factory run when the token is first injected. Shared by
 * every feature's `provideKitXLabels`.
 */
export function provideKitLabelsFor<T extends object>(
  token: InjectionToken<Signal<T>>,
  defaults: T,
  labels: KitLabelsSource<KitLabelsOverride<T>>
): Provider {
  return {
    provide: token,
    useFactory: () => {
      const source = resolveKitLabelsSource(labels);
      return isSignal(source)
        ? computed(() => mergeKitLabels(defaults, source()))
        : signal(mergeKitLabels(defaults, source)).asReadonly();
    }
  };
}

/** Replaces each `{name}` in `template` with its value, e.g. the `{from}` of a paginator range. */
export function formatKitLabel(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((message, [name, value]) => message.replaceAll(`{${name}}`, String(value)), template);
}
