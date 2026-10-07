import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideKitLabels } from '../labels/provide-kit-labels';
import {
  KIT_TABLE_LABELS,
  KIT_TABLE_LABELS_EN,
  KIT_TABLE_LABELS_PL,
  KitTableLabelsOverride,
  provideKitTableLabels
} from './kit-table-labels';

describe('kit table labels', () => {

  it('should default to English', () => {
    expect(TestBed.inject(KIT_TABLE_LABELS)()).toEqual(KIT_TABLE_LABELS_EN);
  });

  it('should have a Polish set with the same shape as the English one', () => {
    expect(Object.keys(KIT_TABLE_LABELS_PL.states)).toEqual(Object.keys(KIT_TABLE_LABELS_EN.states));
    expect(Object.keys(KIT_TABLE_LABELS_PL.paginator)).toEqual(Object.keys(KIT_TABLE_LABELS_EN.paginator));
  });

  it('should keep the placeholders in the Polish range and page labels', () => {
    expect(KIT_TABLE_LABELS_PL.paginator.range).toContain('{from}');
    expect(KIT_TABLE_LABELS_PL.paginator.range).toContain('{to}');
    expect(KIT_TABLE_LABELS_PL.paginator.range).toContain('{total}');
    expect(KIT_TABLE_LABELS_PL.paginator.page).toContain('{page}');
  });

  it('should override a single nested label and keep the rest', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitTableLabels({ paginator: { rowsPerPage: 'Per page' } })] });

    // When
    const labels = TestBed.inject(KIT_TABLE_LABELS)();

    // Then
    expect(labels.paginator.rowsPerPage).toBe('Per page');
    expect(labels.paginator.next).toBe('Next page');
    expect(labels.states).toEqual(KIT_TABLE_LABELS_EN.states);
  });

  it('should follow a signal of overrides as it changes', () => {
    // Given
    const override = signal<KitTableLabelsOverride>({ states: { retry: 'First' } });
    TestBed.configureTestingModule({ providers: [provideKitTableLabels(override)] });
    const labels = TestBed.inject(KIT_TABLE_LABELS);

    // When
    override.set({ states: { retry: 'Second' } });

    // Then
    expect(labels().states.retry).toBe('Second');
  });

  it('should be set by provideKitLabels', () => {
    // Given
    TestBed.configureTestingModule({ providers: [provideKitLabels('pl')] });

    // Then
    expect(TestBed.inject(KIT_TABLE_LABELS)()).toEqual(KIT_TABLE_LABELS_PL);
  });

});
