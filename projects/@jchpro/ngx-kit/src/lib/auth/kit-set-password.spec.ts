import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitSetPassword, KitSetPasswordResult } from './kit-set-password';

describe('KitSetPassword', () => {

  function create(inputs: Partial<Record<'flow' | 'minLength' | 'busy' | 'error', unknown>> = {}) {
    const fixture = TestBed.createComponent(KitSetPassword);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const submitted: KitSetPasswordResult[] = [];
    fixture.componentInstance.submitted.subscribe(result => submitted.push(result));

    const root: HTMLElement = fixture.nativeElement;
    const query = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
    const password = () => query<HTMLInputElement>('input[name="password"]')!;
    const confirmation = () => query<HTMLInputElement>('input[name="confirmation"]')!;
    const type = (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => {
      query<HTMLFormElement>('form')!.requestSubmit();
      fixture.detectChanges();
    };
    return { fixture, query, password, confirmation, type, submit, submitted };
  }

  it('should hint password managers that these are new passwords', () => {
    // Given
    const { password, confirmation } = create();

    // Then
    expect(password().autocomplete).toBe('new-password');
    expect(confirmation().autocomplete).toBe('new-password');
  });

  describe('flow', () => {

    it('should word itself for a reset by default', () => {
      // Given
      const { query } = create();

      // Then
      expect(query('h1')?.textContent).toBe('Set a new password');
      expect(query('button[type="submit"]')?.textContent).toContain('Set password');
    });

    it('should word itself for an invitation', () => {
      // Given
      const { query } = create({ flow: 'invite' });

      // Then
      expect(query('h1')?.textContent).toBe('Accept the invitation');
      expect(query('button[type="submit"]')?.textContent).toContain('Create account');
    });

  });

  describe('submitting', () => {

    it('should emit the password once both match', () => {
      // Given
      const { password, confirmation, type, submit, submitted } = create();
      type(password(), 'correct horse');
      type(confirmation(), 'correct horse');

      // When
      submit();

      // Then
      expect(submitted).toEqual([{ password: 'correct horse' }]);
    });

    it('should not emit mismatching passwords and should say so', () => {
      // Given
      const { password, confirmation, query, type, submit, submitted } = create();
      type(password(), 'correct horse');
      type(confirmation(), 'correct hors');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(query('.kit-field__error')?.textContent).toContain('The passwords do not match.');
      expect(document.activeElement).toBe(confirmation());
    });

    it('should not emit empty fields and should focus the password', () => {
      // Given
      const { fixture, password, submit, submitted } = create();

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.kit-field__error').length).toBe(2);
      expect(document.activeElement).toBe(password());
    });

    it('should not emit a password shorter than the minimum', () => {
      // Given
      const { password, confirmation, query, type, submit, submitted } = create({ minLength: 10 });
      type(password(), 'short');
      type(confirmation(), 'short');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(query('.kit-field__error')?.textContent).toContain('Use at least 10 characters.');
    });

    it('should re-check the confirmation when the password changes after it', () => {
      // Given
      const { password, confirmation, type, submit, submitted } = create();
      type(confirmation(), 'one');
      type(password(), 'two');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(confirmation().getAttribute('aria-invalid')).toBe('true');
    });

    it('should swallow a submit while busy', () => {
      // Given
      const { password, confirmation, type, submit, submitted } = create({ busy: true });
      type(password(), 'correct horse');
      type(confirmation(), 'correct horse');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
    });

  });

  describe('minimum length hint', () => {

    it('should be announced under the password while there is no error', () => {
      // Given
      const { password, query } = create({ minLength: 8 });

      // Then
      const hint = query('.kit-field__hint')!;
      expect(hint.textContent).toBe('Use at least 8 characters.');
      expect(password().getAttribute('aria-describedby')).toBe(hint.id);
      expect(password().getAttribute('minlength')).toBe('8');
    });

    it('should not exist without a minimum', () => {
      // Given
      const { query } = create();

      // Then
      expect(query('.kit-field__hint')).toBeNull();
    });

  });

  it('should show the error it is given', () => {
    // Given
    const { query } = create({ error: 'This link has expired' });

    // Then
    expect(query('[role="alert"]')?.textContent).toContain('This link has expired');
  });

  describe('projection', () => {

    @Component({
      imports: [KitSetPassword],
      template: `
        <kit-set-password flow="invite">
          <div kitAuthFields class="extra">Display name</div>
        </kit-set-password>`
    })
    class Host {}

    it('should place extra fields inside the form, above the passwords', () => {
      // Given
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const form: HTMLElement = fixture.nativeElement.querySelector('form');

      // Then
      expect(form.firstElementChild?.classList).toContain('extra');
    });

  });

});
