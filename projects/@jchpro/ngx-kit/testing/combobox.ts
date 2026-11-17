import { ComponentFixture } from '@angular/core/testing';

/**
 * Opens a `<kit-combobox>`, typing `query` into it when given, and gives the options it lists. The popup lives in the
 * overlay, which is not a part of the fixture, so the options are looked up in the document. Typing doesn't blur the field,
 * since that would put the text back.
 */
export function openCombobox(fixture: ComponentFixture<unknown>, combobox: HTMLElement, query?: string): HTMLElement[] {
  const input = combobox.querySelector<HTMLInputElement>('input[role="combobox"]');
  if (!input) {
    throw new Error('openCombobox(): the element has no combobox input, is it a <kit-combobox>?');
  }
  if (query === undefined) {
    input.click();
  } else {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  }
  fixture.detectChanges();
  return Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="option"]'));
}

/** Picks the option with this exact label of a `<kit-combobox>`, the way `openCombobox` opens it (narrowed by `query`, when given). */
export function pickOption(fixture: ComponentFixture<unknown>, combobox: HTMLElement, label: string, query?: string): void {
  const options = openCombobox(fixture, combobox, query);
  const option = options.find(candidate => candidate.textContent?.trim() === label);
  if (!option) {
    const listed = options.map(candidate => `"${candidate.textContent?.trim()}"`).join(', ') || 'none';
    throw new Error(`pickOption(): no option "${label}", the popup lists: ${listed}`);
  }
  option.click();
  fixture.detectChanges();
}
