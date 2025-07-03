import { Directive, inject } from '@angular/core';
import { PICO_CONFIG } from '../config';

@Directive({})
export class PicoDirective {

  protected readonly config = inject(PICO_CONFIG);

}
