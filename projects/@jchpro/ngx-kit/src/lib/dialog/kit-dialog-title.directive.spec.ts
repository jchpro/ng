import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDialogTitle } from './kit-dialog-title.directive';

describe('KitDialogTitle', () => {

  @Component({
    imports: [KitDialogTitle],
    template: `
      <div id="first" role="dialog"><h2 id="first-title" kitDialogTitle>First</h2></div>
      <div id="second" role="alertdialog"><h2 kitDialogTitle>Second</h2></div>
      <p id="loose"><span kitDialogTitle>No dialog around</span></p>
    `
  })
  class TestHost {
  }

  async function create() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return { element, query: (selector: string) => element.querySelector<HTMLElement>(selector)! };
  }

  it('should give the heading the title class and an id', async () => {
    // Given
    const { query } = await create();

    // Then
    const title = query('#first h2');
    expect(title.classList.contains('kit-dialog__title')).toBeTrue();
    expect(title.id).toMatch(/^kit-dialog-title-\d+$/);
  });

  it('should name the surrounding dialog by it', async () => {
    // Given
    const { query } = await create();

    // Then
    expect(query('#first').getAttribute('aria-labelledby')).toBe(query('#first h2').id);
  });

  it('should also work in an alertdialog, with a different id per title', async () => {
    // Given
    const { query } = await create();

    // Then
    expect(query('#second').getAttribute('aria-labelledby')).toBe(query('#second h2').id);
    expect(query('#second h2').id).not.toBe(query('#first h2').id);
  });

  it('should not fail without a dialog around it', async () => {
    // Given
    const { query } = await create();

    // Then
    expect(query('#loose span').classList.contains('kit-dialog__title')).toBeTrue();
    expect(query('#loose').closest('[aria-labelledby]')).toBeNull();
  });

});
