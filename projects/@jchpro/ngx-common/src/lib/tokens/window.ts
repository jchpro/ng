import { InjectionToken } from "@angular/core";

/**
 * `window` injection token, defaults to the global object.
 */
export const WINDOW = new InjectionToken<Window>('WINDOW', {
  factory: () => window
});
