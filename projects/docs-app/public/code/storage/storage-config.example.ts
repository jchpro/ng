import { provideStorage } from '@jchpro/ngx-common';

{
  providers: [                      // All configuration is optional
    provideStorage({
      namespace: {
        value: 'my_apps_namespace', // Storage keys will be prefixed with this value, e.g. 'my_apps_namespace.my_key'
        localhostOnly: true         // If true, the namespace will only be enabled when hostname is "localhost"
      },
      local: undefined,             // overrides default localStorage, anything implementing Storage interface can be passed here
      session: undefined            // same as local
    })
  ]
}
