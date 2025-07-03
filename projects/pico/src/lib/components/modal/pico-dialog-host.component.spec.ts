import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PICO_DIALOG_REF, PicoDialogRef } from './pico-dialog';
import { PicoDialogContentDirective } from './pico-dialog-content.directive';
import { PicoDialogHostComponent } from './pico-dialog-host.component';

describe('PicoDialogHostComponent', () => {
  let fixture: ComponentFixture<PicoDialogHostComponent>;
  let component: PicoDialogHostComponent;
  let dialogRef: PicoDialogRef;

  @Component({
    selector: 'template-test',
    template: `<ng-template let-data="data" let-close="close">
      <div>{{ data.text }}</div>
      <button (click)="close(true)">btn</button>
    </ng-template>`
  })
  class TemplateHolder {
    @ViewChild(TemplateRef, { static: true }) template!: TemplateRef<any>
  }

  @Component({
    selector: 'component-test',
    imports: [
      PicoDialogContentDirective
    ],
    template: `
      <ng-container *picoDialogContent>
        <div>{{ ref.data.text }}</div>
        <button (click)="ref.close(true)">btn</button>
      </ng-container>`
  })
  class DialogComponent {
    ref = inject(PICO_DIALOG_REF);
  }

  beforeEach(() => {
    dialogRef = { data: {}, close: () => {} };
    TestBed.configureTestingModule({
      imports: [
        PicoDialogHostComponent,
        TemplateHolder
      ],
      providers: [
        {
          provide: PICO_DIALOG_REF,
          useValue: dialogRef
        }
      ]
    });
    fixture = TestBed.createComponent(PicoDialogHostComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should project template content, pass data and working close callback', () => {
    // Given
    const thFixture = TestBed.createComponent(TemplateHolder);
    const templateHolder: TemplateHolder = thFixture.componentInstance;
    const ref: PicoDialogRef<{ text: string; }> = {
      data: { text: 'input' },
      close: (result: any) => {}
    };
    const closeSpy = spyOn(ref, 'close');

    // When
    component.projectContent(
      templateHolder.template,
      ref,
      false
    );
    fixture.detectChanges();

    // Then
    const div = fixture.debugElement.query(By.css('article div'));
    expect(div.nativeElement.innerText).toBe('input');

    // And when
    const button = fixture.debugElement.query(By.css('article button'));
    button.triggerEventHandler('click');

    // Then
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('should project content, attach content from directive, pass data and working close callback', () => {
    // Given
    dialogRef.data = { text: 'input' };
    const attachSpy = spyOn(component, 'attachContentFromDirective').and.callThrough();
    const closeSpy = spyOn(dialogRef, 'close');

    // When
    component.projectContent(
      DialogComponent,
      dialogRef,
      false
    );
    fixture.detectChanges();

    // Then
    expect(attachSpy).toHaveBeenCalledTimes(1);

    // And when, then
    const div = fixture.debugElement.query(By.css('article div'));
    expect(div.nativeElement.innerText).toBe('input');

    // And when, then
    const button = fixture.debugElement.query(By.css('article button'));
    button.triggerEventHandler('click');
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('should open the dialog and attach custom styles', () => {
    // Given
    const styles = { background: 'grey' };

    // When
    component.open({ styles });
    fixture.detectChanges();

    // Then
    const dialogEl = fixture.debugElement.nativeElement as HTMLElement;
    const articleEl = fixture.debugElement.query(By.css('article')).nativeElement as HTMLElement;
    expect(dialogEl.hasAttribute('open')).toBeTrue();
    expect(articleEl.style.background).toBe('grey');
  });

  it('should not let the dialog be closed on overlay click if not configured', () => {
    // Given
    const closeSpy = spyOn(dialogRef, 'close');
    component.projectContent(
      DialogComponent,
      dialogRef,
      false
    );
    component.open({});
    fixture.detectChanges();

    // When
    const dialog = fixture.debugElement;
    const dialogEl = dialog.nativeElement as HTMLDialogElement;
    dialog.triggerEventHandler('click', { target: dialogEl });
    fixture.detectChanges();

    // Then
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should close the dialog on overlay click if configured', () => {
    // Given
    const closeSpy = spyOn(dialogRef, 'close');
    component.projectContent(
      DialogComponent,
      dialogRef,
      true
    );
    component.open({});
    fixture.detectChanges();

    // When
    const dialog = fixture.debugElement;
    const dialogEl = dialog.nativeElement as HTMLDialogElement;
    dialog.triggerEventHandler('click', { target: dialogEl });
    fixture.detectChanges();

    // Then
    expect(closeSpy).toHaveBeenCalled();
  });

});
