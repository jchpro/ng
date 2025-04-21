import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IntlDatesComponent } from './common/intl-dates/intl-dates.component';
import { SearchResultsComponent } from './core/search-results/search-results.component';
import { SearchableDirective } from './core/searchable.directive';

@Component({
  selector: 'app-root',
  imports: [
    IntlDatesComponent,
    SearchResultsComponent,
    SearchableDirective,
    FormsModule
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

}
