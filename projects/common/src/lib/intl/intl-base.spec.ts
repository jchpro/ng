import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WINDOW } from '../tokens/window';
import { IntlBase } from './intl-base';
import { INTL_CONFIG, IntlConfig } from './intl-config';

describe('IntlBase', () => {
  let ext: IntlBaseExt;

  @Injectable()
  class IntlBaseExt extends IntlBase {
    effLocale(locale?: string) { return this.effectiveLocale(locale); }
    get broLocale() { return this.browserLocale(); }
  }

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
      providers: [...providers, IntlBaseExt, IntlBase]
    });
    ext = TestBed.inject(IntlBaseExt);
  }

  it('should return proper browser locale from navigator.language', () => {
    // Given
    create();

    // Then
    expect(ext.broLocale).toBe('en-GB');
  });

  it('should return effective locale same as browser locale if not set in config', () => {
    // Given
    create('en-US');

    // Then
    expect(ext.effLocale()).toBe('en-US');
  });

  it('should return effective locale as set in config', () => {
    // Given
    create('en-US', { locale: 'pl-PL' });

    // Then
    expect(ext.effLocale()).toBe('pl-PL');
  });

  it('should return effective locale same as passed to the function', () => {
    // Given
    create('en-US', { locale: 'pl-PL' });

    // Then
    expect(ext.effLocale('de-DE')).toBe('de-DE');
  });

});
