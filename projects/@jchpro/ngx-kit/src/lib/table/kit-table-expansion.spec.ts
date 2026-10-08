import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDataTable } from './kit-data-table';
import { KitDetailCell } from './kit-detail-cell.directive';
import { KitExpandToggle } from './kit-expand-toggle';
import { KitCol } from './kit-col.directive';
import { kitTableColumns } from './kit-columns';
import { KIT_TABLE_LABELS_PL, provideKitTableLabels } from './kit-table-labels';
import { KitTableExpansion, kitTableExpansion } from './kit-table-expansion';
import { kitTableState } from './kit-table-state';

interface Row {
  id: number;
  name: string;
}

const rows: Row[] = [1, 2, 3].map(id => ({ id, name: `Row ${id}` }));

describe('KitTableExpansion', () => {

  function create(single = false) {
    return new KitTableExpansion<Row, number>(row => row.id, single);
  }

  it('should start with every row collapsed', () => {
    // Given
    const expansion = create();

    // Then
    expect(expansion.count()).toBe(0);
    expect(expansion.isExpanded(rows[0])).toBe(false);
  });

  it('should toggle a row, by its key', () => {
    // Given
    const expansion = create();

    // When
    expansion.toggle(rows[0]);

    // Then
    expect(expansion.isExpanded(rows[0])).toBe(true);
    expect(expansion.isExpanded({ id: 1, name: 'A reloaded copy' })).toBe(true);

    // When
    expansion.toggle(rows[0]);

    // Then
    expect(expansion.isExpanded(rows[0])).toBe(false);
  });

  it('should set a row explicitly', () => {
    // Given
    const expansion = create();

    // When
    expansion.toggle(rows[0], true);
    expansion.toggle(rows[0], true);

    // Then
    expect(expansion.count()).toBe(1);

    // When
    expansion.toggle(rows[0], false);
    expansion.toggle(rows[0], false);

    // Then
    expect(expansion.count()).toBe(0);
  });

  it('should keep several rows open', () => {
    // Given
    const expansion = create();

    // When
    expansion.toggle(rows[0]);
    expansion.toggle(rows[1]);

    // Then
    expect([...expansion.keys()]).toEqual([1, 2]);
  });

  it('should keep only one row open when single', () => {
    // Given
    const expansion = create(true);

    // When
    expansion.toggle(rows[0]);
    expansion.toggle(rows[1]);

    // Then
    expect([...expansion.keys()]).toEqual([2]);

    // When
    expansion.toggle(rows[1]);

    // Then
    expect(expansion.count()).toBe(0);
  });

  it('should collapse all', () => {
    // Given
    const expansion = create();
    expansion.toggle(rows[0]);
    expansion.toggle(rows[1]);

    // When
    expansion.collapseAll();

    // Then
    expect(expansion.count()).toBe(0);
  });

  describe('with a state', () => {

    function createWithState() {
      return TestBed.runInInjectionContext(() => {
        const state = kitTableState({ searchDebounce: 0, filters: { role: null as string | null } });
        const expansion = kitTableExpansion((row: Row) => row.id, { state });
        return { state, expansion };
      });
    }

    it('should collapse when the page, sort, search, a filter or the page size changes', () => {
      // Given
      const { state, expansion } = createWithState();
      TestBed.tick();
      const changes = [
        () => state.page.set(2),
        () => state.sort.set({ field: 'name', direction: 'asc' }),
        () => state.search('ada'),
        () => state.setFilter('role', 'Admin'),
        () => state.pageSize.set(50)
      ];

      for (const change of changes) {
        // When
        expansion.toggle(rows[0], true);
        change();
        TestBed.tick();

        // Then
        expect(expansion.count()).toBe(0);
      }
    });

    it('should keep the rows open while nothing changes', () => {
      // Given
      const { expansion } = createWithState();
      TestBed.tick();

      // When
      expansion.toggle(rows[0]);
      TestBed.tick();

      // Then
      expect(expansion.count()).toBe(1);
    });

  });

});

@Component({
  imports: [KitDataTable, KitExpandToggle, KitDetailCell, KitCol],
  template: `
    <kit-data-table [columns]="columns">
      <table>
        <thead>
          <tr>
            <th class="kit-cell--expand"></th>
            <th kitCol="name">Name</th>
            <th kitCol="role">Role</th>
            <th kitCol="id">ID</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.id) {
            <tr>
              <td><kit-expand-toggle [row]="row.name" [expanded]="expansion.isExpanded(row)" (toggle)="expansion.toggle(row)" /></td>
              <td kitCol="name">{{ row.name }}</td>
              <td kitCol="role">Admin</td>
              <td kitCol="id">{{ row.id }}</td>
            </tr>
            @if (expansion.isExpanded(row)) {
              <tr class="kit-table__detail"><td kitDetail class="detail">Details of {{ row.name }}</td></tr>
            }
          }
        </tbody>
      </table>
    </kit-data-table>`
})
class Host {
  readonly rows = rows;
  readonly expansion = new KitTableExpansion<Row, number>(row => row.id);
  readonly columns = kitTableColumns([
    { id: 'name', label: 'Name', locked: true },
    { id: 'role', label: 'Role' },
    { id: 'id', label: 'ID', hidden: true }
  ]);
  readonly extra = signal(0);
}

describe('KitExpandToggle and KitDetailCell', () => {

  function create(providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      element,
      toggles: () => Array.from(element.querySelectorAll('kit-expand-toggle button')) as HTMLButtonElement[],
      detail: () => element.querySelector('td.detail') as HTMLTableCellElement | null,
      update: () => {
        fixture.detectChanges();
        TestBed.tick();
        fixture.detectChanges();
      }
    };
  }

  it('should name each button after its row and say whether it is expanded', () => {
    // Given
    const { toggles } = create();

    // Then
    expect(toggles()[0].getAttribute('aria-label')).toBe('Show details of Row 1');
    expect(toggles()[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the detail row on a click and close it on another', () => {
    // Given
    const { toggles, detail, update } = create();

    // When
    toggles()[1].click();
    update();

    // Then
    expect(detail()!.textContent).toContain('Details of Row 2');
    expect(toggles()[1].getAttribute('aria-expanded')).toBe('true');
    expect(toggles()[1].getAttribute('aria-label')).toBe('Hide details of Row 2');

    // When
    toggles()[1].click();
    update();

    // Then
    expect(detail()).toBeNull();
  });

  it('should span every column that is shown', () => {
    // Given
    const { toggles, detail, update } = create();

    // When
    toggles()[0].click();
    update();

    // Then: the expand column, name and role; the id column starts hidden
    expect(detail()!.colSpan).toBe(3);
  });

  it('should follow the columns being shown and hidden', () => {
    // Given
    const { host, toggles, detail, update } = create();
    toggles()[0].click();
    update();

    // When
    host.columns.setVisible('id', true);
    update();

    // Then
    expect(detail()!.colSpan).toBe(4);

    // When
    host.columns.setVisible('role', false);
    host.columns.setVisible('id', false);
    update();

    // Then
    expect(detail()!.colSpan).toBe(2);
  });

  it('should use the translated labels', () => {
    // Given
    const { toggles } = create([provideKitTableLabels(KIT_TABLE_LABELS_PL)]);

    // Then
    expect(toggles()[0].getAttribute('aria-label')).toBe('Pokaż szczegóły: Row 1');
  });

});
