import { Component, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-docs-feat-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    FaIconComponent,
  ],
  templateUrl: './docs-feat-card.html',
  styleUrl: './docs-feat-card.scss',
})
export class DocsFeatCard {

  readonly header = input('');
  readonly icon = input<IconDefinition>();

}
