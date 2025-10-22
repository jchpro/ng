import { ApplicationConfig, inject, provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAdminLayoutRules } from '@jchpro/ngx-admin';
import { provideBrowserTitle, provideIntlConfig, provideStorage } from '@jchpro/ngx-common';
import { routes } from './app.routes';
import { MediaRangesService } from './core/services/media-ranges.service';
import { DocsContextService } from './docs/docs-context.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStorage({
      namespace: {
        localhostOnly: true,
        value: 'jchpro.ng.docs_app'
      }
    }),
    provideBrowserTitle({
      observeRouteData: true
    }),
    provideIntlConfig({
      locale: 'en-GB',
    }),
    provideAdminLayoutRules({
      mobileLayout: () => inject(MediaRangesService).signalState(['sm', 'md']),
      sidebar: {
        available: () => inject(DocsContextService).hasMenu
      }
    })
  ]
};
