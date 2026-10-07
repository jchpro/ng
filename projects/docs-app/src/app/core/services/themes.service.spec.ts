import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOCAL_STORAGE, WINDOW } from '@jchpro/ngx-common';
import { ThemesService } from './themes.service';

describe('ThemesService', () => {
  let service: ThemesService;
  let body: HTMLElement;

  function create(initialData: Record<string, string> = {}) {
    let data = { ...initialData };
    const mockStorage: Storage = {
      get length() { return Object.keys(data).length; },
      clear: () => { data = {}; },
      getItem: (key: string) => key in data ? data[key] : null,
      key: (index: number) => Object.keys(data)[index] ?? null,
      removeItem: (key: string) => { delete data[key]; },
      setItem: (key: string, value: string) => { data[key] = value; },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCAL_STORAGE, useValue: mockStorage },
        { provide: WINDOW, useValue: { location: { hostname: 'localhost' } } },
      ]
    });
    service = TestBed.inject(ThemesService);
    body = TestBed.inject(DOCUMENT).body;
  }

  it('should default to jchPRO with no color class applied', () => {
    // Given
    create();

    // Then
    expect(service.color()).toBe('jchPRO');
    expect(body.classList.contains('azure-color')).toBe(false);
    expect(body.classList.contains('green-color')).toBe(false);
  });

  it('should restore a persisted color from storage and apply its class', () => {
    // Given
    create({ 'theme.color': '"azure"' });

    // Then
    expect(service.color()).toBe('azure');
    expect(body.classList.contains('azure-color')).toBe(true);
  });

  it('should persist and apply color changes, swapping the body class', () => {
    // Given
    create();

    // When
    service.change('azure');

    // Then
    expect(service.color()).toBe('azure');
    expect(body.classList.contains('azure-color')).toBe(true);
    expect(body.classList.contains('green-color')).toBe(false);

    // When
    service.change('green');

    // Then
    expect(service.color()).toBe('green');
    expect(body.classList.contains('azure-color')).toBe(false);
    expect(body.classList.contains('green-color')).toBe(true);

    // When
    service.change('jchPRO');

    // Then
    expect(service.color()).toBe('jchPRO');
    expect(body.classList.contains('azure-color')).toBe(false);
    expect(body.classList.contains('green-color')).toBe(false);
  });

});
