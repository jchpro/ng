import { Component, ContentChildren, QueryList } from '@angular/core';
import { Library } from '../libraries';
import { SearchableDirective } from '../searchable.directive';

@Component({
  selector: 'app-search-results',
  imports: [],
  templateUrl: './search-results.component.html'
})
export class SearchResultsComponent {

  @ContentChildren(SearchableDirective) protected items!: QueryList<SearchableDirective>;

  filter(query: string, lib: Library | null) {
    const items = this.items.toArray();
    items.forEach(item => {
      item.visible = (lib ? item.library === lib : true) && item.appSearchable.includes(query);
    });
  }

  clear(lib: Library | null) {
    this.items.toArray()
      .forEach(item => item.visible = (lib ? item.library === lib : true) && true);
  }

}
