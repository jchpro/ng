import { inject, signal, WritableSignal } from '@angular/core';
import { IntlService } from '@jchpro/ngx-common';
import { Subject } from 'rxjs';

export class ProBaseIntl {

  /**
   * If you use `IntlService` from `@jchpro/ngx-common` to set locale in your app, you can access it here.
   *
   * @protected
   */
  protected readonly intl = inject(IntlService);

}

export class ProBaseRxIntl extends ProBaseIntl {

  /**
   * Stream to emit from when labels are changed. Use this to notify components when the labels have
   * changed after initialization.
   */
  readonly changes = new Subject<void>();

}

export abstract class ProBaseLabelsIntl<T> extends ProBaseIntl {

  readonly abstract labels: WritableSignal<T>;

}
