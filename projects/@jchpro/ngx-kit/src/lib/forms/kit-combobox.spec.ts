import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { openCombobox, pickOption } from '../../../testing/combobox';
import { settle } from '../../../testing/table';
import { KitCombobox, kitComboboxFilter, KitComboboxOption } from './kit-combobox';
import { KIT_FORM_LABELS_PL, provideKitFormLabels } from './kit-form-labels';

describe('KitCombobox', () => {

  const COUNTRIES: KitComboboxOption<string>[] = [
    { value: 'pl', label: 'Poland' },
    { value: 'pt', label: 'Portugal' },
    { value: 'de', label: 'Germany', disabled: true },
    { value: 'se', label: 'Sweden' }
  ];

  @Component({
    selector: 'kit-combobox-test',
    imports: [KitCombobox, FormField],
    template: `
      <kit-combobox id="box" inputId="box-input" [options]="options()" [remote]="remote()" [loading]="loading()" clearable
                    [debounce]="10" (search)="searches.push($event)" [formField]="f.country" />
    `
  })
  class TestCmp {
    readonly options = signal<KitComboboxOption<string>[]>(COUNTRIES);
    readonly remote = signal(false);
    readonly loading = signal(false);
    readonly searches: string[] = [];
    readonly model = signal<{ country: string | null }>({ country: null });
    readonly locked = signal(false);
    readonly f = form(this.model, path => disabled(path.country, () => this.locked()));
  }

  function create(labels?: Parameters<typeof provideKitFormLabels>[0]) {
    TestBed.configureTestingModule({ providers: labels ? [provideKitFormLabels(labels)] : [] });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('#box') as HTMLElement;
    const input = () => box.querySelector('input') as HTMLInputElement;
    const labelsOf = () => Array.from(document.querySelectorAll('.cdk-overlay-container [role="option"]')).map(o => o.textContent!.trim());
    const key = (name: string) => {
      const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
      input().dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    const status = () => box.querySelector('.kit-combobox__status')!.textContent!.trim();
    const message = () => document.querySelector('.kit-combobox__message')?.textContent?.trim();
    return { fixture, cmp: fixture.componentInstance, box, input, labelsOf, key, status, message };
  }

  it('should list every option on open, with the combobox pattern attributes', () => {
    // When
    const { fixture, box, input, labelsOf } = create();
    openCombobox(fixture, box);

    // Then
    expect(input().getAttribute('role')).toBe('combobox');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(input().getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')!.id);
    expect(labelsOf()).toEqual(['Poland', 'Portugal', 'Germany', 'Sweden']);
  });

  it('should narrow the options while typing, ignoring case and accents', () => {
    // Given
    const { fixture, cmp, box, labelsOf } = create();
    cmp.options.set([...COUNTRIES, { value: 'zz', label: 'Żółć' }]);
    fixture.detectChanges();

    // When
    openCombobox(fixture, box, 'PO');
    // Then
    expect(labelsOf()).toEqual(['Poland', 'Portugal']);

    // When
    openCombobox(fixture, box, 'zolc');
    // Then
    expect(labelsOf()).toEqual(['Żółć']);
  });

  it('should say there are no results', () => {
    // When
    const { fixture, box, message } = create();
    openCombobox(fixture, box, 'xyz');

    // Then
    expect(message()).toBe('No results');
  });

  it('should pick an option with a click and write its value to the form', () => {
    // When
    const { fixture, cmp, box, input } = create();
    pickOption(fixture, box, 'Portugal', 'port');

    // Then
    expect(cmp.model().country).toBe('pt');
    expect(input().value).toBe('Portugal');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('should not pick a disabled option', () => {
    // Given
    const { fixture, cmp, box } = create();
    const options = openCombobox(fixture, box);

    // When
    options[2].click();
    fixture.detectChanges();

    // Then
    expect(cmp.model().country).toBeNull();
  });

  it('should move with the arrows, skipping a disabled option, and choose with Enter', () => {
    // Given
    const { fixture, cmp, box, key, input } = create();
    openCombobox(fixture, box);

    // When
    key('ArrowDown');
    // Then: Poland is active when the popup opens, so Portugal is next
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-option-1$/);

    // When
    key('ArrowDown');
    // Then: Germany is disabled
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-option-3$/);

    // When
    key('Enter');
    // Then
    expect(cmp.model().country).toBe('se');
  });

  it('should activate the first match while typing, so Enter takes the best one', () => {
    // Given
    const { fixture, cmp, box, key } = create();
    openCombobox(fixture, box, 'por');

    // When
    key('Enter');

    // Then
    expect(cmp.model().country).toBe('pt');
  });

  it('should leave Enter to the form while the popup is closed', () => {
    // Given
    const { key } = create();

    // When
    const event = key('Enter');

    // Then
    expect(event.defaultPrevented).toBeFalse();
  });

  it('should close on Escape, put the chosen text back, and not reach a dialog around it', () => {
    // Given
    const { fixture, cmp, box, input, key } = create();
    pickOption(fixture, box, 'Sweden');
    openCombobox(fixture, box, 'abc');
    let reached = false;
    fixture.nativeElement.addEventListener('keydown', () => reached = true);

    // When
    const event = key('Escape');

    // Then
    expect(input().value).toBe('Sweden');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(cmp.model().country).toBe('se');
    expect(event.defaultPrevented).toBeTrue();
    expect(reached).toBeFalse();
  });

  it('should put the text back on blur, and clear the value when the text was emptied', () => {
    // Given
    const { fixture, cmp, box, input } = create();
    pickOption(fixture, box, 'Poland');

    // When
    openCombobox(fixture, box, 'junk');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    // Then
    expect(input().value).toBe('Poland');
    expect(cmp.model().country).toBe('pl');

    // When
    openCombobox(fixture, box, '');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    // Then
    expect(cmp.model().country).toBeNull();
    expect(input().value).toBe('');
  });

  it('should keep a value whose option is not listed yet, and show its text once it is', () => {
    // Given
    const { fixture, cmp, input } = create();
    cmp.options.set([]);
    cmp.model.set({ country: 'pl' });
    fixture.detectChanges();

    // When: the field is focused and left without typing
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    // Then
    expect(cmp.model().country).toBe('pl');

    // When
    cmp.options.set(COUNTRIES);
    fixture.detectChanges();
    // Then
    expect(input().value).toBe('Poland');
  });

  it('should clear with the button', () => {
    // Given
    const { fixture, cmp, box, input } = create();
    pickOption(fixture, box, 'Sweden');

    // When
    box.querySelector<HTMLButtonElement>('button[title="Clear the selection"]')!.click();
    fixture.detectChanges();

    // Then
    expect(cmp.model().country).toBeNull();
    expect(input().value).toBe('');
  });

  it('should look up on the server: emit the debounced query, list the options as given, and take the query back on close', async () => {
    // Given
    const { fixture, cmp, box, input, labelsOf } = create();
    cmp.remote.set(true);
    fixture.detectChanges();

    // When
    openCombobox(fixture, box, 'sw');
    openCombobox(fixture, box, 'swe');
    // Then: no filtering here, and nothing emitted before the pause
    expect(labelsOf()).toEqual(['Poland', 'Portugal', 'Germany', 'Sweden']);
    expect(cmp.searches).toEqual([]);

    // When
    await new Promise(resolve => setTimeout(resolve, 30));
    // Then
    expect(cmp.searches).toEqual(['swe']);

    // When: the app answers, and the person picks
    cmp.options.set([{ value: 'se', label: 'Sweden' }]);
    fixture.detectChanges();
    pickOption(fixture, box, 'Sweden');
    // Then
    expect(cmp.model().country).toBe('se');
    expect(cmp.searches).toEqual(['swe', '']);

    // When: a later search no longer lists it
    cmp.options.set([{ value: 'pl', label: 'Poland' }]);
    await settle(fixture);
    // Then: its label is still shown
    expect(input().value).toBe('Sweden');
  });

  it('should show "loading" and say the number of options in the live region', async () => {
    // Given
    const { fixture, cmp, box, status, message } = create();
    cmp.remote.set(true);
    cmp.loading.set(true);
    fixture.detectChanges();

    // When
    openCombobox(fixture, box);
    await settle(fixture);
    // Then
    expect(message()).toBe('Loading…');
    expect(status()).toBe('');

    // When
    cmp.loading.set(false);
    await settle(fixture);
    // Then
    expect(status()).toBe('Results available: 4');
  });

  it('should not open while the field is disabled', () => {
    // Given
    const { fixture, cmp, box, input } = create();
    cmp.locked.set(true);
    fixture.detectChanges();

    // When
    openCombobox(fixture, box);

    // Then
    expect(input().disabled).toBeTrue();
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('should read its texts from the labels', () => {
    // When
    const { fixture, box, message } = create(KIT_FORM_LABELS_PL);
    openCombobox(fixture, box, 'xyz');

    // Then
    expect(message()).toBe('Brak wyników');
  });

  it('should match by the default filter', () => {
    expect(kitComboboxFilter({ value: 1, label: 'Łódź' }, ' lod')).toBeTrue();
    expect(kitComboboxFilter({ value: 1, label: 'Łódź' }, 'x')).toBeFalse();
  });

});
