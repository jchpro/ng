import { Directive, TemplateRef, viewChild } from '@angular/core';

/**
 * Use this to build complex layouts with content projected into it.
 *
 * Extend your component with the following template:
 *
 * ```html
 * <ng-template><ng-content></ng-content></ng-template>
 * ```
 */
@Directive()
export class ContentProvider<C = any> {

  readonly contentTemplate = viewChild.required(TemplateRef<C>);

}
