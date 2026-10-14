import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { KitColorField } from './kit-color-field';
import { KIT_FORM_LABELS_PL, provideKitFormLabels } from './kit-form-labels';

describe('KitColorField', () => {

  @Component({
    selector: 'kit-color-field-test',
    imports: [KitColorField, FormField],
    template: `
      <kit-color-field id="plain" inputId="plain-input" [clearable]="clearable()" [placeholder]="placeholder()" [formField]="f.color" />
      <kit-color-field id="locked" clearable [formField]="f.locked" />
    `
  })
  class TestCmp {
    readonly clearable = signal(true);
    readonly placeholder = signal<string | undefined>(undefined);
    readonly model = signal<{ color: string | null; locked: string | null }>({ color: null, locked: '#ff0000' });
    readonly f = form(this.model);
  }

  function create(labels?: Parameters<typeof provideKitFormLabels>[0]) {
    TestBed.configureTestingModule({ providers: labels ? [provideKitFormLabels(labels)] : [] });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const host = (id: string): HTMLElement => fixture.nativeElement.querySelector('#' + id);
    const swatch = () => host('plain').querySelector('input') as HTMLInputElement;
    const text = () => host('plain').textContent!.replace(/\s+/g, ' ').trim();
    const clearButton = () => host('plain').querySelector('button') as HTMLButtonElement | null;
    const pick = (value: string) => {
      swatch().value = value;
      swatch().dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    return { fixture, cmp: fixture.componentInstance, host, swatch, text, clearButton, pick };
  }

  async function settled(fixture: ComponentFixture<unknown>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should show the "not set" text and a dimmed black swatch while the value is null', () => {
    // When
    const { swatch, text, clearButton } = create();

    // Then
    expect(text()).toBe('Not set');
    expect(swatch().value).toBe('#000000');
    expect(swatch().classList).toContain('kit-color-field__input--unset');
    expect(clearButton()).toBeNull();
  });

  it('should write the picked color to the field and show it as hex', () => {
    // Given
    const { cmp, swatch, text, pick } = create();

    // When
    pick('#93298f');

    // Then
    expect(cmp.model().color).toBe('#93298f');
    expect(text()).toBe('#93298f');
    expect(swatch().classList).not.toContain('kit-color-field__input--unset');
  });

  it('should show the color a field already has', () => {
    // When
    const { host } = create();

    // Then
    expect(host('locked').textContent).toContain('#ff0000');
    expect(host('locked').querySelector('button')).not.toBeNull();
  });

  it('should treat an empty string as unset', () => {
    // Given
    const { cmp, fixture, text } = create();

    // When
    cmp.f.color().value.set('');
    fixture.detectChanges();

    // Then
    expect(text()).toBe('Not set');
  });

  it('should clear the color to null with the button and keep the focus on the swatch', async () => {
    // Given
    const { cmp, fixture, swatch, text, clearButton, pick } = create();
    pick('#93298f');

    // When
    clearButton()!.click();
    await settled(fixture);

    // Then
    expect(cmp.model().color).toBeNull();
    expect(text()).toBe('Not set');
    expect(document.activeElement).toBe(swatch());
  });

  it('should show the clear button only while clearable', () => {
    // Given
    const { cmp, fixture, clearButton, pick } = create();
    pick('#93298f');
    expect(clearButton()).not.toBeNull();

    // When
    cmp.clearable.set(false);
    fixture.detectChanges();

    // Then
    expect(clearButton()).toBeNull();
  });

  it('should use the placeholder over the label', () => {
    // Given
    const { cmp, fixture, text } = create();

    // When
    cmp.placeholder.set('Inherit from the theme');
    fixture.detectChanges();

    // Then
    expect(text()).toBe('Inherit from the theme');
  });

  it('should take its texts from the form labels', () => {
    // When
    const { text, clearButton, pick } = create(KIT_FORM_LABELS_PL);

    // Then
    expect(text()).toBe('Nie ustawiono');
    pick('#93298f');
    expect(clearButton()!.getAttribute('aria-label')).toBe('Wyczyść kolor');
  });

  it('should put inputId on the swatch, so a label can point at it', () => {
    // When
    const { swatch } = create();

    // Then
    expect(swatch().id).toBe('plain-input');
  });

  it('should link the swatch to the text that says what is chosen', () => {
    // When
    const { swatch, host } = create();

    // Then
    const statusId = swatch().getAttribute('aria-describedby')!;
    expect(host('plain').querySelector('#' + statusId)!.textContent).toContain('Not set');
  });

});
