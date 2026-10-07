import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDataTable } from './kit-data-table';
import { KitFilter } from './kit-filter.directive';
import { KitPaginator } from './kit-paginator';
import { KitSearchInput } from './kit-search-input.directive';
import { KitSort } from './kit-sort';
import { kitTableState } from './kit-table-state';
import { KitTableResource } from './kit-table.types';

class FakeResource implements KitTableResource {
  readonly loading = signal(false);
  readonly failure = signal<unknown>(undefined);
  reloads = 0;

  isLoading() {
    return this.loading();
  }

  error() {
    return this.failure();
  }

  reload() {
    this.reloads++;
    return true;
  }
}

@Component({
  imports: [KitDataTable, KitSearchInput, KitFilter, KitSort, KitPaginator],
  template: `
    <kit-data-table [state]="state" [resource]="resource" [total]="total()" [empty]="empty()">
      <div kitTableSearch><input kitSearch type="search"></div>
      <div kitTableFilters>
        <select kitFilter="role">
          <option value="">All</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
        </select>
      </div>
      <table>
        <thead><tr><th kitSort="name">Name</th></tr></thead>
      </table>
      <kit-paginator />
    </kit-data-table>`
})
class Host {
  readonly state = kitTableState({
    pageSize: 25,
    searchDebounce: 0,
    filters: { role: null as string | null }
  });
  readonly resource = new FakeResource();
  readonly total = signal<number | null>(95);
  readonly empty = signal(false);
}

describe('KitDataTable with a state', () => {

  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      element,
      query: <T extends HTMLElement>(selector: string) => element.querySelector(selector) as T | null
    };
  }

  describe('search input', () => {

    it('should show the state\'s search text', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      host.state.searchText.set('ada');
      fixture.detectChanges();

      // Then
      expect(query<HTMLInputElement>('input')!.value).toBe('ada');
    });

    it('should search the state as the person types', () => {
      // Given
      const { fixture, host, query } = create();
      const input = query<HTMLInputElement>('input')!;

      // When
      input.value = 'ada';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Then
      expect(host.state.query()).toBe('ada');
    });

    it('should apply the search on Enter without waiting', () => {
      // Given
      const { host, query } = create();
      const input = query<HTMLInputElement>('input')!;
      host.state.searchText.set('ada');

      // When
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Then
      expect(host.state.query()).toBe('ada');
    });

  });

  describe('filter', () => {

    it('should show the state\'s value, the options being rendered already', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      host.state.setFilter('role', 'Editor');
      fixture.detectChanges();

      // Then
      expect(query<HTMLSelectElement>('select')!.value).toBe('Editor');
    });

    it('should set the filter on change and clear it for the empty option', () => {
      // Given
      const { fixture, host, query } = create();
      const select = query<HTMLSelectElement>('select')!;

      // When
      select.value = 'Admin';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Then
      expect(host.state.filters().role).toBe('Admin');

      // When
      select.value = '';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Then
      expect(host.state.filters().role).toBeNull();
    });

    it('should go back to the empty option when the filters are cleared', () => {
      // Given
      const { fixture, host, query } = create();
      host.state.setFilter('role', 'Admin');
      fixture.detectChanges();

      // When
      host.state.clearFilters();
      fixture.detectChanges();

      // Then
      expect(query<HTMLSelectElement>('select')!.value).toBe('');
    });

  });

  describe('sort header', () => {

    it('should sort through the state', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      query<HTMLButtonElement>('th button')!.click();
      fixture.detectChanges();

      // Then
      expect(host.state.sort()).toEqual({ field: 'name', direction: 'asc' });
      expect(query('th')!.getAttribute('aria-sort')).toBe('ascending');
    });

  });

  describe('paginator', () => {

    it('should take the page, the size and the total from the state and the table', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      host.state.page.set(2);
      fixture.detectChanges();

      // Then
      expect(query('.kit-paginator__range')!.textContent!.trim()).toBe('26–50 of 95');
    });

    it('should page the state', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      query<HTMLButtonElement>('button[aria-label="Next page"]')!.click();
      fixture.detectChanges();

      // Then
      expect(host.state.page()).toBe(2);
    });

    it('should change the state\'s page size and go back to the first page', () => {
      // Given
      const { fixture, host, query } = create();
      host.state.page.set(3);
      fixture.detectChanges();
      const select = query<HTMLSelectElement>('.kit-paginator__size select')!;

      // When
      select.value = '50';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Then
      expect(host.state.pageSize()).toBe(50);
      expect(host.state.page()).toBe(1);
    });

  });

  describe('frame', () => {

    it('should follow the resource while it loads', () => {
      // Given
      const { fixture, host, query } = create();

      // When
      host.resource.loading.set(true);
      fixture.detectChanges();

      // Then
      expect(query('.kit-data-table__scroll')!.classList).toContain('kit-busy');
    });

    it('should show the error of a failed resource, and reload it on retry', () => {
      // Given
      const { fixture, host, query } = create();
      host.resource.failure.set(new Error('down'));
      fixture.detectChanges();

      // Then
      expect(query('.kit-data-table__state')!.getAttribute('role')).toBe('alert');
      expect(query('table')).toBeNull();

      // When
      query<HTMLButtonElement>('.kit-data-table__state button')!.click();

      // Then
      expect(host.resource.reloads).toBe(1);
    });

    it('should not show a stale error while the resource reloads', () => {
      // Given
      const { fixture, host, query } = create();
      host.resource.failure.set(new Error('down'));
      fixture.detectChanges();

      // When
      host.resource.loading.set(true);
      fixture.detectChanges();

      // Then
      expect(query('.kit-data-table__state')).toBeNull();
      expect(query('table')).not.toBeNull();
    });

    it('should offer to clear the state when the filters leave nothing', () => {
      // Given
      const { fixture, host, query } = create();
      host.state.setFilter('role', 'Admin');
      host.empty.set(true);
      fixture.detectChanges();

      // Then
      expect(query('.kit-data-table__state-title')!.textContent).toContain('No results');

      // When
      query<HTMLButtonElement>('.kit-data-table__state button')!.click();
      fixture.detectChanges();

      // Then
      expect(host.state.filters().role).toBeNull();
      expect(host.state.filtered()).toBe(false);
    });

  });

});
