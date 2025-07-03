import { Directive, HostBinding, Input } from '@angular/core';
import { Library } from './libraries';

@Directive({
  selector: '[appSearchable]',
})
export class SearchableDirective {

  @Input({ required: true }) appSearchable!: string;
  @Input() visible = true;

  @HostBinding('style.display') protected get displayCss(): string | undefined {
    return this.visible ? undefined : 'none';
  }

  private lib?: Library;

  setLibrary(lib: Library) {
    this.lib = lib;
  }

  get library(): Library | undefined {
    return this.lib;
  }

}
