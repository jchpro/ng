import { TestBed } from '@angular/core/testing';
import { IntlFileSizePipe } from './intl-file-size.pipe';

describe('IntlFileSizePipe', () => {
  let pipe: IntlFileSizePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [IntlFileSizePipe] });
    pipe = TestBed.inject(IntlFileSizePipe);
  });

  it('should return empty string for a missing or invalid size', () => {
    // Then
    expect(pipe.transform(null, 'en')).toBe('');
    expect(pipe.transform(undefined, 'en')).toBe('');
    expect(pipe.transform('', 'en')).toBe('');
    expect(pipe.transform('abc', 'en')).toBe('');
    expect(pipe.transform(NaN, 'en')).toBe('');
  });

  it('should write bytes whole', () => {
    // Then
    expect(pipe.transform(0, 'en')).toBe('0 B');
    expect(pipe.transform(512, 'en')).toBe('512 B');
    expect(pipe.transform(1023, 'en')).toBe('1,023 B');
  });

  it('should step by 1024 and keep at most one decimal', () => {
    // Then
    expect(pipe.transform(1024, 'en')).toBe('1 KB');
    expect(pipe.transform(1536, 'en')).toBe('1.5 KB');
    expect(pipe.transform(10 * 1024 ** 2, 'en')).toBe('10 MB');
    expect(pipe.transform(5 * 1024 ** 3, 'en')).toBe('5 GB');
  });

  it('should not go past the largest unit', () => {
    // Then
    expect(pipe.transform(2048 * 1024 ** 4, 'en')).toBe('2,048 TB');
  });

  it('should write the number as the locale does and keep the units', () => {
    // Then
    expect(pipe.transform(1536, 'pl')).toBe('1,5 KB');
    expect(pipe.transform(1.5 * 1024 ** 2, 'pl-PL')).toBe('1,5 MB');
  });

  it('should accept the size as a numeric string', () => {
    // Then
    expect(pipe.transform('2048', 'en')).toBe('2 KB');
  });

});
