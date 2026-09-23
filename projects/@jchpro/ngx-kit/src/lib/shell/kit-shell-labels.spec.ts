import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  KIT_SHELL_LABELS,
  KIT_SHELL_LABELS_EN,
  KIT_SHELL_LABELS_PL,
  KitShellLabelsOverride,
  provideKitShellLabels
} from './kit-shell-labels';

describe('kit shell labels', () => {

  it('should default to English', () => {
    expect(TestBed.inject(KIT_SHELL_LABELS)()).toEqual(KIT_SHELL_LABELS_EN);
  });

  it('should have a Polish set with the same shape as the English one', () => {
    expect(Object.keys(KIT_SHELL_LABELS_PL)).toEqual(Object.keys(KIT_SHELL_LABELS_EN));
  });

  it('should override the given labels', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitShellLabels({ toggleNavigation: 'Menu' })] });

    // Then
    expect(TestBed.inject(KIT_SHELL_LABELS)().toggleNavigation).toBe('Menu');
  });

  it('should accept the Polish set', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitShellLabels(KIT_SHELL_LABELS_PL)] });

    // Then
    expect(TestBed.inject(KIT_SHELL_LABELS)()).toEqual(KIT_SHELL_LABELS_PL);
  });

  it('should follow a signal of overrides as it changes', () => {
    // Given
    const override = signal<KitShellLabelsOverride>({ toggleNavigation: 'First' });
    TestBed.configureTestingModule({ providers: [provideKitShellLabels(override)] });
    const labels = TestBed.inject(KIT_SHELL_LABELS);
    expect(labels().toggleNavigation).toBe('First');

    // When
    override.set({ toggleNavigation: 'Second' });

    // Then
    expect(labels().toggleNavigation).toBe('Second');
  });

});
