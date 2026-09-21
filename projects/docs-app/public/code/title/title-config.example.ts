import { provideBrowserTitle } from '@jchpro/ngx-common';

{
  providers: [                                    // All configuration is optional
    provideBrowserTitle({
      observeRouteData: true,                     // reads `{ title?: string }` from route data after NavigationEnd
      formatFn: title => `${title} | My App`       // postfix/prefix the title however you like
    })
  ]
}
