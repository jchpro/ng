import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';
import { KitLoadingService } from './kit-loading.service';

/**
 * Opt-in: reports router navigations to `KitLoadingService`, from `NavigationStart` until it
 * ends, is cancelled or fails — which includes time spent in lazy loading and resolvers.
 */
export function provideKitNavigationLoading(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const loading = inject(KitLoadingService);
    const ongoing = new Map<number, () => void>();

    inject(Router).events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        ongoing.set(event.id, loading.begin());
        return;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        ongoing.get(event.id)?.();
        ongoing.delete(event.id);
      }
    });
  });
}
