import { Pipe, PipeTransform } from '@angular/core';
import { IntlNumberPipe } from './intl-number.pipe';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const STEP = 1024;

/**
 * Formats a size in bytes the way people read it (`1.5 MB`, `1,5 MB` in Polish), 1024 to a step.
 * The units are the same in every language, the number follows `locale`.
 */
@Pipe({
  name: 'intlFileSize'
})
export class IntlFileSizePipe implements PipeTransform {

  transform(bytes: string | number | null | undefined, locale: string): string {
    if (bytes === null || bytes === undefined || bytes === '') {
      return '';
    }
    const size = IntlNumberPipe.makeFiniteNumber(bytes);
    if (size === null) {
      return '';
    }
    let value = size;
    let unit = 0;
    while (Math.abs(value) >= STEP && unit < UNITS.length - 1) {
      value /= STEP;
      unit++;
    }
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value);
    return `${number} ${UNITS[unit]}`;
  }

}
