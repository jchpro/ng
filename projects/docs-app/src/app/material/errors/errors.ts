import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { ProErrors } from '@jchpro/ngx-material';
import { ToTablet } from '../../core/to-tablet';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-errors',
  imports: [
    LibPageTitle,
    MatFormField,
    MatLabel,
    MatInput,
    ProErrors,
    ReactiveFormsModule,
    MatError,
    CodeCopyDirective,
    MatHint,
    MatButton,
    FaIconComponent,
    CodeExample
  ],
  templateUrl: './errors.html',
  styleUrl: './errors.scss',
  hostDirectives: [
    ToTablet
  ]
})
export class Errors {

  form = new FormGroup({
    text: new FormControl<string | null>(null, [ Validators.required, Validators.minLength(3)]),
    number: new FormControl<number | null>(null, [ Validators.min(10), Validators.max(20)]),
    customGlobal: new FormControl<string | null>(null, (control: AbstractControl) => {
      if (control.value !== 'stardust') {
        return { custom: true };
      }
      return null;
    }),
    customLocal: new FormControl<string | null>(null, (control: AbstractControl) => {
      if (control.value !== 'supernova') {
        return { custom: true };
      }
      return null;
    }),
  });

  constructor() {
  }

  protected readonly faArrowsRotate = faArrowsRotate;
}
