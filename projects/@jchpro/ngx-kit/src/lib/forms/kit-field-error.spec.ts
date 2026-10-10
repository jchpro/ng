import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { email, form, max, maxLength, min, minLength, pattern, required, validate } from '@angular/forms/signals';
import { provideKitLabels } from '../labels/provide-kit-labels';
import { KitFieldError } from './kit-field-error';
import { provideKitFormLabels } from './kit-form-labels';

describe('KitFieldError', () => {

  const FIELDS = ['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom', 'own', 'bare', 'proto', 'two'] as const;
  type FieldName = typeof FIELDS[number];

  @Component({
    selector: 'kit-field-error-test',
    imports: [KitFieldError],
    template: `
      <kit-field-error id="required" [field]="f.required" [messages]="messages()" />
      <kit-field-error id="email" [field]="f.email" />
      <kit-field-error id="min" [field]="f.min" />
      <kit-field-error id="max" [field]="f.max" />
      <kit-field-error id="minLength" [field]="f.minLength" />
      <kit-field-error id="maxLength" [field]="f.maxLength" />
      <kit-field-error id="pattern" [field]="f.pattern" />
      <kit-field-error id="custom" [field]="f.custom" [messages]="messages()" />
      <kit-field-error id="own" [field]="f.own" />
      <kit-field-error id="bare" [field]="f.bare" />
      <kit-field-error id="proto" [field]="f.proto" />
      <kit-field-error id="two" [field]="f.two" />
    `
  })
  class TestCmp {
    readonly model = signal({
      required: '', email: 'nope', min: 1, max: 11, minLength: 'ab', maxLength: 'abcdef', pattern: '123',
      custom: 'x', own: 'x', bare: 'x', proto: 'x', two: ''
    });
    readonly messages = signal<Record<string, string>>({});
    readonly f = form(this.model, path => {
      required(path.required);
      email(path.email);
      min(path.min, 5);
      max(path.max, 10);
      minLength(path.minLength, 3);
      maxLength(path.maxLength, 5);
      pattern(path.pattern, /^[a-z]+$/);
      validate(path.custom, () => ({ kind: 'taken' }));
      validate(path.own, () => ({ kind: 'mystery', message: 'Own message.' }));
      validate(path.bare, () => ({ kind: 'mystery' }));
      validate(path.proto, () => ({ kind: 'constructor' }));
      required(path.two);
      minLength(path.two, 3);
    });
  }

  let fixture: ComponentFixture<TestCmp>;
  let cmp: TestCmp;

  function create() {
    fixture = TestBed.createComponent(TestCmp);
    cmp = fixture.componentInstance;
    fixture.detectChanges();
  }

  function line(name: FieldName): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${name}`)!;
  }

  /** Touches the field, like leaving it does, and gives the text of its error line */
  function touch(name: FieldName): string {
    cmp.f[name]().markAsTouched();
    fixture.detectChanges();
    return line(name).textContent!.trim();
  }

  it('should show nothing while the field is untouched, even though it is invalid', () => {
    // Given
    create();

    // Then
    expect(cmp.f.required().errors().length).toBe(1);
    expect(line('required').textContent!.trim()).toBe('');
    expect(line('required').classList).not.toContain('kit-field__error');
  });

  it('should show the error with an icon once the field is touched', () => {
    // Given
    create();

    // When
    const text = touch('required');

    // Then
    expect(text).toBe('This field is required.');
    expect(line('required').classList).toContain('kit-field__error');
    expect(line('required').querySelector('svg')).not.toBeNull();
  });

  it('should show only the first error of a field', () => {
    // Given
    create();

    // Then
    expect(cmp.f.two().errors().map(error => error.kind)).toEqual(['required']);
    expect(touch('two')).toBe('This field is required.');

    // When
    cmp.model.update(model => ({ ...model, two: 'a' }));
    fixture.detectChanges();

    // Then
    expect(cmp.f.two().errors().map(error => error.kind)).toEqual(['minLength']);
    expect(line('two').textContent!.trim()).toBe('Enter at least 3 characters.');
  });

  it('should hide the line again when the value becomes valid', () => {
    // Given
    create();
    touch('required');

    // When
    cmp.model.update(model => ({ ...model, required: 'filled' }));
    fixture.detectChanges();

    // Then
    expect(line('required').textContent!.trim()).toBe('');
    expect(line('required').classList).not.toContain('kit-field__error');
  });

  it('should write the message of every built-in kind, with the limit where it has one', () => {
    // Given
    create();

    // Then
    expect(touch('email')).toBe('Enter a valid email address.');
    expect(touch('min')).toBe('Enter a value of at least 5.');
    expect(touch('max')).toBe('Enter a value of at most 10.');
    expect(touch('minLength')).toBe('Enter at least 3 characters.');
    expect(touch('maxLength')).toBe('Enter at most 5 characters.');
    expect(touch('pattern')).toBe('The value is in the wrong format.');
  });

  // Angular documents the error classes but not the names of their limit properties. The component reads the limit
  // by these names, so a change in Angular shows up here instead of as an empty `{min}` in a message
  it('should find the limit of an error under min, max, minLength and maxLength', () => {
    // Given
    create();

    // Then
    expect(cmp.f.min().errors()[0]).toEqual(jasmine.objectContaining({ kind: 'min', min: 5 }));
    expect(cmp.f.max().errors()[0]).toEqual(jasmine.objectContaining({ kind: 'max', max: 10 }));
    expect(cmp.f.minLength().errors()[0]).toEqual(jasmine.objectContaining({ kind: 'minLength', minLength: 3 }));
    expect(cmp.f.maxLength().errors()[0]).toEqual(jasmine.objectContaining({ kind: 'maxLength', maxLength: 5 }));
  });

  it('should use the message given for a custom kind', () => {
    // Given
    create();
    cmp.messages.set({ taken: 'Already in use.' });

    // Then
    expect(touch('custom')).toBe('Already in use.');
  });

  it('should let [messages] reword a built-in kind', () => {
    // Given
    create();
    cmp.messages.set({ required: 'Fill it in.' });

    // Then
    expect(touch('required')).toBe('Fill it in.');
  });

  it('should fall back to the message of the error for a kind it has no text for', () => {
    // Given
    create();

    // Then
    expect(touch('own')).toBe('Own message.');
  });

  it('should fall back to a generic text when the error has no message either', () => {
    // Given
    create();

    // Then
    expect(touch('bare')).toBe('The value is not valid.');
  });

  it('should not take a property of Object for a message', () => {
    // Given
    create();

    // Then
    expect(touch('proto')).toBe('The value is not valid.');
  });

  it('should follow the language of provideKitLabels', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });
    create();

    // Then
    expect(touch('required')).toBe('To pole jest wymagane.');
    expect(touch('minLength')).toBe('Minimalna liczba znaków: 3.');
  });

  it('should take an override from provideKitFormLabels', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitFormLabels({ errors: { required: 'Needed' } })] });
    create();

    // Then
    expect(touch('required')).toBe('Needed');
  });

});
