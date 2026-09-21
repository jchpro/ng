import { Component, input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-docs-feat-card',
  imports: [
    FaIconComponent,
  ],
  templateUrl: './docs-feat-card.html',
  styleUrl: './docs-feat-card.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class DocsFeatCard {

  readonly header = input('');
  readonly icon = input<IconDefinition>();

}
