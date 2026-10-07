import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitCol } from './kit-col.directive';
import { KitColumnPicker } from './kit-column-picker';
import { kitTableColumns } from './kit-columns';
import { KitDataTable } from './kit-data-table';
import { KitDensityToggle } from './kit-density-toggle';
import { KitFilter } from './kit-filter.directive';
import { KitFilterPanel } from './kit-filter-panel';
import { KitPaginator } from './kit-paginator';
import { KitPopover } from './kit-popover';
import { KIT_TABLE_LABELS_PL, provideKitTableLabels } from './kit-table-labels';
import { kitTableSelection } from './kit-table-selection';
import { kitTableState } from './kit-table-state';

@Component({
  imports: [KitDataTable, KitFilter, KitFilterPanel, KitColumnPicker, KitDensityToggle, KitCol],
  template: `
    <kit-data-table [state]="state" [columns]="columns" [selection]="selection" [(density)]="density">
      <input kitTableSearch class="inline-filter">
      <kit-filter-panel kitTableFilters [filters]="['status']">
        <select id="status" kitFilter="status">
          <option value="">Any</option>
          <option value="active">Active</option>
        </select>
      </kit-filter-panel>
      <ng-container kitTableActions>
        <kit-density-toggle />
        <kit-column-picker />
      </ng-container>
      <button kitTableBulk class="bulk-action">Delete</button>
      <table>
        <thead><tr><th kitCol="name">Name</th><th kitCol="role">Role</th></tr></thead>
        <tbody><tr><td kitCol="name">Ada</td><td kitCol="role">Admin</td></tr></tbody>
      </table>
    </kit-data-table>`
})
class Host {
  readonly state = kitTableState({ filters: { status: null as string | null, role: null as string | null } });
  readonly columns = kitTableColumns([
    { id: 'name', label: 'Name', locked: true },
    { id: 'role', label: 'Role' }
  ]);
  readonly selection = kitTableSelection((row: { id: number }) => row.id);
  readonly density = signal<'default' | 'compact'>('default');
}

