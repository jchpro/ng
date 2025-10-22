import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reactive } from '@jchpro/ngx-common';

@Directive({
  selector: 'code[copy]',
  hostDirectives: [
    CdkCopyToClipboard,
  ]
})
export class CodeCopyDirective extends Reactive implements AfterViewInit {

  #copy = inject(CdkCopyToClipboard);
  #el = inject(ElementRef<HTMLElement>).nativeElement;
  #snackbar = inject(MatSnackBar);

  constructor() {
    super();
    this.#copy.copied.asObservable()
      .pipe(this.observeUntilDestroy())
      .subscribe(() => {
        this.#snackbar.open('Copied to clipboard', 'OK', { duration: 3000 });
      });
  }

  ngAfterViewInit() {
    this.#copy.text = this.#el.innerText.trim();
  }

}
