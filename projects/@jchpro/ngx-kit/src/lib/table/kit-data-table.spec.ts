import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDataTable } from './kit-data-table';
import { KIT_TABLE_LABELS_PL, provideKitTableLabels } from './kit-table-labels';

@Component({
  imports: [KitDataTable],
  template: `
    <kit-data-table
      [loading]="loading()"
      [error]="error()"
      [empty]="empty()"
      [filtered]="filtered()"
      [label]="label()"
      (retry)="retries = retries + 1"
      (clearFilters)="clears = clears + 1">
      <input kitTableSearch class="search">
      <button kitTableActions class="action">Add</button>
      <table class="the-table"></table>
      <p kitTableEmpty class="custom-empty">Invite someone</p>
    </kit-data-table>`
})
class Host {
  readonly loading = signal(false);
  readonly error = signal<string | boolean | null>(null);
  readonly empty = signal(false);
  readonly filtered = signal(false);
  readonly label = signal<string | undefined>(undefined);
  retries = 0;
  clears = 0;
}

// Without a `kitTableEmpty` slot: the default empty state is the slot's fallback content.
@Component({
  imports: [KitDataTable],
  template: `<kit-data-table [empty]="true"><table></table></kit-data-table>`
})
class PlainHost {
}

describe('KitDataTable', () => {

  function create(providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const query = (selector: string) => element.querySelector(selector) as HTMLElement | null;
    const update = (change: (host: Host) => void) => {
      change(fixture.componentInstance);
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, query, update };
  }

  it('should project the slots and the table', () => {
    // Given
    const { query } = create();

    // Then
    expect(query('.kit-data-table__toolbar-start .search')).not.toBeNull();
    expect(query('.kit-data-table__toolbar-end .action')).not.toBeNull();
    expect(query('.kit-data-table__scroll .the-table')).not.toBeNull();
    expect(query('.kit-data-table__state')).toBeNull();
  });

  it('should dim and block the table while loading', () => {
    // Given
    const { query, update } = create();

    // When
    update(host => host.loading.set(true));

    // Then
    expect(query('.kit-data-table__scroll')!.classList).toContain('kit-busy');
    expect(query('.kit-data-table__scroll')!.hasAttribute('inert')).toBe(true);
  });

  it('should name the scroll region only when given a label', () => {
    // Given
    const { query, update } = create();

    // Then
    expect(query('.kit-data-table__scroll')!.hasAttribute('role')).toBe(false);

    // When
    update(host => host.label.set('Users'));

    // Then
    expect(query('.kit-data-table__scroll')!.getAttribute('role')).toBe('region');
    expect(query('.kit-data-table__scroll')!.getAttribute('aria-label')).toBe('Users');
  });

  it('should show the default empty state under the table', () => {
    // Given
    const fixture = TestBed.createComponent(PlainHost);

    // When
    fixture.detectChanges();

    // Then
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.kit-data-table__scroll table')).not.toBeNull();
    expect(element.querySelector('.kit-data-table__state-title')!.textContent).toContain('Nothing here yet');
  });

  it('should project a custom empty state in place of the default one', () => {
    // Given
    const { query, update } = create();

    // When
    update(host => host.empty.set(true));

    // Then
    expect(query('.kit-data-table__state .custom-empty')).not.toBeNull();
    expect(query('.kit-data-table__state-title')).toBeNull();
  });

  it('should not show the empty state while loading', () => {
    // Given
    const { query, update } = create();

    // When
    update(host => {
      host.empty.set(true);
      host.loading.set(true);
    });

    // Then
    expect(query('.kit-data-table__state')).toBeNull();
  });

  it('should offer to clear the filters when the empty result is filtered', () => {
    // Given
    const { host, query, update } = create();

    // When
    update(h => {
      h.empty.set(true);
      h.filtered.set(true);
    });
    query('.kit-data-table__state button')!.click();

    // Then
    expect(query('.kit-data-table__state-title')!.textContent).toContain('No results');
    expect(host.clears).toBe(1);
  });

  it('should replace the table with the error and emit retry', () => {
    // Given
    const { host, query, update } = create();

    // When
    update(h => {
      h.empty.set(true);
      h.error.set('Offline');
    });
    query('.kit-data-table__state button')!.click();

    // Then
    expect(query('.the-table')).toBeNull();
    expect(query('.kit-data-table__state')!.getAttribute('role')).toBe('alert');
    expect(query('.kit-data-table__state-text')!.textContent).toBe('Offline');
    expect(host.retries).toBe(1);
  });

  it('should show the default error title for a plain true', () => {
    // Given
    const { query, update } = create();

    // When
    update(host => host.error.set(true));

    // Then
    expect(query('.kit-data-table__state-title')!.textContent).toContain('Could not load the data');
    expect(query('.kit-data-table__state-text')).toBeNull();
  });

  it('should use the translated labels', () => {
    // Given
    const { query, update } = create([provideKitTableLabels(KIT_TABLE_LABELS_PL)]);

    // When
    update(host => host.error.set(true));

    // Then
    expect(query('.kit-data-table__state-title')!.textContent).toContain('Nie udało się wczytać danych');
  });

});
