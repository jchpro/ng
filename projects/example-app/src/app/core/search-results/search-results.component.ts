import { Component, ContentChildren, QueryList } from '@angular/core';
import { SearchableDirective } from '../searchable.directive';

@Component({
  selector: 'app-search-results',
  imports: [],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent {

  @ContentChildren(SearchableDirective) protected items!: QueryList<SearchableDirective>;

  filter(query: string) {
    const items = this.items.toArray();
    items.forEach(item => {
      item.visible = item.appSearchable.includes(query);
    });
  }

  clear() {
    this.items.toArray()
      .forEach(item => item.visible = true);
  }

}
