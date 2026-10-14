import { Component, signal } from '@angular/core';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-feedback-status',
  imports: [
    CodeExample
  ],
  templateUrl: './status.tab.html',
  styleUrl: '../../specimens.scss'
})
export class StatusTab {

  protected readonly rangeValue = signal(40);

  protected onRange(event: Event) {
    this.rangeValue.set(+(event.target as HTMLInputElement).value);
  }

}
