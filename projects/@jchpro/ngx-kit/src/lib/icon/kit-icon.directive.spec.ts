import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitIcon } from './kit-icon.directive';

@Component({
  imports: [KitIcon],
  template: `<span kitIcon="show"></span>`
})
class Host {}

describe('KitIcon', () => {

  it('should expose the slot it fills', () => {
    // Given
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // When
    const directive = fixture.debugElement.children[0].injector.get(KitIcon);

    // Then
    expect(directive.slot()).toBe('show');
  });

});
