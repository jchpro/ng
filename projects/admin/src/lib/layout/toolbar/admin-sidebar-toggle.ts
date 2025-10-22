import { Component, input } from '@angular/core';
import { ContentProvider } from '@jchpro/ngx-common';

@Component({
  selector: 'pro-admin-sidebar-toggle',
  imports: [],
  template: '<ng-template><ng-content></ng-content></ng-template>'
})
export class AdminSidebarToggle extends ContentProvider {

  readonly customIcon = input(false);

}
