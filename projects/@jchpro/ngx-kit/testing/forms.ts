import { ComponentFixture } from '@angular/core/testing';

/** Types into the input found by `selector` like a person would: sets the value, then reports `input` and `blur` (the field is touched). */
export function type(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
  if (!input) {
    throw new Error(`type(): nothing matches "${selector}"`);
  }
  input.value = value;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
}

/** Picks an option of the select found by `selector`, which a browser reports with both `input` and `change`. */
export function pick(root: HTMLElement, selector: string, value: string): void {
  const select = root.querySelector<HTMLSelectElement>(selector);
  if (!select) {
    throw new Error(`pick(): nothing matches "${selector}"`);
  }
  select.value = value;
  select.dispatchEvent(new Event('input'));
  select.dispatchEvent(new Event('change'));
}

/** Submits the form of the component and waits until the submission is done. */
export async function submit(fixture: ComponentFixture<unknown>): Promise<void> {
  const form = (fixture.nativeElement as HTMLElement).querySelector('form');
  if (!form) {
    throw new Error('submit(): the component has no <form>');
  }
  form.dispatchEvent(new Event('submit'));
  await fixture.whenStable();
  fixture.detectChanges();
}
