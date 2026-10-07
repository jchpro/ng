import { InjectionToken, signal, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitLabelsOverride, mergeKitLabels, provideKitLabelsFor } from './kit-labels';

describe('kit labels helpers', () => {

  interface TestLabels {
    title: string;
    buttons: {
      ok: string;
      cancel: string;
    };
  }

  const DEFAULTS: TestLabels = { title: 'Title', buttons: { ok: 'OK', cancel: 'Cancel' } };

  describe('mergeKitLabels()', () => {

    it('should return the defaults without an override', () => {
      expect(mergeKitLabels(DEFAULTS, undefined)).toEqual(DEFAULTS);
      expect(mergeKitLabels(DEFAULTS, {})).toEqual(DEFAULTS);
    });

    it('should override a top-level label and keep the rest', () => {
      // When
      const merged = mergeKitLabels(DEFAULTS, { title: 'Heading' });

      // Then
      expect(merged).toEqual({ title: 'Heading', buttons: { ok: 'OK', cancel: 'Cancel' } });
    });

    it('should override a nested label and keep its siblings', () => {
      // When
      const merged = mergeKitLabels(DEFAULTS, { buttons: { ok: 'Okay' } });

      // Then
      expect(merged).toEqual({ title: 'Title', buttons: { ok: 'Okay', cancel: 'Cancel' } });
    });

    it('should ignore labels explicitly left undefined', () => {
      // When
      const merged = mergeKitLabels(DEFAULTS, { title: undefined, buttons: { ok: undefined } });

      // Then
      expect(merged).toEqual(DEFAULTS);
    });

    it('should not touch the defaults it merges over', () => {
      // When
      mergeKitLabels(DEFAULTS, { buttons: { ok: 'Okay' } });

      // Then
      expect(DEFAULTS.buttons.ok).toBe('OK');
    });

    it('should accept a complete set as an override', () => {
      // Given
      const full: TestLabels = { title: 'Tytuł', buttons: { ok: 'Dobrze', cancel: 'Anuluj' } };

      // Then
      expect(mergeKitLabels(DEFAULTS, full)).toEqual(full);
    });

  });

  describe('provideKitLabelsFor()', () => {

    const TOKEN = new InjectionToken<Signal<TestLabels>>('TEST_LABELS');

    function provide(labels: KitLabelsOverride<TestLabels> | Signal<KitLabelsOverride<TestLabels>>) {
      TestBed.configureTestingModule({ providers: [provideKitLabelsFor(TOKEN, DEFAULTS, labels)] });
      return TestBed.inject(TOKEN);
    }

    it('should provide a signal of the merged labels', () => {
      // When
      const labels = provide({ buttons: { cancel: 'Nope' } });

      // Then
      expect(labels()).toEqual({ title: 'Title', buttons: { ok: 'OK', cancel: 'Nope' } });
    });

    it('should re-merge as a signal of overrides changes', () => {
      // Given
      const override = signal<KitLabelsOverride<TestLabels>>({ title: 'One' });
      const labels = provide(override);
      expect(labels().title).toBe('One');

      // When
      override.set({ buttons: { ok: 'Two' } });

      // Then
      expect(labels().title).toBe('Title');
      expect(labels().buttons.ok).toBe('Two');
    });

  });

});
