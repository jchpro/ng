import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { Reactive } from '@jchpro/ngx-common';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[appLogClicks]'
})
export class LogClicksDirective extends Reactive implements OnDestroy {

  #el = inject(ElementRef).nativeElement;

  constructor() {
    super();
    fromEvent(this.#el, 'click')
      .pipe(this.observeUntilDestroy())  // unsubscribed automatically on destroy
      .subscribe(() => console.log('clicked'));
  }

  override ngOnDestroy() {
    super.ngOnDestroy();                 // required if you implement your own ngOnDestroy
    // ... your own cleanup
  }

}
