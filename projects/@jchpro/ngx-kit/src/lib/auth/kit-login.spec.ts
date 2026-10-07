import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KIT_AUTH_LABELS_PL, provideKitAuthLabels } from './kit-auth-labels';
import { KitLogin, KitLoginCredentials } from './kit-login';

describe('KitLogin', () => {

  function create(inputs: Partial<Record<'identifierType' | 'showRememberMe' | 'busy' | 'error' | 'labels', unknown>> = {}) {
    const fixture = TestBed.createComponent(KitLogin);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const submitted: KitLoginCredentials[] = [];
    fixture.componentInstance.submitted.subscribe(credentials => submitted.push(credentials));

    const root: HTMLElement = fixture.nativeElement;
    const query = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
    const identifier = () => query<HTMLInputElement>('input[name="username"]')!;
    const password = () => query<HTMLInputElement>('input[name="password"]')!;
    const type = (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => {
      query<HTMLFormElement>('form')!.requestSubmit();
      fixture.detectChanges();
    };
    return { fixture, query, identifier, password, type, submit, submitted };
  }

  it('should render the title, both fields and the button from the labels', () => {
    // Given
    const { query, identifier, password } = create();

    // Then
    expect(query('h1')?.textContent).toBe('Sign in');
    expect(query('label[for]')?.textContent).toBe('Email');
    expect(identifier()).toBeTruthy();
    expect(password().type).toBe('password');
    expect(query('button[type="submit"]')?.textContent).toContain('Sign in');
  });

  it('should hint password managers at the right fields', () => {
    // Given
    const { identifier, password } = create();

    // Then
    expect(identifier().autocomplete).toBe('username');
    expect(password().autocomplete).toBe('current-password');
  });

  describe('identifier type', () => {

    it('should make an email field by default', () => {
      // Given
      const { identifier } = create();

      // Then
      expect(identifier().type).toBe('email');
      expect(identifier().getAttribute('inputmode')).toBe('email');
    });

    it('should make a plain text field with its own label for a username', () => {
      // Given
      const { identifier, query } = create({ identifierType: 'username' });

      // Then
      expect(identifier().type).toBe('text');
      expect(identifier().hasAttribute('inputmode')).toBe(false);
      expect(query('label[for]')?.textContent).toBe('Username');
    });

  });

  describe('submitting', () => {

    it('should emit the trimmed identifier and the password', () => {
      // Given
      const { identifier, password, type, submit, submitted } = create();
      type(identifier(), '  jakub@jchpro.pl ');
      type(password(), 'secret');

      // When
      submit();

      // Then
      expect(submitted).toEqual([{ identifier: 'jakub@jchpro.pl', password: 'secret', remember: false }]);
    });

    it('should pick up values that were filled in without an input event, as autofill may do', () => {
      // Given
      const { identifier, password, submit, submitted } = create();
      identifier().value = 'jakub@jchpro.pl';
      password().value = 'secret';

      // When
      submit();

      // Then
      expect(submitted).toEqual([{ identifier: 'jakub@jchpro.pl', password: 'secret', remember: false }]);
    });

    it('should not emit, show every error and focus the first invalid field when empty', () => {
      // Given
      const { fixture, identifier, query, submit, submitted } = create();

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.kit-field__error').length).toBe(2);
      expect(identifier().getAttribute('aria-invalid')).toBe('true');
      expect(query('.kit-field__error')?.textContent).toContain('Fill in this field.');
      expect(document.activeElement).toBe(identifier());
    });

    it('should focus the password when only that is missing', () => {
      // Given
      const { identifier, password, type, submit, submitted } = create();
      type(identifier(), 'jakub@jchpro.pl');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(document.activeElement).toBe(password());
    });

    it('should reject an email address that is not one', () => {
      // Given
      const { identifier, password, query, type, submit, submitted } = create();
      type(identifier(), 'jakub');
      type(password(), 'secret');

      // When
      submit();

      // Then
      expect(submitted).toEqual([]);
      expect(query('.kit-field__error')?.textContent).toContain('Enter a valid email address.');
    });

    it('should accept anything but blank as a username', () => {
      // Given
      const { identifier, password, type, submit, submitted } = create({ identifierType: 'username' });
      type(identifier(), 'jakub');
      type(password(), 'secret');

      // When
      submit();

      // Then
      expect(submitted.length).toBe(1);
    });

    it('should link an error to its field', () => {
      // Given
      const { identifier, query, submit } = create();

      // When
      submit();

      // Then
      const errorId = query('.kit-field__error')!.id;
      expect(identifier().getAttribute('aria-describedby')).toBe(errorId);
    });

    it('should not show an error before the field was left or the form submitted', () => {
      // Given
      const { fixture, identifier, type } = create();

      // When
      type(identifier(), '');
      fixture.detectChanges();

      // Then
      expect(fixture.nativeElement.querySelector('.kit-field__error')).toBeNull();
    });

    it('should show a field its error once it was left', () => {
      // Given
      const { fixture, identifier } = create();

      // When
      identifier().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Then
      expect(fixture.nativeElement.querySelector('.kit-field__error')).toBeTruthy();
    });

  });

  describe('remember me', () => {

    it('should not offer it by default', () => {
      // Given
      const { query } = create();

      // Then
      expect(query('input[name="remember"]')).toBeNull();
    });

    it('should report whether it was ticked', () => {
      // Given
      const { identifier, password, query, type, submit, submitted } = create({ showRememberMe: true });
      type(identifier(), 'jakub@jchpro.pl');
      type(password(), 'secret');
      query<HTMLInputElement>('input[name="remember"]')!.click();

      // When
      submit();

      // Then
      expect(submitted[0].remember).toBe(true);
    });

  });

  describe('busy', () => {

    it('should make the fields read-only and swallow a submit', () => {
      // Given
      const { identifier, password, type, submit, submitted } = create({ busy: true });
      type(identifier(), 'jakub@jchpro.pl');
      type(password(), 'secret');

      // When
      submit();

      // Then
      expect(identifier().readOnly).toBe(true);
      expect(password().readOnly).toBe(true);
      expect(submitted).toEqual([]);
    });

    it('should mark the button busy without disabling it', () => {
      // Given
      const { query } = create({ busy: true });

      // Then
      const button = query<HTMLButtonElement>('button[type="submit"]')!;
      expect(button.classList).toContain('kit-busy');
      expect(button.disabled).toBe(false);
    });

  });

  it('should show the error it is given', () => {
    // Given
    const { query } = create({ error: 'Wrong email or password' });

    // Then
    expect(query('[role="alert"]')?.textContent).toContain('Wrong email or password');
  });

  it('should take its labels from the injected ones, then from the instance', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitAuthLabels(KIT_AUTH_LABELS_PL)] });
    const { query } = create({ labels: { login: { submit: 'Wchodzę' } } });

    // Then
    expect(query('h1')?.textContent).toBe('Zaloguj się');
    expect(query('button[type="submit"]')?.textContent).toContain('Wchodzę');
  });

  describe('projection', () => {

    @Component({
      imports: [KitLogin],
      template: `
        <kit-login>
          <img kitAuthLogo alt="logo">
          <a kitAuthActions href="/forgot">Forgot</a>
          <a kitAuthFooter href="/terms">Terms</a>
        </kit-login>`
    })
    class Host {}

    it('should place the logo, the actions and the footer', () => {
      // Given
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const root: HTMLElement = fixture.nativeElement;

      // Then
      expect(root.querySelector('.kit-auth-card__logo img')).toBeTruthy();
      expect(root.querySelector('form .kit-auth-form__actions a')?.textContent).toBe('Forgot');
      expect(root.querySelector('.kit-auth-card__footer a')?.textContent).toBe('Terms');
    });

  });

});
