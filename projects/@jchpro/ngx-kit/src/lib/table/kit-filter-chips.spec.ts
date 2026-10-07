import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDataTable } from './kit-data-table';
import { KitFilterChips } from './kit-filter-chips';
import { KIT_TABLE_LABELS_PL, provideKitTableLabels } from './kit-table-labels';
import { kitTableState } from './kit-table-state';

@Component({
  imports: [KitDataTable, KitFilterChips],
  template: `
    <kit-data-table [state]="state">
      <kit-filter-chips kitTableChips [labels]="labels" [formatValue]="format()" />
    </kit-data-table>`
})
class Host {
  readonly state = kitTableState({ filters: { role: null as string | null, status: null as string | null } });
  readonly labels = { role: 'Role' };
  readonly format = signal<(name: string, value: unknown) => string>((_name, value) => String(value));
}

describe('KitFilterChips', () => {

  function create(providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      element,
      chips: () => Array.from(element.querySelectorAll('.kit-data-table__chip')) as HTMLButtonElement[],
      update: () => fixture.detectChanges()
    };
  }

  it('should draw nothing while no filter is applied', () => {
    // Given
    const { chips } = create();

    // Then
    expect(chips()).toEqual([]);
  });

  it('should show a chip per applied filter, labelled, and a clear-all', () => {
    // Given
    const { host, update, chips } = create();

    // When
    host.state.setFilter('role', 'Admin');
    host.state.setFilter('status', 'active');
    update();

    // Then
    expect(chips().map(chip => chip.textContent!.trim())).toEqual(['Role: Admin', 'status: active', 'Clear all']);
  });

  it('should name each remove button after its chip', () => {
    // Given
    const { host, update, chips } = create();

    // When
    host.state.setFilter('role', 'Admin');
    update();

    // Then
    expect(chips()[0].getAttribute('aria-label')).toBe('Remove filter Role: Admin');
  });

  it('should remove one filter from its chip', () => {
    // Given
    const { host, update, chips } = create();
    host.state.setFilter('role', 'Admin');
    host.state.setFilter('status', 'active');
    update();

    // When
    chips()[0].click();
    update();

    // Then
    expect(host.state.filters()).toEqual({ role: null, status: 'active' });
    expect(chips().length).toBe(2);
  });

  it('should clear every filter but not the search', () => {
    // Given
    const { host, update, chips } = create();
    host.state.searchText.set('ada');
    host.state.query.set('ada');
    host.state.setFilter('role', 'Admin');
    update();

    // When
    chips().at(-1)!.click();
    update();

    // Then
    expect(host.state.filters()).toEqual({ role: null, status: null });
    expect(host.state.query()).toBe('ada');
    expect(chips()).toEqual([]);
  });

  it('should format the values', () => {
    // Given
    const { host, update, chips } = create();
    host.format.set((name, value) => `${name}=${String(value).toUpperCase()}`);

    // When
    host.state.setFilter('role', 'admin');
    update();

    // Then
    expect(chips()[0].textContent!.trim()).toBe('Role: role=ADMIN');
  });

  it('should leave no visible bar behind when empty', () => {
    // Given
    const { element } = create();

    // Then
    expect(element.querySelector('.kit-data-table__chips')!.querySelector('.kit-data-table__chip')).toBeNull();
  });

  it('should use the translated labels', () => {
    // Given
    const { host, update, chips } = create([provideKitTableLabels(KIT_TABLE_LABELS_PL)]);

    // When
    host.state.setFilter('role', 'Admin');
    update();

    // Then
    expect(chips().at(-1)!.textContent!.trim()).toBe('Wyczyść wszystko');
    expect(chips()[0].getAttribute('aria-label')).toBe('Usuń filtr Role: Admin');
  });

});
