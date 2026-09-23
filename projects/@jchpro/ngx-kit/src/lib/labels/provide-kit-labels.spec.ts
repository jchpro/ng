import { TestBed } from '@angular/core/testing';
import { KIT_DIALOG_LABELS, KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from '../dialog/kit-dialog-labels';
import { KIT_SHELL_LABELS, KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL } from '../shell/kit-shell-labels';
import { provideKitLabels } from './provide-kit-labels';

describe('provideKitLabels', () => {

  it('should wire the Polish labels of every feature for pl', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });

    // Then
    expect(TestBed.inject(KIT_DIALOG_LABELS)()).toEqual(KIT_DIALOG_LABELS_PL);
  });

  it('should wire the English labels of every feature for en', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('en')] });

    // Then
    expect(TestBed.inject(KIT_DIALOG_LABELS)()).toEqual(KIT_DIALOG_LABELS_EN);
    expect(TestBed.inject(KIT_SHELL_LABELS)()).toEqual(KIT_SHELL_LABELS_EN);
  });

  it('should wire the shell labels too', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });

    // Then
    expect(TestBed.inject(KIT_SHELL_LABELS)()).toEqual(KIT_SHELL_LABELS_PL);
  });

  it('should let a later per-feature override win', () => {
    // Given
    TestBed.configureTestingModule({
      providers: [provideKitLabels('pl'), provideKitDialogLabels({ buttons: { ok: 'Dobra' } })]
    });

    // When
    const labels = TestBed.inject(KIT_DIALOG_LABELS)();

    // Then
    expect(labels.buttons.ok).toBe('Dobra');
  });

});
