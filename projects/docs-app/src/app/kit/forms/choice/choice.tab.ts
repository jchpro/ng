import { Component, signal } from '@angular/core';
import { KitCheckGroup } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-choice',
  imports: [
    CodeExample,
    KitCheckGroup
  ],
  templateUrl: './choice.tab.html',
  styleUrl: '../../specimens.scss'
})
export class ChoiceTab {

  protected readonly roles = [
    { id: 'admin', name: 'Administrator', note: 'required to manage content' },
    { id: 'editor', name: 'Editor', note: 'writes and publishes' },
    { id: 'viewer', name: 'Viewer', note: 'read-only' }
  ];
  protected readonly selected = signal<string[]>(['editor']);

}
