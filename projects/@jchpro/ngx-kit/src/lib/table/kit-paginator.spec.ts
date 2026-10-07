import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitPaginator } from './kit-paginator';
import { KIT_TABLE_LABELS_PL, provideKitTableLabels } from './kit-table-labels';

@Component({
  imports: [KitPaginator],
  template: `<kit-paginator [total]="total()" [hasNext]="hasNext()" [pageSizes]="pageSizes()" [(page)]="page" [(pageSize)]="pageSize" />`
})
class Host {
  readonly total = signal<number | null>(95);
  readonly hasNext = signal(false);
  readonly pageSizes = signal<readonly number[]>([10, 25, 50]);
  readonly page = signal(1);
  readonly pageSize = signal(25);
}

describe('KitPaginator', () => {

  function create(providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const range = () => element.querySelector('.kit-paginator__range')!.textContent!.trim();
    const button = (label: string) => element.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement | null;
    const click = (label: string) => {
      button(label)!.click();
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, element, range, button, click };
  }

  it('should show the range and the total', () => {
    // Given
    const { range } = create();

    // Then
    expect(range()).toBe('1–25 of 95');
  });

  it('should clamp the last page to the total', () => {
    // Given
    const { fixture, host, range } = create();

    // When
    host.page.set(4);
    fixture.detectChanges();

    // Then
    expect(range()).toBe('76–95 of 95');
  });

  it('should show 0–0 of 0 for an empty result', () => {
    // Given
    const { fixture, host, range } = create();

    // When
    host.total.set(0);
    fixture.detectChanges();

    // Then
    expect(range()).toBe('0–0 of 0');
  });

  it('should disable previous and first on the first page, next and last on the last one', () => {
    // Given
    const { fixture, host, button } = create();

    // Then
    expect(button('Previous page')!.disabled).toBe(true);
    expect(button('First page')!.disabled).toBe(true);
    expect(button('Next page')!.disabled).toBe(false);

    // When
    host.page.set(4);
    fixture.detectChanges();

    // Then
    expect(button('Next page')!.disabled).toBe(true);
    expect(button('Last page')!.disabled).toBe(true);
    expect(button('Previous page')!.disabled).toBe(false);
  });

  it('should move through the pages with the buttons', () => {
    // Given
    const { host, click } = create();

    // When
    click('Next page');
    click('Next page');

    // Then
    expect(host.page()).toBe(3);

    // When
    click('Previous page');

    // Then
    expect(host.page()).toBe(2);

    // When
    click('Last page');

    // Then
    expect(host.page()).toBe(4);

    // When
    click('First page');

    // Then
    expect(host.page()).toBe(1);
  });

  it('should go back to the first page when the page size changes', () => {
    // Given
    const { fixture, host, element } = create();
    host.page.set(3);
    fixture.detectChanges();
    const select = element.querySelector('select') as HTMLSelectElement;

    // When
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // Then
    expect(host.pageSize()).toBe(10);
    expect(host.page()).toBe(1);
  });

  it('should offer the current page size when it is not one of the choices', () => {
    // Given
    const { fixture, host, element } = create();

    // When
    host.pageSize.set(30);
    fixture.detectChanges();

    // Then
    const options = Array.from(element.querySelectorAll('option')).map(option => option.textContent!.trim());
    expect(options).toEqual(['10', '25', '30', '50']);
  });

  it('should show the page and hide first and last when the total is unknown', () => {
    // Given
    const { fixture, host, range, button } = create();

    // When
    host.total.set(null);
    host.page.set(3);
    fixture.detectChanges();

    // Then
    expect(range()).toBe('Page 3');
    expect(button('First page')).toBeNull();
    expect(button('Last page')).toBeNull();
    expect(button('Next page')!.disabled).toBe(true);

    // When
    host.hasNext.set(true);
    fixture.detectChanges();

    // Then
    expect(button('Next page')!.disabled).toBe(false);
  });

  it('should use the translated labels', () => {
    // Given
    const { range, button } = create([provideKitTableLabels(KIT_TABLE_LABELS_PL)]);

    // Then
    expect(range()).toBe('1–25 z 95');
    expect(button('Następna strona')).not.toBeNull();
  });

});
