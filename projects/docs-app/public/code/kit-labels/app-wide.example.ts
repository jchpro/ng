import { provideKitDialogLabels, provideKitLabels } from '@jchpro/ngx-kit';

export const appConfig: ApplicationConfig = {
  providers: [
    // every built-in string in Polish; a signal follows a language that changes at runtime
    provideKitLabels('pl'),

    // change just some labels: merged over the defaults, so pass only what differs
    provideKitDialogLabels({ buttons: { ok: 'Got it' } })
  ]
};
