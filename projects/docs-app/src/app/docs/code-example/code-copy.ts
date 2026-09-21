import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'code[copy]',
  hostDirectives: [
    CdkCopyToClipboard,
  ]
})
export class CodeCopyDirective implements AfterViewInit {

  #copy = inject(CdkCopyToClipboard);
  #el = inject(ElementRef<HTMLElement>).nativeElement;

  ngAfterViewInit() {
    this.#copy.text = this.#el.innerText.trim();
  }

}
