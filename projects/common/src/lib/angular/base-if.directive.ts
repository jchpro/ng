import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ReactiveDirective } from '../reactivity/reactive.directive';

/**
 * Base logic for creating *ngIf-like structural directives.
 */
@Directive()
export class BaseIfDirective extends ReactiveDirective {

  protected hasView: boolean = false;
  protected renderBinding?: Subject<boolean>;
  private renderingBound: boolean = false;

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef
  ) {
    super();
  }

  /**
   * Call in extending class once your initialization logic is done.
   */
  protected bindRendering(): boolean {
    if (!this.renderBinding) {
      return false;
    }
    if (this.renderingBound) {
      return true;
    }
    this.renderBinding
      .pipe(takeUntil(this.destroySubject))
      .subscribe(shouldRender => {
        this.render(shouldRender);
      });
    this.renderingBound = true;
    return true;
  }

  protected render(shouldRender: boolean) {
    if (shouldRender && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldRender && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

}
