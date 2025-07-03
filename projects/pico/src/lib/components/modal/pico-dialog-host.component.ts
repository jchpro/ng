import { NgComponentOutlet, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, inject, Injector, TemplateRef } from '@angular/core';
import { PicoDialogConfig, PicoDialogRef } from './pico-dialog';

/**
 * Renders dialog content inside <dialog> and <article>, passes down data and binds events.
 * For internal usage.
 */
@Component({
  selector: 'dialog[picoDialogHost]',
  imports: [
    NgTemplateOutlet,
    NgComponentOutlet,
    NgStyle
  ],
  template: `
    <article [ngStyle]="styles">
      @if (isTemplate(content)) {
        <ng-container
          [ngTemplateOutlet]="content"
          [ngTemplateOutletContext]="dialogRef"
          [ngTemplateOutletInjector]="injector">
        </ng-container>
      } @else if (capturedContent) {
        <ng-container [ngTemplateOutlet]="capturedContent"></ng-container>
      }
    </article>
    <div class="component-content-capture">
      @if (!isTemplate(content) && content!!) {
        <ng-container [ngComponentOutlet]="content"></ng-container>
      }
    </div>
  `,
  styles: ':host { & > .component-content-capture { display: none !important; } }'
})
export class PicoDialogHostComponent {

  protected content?: PicoDialogConfig['content'];
  protected dialogRef?: PicoDialogRef;
  protected closeOnOverlayClick?: boolean;
  protected capturedContent?: TemplateRef<any>;
  protected styles?: PicoDialogConfig['styles'];

  protected readonly injector = inject(Injector);

  @HostBinding('attr.open') private opened = false;

  private readonly elementRef = inject(ElementRef<HTMLDialogElement>);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected isTemplate(input: any): input is TemplateRef<PicoDialogRef> {
    return input instanceof TemplateRef;
  }

  open(options: Pick<PicoDialogConfig, 'styles'>): void {
    if (this.opened) {
      return;
    }
    this.styles = options.styles;
    this.opened = true;
  }

  projectContent(content: PicoDialogConfig['content'],
                 dialogRef: PicoDialogRef,
                 closeOnOverlayClick: boolean): void {
    if (this.content) {
      return;
    }
    this.content = content;
    this.dialogRef = dialogRef;
    this.closeOnOverlayClick = closeOnOverlayClick;
  }

  attachContentFromDirective(template: TemplateRef<any>): void {
    this.capturedContent = template;
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('click', ['$event']) protected onOverlayClick(event: Event) {
    if (event.target !== this.elementRef.nativeElement) {
      return;
    }
    if (!this.closeOnOverlayClick) {
      return;
    }
    this.dialogRef?.close(undefined);
  }

}
