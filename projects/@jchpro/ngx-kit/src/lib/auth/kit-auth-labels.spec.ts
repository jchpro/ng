import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KIT_AUTH_LABELS, KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL, KitAuthLabelsOverride, provideKitAuthLabels } from './kit-auth-labels';

describe('kit auth labels', () => {

  it('should default to English', () => {
    // Then
    expect(TestBed.inject(KIT_AUTH_LABELS)()).toEqual(KIT_AUTH_LABELS_EN);
  });

  it('should merge an app-wide override over the English defaults', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitAuthLabels({ login: { submit: 'Enter' } })] });

    // When
    const labels = TestBed.inject(KIT_AUTH_LABELS)();

    // Then
    expect(labels.login.submit).toBe('Enter');
    expect(labels.login.title).toBe(KIT_AUTH_LABELS_EN.login.title);
  });

  it('should merge deeply, keeping the siblings of an overridden nested label', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitAuthLabels({ setPassword: { invite: { title: 'Welcome' } } })] });

    // When
    const { invite } = TestBed.inject(KIT_AUTH_LABELS)().setPassword;

    // Then
    expect(invite.title).toBe('Welcome');
    expect(invite.submit).toBe(KIT_AUTH_LABELS_EN.setPassword.invite.submit);
  });

  it('should follow a signal of overrides', () => {
    // Given
    const override = signal<KitAuthLabelsOverride>(KIT_AUTH_LABELS_EN);
    TestBed.configureTestingModule({ providers: [provideKitAuthLabels(override)] });
    const labels = TestBed.inject(KIT_AUTH_LABELS);

    // When
    override.set(KIT_AUTH_LABELS_PL);

    // Then
    expect(labels()).toEqual(KIT_AUTH_LABELS_PL);
  });

});
