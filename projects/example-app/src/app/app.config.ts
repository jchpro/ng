import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStorage } from '../../../common/src/lib/storage/provide-storage';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStorage({
      namespace: {
        localhostOnly: true,
        value: 'jchpro.ng.example_app'
      }
    })
  ]
};
