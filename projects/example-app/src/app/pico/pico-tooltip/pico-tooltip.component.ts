import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PicoTooltipDirective, PicoTooltipPlacement } from '@jchpro/ngx-pico';
import { ExampleTitleComponent } from "../../core/example-title/example-title.component";

@Component({
  selector: 'app-pico-tooltip',
  imports: [
    ExampleTitleComponent,
    ReactiveFormsModule,
    FormsModule,
    PicoTooltipDirective
  ],
  templateUrl: './pico-tooltip.component.html'
})
export class PicoTooltipComponent {

  text = 'Hello I\'m a tooltip!';
  disabled = false;
  placement: PicoTooltipPlacement = 'bottom';

  changeDetectorRef = inject(ChangeDetectorRef);

}
