import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOCAL_STORAGE, WINDOW } from '@jchpro/ngx-common';
import { BehaviorSubject } from 'rxjs';
import { KitThemeService } from './kit-theme.service';

describe('KitThemeService', () => {
  let service: KitThemeService;
  let body: HTMLElement;
  let prefersDark$: BehaviorSubject<BreakpointState>;

  function create(initialData: Record<string, string> = {}, prefersDark = false) {
    let data = { ...initialData };
    const mockStorage: Storage = {
      get length() { return Object.keys(data).length; },
      clear: () => { data = {}; },
      getItem: (key: string) => key in data ? data[key] : null,
      key: (index: number) => Object.keys(data)[index] ?? null,
      removeItem: (key: string) => { delete data[key]; },
      setItem: (key: string, value: string) => { data[key] = value; },
    };
    prefersDark$ = new BehaviorSubject<BreakpointState>({ matches: prefersDark, breakpoints: {} });
    const mockBreakpoints: Partial<BreakpointObserver> = {
      observe: () => prefersDark$.asObservable(),
      isMatched: () => prefersDark,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCAL_STORAGE, useValue: mockStorage },
        { provide: WINDOW, useValue: { location: { hostname: 'localhost' } } },
        { provide: BreakpointObserver, useValue: mockBreakpoints },
      ]
    });
    service = TestBed.inject(KitThemeService);
    body = TestBed.inject(DOCUMENT).body;
  }

  it('should default to system scheme and mark the body with kit-theme and kit-system', () => {
    // Given
    create();

    // Then
    expect(service.scheme()).toBe('system');
    expect(body.classList.contains('kit-theme')).toBe(true);
    expect(body.classList.contains('kit-system')).toBe(true);
    expect(body.classList.contains('kit-light')).toBe(false);
  });

  it('should restore a persisted scheme from storage', () => {
    // Given
    create({ 'kit.scheme': '"light"' });

    // Then
    expect(service.scheme()).toBe('light');
    expect(body.classList.contains('kit-light')).toBe(true);
    expect(body.classList.contains('kit-system')).toBe(false);
  });

  it('should resolve effectiveScheme from the OS preference while system, and track it live', () => {
    // Given
    create({}, false);
    expect(service.effectiveScheme()).toBe('light');

    // When
    prefersDark$.next({ matches: true, breakpoints: {} });

    // Then
    expect(service.effectiveScheme()).toBe('dark');
  });

  it('should resolve effectiveScheme to the explicit scheme, ignoring OS preference', () => {
    // Given
    create({ 'kit.scheme': '"light"' }, true);

    // Then
    expect(service.effectiveScheme()).toBe('light');
  });

  it('should persist and apply explicit scheme changes', () => {
    // Given
    create();

    // When
    service.set('dark');

    // Then
    expect(service.scheme()).toBe('dark');
    expect(body.classList.contains('kit-light')).toBe(false);
    expect(body.classList.contains('kit-system')).toBe(false);

    // When
    service.set('light');

    // Then
    expect(service.scheme()).toBe('light');
    expect(body.classList.contains('kit-light')).toBe(true);
  });

  it('should cycle system -> dark -> light -> system on toggle', () => {
    // Given
    create();
    expect(service.scheme()).toBe('system');

    // When
    service.toggle();

    // Then
    expect(service.scheme()).toBe('dark');

    // When
    service.toggle();

    // Then
    expect(service.scheme()).toBe('light');

    // When
    service.toggle();

    // Then
    expect(service.scheme()).toBe('system');
  });

});
