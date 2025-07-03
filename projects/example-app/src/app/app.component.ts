import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { PicoDialogOutletDirective } from '@jchpro/ngx-pico';
import { IntlDatesComponent } from './common/intl-dates/intl-dates.component';
import { IntlNumbersComponent } from './common/intl-numbers/intl-numbers.component';
import { RouterEventsServiceComponent } from './common/router-events-service/router-events-service.component';
import { StorageServiceComponent } from './common/storage-service/storage-service.component';
import { TitleServiceComponent } from './common/title-service/title-service.component';
import { ReactiveDirectiveComponent } from './common/reactive-directive/reactive-directive.component';
import { FullRowDirective } from './core/full-row.directive';
import { Library } from './core/libraries';
import { SearchResultsComponent } from './core/search-results/search-results.component';
import { SearchableDirective } from './core/searchable.directive';
import { PicoDialogComponent } from './pico/pico-dialog/pico-dialog.component';
import { PicoLoadingComponent } from './pico/pico-loading/pico-loading.component';
import { PicoTooltipComponent } from './pico/pico-tooltip/pico-tooltip.component';

@Component({
  selector: 'app-root',
  imports: [
    IntlDatesComponent,
    SearchResultsComponent,
    SearchableDirective,
    FormsModule,
    TitleServiceComponent,
    ReactiveDirectiveComponent,
    RouterEventsServiceComponent,
    FullRowDirective,
    FaIconComponent,
    StorageServiceComponent,
    PicoTooltipComponent,
    PicoLoadingComponent,
    PicoDialogOutletDirective,
    PicoDialogComponent,
    IntlNumbersComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  protected searchQuery = '';
  protected switchingLib = false;
  protected lib: Library | null = null;
  protected readonly faGithub = faGithub;

  @ViewChild('results', { static: true }) results!: SearchResultsComponent;

  get placeholderSuffix(): string {
    switch (this.lib) {
      case 'common': return 'common library';
      case 'pico': return 'Pico.css library';
      default: return 'all libraries';
    }
  }

  onLibChange(lib: Library | null) {
    this.lib = lib;
    this.switchingLib = false;
    this.searchQuery = '';
    this.results.clear(this.lib);
  }

  onSearch(query: string) {
    this.searchQuery = query;
    const trimmed = query.trim();
    if (trimmed.length > 2) {
      this.results.filter(query.toLowerCase(), this.lib);
    } else {
      this.results.clear(this.lib);
    }
  }

}
