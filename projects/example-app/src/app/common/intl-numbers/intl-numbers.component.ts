import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyDisplay, IntlCurrencyPipe, IntlNumberPipe, NumberFormat } from '@jchpro/ngx-common';
import { ExampleTitleComponent } from '../../core/example-title/example-title.component';
import { FullRowDirective } from '../../core/full-row.directive';

@Component({
  selector: 'app-intl-numbers',
  imports: [
    ExampleTitleComponent,
    FullRowDirective,
    ReactiveFormsModule,
    FormsModule,
    IntlNumberPipe,
    IntlCurrencyPipe
  ],
  templateUrl: './intl-numbers.component.html'
})
export class IntlNumbersComponent {

  number = 12_345.67;
  style: NumberFormat = 'decimal';
  money = 123_567.89;
  currency: string = 'USD';
  display: CurrencyDisplay = 'symbol';

  // changeDetectorRef = inject(ChangeDetectorRef);

}
