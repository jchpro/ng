import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitAuthCard } from './kit-auth-card';

@Component({
  imports: [KitAuthCard],
  template: `
    <kit-auth-card heading="Sign in" description="Welcome back" [error]="error()">
      <img kitAuthLogo alt="logo">
      <p class="body">Body</p>
      <a kitAuthFooter href="/">Footer</a>
    </kit-auth-card>`
})
class Host {
  readonly error = signal<string | null>(null);
}

describe('KitAuthCard', () => {

  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    return { fixture, query };
  }

  it('should render the heading as the page title and the description under it', () => {
    // Given
    const { query } = create();

    // Then
    expect(query('h1')?.textContent).toBe('Sign in');
    expect(query('.kit-auth-card__description')?.textContent).toBe('Welcome back');
  });

  it('should project the logo, the body and the footer into their places', () => {
    // Given
    const { query } = create();

    // Then
    expect(query('.kit-auth-card__logo img')).toBeTruthy();
    expect(query('.body')?.parentElement?.tagName).toBe('KIT-AUTH-CARD');
    expect(query('.kit-auth-card__footer a')).toBeTruthy();
  });

  it('should keep an alert region in the DOM while there is no error', () => {
    // Given
    const { query } = create();

    // Then
    expect(query('[role="alert"]')).toBeTruthy();
    expect(query('[role="alert"]')?.textContent?.trim()).toBe('');
  });

  it('should show an error in the alert region', () => {
    // Given
    const { fixture, query } = create();

    // When
    fixture.componentInstance.error.set('Wrong password');
    fixture.detectChanges();

    // Then
    expect(query('[role="alert"] .kit-field__error')?.textContent).toContain('Wrong password');
  });

});
