import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pick, submit, type } from './forms';

describe('testing helpers for forms', () => {

  @Component({
    selector: 'kit-testing-forms',
    template: `
      <form (submit)="submitted.push('submit')">
        <input id="name" (input)="events.push('input')" (blur)="events.push('blur')">
        <textarea id="note" (input)="events.push('note')"></textarea>
        <select id="role" (input)="events.push('select input')" (change)="events.push('select change')">
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      </form>
    `
  })
  class TestCmp {
    events: string[] = [];
    submitted: string[] = [];
  }

  function create() {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    return { fixture, cmp: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
  }

  describe('type()', () => {

    it('should set the value and report input, then blur', () => {
      // Given
      const { cmp, element } = create();

      // When
      type(element, '#name', 'Ada');

      // Then
      expect(element.querySelector<HTMLInputElement>('#name')!.value).toBe('Ada');
      expect(cmp.events).toEqual(['input', 'blur']);
    });

    it('should type into a textarea too', () => {
      // Given
      const { cmp, element } = create();

      // When
      type(element, '#note', 'Hello');

      // Then
      expect(element.querySelector<HTMLTextAreaElement>('#note')!.value).toBe('Hello');
      expect(cmp.events).toEqual(['note']);
    });

    it('should say which selector matched nothing', () => {
      // Given
      const { element } = create();

      // Then
      expect(() => type(element, '#missing', 'x')).toThrowError('type(): nothing matches "#missing"');
    });

  });

  describe('pick()', () => {

    it('should select the option and report both input and change', () => {
      // Given
      const { cmp, element } = create();

      // When
      pick(element, '#role', 'b');

      // Then
      expect(element.querySelector<HTMLSelectElement>('#role')!.value).toBe('b');
      expect(cmp.events).toEqual(['select input', 'select change']);
    });

    it('should say which selector matched nothing', () => {
      // Given
      const { element } = create();

      // Then
      expect(() => pick(element, '#missing', 'x')).toThrowError('pick(): nothing matches "#missing"');
    });

  });

  describe('submit()', () => {

    it('should submit the form of the component', async () => {
      // Given
      const { fixture, cmp } = create();

      // When
      await submit(fixture);

      // Then
      expect(cmp.submitted).toEqual(['submit']);
    });

    it('should complain about a component without a form', async () => {
      // Given
      @Component({ selector: 'kit-testing-no-form', template: '' })
      class NoForm {}
      const fixture = TestBed.createComponent(NoForm);

      // Then
      await expectAsync(submit(fixture)).toBeRejectedWithError('submit(): the component has no <form>');
    });

  });

});
