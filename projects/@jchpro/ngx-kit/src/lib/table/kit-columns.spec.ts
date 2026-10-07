import { kitTableColumns, KitTableColumn } from './kit-columns';

const definitions: KitTableColumn[] = [
  { id: 'name', label: 'Name', locked: true },
  { id: 'role', label: 'Role' },
  { id: 'id', label: 'ID', hidden: true }
];

describe('KitTableColumns', () => {

  const key = 'kit-columns-spec';

  beforeEach(() => localStorage.removeItem(key));
  afterEach(() => localStorage.removeItem(key));

  it('should start with the columns the definitions leave visible', () => {
    // Given
    const columns = kitTableColumns(definitions);

    // Then
    expect(columns.isVisible('name')).toBe(true);
    expect(columns.isVisible('role')).toBe(true);
    expect(columns.isVisible('id')).toBe(false);
    expect(columns.visibleCount()).toBe(2);
  });

  it('should show a column it does not know', () => {
    expect(kitTableColumns(definitions).isVisible('other')).toBe(true);
  });

  it('should toggle a column', () => {
    // Given
    const columns = kitTableColumns(definitions);

    // When
    columns.toggle('role');

    // Then
    expect(columns.isVisible('role')).toBe(false);
    expect(columns.hidden()).toEqual(new Set(['id', 'role']));

    // When
    columns.toggle('role');

    // Then
    expect(columns.isVisible('role')).toBe(true);
  });

  it('should not hide a locked column', () => {
    // Given
    const columns = kitTableColumns(definitions);

    // When
    columns.toggle('name');
    columns.setVisible('name', false);

    // Then
    expect(columns.isVisible('name')).toBe(true);
    expect(columns.isLocked('name')).toBe(true);
  });

  it('should not start a locked column hidden', () => {
    // Given
    const columns = kitTableColumns([{ id: 'name', label: 'Name', locked: true, hidden: true }]);

    // Then
    expect(columns.isVisible('name')).toBe(true);
  });

  it('should go back to the definitions on reset', () => {
    // Given
    const columns = kitTableColumns(definitions);
    columns.toggle('role');
    columns.toggle('id');

    // When
    columns.reset();

    // Then
    expect(columns.hidden()).toEqual(new Set(['id']));
  });

  describe('storage', () => {

    it('should remember the choice', () => {
      // Given
      const columns = kitTableColumns(definitions, { storageKey: key });

      // When
      columns.toggle('role');

      // Then
      expect(JSON.parse(localStorage.getItem(key)!)).toEqual(['id', 'role']);
    });

    it('should restore it, over the definitions', () => {
      // Given
      localStorage.setItem(key, JSON.stringify(['role']));

      // When
      const columns = kitTableColumns(definitions, { storageKey: key });

      // Then
      expect(columns.isVisible('role')).toBe(false);
      expect(columns.isVisible('id')).toBe(true);
    });

    it('should ignore unknown ids, locked ones and junk', () => {
      // Given
      localStorage.setItem(key, JSON.stringify(['gone', 'name', 5, 'role']));

      // When
      const columns = kitTableColumns(definitions, { storageKey: key });

      // Then
      expect(columns.hidden()).toEqual(new Set(['role']));
    });

    it('should fall back to the definitions for unreadable storage', () => {
      // Given
      localStorage.setItem(key, '{not json');

      // When
      const columns = kitTableColumns(definitions, { storageKey: key });

      // Then
      expect(columns.hidden()).toEqual(new Set(['id']));
    });

    it('should keep working when the storage throws', () => {
      // Given
      spyOn(Storage.prototype, 'setItem').and.throwError('full');
      const columns = kitTableColumns(definitions, { storageKey: key });

      // When
      columns.toggle('role');

      // Then
      expect(columns.isVisible('role')).toBe(false);
    });

  });

});
