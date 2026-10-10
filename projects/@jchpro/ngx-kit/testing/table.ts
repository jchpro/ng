import { ComponentFixture } from '@angular/core/testing';

/**
 * Lets what the component is waiting for finish (a resource, a request, the chain of promises of a click handler,
 * which `whenStable` does not know about), and shows the result.
 */
export async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await new Promise(resolve => setTimeout(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
}

/**
 * Opens the menu of a `kitMenu` trigger and gives its items. The menu lives in the overlay, which is not a part of
 * the fixture, so the items are looked up in the document.
 */
export function openMenu(fixture: ComponentFixture<unknown>, trigger: HTMLElement): HTMLElement[] {
  trigger.click();
  fixture.detectChanges();
  return Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container .kit-menu__item'));
}
