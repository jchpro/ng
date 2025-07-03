import { Component, inject, Input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { PicoTooltipDirective } from '@jchpro/ngx-pico';
import { libraries, Library } from '../libraries';
import { SearchableDirective } from '../searchable.directive';

@Component({
  selector: 'h3[example-title]',
  imports: [
    FaIconComponent,
    PicoTooltipDirective
  ],
  templateUrl: './example-title.component.html',
  host: {
    'class': 'flex row m-between x-center'
  }
})
export class ExampleTitleComponent implements OnInit {

  @Input() lib?: Library;

  protected readonly libraries = libraries;
  protected readonly warningIcon = faTriangleExclamation;
  private readonly searchable = inject(SearchableDirective, { optional: true });

  ngOnInit() {
    if (this.searchable && this.lib) {
      this.searchable.setLibrary(this.lib);
    }
  }

}
