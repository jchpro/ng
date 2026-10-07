import { TestBed } from '@angular/core/testing';
import { KitForgotPassword, KitForgotPasswordRequest } from './kit-forgot-password';

describe('KitForgotPassword', () => {

  function create(inputs: Partial<Record<'identifierType' | 'busy' | 'sent' | 'error', unknown>> = {}) {
    const fixture = TestBed.createComponent(KitForgotPassword);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const requested: KitForgotPasswordRequest[] = [];
    fixture.componentInstance.requested.subscribe(request => requested.push(request));

    const root: HTMLElement = fixture.nativeElement;
    const query = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
    const identifier = () => query<HTMLInputElement>('input[name="username"]')!;
    const type = (value: string) => {
      identifier().value = value;
      identifier().dispatchEvent(new Event('input'));
    };
    const submit = () => {
      query<HTMLFormElement>('form')!.requestSubmit();
      fixture.detectChanges();
    };
    return { fixture, query, identifier, type, submit, requested };
  }

  it('should render the title, the description, the field and the button', () => {
    // Given
    const { query, identifier } = create();

    // Then
    expect(query('h1')?.textContent).toBe('Forgot your password?');
    expect(query('.kit-auth-card__description')).toBeTruthy();
    expect(identifier().type).toBe('email');
    expect(query('button[type="submit"]')?.textContent).toContain('Send instructions');
  });

  it('should emit the trimmed identifier', () => {
    // Given
    const { type, submit, requested } = create();
    type(' jakub@jchpro.pl ');

    // When
    submit();

    // Then
    expect(requested).toEqual([{ identifier: 'jakub@jchpro.pl' }]);
  });

  it('should not emit an empty or malformed email and should focus the field', () => {
    // Given
    const { identifier, query, type, submit, requested } = create();

    // When
    submit();
    type('jakub');
    submit();

    // Then
    expect(requested).toEqual([]);
    expect(query('.kit-field__error')?.textContent).toContain('Enter a valid email address.');
    expect(document.activeElement).toBe(identifier());
  });

  it('should accept a username of any shape', () => {
    // Given
    const { type, submit, requested } = create({ identifierType: 'username' });
    type('jakub');

    // When
    submit();

    // Then
    expect(requested).toEqual([{ identifier: 'jakub' }]);
  });

  it('should swallow a submit while busy', () => {
    // Given
    const { type, submit, requested } = create({ busy: true });
    type('jakub@jchpro.pl');

    // When
    submit();

    // Then
    expect(requested).toEqual([]);
  });

  describe('once sent', () => {

    it('should replace the form with a confirmation that names what was entered', () => {
      // Given
      const { fixture, query, type, submit } = create();
      type('jakub@jchpro.pl');
      submit();

      // When
      fixture.componentRef.setInput('sent', true);
      fixture.detectChanges();

      // Then
      expect(query('form')).toBeNull();
      expect(query('h1')?.textContent).toBe('Check your inbox');
      expect(query('.kit-auth-card__description')).toBeNull();
      expect(query('.kit-auth-notice')?.textContent).toContain('If an account exists for jakub@jchpro.pl');
    });

  });

});