describe('data table toolbar parts', () => {

  const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement;
  const panel = () => document.querySelector('.cdk-overlay-container .kit-popover__panel') as HTMLElement | null;

  function create(providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      element,
      query: <T extends HTMLElement>(selector: string) => element.querySelector(selector) as T | null,
      update: () => fixture.detectChanges()
    };
  }

  afterEach(() => {
    overlay()?.replaceChildren();
  });

  describe('bulk bar', () => {

    it('should stay out while nothing is selected', () => {
      // Given
      const { query } = create();

      // Then
      expect(query('.kit-data-table__bulk')).toBeNull();
      expect(query('kit-data-table')!.classList).not.toContain('kit-data-table--selecting');
    });

    it('should replace the toolbar with the count and the bulk actions while rows are selected', () => {
      // Given
      const { host, update, query } = create();

      // When
      host.selection.select([{ id: 1 }, { id: 2 }]);
      update();

      // Then
      expect(query('kit-data-table')!.classList).toContain('kit-data-table--selecting');
      expect(query('.kit-data-table__bulk-count')!.textContent!.trim()).toBe('2 selected');
      expect(query('.kit-data-table__bulk .bulk-action')).not.toBeNull();
    });

    it('should clear the selection from the bar', () => {
      // Given
      const { host, update, query } = create();
      host.selection.select([{ id: 1 }]);
      update();

      // When
      query<HTMLButtonElement>('.kit-data-table__bulk > button')!.click();
      update();

      // Then
      expect(host.selection.count()).toBe(0);
      expect(query('.kit-data-table__bulk')).toBeNull();
    });

    it('should use the translated count', () => {
      // Given
      const { host, update, query } = create([provideKitTableLabels(KIT_TABLE_LABELS_PL)]);

      // When
      host.selection.select([{ id: 1 }]);
      update();

      // Then
      expect(query('.kit-data-table__bulk-count')!.textContent!.trim()).toBe('Zaznaczono: 1');
    });

  });

  describe('density', () => {

    it('should toggle the compact class and the model', () => {
      // Given
      const { host, update, query } = create();
      const button = query<HTMLButtonElement>('kit-density-toggle button')!;

      // Then
      expect(button.getAttribute('aria-pressed')).toBe('false');

      // When
      button.click();
      update();

      // Then
      expect(host.density()).toBe('compact');
      expect(query('kit-data-table')!.classList).toContain('kit-data-table--compact');
      expect(button.getAttribute('aria-pressed')).toBe('true');

      // When
      button.click();
      update();

      // Then
      expect(host.density()).toBe('default');
      expect(query('kit-data-table')!.classList).not.toContain('kit-data-table--compact');
    });

  });

  describe('columns', () => {

    it('should hide a column\'s header and cells through kitCol', () => {
      // Given
      const { host, update, query } = create();

      // When
      host.columns.setVisible('role', false);
      update();

      // Then
      expect(query('th:nth-child(2)')!.hasAttribute('hidden')).toBe(true);
      expect(query('td:nth-child(2)')!.hasAttribute('hidden')).toBe(true);
      expect(query('td:nth-child(1)')!.hasAttribute('hidden')).toBe(false);
    });

    it('should list the columns in the picker and toggle them', () => {
      // Given
      const { host, update, query } = create();

      // When
      query<HTMLButtonElement>('kit-column-picker button')!.click();
      update();
      const boxes = Array.from(panel()!.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];

      // Then
      expect(boxes.map(box => [box.checked, box.disabled])).toEqual([[true, true], [true, false]]);

      // When
      boxes[1].click();
      update();

      // Then
      expect(host.columns.isVisible('role')).toBe(false);
      expect(panel()).not.toBeNull();
    });

    it('should reset the columns from the picker', () => {
      // Given
      const { host, update, query } = create();
      host.columns.setVisible('role', false);
      query<HTMLButtonElement>('kit-column-picker button')!.click();
      update();

      // When
      (panel()!.querySelector('.kit-popover__footer button') as HTMLButtonElement).click();
      update();

      // Then
      expect(host.columns.isVisible('role')).toBe(true);
    });

  });

  describe('filters panel', () => {

    it('should open on the button and show the controls inside', () => {
      // Given
      const { update, query } = create();
      const button = query<HTMLButtonElement>('kit-filter-panel button')!;

      // Then
      expect(panel()).toBeNull();
      expect(button.getAttribute('aria-expanded')).toBe('false');

      // When
      button.click();
      update();

      // Then
      expect(panel()!.querySelector('select')).not.toBeNull();
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(panel()!.getAttribute('role')).toBe('dialog');
    });

    it('should bind the filter inside to the state and count it on the button', () => {
      // Given
      const { host, update, query } = create();
      query<HTMLButtonElement>('kit-filter-panel button')!.click();
      update();
      const select = panel()!.querySelector('select') as HTMLSelectElement;

      // When
      select.value = 'active';
      select.dispatchEvent(new Event('change'));
      update();

      // Then
      expect(host.state.filters().status).toBe('active');
      expect(query('kit-filter-panel .kit-popover__badge')!.textContent!.trim()).toBe('1');
    });

    it('should count only the filters it is told about', () => {
      // Given
      const { host, update, query } = create();

      // When
      host.state.setFilter('role', 'Admin');
      update();

      // Then
      expect(query('kit-filter-panel .kit-popover__badge')).toBeNull();
    });

    it('should reset only its own filters', () => {
      // Given
      const { host, update, query } = create();
      host.state.setFilter('status', 'active');
      host.state.setFilter('role', 'Admin');
      update();
      query<HTMLButtonElement>('kit-filter-panel button')!.click();
      update();

      // When
      (panel()!.querySelector('.kit-popover__footer button') as HTMLButtonElement).click();
      update();

      // Then
      expect(host.state.filters()).toEqual({ status: null, role: 'Admin' });
    });

    it('should close on Done', () => {
      // Given
      const { update, query } = create();
      query<HTMLButtonElement>('kit-filter-panel button')!.click();
      update();

      // When
      (panel()!.querySelectorAll('.kit-popover__footer button')[1] as HTMLButtonElement).click();
      update();

      // Then
      expect(panel()).toBeNull();
    });

  });

});

@Component({
  imports: [KitDataTable, KitPaginator],
  template: `
    <kit-data-table [hasNext]="hasNext()" [densityStorageKey]="key" [(density)]="density">
      <kit-paginator />
    </kit-data-table>`
})
class CursorHost {
  readonly hasNext = signal(false);
  readonly density = signal<'default' | 'compact'>('default');
  key: string | undefined = undefined;
}

