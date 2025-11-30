import { Component } from '@angular/core';
import { ContentProvider } from '@jchpro/ngx-common';

@Component({
  selector: 'pro-admin-toolbar-end',
  imports: [],
  template: '<ng-template><ng-content></ng-content></ng-template>'
})
export class AdminToolbarEnd extends ContentProvider {

}
