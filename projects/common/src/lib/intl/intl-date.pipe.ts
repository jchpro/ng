import { Pipe, PipeTransform } from '@angular/core';
import { DateFormat } from './intl-config';
import { IntlDateBase } from './intl-date-base';

/**
 * Formats date using `Intl` date style presets.
 */
@Pipe({
  name: 'intlDate'
})
export class IntlDatePipe extends IntlDateBase implements PipeTransform {

  transform(value: string | number | Date | null | undefined,
            format?: DateFormat,
            locale?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    return IntlDateBase.buildDateTimeFormat(
      this.effectiveLocale(locale),
      format ?? this.defaultDateFormat,
      undefined
    ).format(date);
  }

}
