import { Component, signal } from '@angular/core';
import { KitCheckGroup, KitTile, KitTiles } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-choice',
  imports: [
    CodeExample,
    KitCheckGroup,
    KitTile,
    KitTiles
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
  protected readonly tile = signal<string | null>('violet');
  protected readonly samples = [
    { id: 'violet', name: 'violet-banner.png', color: '#6c2a8c', disabled: false },
    { id: 'pink', name: 'pink.png', color: '#b24cb2', disabled: false },
    { id: 'indigo', name: 'indigo-hero-with-a-long-name.png', color: '#390f61', disabled: false },
    { id: 'peach', name: 'peach.png', color: '#eab88f', disabled: false },
    { id: 'pdf', name: 'terms.pdf (not an image)', color: '#8d889e', disabled: true }
  ];

}
