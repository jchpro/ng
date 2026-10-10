import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { resetKitForm } from './kit-reset-form';

describe('resetKitForm', () => {

  @Component({
    selector: 'kit-reset-form-test',
    imports: [FormField],
    template: `
      <form #formElement (reset)="resets.push('reset')">
        <input id="name" [formField]="f.name">
        <input id="note" [formField]="f.note">
      </form>
    `
  })
  class TestCmp {
    readonly resets: string[] = [];
    readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
    readonly model = signal({ name: 'Ada', note: '' });
    readonly f = form(this.model, path => required(path.name));
  }

  function create() {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
    /** Edits like a person does */
    const edit = (id: string, value: string) => {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
      input(id).dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    };
    return { fixture, cmp: fixture.componentInstance, input, edit };
  }

  it('should reset the native form and write the values of the model back', () => {
    // Given
    const { fixture, cmp, input, edit } = create();
    edit('name', 'Grace');
    edit('note', 'something');
    expect(cmp.f.name().touched()).toBeTrue();

    // When
    resetKitForm(cmp.f, cmp.formElement(), { name: 'Ada', note: '' });
    fixture.detectChanges();

    // Then
    expect(cmp.resets).toEqual(['reset']);
    expect(cmp.model()).toEqual({ name: 'Ada', note: '' });
    expect(input('name').value).toBe('Ada');
    expect(input('note').value).toBe('');
    expect(cmp.f.name().touched()).toBeFalse();
  });

  it('should keep the current value of the model when none is given', () => {
    // Given
    const { fixture, cmp, input, edit } = create();
    edit('name', 'Grace');

    // When
    resetKitForm(cmp.f, cmp.formElement().nativeElement);
    fixture.detectChanges();

    // Then
    expect(cmp.resets).toEqual(['reset']);
    expect(cmp.model().name).toBe('Grace');
    expect(input('name').value).toBe('Grace');
    expect(cmp.f.name().touched()).toBeFalse();
  });

  it('should empty a required field the person left, and not show it as touched', () => {
    // Given
    const { fixture, cmp, input, edit } = create();
    edit('name', '');
    expect(cmp.f.name().errors().length).toBe(1);

    // When
    resetKitForm(cmp.f, cmp.formElement(), { name: '', note: '' });
    fixture.detectChanges();

    // Then
    expect(input('name').value).toBe('');
    expect(cmp.f.name().touched()).toBeFalse();
  });

});
