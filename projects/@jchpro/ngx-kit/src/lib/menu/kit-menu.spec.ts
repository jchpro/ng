import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KitMenuItem } from './kit-menu-item.directive';
import { KitMenuTrigger } from './kit-menu-trigger.directive';
import { KitMenu } from './kit-menu.directive';

describe('kit menu', () => {

  const CUSTOM_POSITIONS: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }
  ];

  @Component({
    imports: [KitMenuTrigger, KitMenu, KitMenuItem],
    template: `
      <button id="trigger" type="button" [kitMenuTriggerFor]="menu"
              (kitMenuOpened)="opened.update(count => count + 1)"
              (kitMenuClosed)="closed.update(count => count + 1)">Actions</button>
      <button id="custom" type="button" [kitMenuTriggerFor]="menu" [kitMenuPosition]="positions">Custom</button>
      <ng-template #menu>
        <div kitMenu>
          <button id="edit" type="button" kitMenuItem (click)="edited.set(true)">Edit</button>
          <a id="open" kitMenuItem href="#">Open</a>
          <hr class="kit-menu__separator">
          <button id="remove" type="button" kitMenuItem danger>Delete</button>
          <button id="off" type="button" kitMenuItem [disabled]="true" (click)="edited.set(true)">Off</button>
          <button id="picked" type="button" kitMenuItem [checked]="true">Picked</button>
          <button id="other" type="button" kitMenuItem [checked]="false">Other</button>
          <button id="toggle" type="button" kitMenuItem checkbox [checked]="false">Toggle</button>
        </div>
      </ng-template>
    `
  })
  class TestHost {
    readonly positions = CUSTOM_POSITIONS;
    readonly edited = signal(false);
    readonly opened = signal(0);
    readonly closed = signal(0);
  }

  function create() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger');
    const panel = () => document.querySelector<HTMLElement>('.kit-menu');
    const item = (id: string) => document.querySelector<HTMLElement>(`#${id}`)!;
    const open = async () => {
      trigger.click();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, trigger, panel, item, open };
  }

  async function settle(fixture: ComponentFixture<unknown>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should not render the menu until the trigger is used', () => {
    // Given
    const { panel, trigger } = create();

    // Then
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the menu in an overlay when the trigger is clicked', async () => {
    // Given
    const { open, panel, trigger, host } = create();

    // When
    await open();

    // Then
    expect(panel()).toBeTruthy();
    expect(panel()!.getAttribute('role')).toBe('menu');
    expect(panel()!.closest('.cdk-overlay-container')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(host.opened()).toBe(1);
  });

  it('should give items the menuitem role and the kit class', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    for (const id of ['edit', 'open', 'remove', 'off']) {
      expect(item(id).getAttribute('role')).toBe('menuitem');
      expect(item(id).classList.contains('kit-menu__item')).toBeTrue();
    }
  });

  it('should turn an item with [checked] into a menuitemradio exposing aria-checked', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    expect(item('picked').getAttribute('role')).toBe('menuitemradio');
    expect(item('picked').getAttribute('aria-checked')).toBe('true');
    expect(item('other').getAttribute('role')).toBe('menuitemradio');
    expect(item('other').getAttribute('aria-checked')).toBe('false');
  });

  it('should make a checked item a menuitemcheckbox with the checkbox attribute', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    expect(item('toggle').getAttribute('role')).toBe('menuitemcheckbox');
    expect(item('toggle').getAttribute('aria-checked')).toBe('false');
  });

  it('should leave items without [checked] as plain menuitems with no aria-checked', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    expect(item('edit').getAttribute('role')).toBe('menuitem');
    expect(item('edit').hasAttribute('aria-checked')).toBeFalse();
  });

  it('should only mark danger items with the danger modifier', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    expect(item('remove').classList.contains('kit-menu__item--danger')).toBeTrue();
    expect(item('edit').classList.contains('kit-menu__item--danger')).toBeFalse();
  });

  it('should expose a disabled item as aria-disabled', async () => {
    // Given
    const { open, item } = create();

    // When
    await open();

    // Then
    expect(item('off').getAttribute('aria-disabled')).toBe('true');
    expect(item('edit').getAttribute('aria-disabled')).toBeNull();
  });

  it('should not activate a disabled item', async () => {
    // Given
    const { open, item, host, fixture } = create();
    await open();

    // When
    item('off').click();
    await settle(fixture);

    // Then
    expect(host.edited()).toBeFalse();
  });

  it('should run the click handler and close the menu when an item is activated', async () => {
    // Given
    const { open, item, panel, trigger, host, fixture } = create();
    await open();

    // When
    item('edit').click();
    await settle(fixture);

    // Then
    expect(host.edited()).toBeTrue();
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.closed()).toBe(1);
  });

  it('should close the menu on Escape', async () => {
    // Given
    const { open, panel, fixture } = create();
    await open();

    // When
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
    await settle(fixture);

    // Then
    expect(panel()).toBeNull();
  });

  it('should default to a below-the-trigger position with a small gap', () => {
    // Given
    const { fixture } = create();
    const cdkTrigger = fixture.debugElement.query(By.css('#trigger')).injector.get(CdkMenuTrigger);

    // Then
    expect(cdkTrigger.menuPosition[0]).toEqual(jasmine.objectContaining({
      originY: 'bottom',
      overlayY: 'top',
      offsetY: 4
    }));
  });

  it('should let kitMenuPosition override the default positions', () => {
    // Given
    const { fixture } = create();
    const cdkTrigger = fixture.debugElement.query(By.css('#custom')).injector.get(CdkMenuTrigger);

    // Then
    expect(cdkTrigger.menuPosition).toBe(CUSTOM_POSITIONS);
  });

});
