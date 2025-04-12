import { InjectionToken } from "@angular/core";

/**
 * `localStorage` injection token, defaults to the global object.
 */
export const LOCAL_STORAGE = new InjectionToken<Storage>('LOCAL_STORAGE', {
  factory: () => localStorage
});

/**
 * `sessionStorage` injection token, defaults to the global object.
 */
export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
  factory: () => sessionStorage
});
