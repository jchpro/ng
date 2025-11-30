import { ProFilesIntl, provideFilesIntl } from '@jchpro/ngx-material';

export class MyFilesIntl extends ProFilesIntl {

  // To change the labels, emit the new object on the `labels` signal.

  // If you use the Intl mechanism from `@jchpro/ngx-common`, there is an instance of `IntlService` available here for your convenience.
  // protected readonly intl: IntlService

  constructor() {
    super();
    this.labels.update(val => ({
      ...val,
      selectLabel: 'Select that thang!'
    }))
  }

}

// Provide the class in your app's config by passing the factory function, which will be run in the injection context.
{
  providers: [
    provideFilesIntl(() => new MyFilesIntl())
  ]
}
