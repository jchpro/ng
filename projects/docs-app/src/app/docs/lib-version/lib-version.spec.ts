import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DocLib } from '../types';
import { LibVersion } from './lib-version';
import { NpmLatest, NpmLatestService } from './npm-latest.service';

describe('LibVersion', () => {

  function create(version: string | undefined, latest: NpmLatest) {
    TestBed.configureTestingModule({
      providers: [{ provide: NpmLatestService, useValue: { latest: () => signal(latest) } }]
    });
    const fixture = TestBed.createComponent(LibVersion);
    fixture.componentRef.setInput('lib', { libName: '@jchpro/ngx-kit', version } as DocLib);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return {
      version: el.querySelector('code')?.textContent,
      badge: el.querySelector('.kit-badge--warning'),
      href: el.querySelector('a')?.getAttribute('href')
    };
  }

  it('should show just the version when it matches npm, linking to the package', () => {
    const view = create('0.5.0', { status: 'ok', version: '0.5.0' });
    expect(view.version).toBe('0.5.0');
    expect(view.badge).toBeNull();
    expect(view.href).toBe('https://www.npmjs.com/package/@jchpro/ngx-kit');
  });

  it('should flag a version newer than npm as unreleased', () => {
    const view = create('0.6.0', { status: 'ok', version: '0.5.0' });
    expect(view.version).toBe('0.6.0');
    expect(view.badge?.textContent?.trim()).toBe('unreleased');
  });

  it('should not flag anything while npm is loading', () => {
    expect(create('0.6.0', { status: 'loading' }).badge).toBeNull();
  });

  it('should not flag anything when npm is unreachable', () => {
    expect(create('0.6.0', { status: 'error' }).badge).toBeNull();
  });

  it('should not flag a version older than npm', () => {
    expect(create('0.4.0', { status: 'ok', version: '0.5.0' }).badge).toBeNull();
  });

});
