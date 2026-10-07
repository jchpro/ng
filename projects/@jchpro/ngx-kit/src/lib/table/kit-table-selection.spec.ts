import { TestBed } from '@angular/core/testing';
import { kitTableSelection, KitTableSelection } from './kit-table-selection';
import { kitTableState } from './kit-table-state';

interface Row {
  id: number;
  name: string;
}

const rows: Row[] = [1, 2, 3, 4].map(id => ({ id, name: `Row ${id}` }));

describe('KitTableSelection', () => {

  function create() {
    return new KitTableSelection<Row, number>(row => row.id);
  }

  it('should start empty', () => {
    // Given
    const selection = create();

    // Then
    expect(selection.count()).toBe(0);
    expect(selection.isSelected(rows[0])).toBe(false);
  });

  it('should toggle a row', () => {
    // Given
    const selection = create();

    // When
    selection.toggle(rows[0]);

    // Then
    expect(selection.isSelected(rows[0])).toBe(true);
    expect(selection.count()).toBe(1);

    // When
    selection.toggle(rows[0]);

    // Then
    expect(selection.isSelected(rows[0])).toBe(false);
  });

  it('should set a row explicitly', () => {
    // Given
    const selection = create();

    // When
    selection.toggle(rows[0], true);
    selection.toggle(rows[0], true);

    // Then
    expect(selection.count()).toBe(1);

    // When
    selection.toggle(rows[0], false);

    // Then
    expect(selection.count()).toBe(0);
  });

  it('should recognize a row by its key, not its identity', () => {
    // Given
    const selection = create();
    selection.toggle(rows[0]);

    // Then
    expect(selection.isSelected({ id: 1, name: 'A reloaded copy' })).toBe(true);
  });

  it('should select and deselect many rows', () => {
    // Given
    const selection = create();

    // When
    selection.select(rows);
    selection.deselect([rows[1], rows[2]]);

    // Then
    expect([...selection.keys()]).toEqual([1, 4]);
  });

  it('should select all of the rows with toggleAll, then deselect them', () => {
    // Given
    const selection = create();
    selection.toggle(rows[0]);

    // When
    selection.toggleAll(rows);

    // Then
    expect(selection.count()).toBe(4);
    expect(selection.allSelected(rows)).toBe(true);

    // When
    selection.toggleAll(rows);

    // Then
    expect(selection.count()).toBe(0);
  });

  it('should leave rows outside the given ones alone in toggleAll', () => {
    // Given
    const selection = create();
    selection.select([rows[3]]);

    // When
    selection.toggleAll(rows.slice(0, 2));
    selection.toggleAll(rows.slice(0, 2));

    // Then
    expect([...selection.keys()]).toEqual([4]);
  });

  it('should tell all, some and none apart for the header checkbox', () => {
    // Given
    const selection = create();

    // Then
    expect(selection.allSelected(rows)).toBe(false);
    expect(selection.someSelected(rows)).toBe(false);

    // When
    selection.toggle(rows[0]);

    // Then
    expect(selection.allSelected(rows)).toBe(false);
    expect(selection.someSelected(rows)).toBe(true);

    // When
    selection.select(rows);

    // Then
    expect(selection.allSelected(rows)).toBe(true);
    expect(selection.someSelected(rows)).toBe(false);
  });

  it('should not call no rows all selected', () => {
    expect(create().allSelected([])).toBe(false);
  });

  it('should clear', () => {
    // Given
    const selection = create();
    selection.select(rows);

    // When
    selection.clear();

    // Then
    expect(selection.count()).toBe(0);
  });

  describe('with a state', () => {

    function createWithState() {
      return TestBed.runInInjectionContext(() => {
        const state = kitTableState({ searchDebounce: 0, filters: { role: null as string | null } });
        const selection = kitTableSelection((row: Row) => row.id, { state });
        return { state, selection };
      });
    }

    it('should empty when the search changes', () => {
      // Given
      const { state, selection } = createWithState();
      TestBed.tick();
      selection.select(rows);

      // When
      state.search('row');
      TestBed.tick();

      // Then
      expect(selection.count()).toBe(0);
    });

    it('should empty when a filter changes', () => {
      // Given
      const { state, selection } = createWithState();
      TestBed.tick();
      selection.select(rows);

      // When
      state.setFilter('role', 'Admin');
      TestBed.tick();

      // Then
      expect(selection.count()).toBe(0);
    });

    it('should keep the selection when paging, sorting or changing the page size', () => {
      // Given
      const { state, selection } = createWithState();
      TestBed.tick();
      selection.select(rows);

      // When
      state.page.set(2);
      state.sort.set({ field: 'name', direction: 'asc' });
      state.pageSize.set(50);
      TestBed.tick();

      // Then
      expect(selection.count()).toBe(4);
    });

  });

});
