import { TestBed } from '@angular/core/testing';
import { IntlDatePipe } from "./intl-date.pipe";

describe('IntlDatePipe', () => {
  let pipe: IntlDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntlDatePipe]
    });
    pipe = TestBed.inject(IntlDatePipe);
  });

  it('should return empty string for nullable input', () => {
    // When
    let str = pipe.transform(null, 'pl-PL');

    // Then
    expect(str).toEqual('');

    // When
    str = pipe.transform(undefined, 'pl-PL');

    // Then
    expect(str).toEqual('');
  });

  it('should return non-empty string for valid date input', () => {
    // When
    let str = pipe.transform(new Date().toISOString(), 'pl-PL');

    // Then
    expect(str).not.toBe('');

    // When
    str = pipe.transform(new Date().valueOf(), 'pl-PL');

    // Then
    expect(str).not.toBe('');

    // When
    str = pipe.transform(new Date(), 'pl-PL');

    // Then
    expect(str).not.toBe('');
  });

});
