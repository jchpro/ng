import { Directive, OnDestroy } from "@angular/core";
import { MonoTypeOperatorFunction, Subject, takeUntil } from "rxjs";

/**
 * Extends your directive with {@link ReactiveDirective} and make observing
 * of reactive streams until the destruction of the directive a bit easier.
 *
 * Remember to call `super.ngOnDestroy()` if you implement `OnDestroy` in your own directive.
 */
@Directive({})
export class ReactiveDirective implements OnDestroy {

  protected readonly destroySubject = new Subject<void>();

  /**
   * Call in extending directive if you have your own implementation.
   */
  ngOnDestroy() {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  /**
   * Observe reactive stream until the directive gets destroyed.
   */
  protected observeUntilDestroy<T>(): MonoTypeOperatorFunction<T> {
    return takeUntil<T>(
      this.destroySubject
    );
  }

}
