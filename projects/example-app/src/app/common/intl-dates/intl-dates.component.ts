import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateFormat, DatetimeFormat, IntlDatePipe, IntlDatetimePipe, IntlTimePipe, TimeFormat } from '@jchpro/ngx-common';
import { libraries } from '../../core/libraries';

@Component({
  selector: 'app-intl-dates',
  imports: [
    IntlDatePipe,
    IntlTimePipe,
    IntlDatetimePipe,
    FormsModule
  ],
  templateUrl: './intl-dates.component.html',
  styleUrl: './intl-dates.component.scss'
})
export class IntlDatesComponent {

  readonly date = new Date();
  readonly rawDate = this.date.toISOString();
  dateFormat: DateFormat = 'medium';
  timeFormat: TimeFormat = 'medium';
  locale = 'en-GB';

  changeDetectorRef = inject(ChangeDetectorRef);

  get datetimeFormat(): DatetimeFormat {
    return `${this.dateFormat}-${this.timeFormat}`;
  }

  protected readonly libraries = libraries;
}
