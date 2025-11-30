import { provideErrorsIntl, ProErrorsIntl } from '@jchpro/ngx-material';

export class MyErrorIntl extends ProErrorsIntl {

  // Override built-it messages by extending default implementation.

  override required = `Required I tell 'ya!`

  override min(obj: { actual: number }) {
    return `Noooooo, ${obj.actual} is too small!`;
  }

  // Add any custom error as either string field or method.
  // Note that the name of the field or method must match the name of the error you use in form controls.

  simpleError = 'Simple message';

  complexError(obj: { foo: string; }) {
    return `Complex message ${obj.foo}`;
  }

  // To change static messages after locale change, observe your mechanism's events and emit the value on the `changes` subject.
  // readonly changes: Subject<void>;

  // If you use the Intl mechanism from `@jchpro/ngx-common`, there is an instance of `IntlService` available here for your convenience.
  // protected readonly intl: IntlService

}

// Provide the class in your app's config by passing the factory function, which will be run in the injection context.
{
  providers: [
    provideErrorsIntl(() => new MyErrorIntl())
  ]
}
