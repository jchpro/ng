import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PicoLoadingDirective } from '@jchpro/ngx-pico';
import { ExampleTitleComponent } from '../../core/example-title/example-title.component';

@Component({
  selector: 'app-pico-loading',
  imports: [
    ExampleTitleComponent,
    FormsModule,
    PicoLoadingDirective
  ],
  templateUrl: './pico-loading.component.html'
})
export class PicoLoadingComponent {

  enabled = true;

  changeDetectorRef = inject(ChangeDetectorRef);

}
