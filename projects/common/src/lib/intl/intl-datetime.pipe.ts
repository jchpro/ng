import { Pipe, PipeTransform } from '@angular/core';
import { DateFormat, DatetimeFormat, TimeFormat } from './intl-config';
import { IntlDateBase } from './intl-date-base';

/**
 * Formats datetime using `Intl` date & time style presets.
 */
@Pipe({
  name: 'intlDatetime'
})
export class IntlDatetimePipe extends IntlDateBase implements PipeTransform {

  transform(value: string | number | Date | null | undefined,
            format?: DatetimeFormat,
            locale?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    const [dateFormat, timeFormat] = IntlDatetimePipe.parseFormats(format ?? this.defaultDatetimeFormat);
    return IntlDateBase.buildDateTimeFormat(
      this.effectiveLocale(locale),
      dateFormat,
      timeFormat
    ).format(date);
  }

  static parseFormats(compound: DatetimeFormat): [DateFormat, TimeFormat] {
    const [dateRaw, timeRaw] = compound.split('-');
    return [dateRaw as DateFormat, timeRaw as TimeFormat];
  }

}

