import { Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GlobalLoadingIndicator, LoadingOverlay } from '@jchpro/ngx-material';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-loading',
  imports: [
    LibPageTitle,
    GlobalLoadingIndicator,
    LoadingOverlay,
    MatSlideToggle,
    FormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatInput,
    CodeExample,
    CodeCopyDirective
  ],
  templateUrl: './loading.html',
  styles: `
    .container {
      height: 10rem;
      border: 1px dashed var(--mat-sys-outline);
      border-radius: 0.5rem;
      position: relative;
      margin-top: 1rem;
    }
  `
})
export class Loading {

  globalLoading = model(false);
  globalPosition = model<'top' | 'bottom'>('top');

  overlayDiameter = model<number>(80);
  overlayLoading = model(false);

}
