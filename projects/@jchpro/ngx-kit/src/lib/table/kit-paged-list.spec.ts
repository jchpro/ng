import { TestBed } from '@angular/core/testing';
import { KitPage, kitPagedList } from './kit-paged-list';
import { kitTableState } from './kit-table-state';
import { KitTableParams } from './kit-table.types';

describe('kitPagedList', () => {

  type Loader = (params: KitTableParams<object>, abortSignal: AbortSignal) => Promise<KitPage<string>>;

  /** A loader whose answers the test gives by hand, one per call */
  function manualLoader() {
    const calls: { params: KitTableParams<object>; resolve: (page: KitPage<string>) => void; reject: (error: unknown) => void }[] = [];
    const loader: Loader = params => new Promise<KitPage<string>>((resolve, reject) => calls.push({ params, resolve, reject }));
    return { calls, loader: jasmine.createSpy('loader').and.callFake(loader) as jasmine.Spy<Loader> };
  }

  function create(loader: Loader, pageSize = 10) {
    return TestBed.runInInjectionContext(() => {
      const state = kitTableState({ pageSize });
      return { state, list: kitPagedList(state, loader) };
    });
  }

  /** Runs the effects, lets the promises settle, and runs the effects those wake up. Not `whenStable`: a load the test holds back never ends. */
  async function settle() {
    TestBed.tick();
    await new Promise(resolve => setTimeout(resolve));
    TestBed.tick();
  }

  it('should load the page the state asks for, and another one when the state changes', async () => {
    // Given
    const loader = jasmine.createSpy('loader').and.callFake(async (params: KitTableParams<object>) => ({ items: [`page ${params.page}`], total: 30 }));
    const { state, list } = create(loader);
    await settle();

    // Then
    expect(list.rows()).toEqual(['page 1']);
    expect(list.total()).toBe(30);

    // When
    state.page.set(2);
    await settle();

    // Then
    expect(list.rows()).toEqual(['page 2']);
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ page: 2, pageSize: 10 }));
    expect(loader.calls.mostRecent().args[1]).toEqual(jasmine.any(AbortSignal));
  });

  it('should have no rows, no total and no empty state before the first page loads', async () => {
    // Given
    const { loader } = manualLoader();
    const { list } = create(loader);
    await settle();

    // Then
    expect(list.resource.isLoading()).toBeTrue();
    expect(list.rows()).toEqual([]);
    expect(list.total()).toBeNull();
    expect(list.empty()).toBeFalse();
  });

  it('should keep the rows of the page it has while the next one loads', async () => {
    // Given
    const { calls, loader } = manualLoader();
    const { state, list } = create(loader);
    await settle();
    calls[0].resolve({ items: ['first'], total: 20 });
    await settle();
    expect(list.rows()).toEqual(['first']);

    // When
    state.page.set(2);
    await settle();

    // Then
    expect(list.resource.isLoading()).toBeTrue();
    expect(list.rows()).toEqual(['first']);
    expect(list.total()).toBe(20);

    // When
    calls[1].resolve({ items: ['second'], total: 20 });
    await settle();

    // Then
    expect(list.rows()).toEqual(['second']);
  });

  it('should keep the rows when the next load fails, and not throw', async () => {
    // Given
    const { calls, loader } = manualLoader();
    const { state, list } = create(loader);
    await settle();
    calls[0].resolve({ items: ['first'], total: 20 });
    await settle();
    expect(list.rows()).toEqual(['first']);

    // When
    state.page.set(2);
    await settle();
    calls[1].reject(new Error('down'));
    await settle();

    // Then
    expect(list.resource.error()).toBeTruthy();
    expect(() => list.rows()).not.toThrow();
    expect(list.rows()).toEqual(['first']);
    expect(list.total()).toBe(20);
    expect(list.empty()).toBeFalse();
  });

  it('should show the page that loaded when the first read comes after the second load', async () => {
    // Given: nothing reads the rows while the two pages load
    const loader = jasmine.createSpy('loader').and.callFake(async (params: KitTableParams<object>) => ({ items: [`page ${params.page}`], total: 30 }));
    const { state, list } = create(loader);
    await settle();
    state.page.set(2);
    await settle();

    // Then
    expect(list.rows()).toEqual(['page 2']);
    expect(list.total()).toBe(30);
  });

  it('should have no rows to keep when the first read comes after a failed second load', async () => {
    // Given: the first page is never read, so there is nothing for the rows to remember
    const { calls, loader } = manualLoader();
    const { state, list } = create(loader);
    await settle();
    calls[0].resolve({ items: ['first'], total: 20 });
    await settle();
    state.page.set(2);
    await settle();
    calls[1].reject(new Error('down'));
    await settle();

    // Then
    expect(list.rows()).toEqual([]);
    expect(list.empty()).toBeFalse();
  });

  describe('empty', () => {

    it('should be true when the page that loaded has no rows', async () => {
      // Given
      const { list } = create(async () => ({ items: [], total: 0 }));
      await settle();

      // Then
      expect(list.empty()).toBeTrue();
      expect(list.total()).toBe(0);
    });

    it('should be false when there are rows', async () => {
      // Given
      const { list } = create(async () => ({ items: ['a'], total: 1 }));
      await settle();

      // Then
      expect(list.empty()).toBeFalse();
    });

  });

  describe('reloadAfterRemoval()', () => {

    /** Loads `rows` rows of the page the state is on, out of `total` */
    async function loaded(page: number, rows: number, total: number, pageSize = 10) {
      const loader = jasmine.createSpy('loader').and.callFake(async () => ({ items: Array.from({ length: rows }, (_, i) => `row ${i}`), total }));
      const created = create(loader, pageSize);
      created.state.page.set(page);
      await settle();
      expect(created.list.rows().length).toBe(rows);
      loader.calls.reset();
      return { ...created, loader };
    }

    it('should load the page again', async () => {
      // Given
      const { state, list, loader } = await loaded(2, 10, 25);

      // When
      list.reloadAfterRemoval();
      await settle();

      // Then
      expect(loader).toHaveBeenCalledTimes(1);
      expect(state.page()).toBe(2);
    });

    it('should go back a page when the removed row was the only one of the last page', async () => {
      // Given
      const { state, list } = await loaded(3, 1, 21);

      // When
      list.reloadAfterRemoval();
      await settle();

      // Then
      expect(state.page()).toBe(2);
    });

    it('should stay on the first page whatever is left of it', async () => {
      // Given
      const { state, list, loader } = await loaded(1, 1, 1);

      // When
      list.reloadAfterRemoval();
      await settle();

      // Then
      expect(state.page()).toBe(1);
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should stay on a page that is not the last one even when it shows a single row', async () => {
      // Given: a page size of 1, so every page is a single row
      const { state, list, loader } = await loaded(2, 1, 5, 1);

      // When
      list.reloadAfterRemoval();
      await settle();

      // Then
      expect(state.page()).toBe(2);
      expect(loader).toHaveBeenCalledTimes(1);
    });

  });

});
