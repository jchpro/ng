import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { KitChipInput } from './kit-chip-input';
import { KIT_FORM_LABELS_PL, provideKitFormLabels } from './kit-form-labels';

describe('KitChipInput', () => {

  @Component({
    selector: 'kit-chip-input-test',
    imports: [KitChipInput, FormField],
    template: `
      <kit-chip-input id="plain" inputId="plain-input" ariaLabel="Tasks" placeholder="Add a task" [maxlength]="20"
                      [separators]="separators()" [addOnBlur]="addOnBlur()" [disabled]="disabled()" [readonly]="readonly()"
                      [(value)]="chips" (touch)="touched.set(true)" />
      <kit-chip-input id="bound" [formField]="f.tags" />
    `
  })
  class TestCmp {
    readonly chips = signal<string[]>(['one']);
    readonly separators = signal<readonly string[]>(['Enter', ',']);
    readonly addOnBlur = signal(false);
    readonly disabled = signal(false);
    readonly readonly = signal(false);
    readonly touched = signal(false);
    readonly model = signal({ tags: ['a'] });
    readonly f = form(this.model, path => {
      maxLength(path.tags, 3);
    });
  }

  function create(labels?: Parameters<typeof provideKitFormLabels>[0]) {
    TestBed.configureTestingModule({ providers: labels ? [provideKitFormLabels(labels)] : [] });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const host = (id: string): HTMLElement => fixture.nativeElement.querySelector('#' + id);
    const field = (id = 'plain') => host(id).querySelector('input') as HTMLInputElement;
    const chips = (id = 'plain') => Array.from(host(id).querySelectorAll('.kit-chip')).map(chip => chip.textContent!.trim());
    const status = () => host('plain').querySelector('[role=status]')!.textContent;
    const type = (text: string, id = 'plain') => {
      field(id).value = text;
      field(id).dispatchEvent(new Event('input'));
    };
    const press = (key: string, id = 'plain', init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
      field(id).dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    const paste = (text: string, id = 'plain') => {
      const data = new DataTransfer();
      data.setData('text', text);
      const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
      field(id).dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    return { fixture, cmp: fixture.componentInstance, host, field, chips, status, type, press, paste };
  }

  it('should show the chips of the value, a button on each, and the text field attributes', () => {
    // When
    const { chips, field, host } = create();

    // Then
    expect(chips()).toEqual(['one']);
    expect(host('plain').querySelector('.kit-chip__remove')).not.toBeNull();
    expect(field().id).toBe('plain-input');
    expect(field().placeholder).toBe('Add a task');
    expect(field().maxLength).toBe(20);
    expect(field().getAttribute('aria-label')).toBe('Tasks');
  });

  it('should turn the typed text into a chip on Enter, empty the field and say so', () => {
    // Given
    const { cmp, fixture, chips, field, type, press, status } = create();
    type('Write the intro');

    // When
    const event = press('Enter');

    // Then
    expect(event.defaultPrevented).toBeTrue();
    expect(cmp.chips()).toEqual(['one', 'Write the intro']);
    expect(chips()).toEqual(['one', 'Write the intro']);
    expect(field().value).toBe('');
    fixture.detectChanges();
    expect(status()).toBe('Added Write the intro');
  });

  it('should do the same on the comma, which is not typed into the field', () => {
    // Given
    const { cmp, type, press } = create();
    type('beta');

    // When
    const event = press(',');

    // Then
    expect(event.defaultPrevented).toBeTrue();
    expect(cmp.chips()).toEqual(['one', 'beta']);
  });

  it('should trim the text and not add an empty one', () => {
    // Given
    const { cmp, type, press } = create();

    // When
    type('   ');
    press('Enter');
    type('  padded  ');
    press('Enter');

    // Then
    expect(cmp.chips()).toEqual(['one', 'padded']);
  });

  it('should leave an Enter in an empty field alone so a form can submit, but not type a comma into it', () => {
    // Given
    const { press } = create();

    // Then
    expect(press('Enter').defaultPrevented).toBeFalse();
    expect(press(',').defaultPrevented).toBeTrue();
  });

  it('should accept a duplicate: the list is for the form to validate', () => {
    // Given
    const { cmp, type, press } = create();
    type('one');

    // When
    press('Enter');

    // Then
    expect(cmp.chips()).toEqual(['one', 'one']);
  });

  it('should use the separators it is given', () => {
    // Given
    const { cmp, fixture, type, press } = create();
    cmp.separators.set([';']);
    fixture.detectChanges();
    type('first');

    // When
    press('Enter');
    expect(cmp.chips()).toEqual(['one']);
    press(';');

    // Then
    expect(cmp.chips()).toEqual(['one', 'first']);
  });

  it('should not act on the keys of an IME composition', () => {
    // Given
    const { cmp, type, press } = create();
    type('にほん');

    // When
    press('Enter', 'plain', { isComposing: true });

    // Then
    expect(cmp.chips()).toEqual(['one']);
  });

  it('should add one chip per line, or per separator, of a pasted text', () => {
    // Given
    const { cmp, field, paste } = create();

    // When
    const event = paste('alpha\nbeta\r\n\ngamma, delta');

    // Then
    expect(event.defaultPrevented).toBeTrue();
    expect(cmp.chips()).toEqual(['one', 'alpha', 'beta', 'gamma', 'delta']);
    expect(field().value).toBe('');
  });

  it('should leave a pasted text without a break to the field', () => {
    // Given
    const { cmp, paste } = create();

    // When
    const event = paste('just one thing');

    // Then
    expect(event.defaultPrevented).toBeFalse();
    expect(cmp.chips()).toEqual(['one']);
  });

  it('should put the text before and after the caret of a paste with the first and the last piece', () => {
    // Given
    const { cmp, field, type, paste } = create();
    type('[]');
    field().setSelectionRange(1, 1);

    // When
    paste('a\nb');

    // Then
    expect(cmp.chips()).toEqual(['one', '[a', 'b]']);
  });

  it('should remove the last chip with Backspace in an empty field, and not while there is text', () => {
    // Given
    const { cmp, type, press } = create();
    type('x');

    // When
    expect(press('Backspace').defaultPrevented).toBeFalse();

    // Then
    expect(cmp.chips()).toEqual(['one']);

    // When
    type('');
    press('Backspace');

    // Then
    expect(cmp.chips()).toEqual([]);
    expect(press('Backspace').defaultPrevented).toBeFalse();
  });

  it('should remove the chip of a button, name the button with its text and keep the focus in the field', () => {
    // Given
    const { cmp, fixture, host, field, chips, press, type, status } = create();
    type('two');
    press('Enter');
    const buttons = () => Array.from(host('plain').querySelectorAll<HTMLButtonElement>('.kit-chip__remove'));
    expect(buttons().map(button => button.getAttribute('aria-label'))).toEqual(['Remove one', 'Remove two']);

    // When
    buttons()[0].click();
    fixture.detectChanges();

    // Then
    expect(cmp.chips()).toEqual(['two']);
    expect(chips()).toEqual(['two']);
    expect(document.activeElement).toBe(field());
    expect(status()).toBe('Removed one');
  });

  it('should take its texts from the form labels', () => {
    // When
    const { host, type, press, fixture, status } = create(KIT_FORM_LABELS_PL);

    // Then
    expect(host('plain').querySelector('.kit-chip__remove')!.getAttribute('aria-label')).toBe('Usuń one');

    // When
    type('dwa');
    press('Enter');
    fixture.detectChanges();

    // Then
    expect(status()).toBe('Dodano dwa');
  });

  it('should add the text left in the field on blur only when asked to, and always say it was touched', () => {
    // Given
    const { cmp, fixture, field, type } = create();
    type('left over');

    // When
    field().dispatchEvent(new Event('blur'));

    // Then
    expect(cmp.chips()).toEqual(['one']);
    expect(cmp.touched()).toBeTrue();

    // When
    cmp.addOnBlur.set(true);
    fixture.detectChanges();
    field().dispatchEvent(new Event('blur'));

    // Then
    expect(cmp.chips()).toEqual(['one', 'left over']);
    expect(field().value).toBe('');
  });

  it('should have no remove buttons while disabled or read-only', () => {
    // Given
    const { cmp, fixture, host, field } = create();

    // When
    cmp.disabled.set(true);
    fixture.detectChanges();

    // Then
    expect(host('plain').querySelector('.kit-chip__remove')).toBeNull();
    expect(field().disabled).toBeTrue();

    // When
    cmp.disabled.set(false);
    cmp.readonly.set(true);
    fixture.detectChanges();

    // Then
    expect(host('plain').querySelector('.kit-chip__remove')).toBeNull();
    expect(field().readOnly).toBeTrue();
  });

  describe('as a Signal Forms control', () => {

    it('should show the value of the field and write the chips back to it', () => {
      // Given
      const { cmp, chips, type, press } = create();
      expect(chips('bound')).toEqual(['a']);

      // When
      type('b', 'bound');
      press('Enter', 'bound');

      // Then
      expect(cmp.model().tags).toEqual(['a', 'b']);
    });

    it('should leave the limit to the validators of the field', () => {
      // Given
      const { cmp, chips, type, press } = create();
      ['b', 'c', 'd'].forEach(text => {
        type(text, 'bound');
        press('Enter', 'bound');
      });

      // Then: the fourth chip is there, and the field says it is too many
      expect(chips('bound')).toEqual(['a', 'b', 'c', 'd']);
      expect(cmp.f.tags().errors().map(error => error.kind)).toEqual(['maxLength']);
    });

  });

});
