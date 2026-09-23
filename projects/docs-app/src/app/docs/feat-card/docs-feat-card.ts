import { Component, input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

@Component({
  selector: 'app-docs-feat-card',
  imports: [
    LucideDynamicIcon,
  ],
  templateUrl: './docs-feat-card.html',
  styleUrl: './docs-feat-card.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class DocsFeatCard {

  readonly header = input('');
  readonly icon = input<LucideIcon>();

}
