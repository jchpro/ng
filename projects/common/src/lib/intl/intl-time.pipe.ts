import { Pipe, PipeTransform } from '@angular/core';
import { TimeFormat } from './intl-config';
import { IntlDateBase } from './intl-date-base';

/**
 * Formats date using `Intl` time style presets.
 */
@Pipe({
  name: 'intlTime'
})
export class IntlTimePipe extends IntlDateBase implements PipeTransform {

  transform(value: string | number | Date | null | undefined,
            format?: TimeFormat,
            locale?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    return IntlDateBase.buildDateTimeFormat(
      this.effectiveLocale(locale),
      undefined,
      format ?? this.defaultTimeFormat
    ).format(date);
  }

}
