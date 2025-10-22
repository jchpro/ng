import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  CurrencyDisplay,
  DateFormat,
  DatetimeFormat,
  IntlCurrencyPipe,
  IntlDatePipe,
  IntlDatetimePipe,
  IntlNumberPipe,
  IntlService,
  IntlTimePipe, NumberFormat,
  TimeFormat
} from '@jchpro/ngx-common';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-intl-dates',
  imports: [
    FormsModule,
    LibPageTitle,
    CodeExample,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    IntlDatePipe,
    IntlTimePipe,
    IntlDatetimePipe,
    CodeCopyDirective,
    MatInput,
    IntlNumberPipe,
    IntlCurrencyPipe
  ],
  templateUrl: './intl-utils.page.html',
  styles: ` .controls { > * { margin-right: 0.5rem; } }
    table { margin-top: 0.5rem;  }
    .raw { font-family: monospace; cursor: pointer; }`
})
export class IntlUtilsPage {

  protected date = new Date();
  protected rawDate = this.date.toISOString();
  protected readonly intl = inject(IntlService)
  protected readonly localeOptions = [
    'en-GB',
    'en-US',
    'fr-FR',
    'de-DE',
    'es-ES',
    'pl-PL'
  ];
  protected readonly dateFormats: TimeFormat[] = [
    'short',
    'medium',
    'long',
    'full'
  ];
  protected readonly timeFormats: DateFormat[] = [
    'short',
    'medium',
    'long',
    'full'
  ];
  protected readonly currencies: string[] = [
    'USD',
    'EUR',
    'PLN',
    'GBP',
    'CAD',
  ];
  protected readonly currencyDisplays: CurrencyDisplay[] = [
    'name',
    'code',
    'symbol',
    'narrowSymbol'
  ];

  protected locale = this.intl.locale();
  protected dateFormat: DateFormat = 'medium';
  protected timeFormat: TimeFormat = 'medium';
  protected numberStyle: NumberFormat = 'decimal';
  protected currency = 'USD';
  protected currencyDisplay: CurrencyDisplay = 'name';
  protected numberValue: number = 42.69;

  protected get datetimeFormat(): DatetimeFormat {
    return `${this.dateFormat}-${this.timeFormat}`;
  }

  protected onDateClick() {
    this.date = new Date();
    this.rawDate = this.date.toISOString();
  }

}
