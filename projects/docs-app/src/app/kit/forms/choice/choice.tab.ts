import { Component, signal } from '@angular/core';
import { KitCheckGroup, KitCombobox, KitComboboxOption, KitTile, KitTiles } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

const COUNTRIES: KitComboboxOption<string>[] = [
  { value: 'at', label: 'Austria' },
  { value: 'be', label: 'Belgium' },
  { value: 'cz', label: 'Czechia' },
  { value: 'dk', label: 'Denmark' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'gr', label: 'Greece', disabled: true },
  { value: 'hu', label: 'Hungary' },
  { value: 'it', label: 'Italy' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'no', label: 'Norway' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'es', label: 'Spain' },
  { value: 'se', label: 'Sweden' }
];

@Component({
  selector: 'app-forms-choice',
  imports: [
    CodeExample,
    KitCheckGroup,
    KitCombobox,
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
  protected readonly countries = COUNTRIES;
  protected readonly country = signal<string | null>('pl');
  protected readonly found = signal<KitComboboxOption<string>[]>(COUNTRIES);
  protected readonly lookupCountry = signal<string | null>(null);
  protected readonly loading = signal(false);
  #lookup: ReturnType<typeof setTimeout> | undefined;
  protected readonly selected = signal<string[]>(['editor']);
  protected readonly tile = signal<string | null>('violet');
  protected readonly samples = [
    { id: 'violet', name: 'violet-banner.png', color: '#6c2a8c', disabled: false },
    { id: 'pink', name: 'pink.png', color: '#b24cb2', disabled: false },
    { id: 'indigo', name: 'indigo-hero-with-a-long-name.png', color: '#390f61', disabled: false },
    { id: 'peach', name: 'peach.png', color: '#eab88f', disabled: false },
    { id: 'pdf', name: 'terms.pdf (not an image)', color: '#8d889e', disabled: true }
  ];

  /** Stands in for a request: the answer comes after a pause, and only the latest query counts. */
  protected search(query: string) {
    clearTimeout(this.#lookup);
    this.loading.set(true);
    this.#lookup = setTimeout(() => {
      const needle = query.toLowerCase();
      this.found.set(COUNTRIES.filter(country => country.label.toLowerCase().includes(needle)));
      this.loading.set(false);
    }, 600);
  }

}
