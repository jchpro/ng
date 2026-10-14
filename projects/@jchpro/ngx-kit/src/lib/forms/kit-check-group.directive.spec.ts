import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { KitCheckGroup } from './kit-check-group.directive';

describe('KitCheckGroup', () => {

  @Component({
    selector: 'kit-check-group-test',
    imports: [KitCheckGroup],
    template: `
      @for (role of roles; track role) {
        <input type="checkbox" [id]="role" [kitCheckGroup]="selected" [kitCheckValue]="role">
      }
      @for (role of roles; track role) {
        <input type="checkbox" [id]="'form-' + role" [kitCheckGroup]="f.roles().value" [kitCheckValue]="role">
      }
    `
  })
  class TestCmp {
    readonly roles = ['admin', 'editor', 'viewer'];
    readonly selected = signal<string[]>(['editor']);
    readonly model = signal({ roles: ['viewer'] });
    readonly f = form(this.model);
  }

  function create() {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const input = (id: string) => fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
    const click = (id: string) => {
      input(id).click();
      fixture.detectChanges();
    };
    return { fixture, input, click, cmp: fixture.componentInstance };
  }

  it('should check the inputs whose value is in the array', () => {
    // When
    const { input } = create();

    // Then
    expect(['admin', 'editor', 'viewer'].map(id => input(id).checked)).toEqual([false, true, false]);
  });

  it('should add a value when its input is checked, keeping the order they were checked in', () => {
    // Given
    const { click, cmp } = create();

    // When
    click('admin');

    // Then
    expect(cmp.selected()).toEqual(['editor', 'admin']);
  });

  it('should remove a value when its input is unchecked', () => {
    // Given
    const { click, cmp } = create();

    // When
    click('editor');

    // Then
    expect(cmp.selected()).toEqual([]);
  });

  it('should replace the array instead of changing it', () => {
    // Given
    const { click, cmp } = create();
    const before = cmp.selected();

    // When
    click('admin');

    // Then
    expect(cmp.selected()).not.toBe(before);
    expect(before).toEqual(['editor']);
  });

  it('should follow the array when it changes elsewhere', () => {
    // Given
    const { fixture, input, cmp } = create();

    // When
    cmp.selected.set(['admin', 'viewer']);
    fixture.detectChanges();

    // Then
    expect(['admin', 'editor', 'viewer'].map(id => input(id).checked)).toEqual([true, false, true]);
  });

  it('should bind to the value of a Signal Forms field', () => {
    // Given
    const { input, click, cmp } = create();
    expect(['admin', 'editor', 'viewer'].map(id => input('form-' + id).checked)).toEqual([false, false, true]);

    // When
    click('form-admin');

    // Then
    expect(cmp.model().roles).toEqual(['viewer', 'admin']);
  });

});
