import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideBrowserTitle, provideIntlConfig, provideStorage } from '@jchpro/ngx-common';
import { provideLucideConfig } from '@lucide/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideLucideConfig({
      // Icons scale with the surrounding font-size; Lucide's own default is a fixed 24px.
      size: '1em'
    }),
    provideStorage({
      namespace: {
        localhostOnly: true,
        value: 'jchpro.ng.docs_app'
      }
    }),
    provideBrowserTitle({
      observeRouteData: true,
      formatFn: title => `${title} | @jchpro/ngx`
    }),
    provideIntlConfig({
      locale: 'en-GB',
    }),
  ]
};
