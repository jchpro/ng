import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { applyKitTableParams, kitClientTable } from './kit-client-table';
import { kitTableState } from './kit-table-state';
import { KitTableParams } from './kit-table.types';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  seats: number | null;
  joined: Date;
  active: boolean;
}

interface Filters {
  role: string | null;
  minSeats: number | null;
}

const people: Person[] = [
  { id: 1, name: 'Zażółć Gęślą', email: 'zg@example.com', role: 'Admin', seats: 10, joined: new Date(2026, 0, 5), active: true },
  { id: 2, name: 'ada lovelace', email: 'ada@example.com', role: 'Editor', seats: 2, joined: new Date(2026, 0, 3), active: false },
  { id: 3, name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', seats: null, joined: new Date(2026, 0, 4), active: true },
  { id: 4, name: 'Item 10', email: 'i10@example.com', role: 'Viewer', seats: 30, joined: new Date(2026, 0, 1), active: true },
  { id: 5, name: 'Item 9', email: 'i9@example.com', role: 'Viewer', seats: 4, joined: new Date(2026, 0, 2), active: false }
];

function params(overrides: Partial<KitTableParams<Filters>> = {}): KitTableParams<Filters> {
  return { query: '', filters: { role: null, minSeats: null }, sort: null, page: 1, pageSize: 25, ...overrides };
}

const ids = (rows: Person[]) => rows.map(row => row.id);

describe('applyKitTableParams', () => {

  it('should return every row, in order, for empty params', () => {
    // When
    const view = applyKitTableParams(people, params());

    // Then
    expect(ids(view.rows)).toEqual([1, 2, 3, 4, 5]);
    expect(view.total).toBe(5);
  });

  it('should not change the rows it is given', () => {
    // Given
    const copy = [...people];

    // When
    applyKitTableParams(people, params({ sort: { field: 'name', direction: 'desc' } }));

    // Then
    expect(people).toEqual(copy);
  });

  describe('search', () => {

    const options = { search: (person: Person) => [person.name, person.email] };

    it('should ignore the query without a search function', () => {
      expect(applyKitTableParams(people, params({ query: 'ada' })).total).toBe(5);
    });

    it('should match case-insensitively in any of the given texts', () => {
      // When
      const view = applyKitTableParams(people, params({ query: 'ADA' }), options);

      // Then
      expect(ids(view.rows)).toEqual([2]);
      expect(ids(applyKitTableParams(people, params({ query: 'grace@' }), options).rows)).toEqual([3]);
    });

    it('should require every word, in any order', () => {
      // Then
      expect(ids(applyKitTableParams(people, params({ query: 'hopper grace' }), options).rows)).toEqual([3]);
      expect(applyKitTableParams(people, params({ query: 'grace lovelace' }), options).total).toBe(0);
    });

    it('should ignore accents', () => {
      // Then
      expect(ids(applyKitTableParams(people, params({ query: 'zazolc' }), options).rows)).toEqual([]);
      expect(ids(applyKitTableParams(people, params({ query: 'zażółć' }), options).rows)).toEqual([1]);
      expect(ids(applyKitTableParams([{ ...people[0], name: 'José' }], params({ query: 'jose' }), options).rows)).toEqual([1]);
    });

    it('should accept a single string', () => {
      // When
      const view = applyKitTableParams(people, params({ query: 'viewer' }), { search: person => person.role });

      // Then
      expect(ids(view.rows)).toEqual([4, 5]);
    });

  });

  describe('filters', () => {

    it('should compare the property of the same name by default', () => {
      // When
      const view = applyKitTableParams(people, params({ filters: { role: 'Admin', minSeats: null } }));

      // Then
      expect(ids(view.rows)).toEqual([1, 3]);
    });

    it('should use the given function, only for filters with a value', () => {
      // Given
      const options = { filters: { minSeats: (person: Person, min: number) => (person.seats ?? 0) >= min } };

      // Then
      expect(ids(applyKitTableParams(people, params({ filters: { role: null, minSeats: 5 } }), options).rows)).toEqual([1, 4]);
      expect(applyKitTableParams(people, params({ filters: { role: null, minSeats: null } }), options).total).toBe(5);
    });

    it('should combine filters and the search', () => {
      // When
      const view = applyKitTableParams(people, params({ query: 'a', filters: { role: 'Admin', minSeats: null } }), {
        search: person => person.name
      });

      // Then
      expect(ids(view.rows)).toEqual([1, 3]);
    });

    it('should treat an empty string as no filter', () => {
      expect(applyKitTableParams(people, params({ filters: { role: '', minSeats: null } })).total).toBe(5);
    });

  });

  describe('sort', () => {

    it('should sort text case-insensitively and numbers inside it in natural order', () => {
      // When
      const asc = applyKitTableParams(people, params({ sort: { field: 'name', direction: 'asc' } }));

      // Then
      expect(ids(asc.rows)).toEqual([2, 3, 5, 4, 1]);
    });

    it('should sort descending', () => {
      // When
      const desc = applyKitTableParams(people, params({ sort: { field: 'name', direction: 'desc' } }));

      // Then
      expect(ids(desc.rows)).toEqual([1, 4, 5, 3, 2]);
    });

    it('should sort numbers as numbers and keep empty values last either way', () => {
      // When
      const asc = applyKitTableParams(people, params({ sort: { field: 'seats', direction: 'asc' } }));
      const desc = applyKitTableParams(people, params({ sort: { field: 'seats', direction: 'desc' } }));

      // Then
      expect(ids(asc.rows)).toEqual([2, 5, 1, 4, 3]);
      expect(ids(desc.rows)).toEqual([4, 1, 5, 2, 3]);
    });

    it('should sort dates and booleans', () => {
      // Then
      expect(ids(applyKitTableParams(people, params({ sort: { field: 'joined', direction: 'asc' } })).rows)).toEqual([4, 5, 2, 3, 1]);
      expect(ids(applyKitTableParams(people, params({ sort: { field: 'active', direction: 'asc' } })).rows).slice(0, 2).sort()).toEqual([2, 5]);
    });

    it('should use the accessor given for a column', () => {
      // When
      const view = applyKitTableParams(people, params({ sort: { field: 'user', direction: 'asc' } }), {
        sort: { user: person => person.email }
      });

      // Then
      expect(ids(view.rows)).toEqual([2, 3, 5, 4, 1]);
    });

    it('should be stable for equal values', () => {
      // When
      const view = applyKitTableParams(people, params({ sort: { field: 'role', direction: 'asc' } }));

      // Then
      expect(ids(view.rows)).toEqual([1, 3, 2, 4, 5]);
    });

  });

  describe('paging', () => {

    it('should return the page and the total across pages', () => {
      // When
      const view = applyKitTableParams(people, params({ page: 2, pageSize: 2 }));

      // Then
      expect(ids(view.rows)).toEqual([3, 4]);
      expect(view.total).toBe(5);
    });

    it('should return a short last page and an empty page past the end', () => {
      // Then
      expect(ids(applyKitTableParams(people, params({ page: 3, pageSize: 2 })).rows)).toEqual([5]);
      expect(applyKitTableParams(people, params({ page: 4, pageSize: 2 })).rows).toEqual([]);
    });

    it('should page the filtered rows', () => {
      // When
      const view = applyKitTableParams(people, params({ page: 2, pageSize: 1, filters: { role: 'Admin', minSeats: null } }));

      // Then
      expect(ids(view.rows)).toEqual([3]);
      expect(view.total).toBe(2);
    });

  });

});

describe('kitClientTable', () => {

  function create() {
    const rows = signal<readonly Person[]>(people);
    const state = TestBed.runInInjectionContext(() => kitTableState<Filters>({
      pageSize: 2,
      searchDebounce: 0,
      filters: { role: null, minSeats: null }
    }));
    const view = kitClientTable(rows, state, { search: person => person.name });
    return { rows, state, view };
  }

  it('should show the first page of the rows', () => {
    // Given
    const { view } = create();

    // Then
    expect(ids(view.rows())).toEqual([1, 2]);
    expect(view.total()).toBe(5);
  });

  it('should follow the state', () => {
    // Given
    const { state, view } = create();

    // When
    state.page.set(2);

    // Then
    expect(ids(view.rows())).toEqual([3, 4]);

    // When
    state.setFilter('role', 'Admin');

    // Then
    expect(ids(view.rows())).toEqual([1, 3]);
    expect(view.total()).toBe(2);

    // When
    state.search('grace');

    // Then
    expect(ids(view.rows())).toEqual([3]);
  });

  it('should follow the rows', () => {
    // Given
    const { rows, view } = create();

    // When
    rows.set(people.slice(0, 1));

    // Then
    expect(ids(view.rows())).toEqual([1]);
    expect(view.total()).toBe(1);
  });

});
