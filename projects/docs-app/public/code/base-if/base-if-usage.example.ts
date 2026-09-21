import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { BaseIf } from '@jchpro/ngx-common';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';

@Directive({
  selector: '[appIfOnline]'
})
export class IfOnlineDirective extends BaseIf {

  #online$ = new BehaviorSubject(navigator.onLine);

  constructor(templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
    super(templateRef, viewContainer);

    this.renderBinding = this.#online$;           // the stream that decides render vs. clear
    this.bindRendering();                          // call once your setup is done

    merge(
      fromEvent(window, 'online').pipe(() => true),
      fromEvent(window, 'offline').pipe(() => false)
    )
      .pipe(this.observeUntilDestroy())            // inherited from Reactive
      .subscribe(online => this.#online$.next(online));
  }

}
