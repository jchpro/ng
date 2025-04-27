import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { IntlDatesComponent } from './common/intl-dates/intl-dates.component';
import { RouterEventsServiceComponent } from './common/router-events-service/router-events-service.component';
import { StorageServiceComponent } from './common/storage-service/storage-service.component';
import { TitleServiceComponent } from './common/title-service/title-service.component';
import { ReactiveDirectiveComponent } from './common/reactive-directive/reactive-directive.component';
import { FullRowDirective } from './core/full-row.directive';
import { SearchResultsComponent } from './core/search-results/search-results.component';
import { SearchableDirective } from './core/searchable.directive';

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
    StorageServiceComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  searchQuery = '';

  onSearch(query: string, results: SearchResultsComponent) {
    this.searchQuery = query;
    const trimmed = query.trim();
    if (trimmed.length > 2) {
      results.filter(query.toLowerCase());
    } else {
      results.clear();
    }
  }

  protected readonly faGithub = faGithub;
}
