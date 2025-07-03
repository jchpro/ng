import { JsonPipe } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PicoDialogRef, PicoDialogService } from '@jchpro/ngx-pico';
import { ExampleTitleComponent } from "../../core/example-title/example-title.component";
import { PreAlignDirective } from '../../core/pre-align.directive';

@Component({
  selector: 'app-pico-dialog',
  imports: [
    ExampleTitleComponent,
    PreAlignDirective,
    FormsModule,
    JsonPipe
  ],
  templateUrl: './pico-dialog.component.html',
  styleUrl: './pico-dialog.component.scss'
})
export class PicoDialogComponent {

  text: string = 'Hello world';
  animate = false;
  closeOnOverlayClick = false;
  result?: any;

  @ViewChild('dialog', { static: true }) private readonly dialogTemplate!: TemplateRef<PicoDialogRef>;
  private readonly dialogService = inject(PicoDialogService);

  async onOpenDialogClick() {
    const result = await this.dialogService.open({
      data: { text: this.text },
      content: this.dialogTemplate,
      animation: this.animate,
      closeOnOverlayClick: this.closeOnOverlayClick
    });
    this.result = result;
  }

}
