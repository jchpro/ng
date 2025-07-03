import { Pipe, PipeTransform } from '@angular/core';
import { IntlBase } from './intl-base';
import { CurrencyDisplay } from './intl-config';
import { IntlNumberPipe } from './intl-number.pipe';

@Pipe({
  name: 'intlCurrency'
})
export class IntlCurrencyPipe extends IntlBase implements PipeTransform {

  transform(value: string | number,
            currency: string,
            display?: CurrencyDisplay,
            locale?: string): string {
    const num = IntlNumberPipe.makeFiniteNumber(value);
    if (num === null) {
      return '';
    }
    const formatInstance = new Intl.NumberFormat(
      this.effectiveLocale(locale),
      {
        style: 'currency',
        currency,
        currencyDisplay: display
      }
    );
    return formatInstance.format(num);
  }

}
