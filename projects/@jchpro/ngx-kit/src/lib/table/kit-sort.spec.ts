import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDataTable } from './kit-data-table';
import { KitSort } from './kit-sort';
import { KitTableSort } from './kit-table.types';

@Component({
  imports: [KitDataTable, KitSort],
  template: `
    <kit-data-table [(sort)]="sort">
      <table>
        <thead>
          <tr>
            <th kitSort="name" [cycle]="cycle()">Name</th>
            <th kitSort="age">Age</th>
            <th>Plain</th>
          </tr>
        </thead>
      </table>
    </kit-data-table>`
})
class Host {
  readonly sort = signal<KitTableSort | null>(null);
  readonly cycle = signal(false);
}

describe('KitSort', () => {

  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')) as HTMLElement[];
    const click = (index: number) => {
      (headers[index].querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, headers, click };
  }

  it('should render the label as a button and leave plain headers alone', () => {
    // Given
    const { headers } = create();

    // Then
    expect(headers[0].querySelector('button')!.textContent).toContain('Name');
    expect(headers[2].querySelector('button')).toBeNull();
    expect(headers[2].hasAttribute('aria-sort')).toBe(false);
  });

  it('should start as not sorted', () => {
    // Given
    const { headers } = create();

    // Then
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
  });

  it('should sort ascending, then descending, then ascending again', () => {
    // Given
    const { host, headers, click } = create();

    // When
    click(0);

    // Then
    expect(host.sort()).toEqual({ field: 'name', direction: 'asc' });
    expect(headers[0].getAttribute('aria-sort')).toBe('ascending');

    // When
    click(0);

    // Then
    expect(host.sort()).toEqual({ field: 'name', direction: 'desc' });
    expect(headers[0].getAttribute('aria-sort')).toBe('descending');

    // When
    click(0);

    // Then
    expect(host.sort()).toEqual({ field: 'name', direction: 'asc' });
  });

  it('should clear the sort on the third click with cycle', () => {
    // Given
    const { host, headers, click } = create();
    host.cycle.set(true);

    // When
    click(0);
    click(0);
    click(0);

    // Then
    expect(host.sort()).toBeNull();
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
  });

  it('should start ascending when another column is the sorted one', () => {
    // Given
    const { host, headers, click } = create();
    host.sort.set({ field: 'name', direction: 'desc' });

    // When
    click(1);

    // Then
    expect(host.sort()).toEqual({ field: 'age', direction: 'asc' });
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
    expect(headers[1].getAttribute('aria-sort')).toBe('ascending');
  });

});
