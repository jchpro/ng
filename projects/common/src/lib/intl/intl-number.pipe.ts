import { Pipe, PipeTransform } from '@angular/core';
import { IntlBase } from './intl-base';
import { NumberFormat } from './intl-config';

/**
 * Formats number using `Intl` using style preset or full configuration object.
 */
@Pipe({
  name: 'intlNumber'
})
export class IntlNumberPipe extends IntlBase implements PipeTransform {

  transform(value: string | number,
            format?: NumberFormat,
            locale?: string): string {
    const num = IntlNumberPipe.makeFiniteNumber(value);
    if (num === null) {
      return '';
    }
    const formatInstance = new Intl.NumberFormat(
      this.effectiveLocale(locale),
      typeof format === 'string' ? { style: format } : format
    );
    return formatInstance.format(num);
  }

  static makeFiniteNumber(input: string | number): number | null {
    const value = Number(input);
    if (!isFinite(value)) {
      return null;
    }
    return value;
  }

}
