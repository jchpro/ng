import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideGlobe, LucideHardDrive } from '@lucide/angular';
import { DocsContext, DocsContextService } from '../docs-context.service';
import { DocLib, DocPage } from '../types';
import { DocsMenu } from './docs-menu';

describe('DocsMenu', () => {

  @Component({ selector: 'app-test-page', template: '' }) class TestPageCmp {}

  const pageA: DocPage = {
    fullName: 'Page A full name',
    menuName: 'Page A',
    path: 'page-a',
    icon: LucideGlobe,
    desc: 'desc a',
    component: TestPageCmp
  };

  const pageB: DocPage = {
    fullName: 'Page B full name',
    menuName: 'Page B',
    path: 'page-b',
    icon: LucideHardDrive,
    desc: 'desc b',
    component: TestPageCmp
  };

  const lib: DocLib = {
    name: 'Lib',
    path: 'lib',
    libName: '@jchpro/lib',
    desc: 'lib desc',
    component: TestPageCmp,
    pages: [pageA, pageB]
  };

  function create(initial: DocsContext = {}) {
    const context = signal(initial);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: DocsContextService, useValue: { context: context.asReadonly() } },
      ]
    });
    const fixture = TestBed.createComponent(DocsMenu);
    fixture.detectChanges();
    return { fixture, context };
  }

  function pageLabels(fixture: { nativeElement: HTMLElement }): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll<HTMLAnchorElement>('a.kit-shell-nav-section__item'))
      .map(a => a.textContent?.trim() ?? '');
  }

  it('should render nothing when there is no active lib', () => {
    // Given
    const { fixture } = create();

    // Then
    expect(fixture.nativeElement.querySelector('kit-shell-nav-section')).toBeNull();
  });

  it('should use the active lib\'s name as the section title', () => {
    // Given
    const { fixture } = create({ lib });

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell-nav-section__title')?.textContent?.trim()).toBe('Lib');
  });

  it('should list the active lib\'s pages as menu links, in order, plus a disabled "more to come" entry', () => {
    // Given
    const { fixture } = create({ lib });

    // Then
    expect(pageLabels(fixture)).toEqual(['Page A', 'Page B']);
    const more: HTMLButtonElement = fixture.nativeElement.querySelector('button.kit-shell-nav-section__item')!;
    expect(more.textContent?.trim()).toBe('More to come...');
    expect(more.disabled).toBe(true);
  });

  it('should react to context changes, re-deriving the menu', () => {
    // Given
    const { fixture, context } = create({ lib });
    expect(pageLabels(fixture)).toEqual(['Page A', 'Page B']);

    // When
    context.set({});
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.querySelector('kit-shell-nav-section')).toBeNull();

    // When
    context.set({ lib: { ...lib, pages: [pageB] } });
    fixture.detectChanges();

    // Then
    expect(pageLabels(fixture)).toEqual(['Page B']);
  });

});
