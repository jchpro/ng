import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { formatKitAuthMessage, isKitAuthEmail, KitAuthField, nextKitAuthId } from './kit-auth-form';

describe('kit auth form helpers', () => {

  describe('nextKitAuthId()', () => {

    it('should never repeat an id', () => {
      // Then
      expect(nextKitAuthId('kit-login')).not.toBe(nextKitAuthId('kit-login'));
    });

    it('should start with the prefix', () => {
      // Then
      expect(nextKitAuthId('kit-login')).toMatch(/^kit-login-\d+$/);
    });

  });

  describe('formatKitAuthMessage()', () => {

    it('should replace every occurrence of a placeholder', () => {
      // Then
      expect(formatKitAuthMessage('{min} and again {min}', { min: 8 })).toBe('8 and again 8');
    });

    it('should replace several placeholders', () => {
      // Then
      expect(formatKitAuthMessage('{a}-{b}', { a: 'x', b: 2 })).toBe('x-2');
    });

    it('should leave a message without placeholders as is', () => {
      // Then
      expect(formatKitAuthMessage('Hello', { min: 8 })).toBe('Hello');
    });

  });

  describe('isKitAuthEmail()', () => {

    it('should accept something shaped like an address', () => {
      // Then
      expect(isKitAuthEmail('jakub@jchpro.pl')).toBe(true);
    });

    it('should reject a value without an at sign, without a domain or with spaces', () => {
      // Then
      expect(isKitAuthEmail('jakub')).toBe(false);
      expect(isKitAuthEmail('jakub@')).toBe(false);
      expect(isKitAuthEmail('ja kub@jchpro.pl')).toBe(false);
    });

  });

  describe('KitAuthField', () => {

    function create(submitted = signal(false)) {
      return TestBed.runInInjectionContext(() =>
        new KitAuthField(value => value ? null : 'Required', submitted)
      );
    }

    it('should expose the error of the current value', () => {
      // Given
      const field = create();
      expect(field.error()).toBe('Required');

      // When
      field.value.set('x');

      // Then
      expect(field.error()).toBeNull();
    });

    it('should not show an error before the field is touched or the form submitted', () => {
      // Given
      const field = create();

      // Then
      expect(field.shownError()).toBeNull();
    });

    it('should show the error once the field is touched', () => {
      // Given
      const field = create();

      // When
      field.touch();

      // Then
      expect(field.shownError()).toBe('Required');
    });

    it('should show the error once the form is submitted', () => {
      // Given
      const submitted = signal(false);
      const field = create(submitted);

      // When
      submitted.set(true);

      // Then
      expect(field.shownError()).toBe('Required');
    });

    it('should read its value from an input event', () => {
      // Given
      const field = create();
      const input = document.createElement('input');
      input.value = 'typed';

      // When
      input.addEventListener('input', event => field.update(event));
      input.dispatchEvent(new Event('input'));

      // Then
      expect(field.value()).toBe('typed');
    });

  });

});
