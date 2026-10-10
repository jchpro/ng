import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KIT_AUTH_LABELS, KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL } from '../auth/kit-auth-labels';
import { KIT_DIALOG_LABELS,KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from '../dialog/kit-dialog-labels';
import { KIT_FORM_LABELS, KIT_FORM_LABELS_EN, KIT_FORM_LABELS_PL } from '../forms/kit-form-labels';
import { KIT_SHELL_LABELS, KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL } from '../shell/kit-shell-labels';
import { KIT_TABLE_LABELS, KIT_TABLE_LABELS_EN, KIT_TABLE_LABELS_PL } from '../table/kit-table-labels';
import { KitLanguage, provideKitLabels } from './provide-kit-labels';

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

  it('should wire the auth labels in either language', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });

    // Then
    expect(TestBed.inject(KIT_AUTH_LABELS)()).toEqual(KIT_AUTH_LABELS_PL);
  });

  it('should wire the English auth labels for en', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('en')] });

    // Then
    expect(TestBed.inject(KIT_AUTH_LABELS)()).toEqual(KIT_AUTH_LABELS_EN);
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

  it('should wire the forms and table labels too', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });

    // Then
    expect(TestBed.inject(KIT_FORM_LABELS)()).toEqual(KIT_FORM_LABELS_PL);
    expect(TestBed.inject(KIT_TABLE_LABELS)()).toEqual(KIT_TABLE_LABELS_PL);
  });

  describe('with a language signal', () => {

    it('should make every feature follow the language as it changes', () => {
      // Given
      const language = signal<KitLanguage>('en');
      TestBed.configureTestingModule({ providers: [provideKitLabels(language)] });
      const labels = {
        auth: TestBed.inject(KIT_AUTH_LABELS),
        dialog: TestBed.inject(KIT_DIALOG_LABELS),
        form: TestBed.inject(KIT_FORM_LABELS),
        shell: TestBed.inject(KIT_SHELL_LABELS),
        table: TestBed.inject(KIT_TABLE_LABELS)
      };
      expect(labels.dialog()).toEqual(KIT_DIALOG_LABELS_EN);

      // When
      language.set('pl');

      // Then
      expect(labels.auth()).toEqual(KIT_AUTH_LABELS_PL);
      expect(labels.dialog()).toEqual(KIT_DIALOG_LABELS_PL);
      expect(labels.form()).toEqual(KIT_FORM_LABELS_PL);
      expect(labels.shell()).toEqual(KIT_SHELL_LABELS_PL);
      expect(labels.table()).toEqual(KIT_TABLE_LABELS_PL);

      // When
      language.set('en');

      // Then
      expect(labels.form()).toEqual(KIT_FORM_LABELS_EN);
      expect(labels.table()).toEqual(KIT_TABLE_LABELS_EN);
    });

    it('should let a later per-feature override win over a language that changes', () => {
      // Given
      const language = signal<KitLanguage>('pl');
      TestBed.configureTestingModule({
        providers: [provideKitLabels(language), provideKitDialogLabels({ buttons: { ok: 'Dobra' } })]
      });

      // Then
      expect(TestBed.inject(KIT_DIALOG_LABELS)().buttons.ok).toBe('Dobra');
    });

  });

});
