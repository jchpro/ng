import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WINDOW } from '../tokens/window';
import { INTL_CONFIG, IntlConfig } from './intl-config';

import { IntlService } from './intl.service';

describe('IntlService', () => {
  let service: IntlService;

  function create(browserLocale = 'en-GB', config?: IntlConfig) {
    const providers: any[] = [
      {
        provide: WINDOW,
        useValue: {
          navigator: {
            language: browserLocale
          }
        },
      }
    ];
    if (config) {
      providers.push({
        provide: INTL_CONFIG,
        useValue: config
      });
    }
    TestBed.configureTestingModule({
      providers: [...providers, IntlService]
    });
    service = TestBed.inject(IntlService);
  }

  it('should return proper browser locale from navigator.language', () => {
    // Given
    create();

    // Then
    expect(service.browserLocale()).toBe('en-GB');
  });

  it('should return effective locale same as browser locale if not set in config', () => {
    // Given
    create('en-US');

    // Then
    expect(service.locale()).toBe('en-US');
  });

  it('should return effective locale as set in config', () => {
    // Given
    create('en-US', { locale: 'pl-PL' });

    // Then
    expect(service.locale()).toBe('pl-PL');
  });

  it('should track the changes of the signal returned from a factory passed `locale` option', () => {
    // Given
    const locale = signal('en-US');
    create('en-GB', { locale: () => locale });

    // Then
    expect(service.locale()).toBe('en-US');

    // When
    locale.set('pl-PL');

    // Then
    expect(service.locale()).toBe('pl-PL');
  });

});
