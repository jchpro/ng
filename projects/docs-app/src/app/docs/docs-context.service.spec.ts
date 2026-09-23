import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule, Routes } from '@angular/router';
import { LucideGlobe } from '@lucide/angular';
import { DocsContextService } from './docs-context.service';
import { DocLib, DocPage } from './types';

describe('DocsContextService', () => {

  @Component({ selector: 'app-test-cmp', template: '' }) class TestCmp {}

  const page: DocPage = {
    fullName: 'Page full name',
    menuName: 'Page',
    path: 'page',
    icon: LucideGlobe,
    desc: 'page desc',
    component: TestCmp
  };

  const lib: DocLib = {
    name: 'Lib',
    path: 'lib',
    libName: '@jchpro/lib',
    desc: 'lib desc',
    component: TestCmp,
    pages: [page]
  };

  const routes: Routes = [
    { path: 'empty', component: TestCmp },
    {
      path: 'lib',
      component: TestCmp,
      data: { lib },
      children: [
        { path: 'page', component: TestCmp, data: { lib, page } },
      ]
    },
  ];

  let service: DocsContextService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes)]
    });
    service = TestBed.inject(DocsContextService);
    router = TestBed.inject(Router);
  });

  it('should start with an empty context and no menu', () => {
    // Then
    expect(service.context()).toEqual({});
    expect(service.hasMenu()).toBe(false);
  });

  it('should pick up the deepest matched route\'s data after navigation', async () => {
    // When
    await router.navigateByUrl('/lib/page');

    // Then
    expect(service.context().lib).toEqual(lib);
    expect(service.context().page).toEqual(page);
    expect(service.hasMenu()).toBe(true);
  });

  it('should report hasMenu for a lib with pages even without an active page', async () => {
    // When
    await router.navigateByUrl('/lib');

    // Then
    expect(service.context().lib).toEqual(lib);
    expect(service.context().page).toBeUndefined();
    expect(service.hasMenu()).toBe(true);
  });

  it('should report no menu once navigation reaches a route with neither lib nor page', async () => {
    // Given
    await router.navigateByUrl('/lib/page');
    expect(service.hasMenu()).toBe(true);

    // When
    await router.navigateByUrl('/empty');

    // Then
    expect(service.context().lib).toBeUndefined();
    expect(service.context().page).toBeUndefined();
    expect(service.hasMenu()).toBe(false);
  });

});
