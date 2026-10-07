import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KitTableState, kitTableState } from './kit-table-state';
import { KitTableStateOptions } from './kit-table.types';

interface RoleFilters {
  role: string | null;
  active: boolean | null;
  minSeats: number | null;
}

describe('KitTableState', () => {

  function create(options: KitTableStateOptions<RoleFilters> = {}) {
    return TestBed.runInInjectionContext(() => kitTableState<RoleFilters>({
      filters: { role: null, active: null, minSeats: null },
      ...options
    }));
  }

  it('should start from the options', () => {
    // Given
    const state = create({ pageSize: 10, sort: { field: 'name', direction: 'asc' } });

    // Then
    expect(state.params()).toEqual({
      query: '',
      filters: { role: null, active: null, minSeats: null },
      sort: { field: 'name', direction: 'asc' },
      page: 1,
      pageSize: 10
    });
    expect(state.filtered()).toBe(false);
  });

  it('should default to 25 rows per page and no sort', () => {
    // Given
    const state = TestBed.runInInjectionContext(() => kitTableState());

    // Then
    expect(state.pageSize()).toBe(25);
    expect(state.sort()).toBeNull();
    expect(state.filters()).toEqual({});
  });

  it('should compute the offset of the current page', () => {
    // Given
    const state = create({ pageSize: 10 });

    // When
    state.page.set(3);

    // Then
    expect(state.offset()).toBe(20);
  });

  describe('search', () => {

    it('should show the text at once and apply it after the debounce', fakeAsync(() => {
      // Given
      const state = create({ searchDebounce: 300 });

      // When
      state.search('ad');
      state.search(' ada ');
      tick(299);

      // Then
      expect(state.searchText()).toBe(' ada ');
      expect(state.query()).toBe('');

      // When
      tick(1);

      // Then
      expect(state.query()).toBe('ada');
      expect(state.filtered()).toBe(true);
    }));

    it('should apply an emptied search at once', fakeAsync(() => {
      // Given
      const state = create();
      state.search('ada');
      tick(300);

      // When
      state.search('');

      // Then
      expect(state.query()).toBe('');
    }));

    it('should apply the search at once with no debounce', () => {
      // Given
      const state = create({ searchDebounce: 0 });

      // When
      state.search('ada');

      // Then
      expect(state.query()).toBe('ada');
    });

    it('should apply the search on flush without waiting', fakeAsync(() => {
      // Given
      const state = create();
      state.search('ada');

      // When
      state.flushSearch();

      // Then
      expect(state.query()).toBe('ada');
      tick(300);
      expect(state.query()).toBe('ada');
    }));

  });

  describe('filters', () => {

    it('should set a filter and list it as active', () => {
      // Given
      const state = create();

      // When
      state.setFilter('role', 'Admin');

      // Then
      expect(state.filters().role).toBe('Admin');
      expect(state.activeFilters()).toEqual([{ key: 'role', value: 'Admin' }]);
      expect(state.filtered()).toBe(true);
    });

    it('should store an empty string as no filter', () => {
      // Given
      const state = create();
      state.setFilter('role', 'Admin');

      // When
      state.setFilter('role', '');

      // Then
      expect(state.filters().role).toBeNull();
      expect(state.activeFilters()).toEqual([]);
    });

    it('should keep a filter that is false or 0', () => {
      // Given
      const state = create();

      // When
      state.setFilter('active', false);
      state.setFilter('minSeats', 0);

      // Then
      expect(state.activeFilters().map(filter => filter.key)).toEqual(['active', 'minSeats']);
    });

    it('should clear the search and every filter but keep the sort and page size', () => {
      // Given
      const state = create({ pageSize: 10, sort: { field: 'name', direction: 'desc' }, searchDebounce: 0 });
      state.search('ada');
      state.setFilter('role', 'Admin');

      // When
      state.clearFilters();

      // Then
      expect(state.searchText()).toBe('');
      expect(state.query()).toBe('');
      expect(state.filters()).toEqual({ role: null, active: null, minSeats: null });
      expect(state.sort()).toEqual({ field: 'name', direction: 'desc' });
      expect(state.pageSize()).toBe(10);
    });

  });

  describe('page', () => {

    it('should go back to the first page when the query changes', () => {
      // Given
      const state = create({ searchDebounce: 0 });
      state.page.set(4);

      // When
      state.search('ada');

      // Then
      expect(state.page()).toBe(1);
    });

    it('should go back to the first page when a filter, the sort or the page size changes', () => {
      // Given
      const state = create();

      // When
      state.page.set(4);
      state.setFilter('role', 'Admin');

      // Then
      expect(state.page()).toBe(1);

      // When
      state.page.set(4);
      state.sort.set({ field: 'name', direction: 'asc' });

      // Then
      expect(state.page()).toBe(1);

      // When
      state.page.set(4);
      state.pageSize.set(50);

      // Then
      expect(state.page()).toBe(1);
    });

    it('should keep the page when paging', () => {
      // Given
      const state = create();

      // When
      state.page.set(2);
      state.page.set(3);

      // Then
      expect(state.page()).toBe(3);
    });

  });

  describe('URL params', () => {

    const get = (params: Record<string, string>) => (name: string) => params[name] ?? null;

    it('should leave out everything equal to the starting state', () => {
      // Given
      const state = create({ pageSize: 10, sort: { field: 'name', direction: 'asc' } });

      // Then
      expect(Object.values(state.toUrlParams())).toEqual([null, null, null, null, null, null, null]);
    });

    it('should write the state', () => {
      // Given
      const state = create({ pageSize: 10, sort: { field: 'name', direction: 'asc' }, searchDebounce: 0 });
      state.search('ada');
      state.setFilter('role', 'Admin');
      state.setFilter('active', false);
      state.sort.set({ field: 'seats', direction: 'desc' });
      state.pageSize.set(50);
      state.page.set(2);

      // Then
      expect(state.toUrlParams()).toEqual({
        q: 'ada',
        sort: '-seats',
        page: '2',
        size: '50',
        role: 'Admin',
        active: 'false',
        minSeats: null
      });
    });

    it('should put a prefix before every name', () => {
      // Given
      const state = create();

      // Then
      expect(state.urlParamNames('users.')).toEqual(['users.q', 'users.sort', 'users.page', 'users.size', 'users.role', 'users.active', 'users.minSeats']);
      expect(Object.keys(state.toUrlParams('users.'))).toEqual(state.urlParamNames('users.'));
    });

    it('should write an explicit empty value for a sort or filter cleared from a non-empty start', () => {
      // Given
      const state = create({ sort: { field: 'name', direction: 'asc' }, filters: { role: 'Admin', active: null, minSeats: null } });

      // When
      state.sort.set(null);
      state.setFilter('role', '');

      // Then
      expect(state.toUrlParams()['sort']).toBe('none');
      expect(state.toUrlParams()['role']).toBe('');
    });

    it('should read the state back, typing the filters like their starting values', () => {
      // Given
      const state = create({ pageSize: 10, filters: { role: null, active: false, minSeats: 0 } });

      // When
      state.applyUrlParams(get({ q: 'ada', sort: '-seats', page: '3', size: '50', role: 'Admin', active: 'true', minSeats: '7' }));

      // Then
      expect(state.params()).toEqual({
        query: 'ada',
        filters: { role: 'Admin', active: true, minSeats: 7 },
        sort: { field: 'seats', direction: 'desc' },
        page: 3,
        pageSize: 50
      });
      expect(state.searchText()).toBe('ada');
    });

    it('should fall back to the starting state for a missing or invalid value', () => {
      // Given
      const state = create({ pageSize: 10, sort: { field: 'name', direction: 'asc' }, filters: { role: null, active: null, minSeats: 0 } });
      state.applyUrlParams(get({ q: 'ada', size: '50', page: '3' }));

      // When
      state.applyUrlParams(get({ size: 'many', page: '-4', sort: '', minSeats: 'x' }));

      // Then
      expect(state.params()).toEqual({
        query: '',
        filters: { role: null, active: null, minSeats: 0 },
        sort: { field: 'name', direction: 'asc' },
        page: 1,
        pageSize: 10
      });
    });

    it('should read none as no sort and an empty value as no filter', () => {
      // Given
      const state = create({ sort: { field: 'name', direction: 'asc' }, filters: { role: 'Admin', active: null, minSeats: null } });

      // When
      state.applyUrlParams(get({ sort: 'none', role: '' }));

      // Then
      expect(state.sort()).toBeNull();
      expect(state.filters().role).toBeNull();
    });

    it('should round-trip through the URL form', () => {
      // Given
      const source = create({ sort: { field: 'name', direction: 'asc' }, searchDebounce: 0 });
      source.search('ada');
      source.setFilter('role', 'Admin');
      source.sort.set(null);
      source.page.set(2);
      const written = source.toUrlParams();
      const target = create({ sort: { field: 'name', direction: 'asc' } });

      // When
      target.applyUrlParams(name => written[name] ?? null);

      // Then
      expect(target.params()).toEqual(source.params());
    });

    it('should not touch the signals when the URL already matches', () => {
      // Given
      const state = create({ pageSize: 10 });
      state.applyUrlParams(get({ role: 'Admin', page: '2' }));
      const filters = state.filters();

      // When
      state.applyUrlParams(get({ role: 'Admin', page: '2' }));

      // Then
      expect(state.filters()).toBe(filters);
      expect(state.page()).toBe(2);
    });

  });

  it('should be a KitTableState', () => {
    expect(create()).toBeInstanceOf(KitTableState);
  });

});
