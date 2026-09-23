import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitBusy } from './kit-busy.directive';

describe('KitBusy', () => {

  @Component({
    imports: [KitBusy],
    template: `
      <button id="button" class="kit-btn kit-btn--primary" type="button" [kitBusy]="busy()" (click)="clicks.set(clicks() + 1)">Save</button>
      <div id="panel" [kitBusy]="busy()"><input id="field"></div>
      <button id="plain" type="button" kitBusy>Plain</button>
    `
  })
  class TestHost {
    readonly busy = signal(false);
    readonly clicks = signal(0);
  }

  function create() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      host: fixture.componentInstance,
      button: element.querySelector<HTMLButtonElement>('#button')!,
      panel: element.querySelector<HTMLElement>('#panel')!,
      plain: element.querySelector<HTMLButtonElement>('#plain')!,
      setBusy: (busy: boolean) => {
        fixture.componentInstance.busy.set(busy);
        fixture.detectChanges();
      }
    };
  }

  it('should leave elements untouched while not busy', () => {
    // Given
    const { button, panel } = create();

    // Then
    for (const element of [button, panel]) {
      expect(element.classList.contains('kit-busy')).toBeFalse();
      expect(element.hasAttribute('aria-busy')).toBeFalse();
      expect(element.hasAttribute('inert')).toBeFalse();
    }
  });

  it('should mark the element as busy', () => {
    // Given
    const { button, panel, setBusy } = create();

    // When
    setBusy(true);

    // Then
    for (const element of [button, panel]) {
      expect(element.classList.contains('kit-busy')).toBeTrue();
      expect(element.getAttribute('aria-busy')).toBe('true');
    }
  });

  it('should treat a bare kitBusy attribute as busy', () => {
    // Given
    const { plain } = create();

    // Then
    expect(plain.classList.contains('kit-busy')).toBeTrue();
  });

  it('should make a non-button host inert, but keep a button focusable', () => {
    // Given
    const { button, panel, setBusy } = create();

    // When
    setBusy(true);

    // Then
    expect(panel.hasAttribute('inert')).toBeTrue();
    expect(button.hasAttribute('inert')).toBeFalse();
    expect(button.disabled).toBeFalse();
  });

  it('should swallow clicks while busy', () => {
    // Given
    const { host, button, setBusy } = create();
    setBusy(true);

    // When
    button.click();

    // Then
    expect(host.clicks()).toBe(0);
  });

  it('should let clicks through while not busy, and again once busy ends', () => {
    // Given
    const { host, button, setBusy } = create();

    // When
    button.click();

    // Then
    expect(host.clicks()).toBe(1);

    // When
    setBusy(true);
    button.click();
    setBusy(false);
    button.click();

    // Then
    expect(host.clicks()).toBe(2);
  });

  it('should prevent the default action of a swallowed click', () => {
    // Given
    const { button, setBusy } = create();
    setBusy(true);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    // When
    button.dispatchEvent(event);

    // Then
    expect(event.defaultPrevented).toBeTrue();
  });

});
