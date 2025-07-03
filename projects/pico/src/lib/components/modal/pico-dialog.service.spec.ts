import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PicoDialogConfig } from './pico-dialog';
import { PicoDialogOutletDirective } from './pico-dialog-outlet.directive';
import { PicoDialogService } from './pico-dialog.service';

describe('PicoDialogService', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let service: PicoDialogService;

  @Component({
    selector: 'test',
    imports: [
      PicoDialogOutletDirective
    ],
    template: `
      <ng-template let-close="close">
        <button (click)="close('result')"></button>
      </ng-template>
      <ng-container *picoDialogOutlet></ng-container>`
  })
  class TestComponent {
    @ViewChild(TemplateRef, { static: true }) template!: TemplateRef<any>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestComponent
      ]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(PicoDialogService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should create dialog window and destroy it after calling close callback', async () => {
    // Given
    const config: PicoDialogConfig = {
      data: {},
      content: component.template
    };

    // When
    const promise = service.open(config);

    // Then
    const dialog = fixture.debugElement.query(By.css('dialog'));
    fixture.detectChanges();
    expect(dialog).toBeTruthy();

    // And when
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click');

    // Then
    expect(await promise).toBe('result');
  });

});
