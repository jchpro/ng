import { TestBed } from '@angular/core/testing';
import { PRO_DIALOGS_INTL, ProDialogsIntl } from './pro-dialogs-intl';

describe('ProBaseLabelsIntl', () => {
  let intl: ProDialogsIntl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    intl = TestBed.inject(PRO_DIALOGS_INTL);
  });

  it('should be created', () => {
    expect(intl).toBeTruthy();
  });

  it('returned signal labels should track changes', () => {
    // Given
    const confirm = intl.getLabel('confirmButton');

    // Then
    expect(confirm()).toBe('Confirm');

    // When
    intl.labels.update(val => ({ ...val, confirmButton: 'hello_world' }));

    // Then
    expect(confirm()).toBe('hello_world');
  });

});
