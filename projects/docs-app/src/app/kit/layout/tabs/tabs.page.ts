import { Component, signal } from '@angular/core';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-tabs',
  imports: [
    CodeExample
  ],
  templateUrl: './tabs.page.html',
  styleUrl: '../../specimens.scss'
})
export class TabsPage {

  protected readonly tabs = [
    { label: 'General' },
    { label: 'Questions', count: 12 },
    { label: 'Tasks', count: 3 },
    { label: 'Colors' },
    { label: 'Deployment' }
  ];
  protected readonly active = signal('General');

}
