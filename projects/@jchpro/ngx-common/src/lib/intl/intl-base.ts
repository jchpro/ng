import { inject, Injectable } from '@angular/core';
import { INTL_CONFIG } from './intl-config';

/**
 * Base class for a mechanism built on top of `Intl`.
 */
@Injectable()
export class IntlBase {

  protected readonly config = inject(INTL_CONFIG, { optional: true }) ?? undefined;

}
