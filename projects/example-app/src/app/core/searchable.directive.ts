import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appSearchable]',
})
export class SearchableDirective {

  @Input({ required: true }) appSearchable!: string;

  @Input() visible = true;

  @HostBinding('style.display') protected get displayCss(): string | undefined {
    return this.visible ? undefined : 'none';
  }

}
