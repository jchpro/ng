import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  KIT_DIALOG_LABELS,
  KIT_DIALOG_LABELS_EN,
  KIT_DIALOG_LABELS_PL,
  KitDialogLabelsOverride,
  provideKitDialogLabels
} from './kit-dialog-labels';

describe('kit dialog labels', () => {

  it('should default to English', () => {
    // When
    const labels = TestBed.inject(KIT_DIALOG_LABELS);

    // Then
    expect(labels()).toEqual(KIT_DIALOG_LABELS_EN);
  });

  it('should have a Polish set with the same shape as the English one', () => {
    expect(Object.keys(KIT_DIALOG_LABELS_PL.titles)).toEqual(Object.keys(KIT_DIALOG_LABELS_EN.titles));
    expect(Object.keys(KIT_DIALOG_LABELS_PL.buttons)).toEqual(Object.keys(KIT_DIALOG_LABELS_EN.buttons));
  });

  it('should override only the given labels, keeping the English defaults for the rest', () => {
    // Given
    TestBed.configureTestingModule({
      providers: [provideKitDialogLabels({ buttons: { ok: 'Okay' }, titles: { danger: 'Really?' } })]
    });

    // When
    const labels = TestBed.inject(KIT_DIALOG_LABELS)();

    // Then
    expect(labels.buttons.ok).toBe('Okay');
    expect(labels.buttons.cancel).toBe('Cancel');
    expect(labels.titles.danger).toBe('Really?');
    expect(labels.titles.info).toBe('Information');
  });

  it('should accept a complete set, such as the Polish one', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitDialogLabels(KIT_DIALOG_LABELS_PL)] });

    // When
    const labels = TestBed.inject(KIT_DIALOG_LABELS)();

    // Then
    expect(labels).toEqual(KIT_DIALOG_LABELS_PL);
  });

  it('should follow a signal of overrides as it changes', () => {
    // Given
    const override = signal<KitDialogLabelsOverride>({ buttons: { ok: 'First' } });
    TestBed.configureTestingModule({ providers: [provideKitDialogLabels(override)] });
    const labels = TestBed.inject(KIT_DIALOG_LABELS);
    expect(labels().buttons.ok).toBe('First');

    // When
    override.set({ buttons: { ok: 'Second' } });

    // Then
    expect(labels().buttons.ok).toBe('Second');
    expect(labels().buttons.yes).toBe('Yes');
  });

});
