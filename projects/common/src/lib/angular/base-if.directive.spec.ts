import { Subject } from 'rxjs';
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { BaseIfDirective } from './base-if.directive';

describe('BaseIfDirective', () => {
  const templateRef = {} as unknown as TemplateRef<any>;
  const viewContainer = jasmine.createSpyObj<ViewContainerRef>('ViewContainerRef', ['createEmbeddedView', 'clear']);

  class MyIfDirective extends BaseIfDirective {
    private readonly stream = new Subject<boolean>();

    constructor() {
      super(templateRef, viewContainer);
      this.renderBinding = this.stream;
      this.bindRendering();
    }

    emit(value: boolean) {
      this.stream.next(value);
    }

    get viewPresent(): boolean {
      return this.hasView;
    }

    override ngOnDestroy(): void {
      super.ngOnDestroy();
    }
  }

  it('should create an instance', () => {
    const dir = new MyIfDirective();
    expect(dir).toBeTruthy();
  });

  it('should toggle view according to emitted values', () => {
    // Given
    const dir = new MyIfDirective();
    expect(dir.viewPresent).toBeFalse();

    // When
    dir.emit(true);

    // Then
    expect(dir.viewPresent).toBeTrue();

    // When
    dir.emit(false);

    // Then
    expect(dir.viewPresent).toBeFalse();
  });

  it('should stop reacting after destruction', () => {
    // Given
    const dir = new MyIfDirective();

    // When
    dir.emit(true);

    // Then
    expect(dir.viewPresent).toBeTrue();

    // When
    dir.ngOnDestroy();
    dir.emit(false);

    // Then
    expect(dir.viewPresent).toBeTrue();
  });
});
