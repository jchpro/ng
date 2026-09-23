import { DialogRef } from '@angular/cdk/dialog';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDialogClose } from './kit-dialog-close.directive';

describe('KitDialogClose', () => {

  @Component({
    imports: [KitDialogClose],
    template: `
      <button id="no" [kitDialogClose]="false">No</button>
      <button id="value" [kitDialogClose]="value()">Value</button>
      <button id="submit" type="submit" [kitDialogClose]="true">Submit</button>
      <a id="link" [kitDialogClose]="true">Link</a>
    `
  })
  class TestHost {
    readonly value = signal<unknown>({ id: 1 });
  }

  function create() {
    const ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({ providers: [{ provide: DialogRef, useValue: ref }] });
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const element = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    return { fixture, host: fixture.componentInstance, ref, element };
  }

  it('should close the dialog with the bound value on click', () => {
    // Given
    const { ref, element } = create();

    // When
    element('no').click();

    // Then
    expect(ref.close).toHaveBeenCalledOnceWith(false);
  });

  it('should follow the bound value as it changes', () => {
    // Given
    const { fixture, host, ref, element } = create();
    element('value').click();
    expect(ref.close).toHaveBeenCalledWith({ id: 1 });

    // When
    host.value.set('other');
    fixture.detectChanges();
    element('value').click();

    // Then
    expect(ref.close).toHaveBeenCalledWith('other');
  });

  it('should make a button without a type a plain button', () => {
    // Given
    const { element } = create();

    // Then
    expect(element('no').getAttribute('type')).toBe('button');
  });

  it('should leave an explicit button type alone', () => {
    // Given
    const { element } = create();

    // Then
    expect(element('submit').getAttribute('type')).toBe('submit');
  });

  it('should not add a type to other elements', () => {
    // Given
    const { element } = create();

    // Then
    expect(element('link').hasAttribute('type')).toBeFalse();
  });

});
