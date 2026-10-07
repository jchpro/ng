import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { kitTableState } from './kit-table-state';

@Component({ template: '' })
class PlainTable {
  readonly state = kitTableState({
    pageSize: 10,
    searchDebounce: 0,
    filters: { role: null as string | null },
    urlSync: true
  });
}

@Component({ template: '' })
class PrefixedTable {
  readonly state = kitTableState({ searchDebounce: 0, urlSync: { prefix: 'users.' } });
}

describe('kitTableState with urlSync', () => {

  async function open<T extends { state: ReturnType<typeof kitTableState> }>(component: new () => T, url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component }])] });
    const harness = await RouterTestingHarness.create();
    const instance = await harness.navigateByUrl(url, component);
    harness.detectChanges();
    const router = TestBed.inject(Router);
    const settle = async () => {
      harness.detectChanges();
      await harness.fixture.whenStable();
      harness.detectChanges();
      await harness.fixture.whenStable();
    };
    return { harness, instance, router, settle };
  }

  it('should restore the state from the URL', async () => {
    // Given
    const { instance } = await open(PlainTable, '/?q=ada&role=Admin&page=3&size=50&sort=-seats');

    // Then
    expect(instance.state.params()).toEqual({
      query: 'ada',
      filters: { role: 'Admin' },
      sort: { field: 'seats', direction: 'desc' },
      page: 3,
      pageSize: 50
    });
    expect(instance.state.searchText()).toBe('ada');
  });

  it('should keep the URL clean while the state is the starting one', async () => {
    // Given
    const { router, settle } = await open(PlainTable, '/');

    // When
    await settle();

    // Then
    expect(router.url).toBe('/');
  });

  it('should write a change of the state to the URL', async () => {
    // Given
    const { instance, router, settle } = await open(PlainTable, '/');

    // When
    instance.state.search('ada');
    instance.state.page.set(2);
    await settle();

    // Then
    expect(router.url).toBe('/?q=ada&page=2');
  });

  it('should drop a param when the state goes back to its starting value', async () => {
    // Given
    const { instance, router, settle } = await open(PlainTable, '/?role=Admin');

    // When
    instance.state.setFilter('role', '');
    await settle();

    // Then
    expect(router.url).toBe('/');
  });

  it('should leave other query params alone', async () => {
    // Given
    const { instance, router, settle } = await open(PlainTable, '/?tab=billing');

    // When
    instance.state.search('ada');
    await settle();

    // Then
    expect(router.url).toBe('/?tab=billing&q=ada');
  });

  it('should apply a navigation from outside to the state', async () => {
    // Given
    const { instance, router, settle } = await open(PlainTable, '/?q=ada');

    // When
    await router.navigateByUrl('/?q=grace&page=2');
    await settle();

    // Then
    expect(instance.state.query()).toBe('grace');
    expect(instance.state.page()).toBe(2);
    expect(router.url).toBe('/?q=grace&page=2');
  });

  it('should not let the echo of an older navigation overwrite newer input', async () => {
    // Given
    const { instance, router, settle } = await open(PlainTable, '/');

    // When
    instance.state.search('a');
    instance.state.search('ad');
    instance.state.search('ada');
    await settle();

    // Then
    expect(instance.state.query()).toBe('ada');
    expect(router.url).toBe('/?q=ada');
  });

  it('should only use the prefixed names', async () => {
    // Given
    const { instance, router, settle } = await open(PrefixedTable, '/?q=other&users.q=ada');

    // Then
    expect(instance.state.query()).toBe('ada');

    // When
    instance.state.page.set(2);
    await settle();

    // Then
    expect(router.url).toBe('/?q=other&users.q=ada&users.page=2');
  });

});
