import { Component } from '@angular/core';
import { ContentProvider } from '@jchpro/ngx-common';

@Component({
  selector: 'pro-admin-toolbar-start',
  imports: [],
  template: '<ng-template><ng-content></ng-content></ng-template>'
})
export class AdminToolbarStart extends ContentProvider {

  // TODO
  //   - middle should go to extra bar on mobile
  //   - simplify what's happening in toolbar itself

}
