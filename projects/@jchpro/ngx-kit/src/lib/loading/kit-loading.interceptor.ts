import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KitLoadingService } from './kit-loading.service';

/**
 * Request context flag that keeps a request out of the global loading state — for polling and
 * other background calls: `http.get(url, { context: new HttpContext().set(KIT_LOADING_SKIP, true) })`.
 */
export const KIT_LOADING_SKIP = new HttpContextToken<boolean>(() => false);

/**
 * Opt-in: reports every HTTP request to `KitLoadingService`.
 * `provideHttpClient(withInterceptors([kitLoadingInterceptor]))`
 */
export const kitLoadingInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(KIT_LOADING_SKIP)) {
    return next(request);
  }
  return inject(KitLoadingService).track(next(request));
};

/** Convenience for building the context that `KIT_LOADING_SKIP` expects. */
export function kitLoadingSkipContext(): HttpContext {
  return new HttpContext().set(KIT_LOADING_SKIP, true);
}