describe('KitDataTable cursor paging and density storage', () => {

  const key = 'kit-density-spec';

  beforeEach(() => localStorage.removeItem(key));
  afterEach(() => localStorage.removeItem(key));

  function create(storageKey?: string) {
    const fixture = TestBed.createComponent(CursorHost);
    fixture.componentInstance.key = storageKey;
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
  }

  it('should enable next through the frame\'s hasNext when the total is unknown', () => {
    // Given
    const { fixture, host, element } = create();
    const next = () => element.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;

    // Then
    expect(element.querySelector('.kit-paginator__range')!.textContent!.trim()).toBe('Page 1');
    expect(next().disabled).toBe(true);

    // When
    host.hasNext.set(true);
    fixture.detectChanges();

    // Then
    expect(next().disabled).toBe(false);
  });

  it('should write the density to storage as it changes', () => {
    // Given
    const { fixture, host } = create(key);

    // When
    host.density.set('compact');
    fixture.detectChanges();
    TestBed.tick();

    // Then
    expect(localStorage.getItem(key)).toBe('compact');
  });

  it('should restore the stored density on load', () => {
    // Given
    localStorage.setItem(key, 'compact');

    // When
    const { host, element } = create(key);

    // Then
    expect(host.density()).toBe('compact');
    expect(element.querySelector('kit-data-table')!.classList).toContain('kit-data-table--compact');
  });

  it('should keep the stored density when the model starts at the default', () => {
    // Given
    localStorage.setItem(key, 'compact');

    // When
    create(key);

    // Then
    expect(localStorage.getItem(key)).toBe('compact');
  });

  it('should ignore a stored value that is not a density', () => {
    // Given
    localStorage.setItem(key, 'huge');

    // When
    const { host } = create(key);

    // Then
    expect(host.density()).toBe('default');
  });

  it('should not touch storage without a key', () => {
    // Given
    const setItem = spyOn(Storage.prototype, 'setItem');
    const { fixture, host } = create();

    // When
    host.density.set('compact');
    fixture.detectChanges();
    TestBed.tick();

    // Then
    expect(setItem).not.toHaveBeenCalled();
  });

});

@Component({
  imports: [KitPopover],
  template: `
    <button class="outside">Outside</button>
    <kit-popover label="Options" [badge]="badge()" [(open)]="open"><p class="content">Inside</p></kit-popover>`
})
class PopoverHost {
  readonly open = signal(false);
  readonly badge = signal<number | null>(null);
}

describe('KitPopover', () => {

  const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement;

  function create() {
    const fixture = TestBed.createComponent(PopoverHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('kit-popover button') as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, element, button, update: () => fixture.detectChanges() };
  }

  afterEach(() => overlay()?.replaceChildren());

  it('should open and close with its button', () => {
    // Given
    const { host, button, update } = create();

    // When
    button.click();
    update();

    // Then
    expect(host.open()).toBe(true);
    expect(overlay().querySelector('.kit-popover__panel .content')).not.toBeNull();

    // When
    button.click();
    update();

    // Then
    expect(host.open()).toBe(false);
    expect(overlay().querySelector('.kit-popover__panel')).toBeNull();
  });

  it('should name the panel after the label', () => {
    // Given
    const { button, update } = create();

    // When
    button.click();
    update();

    // Then
    expect(overlay().querySelector('.kit-popover__panel')!.getAttribute('aria-label')).toBe('Options');
  });

  it('should close on Escape and give the focus back to the button', () => {
    // Given
    const { host, button, update } = create();
    button.click();
    update();

    // When
    overlay().querySelector('.kit-popover__panel')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    update();

    // Then
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('should close on a click outside but not on a click inside', () => {
    // Given
    const { host, element, update } = create();
    (element.querySelector('kit-popover button') as HTMLButtonElement).click();
    update();

    // When
    (overlay().querySelector('.content') as HTMLElement).click();
    update();

    // Then
    expect(host.open()).toBe(true);

    // When
    document.body.click();
    update();

    // Then
    expect(host.open()).toBe(false);
  });

  it('should show the badge only for a count above zero', () => {
    // Given
    const { host, element, update } = create();
    const badge = () => element.querySelector('.kit-popover__badge');

    // Then
    expect(badge()).toBeNull();

    // When
    host.badge.set(3);
    update();

    // Then
    expect(badge()!.textContent!.trim()).toBe('3');

    // When
    host.badge.set(0);
    update();

    // Then
    expect(badge()).toBeNull();
  });

});
