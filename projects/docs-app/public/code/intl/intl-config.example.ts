import { provideIntlConfig } from '@jchpro/ngx-common';

{
  providers: [                        // All configuration is optional
    provideIntlConfig({
      locale: 'en-gb',                // or a factory function run in injection context which should return Signal<string>,
      defaults: {
        dateFormat: 'long',           // Allowed values as defined in Intl
        timeFormat: 'short',
        datetimeFormat: 'short-short' // date and format combined with hyphen
      }
    })
  ]
}
