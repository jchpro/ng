import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitShellRoot } from './kit-shell-root.directive';

describe('KitShellRoot', () => {

  @Component({
    imports: [KitShellRoot],
    template: `<div kitShellRoot></div>`
  })
  class TestHost {
  }

  it('should add the kit-shell-root class to its host', () => {
    // Given
    const fixture = TestBed.createComponent(TestHost);

    // When
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.querySelector('div').classList.contains('kit-shell-root')).toBe(true);
  });

});
