import { Pipe, PipeTransform } from '@angular/core';
import { NumberFormat } from './intl-config';

/**
 * Formats number using `Intl` using style preset or full configuration object.
 */
@Pipe({
  name: 'intlNumber'
})
export class IntlNumberPipe implements PipeTransform {

  transform(value: string | number,
            locale: string,
            format?: NumberFormat): string {
    const num = IntlNumberPipe.makeFiniteNumber(value);
    if (num === null) {
      return '';
    }
    const formatInstance = new Intl.NumberFormat(
      locale,
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
