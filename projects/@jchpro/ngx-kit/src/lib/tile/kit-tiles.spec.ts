import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitTile } from './kit-tile.directive';
import { KitTiles } from './kit-tiles.directive';

describe('KitTiles', () => {

  @Component({
    selector: 'kit-tiles-test',
    imports: [KitTiles, KitTile],
    template: `
      <div kitTiles aria-label="Files" [(value)]="selected" [disabled]="locked()">
        <div kitTile="a" data-id="a"><span class="kit-tile__name">alpha</span></div>
        <div kitTile="b" data-id="b"><span class="kit-tile__name">beta</span></div>
        <div kitTile="c" data-id="c" [disabled]="true"><span class="kit-tile__name">gamma</span></div>
      </div>
    `
  })
  class TestCmp {
    readonly selected = signal<string | null>(null);
    readonly locked = signal(false);
  }

  function create() {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const el = (id: string): HTMLElement => fixture.nativeElement.querySelector(`[data-id=${id}]`);
    const grid = (): HTMLElement => fixture.nativeElement.querySelector('.kit-tiles');
    const selected = () => ['a', 'b', 'c'].filter(id => el(id).getAttribute('aria-selected') === 'true');
    const click = (id: string) => {
      el(id).click();
      fixture.detectChanges();
    };
    return { fixture, cmp: fixture.componentInstance, el, grid, selected, click };
  }

  it('should be a listbox of options with the tile classes', () => {
    // When
    const { grid, el } = create();

    // Then
    expect(grid().getAttribute('role')).toBe('listbox');
    expect(grid().getAttribute('aria-label')).toBe('Files');
    expect(el('a').getAttribute('role')).toBe('option');
    expect(el('a').classList).toContain('kit-tile');
  });

  it('should select a tile on click and put its value into the model', () => {
    // Given
    const { click, cmp, selected } = create();

    // When
    click('b');

    // Then
    expect(cmp.selected()).toBe('b');
    expect(selected()).toEqual(['b']);
  });

  it('should move the selection to the tile clicked next', () => {
    // Given
    const { click, cmp, selected } = create();
    click('a');

    // When
    click('b');

    // Then
    expect(cmp.selected()).toBe('b');
    expect(selected()).toEqual(['b']);
  });

  it('should show a value set from the outside as selected', () => {
    // Given
    const { fixture, cmp, selected } = create();

    // When
    cmp.selected.set('a');
    fixture.detectChanges();

    // Then
    expect(selected()).toEqual(['a']);
  });

  it('should show nothing selected for null', () => {
    // Given
    const { fixture, cmp, selected } = create();
    cmp.selected.set('a');
    fixture.detectChanges();

    // When
    cmp.selected.set(null);
    fixture.detectChanges();

    // Then
    expect(selected()).toEqual([]);
  });

  it('should not select a disabled tile', () => {
    // Given
    const { click, cmp, el } = create();

    // When
    click('c');

    // Then
    expect(cmp.selected()).toBeNull();
    expect(el('c').getAttribute('aria-disabled')).toBe('true');
  });

  it('should move the focus with the arrow keys and select the focused tile with Enter', () => {
    // Given
    const { fixture, el, grid, cmp } = create();
    // The CDK's key manager reads `keyCode`
    const press = (key: string, keyCode: number) => {
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, bubbles: true }));
      fixture.detectChanges();
    };
    grid().focus();

    // When
    press('ArrowRight', 39);
    press('Enter', 13);

    // Then
    expect(document.activeElement).toBe(el('b'));
    expect(cmp.selected()).toBe('b');
  });

  it('should keep every tile from being chosen while the grid is disabled', () => {
    // Given
    const { fixture, cmp, click } = create();
    cmp.locked.set(true);
    fixture.detectChanges();

    // When
    click('a');

    // Then
    expect(cmp.selected()).toBeNull();
  });

});
