import { ProDialogsIntl, provideDialogsIntl } from '@jchpro/ngx-material';

export class MyDialogIntl extends ProDialogsIntl {

  // To change the labels, emit the new object on the `labels` signal.

  constructor() {
    super();
    this.labels.update(val => ({
      ...val,
      infoTitle: '!!! NOTICE !!!'
    }))
  }

  // If you use the Intl mechanism from `@jchpro/ngx-common`, there is an instance of `IntlService` available here for your convenience.
  // protected readonly intl: IntlService

}

// Provide the class in your app's config by passing the factory function, which will be run in the injection context.
{
  providers: [
    provideDialogsIntl(() => new MyDialogIntl())
  ]
}
