import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'pre[appPreAlign]',
})
export class PreAlignDirective implements AfterViewInit {

  private readonly elementRef = inject(ElementRef);

  public ngAfterViewInit() {
    const element: HTMLPreElement = this.elementRef.nativeElement;
    element.innerText = PreAlignDirective.alignText(element.innerText);
  }

  private static alignText(text: string): string {
    const tabsRe = /^(\s+)/;
    let minSpaces = Infinity;
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const spaces = tabsRe.exec(line)?.[1]?.length ?? 0;
        if (spaces < minSpaces) {
          minSpaces = spaces;
        }
        return line;
      })
      .map(line => line.substring(minSpaces))
      .join('\n');
  }

}
