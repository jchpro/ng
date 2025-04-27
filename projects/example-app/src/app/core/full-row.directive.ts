import { Directive } from '@angular/core';

@Directive({
  selector: '[fullRow]',
  host: {
    'class': 'flex row m-between x-center'
  }
})
export class FullRowDirective {}
