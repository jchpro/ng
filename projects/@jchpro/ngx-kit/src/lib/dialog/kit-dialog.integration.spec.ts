import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDialogClose } from './kit-dialog-close.directive';
import { KitDialogTitle } from './kit-dialog-title.directive';
import { KitDialogService } from './kit-dialog.service';

// Real CDK dialog and overlay underneath — checks the pieces actually work together.
describe('KitDialogService with the CDK', () => {

  @Component({
    imports: [KitDialogTitle, KitDialogClose],
    template: `
      <h2 kitDialogTitle>Edit {{ data.name }}</h2>
      <input class="name">
      <button class="save" [kitDialogClose]="data.name + '!'">Save</button>
      <button class="cancel" [kitDialogClose]="undefined">Cancel</button>
    `,
    host: { 'class': 'kit-dialog' }
  })
  class EditDialog {
    protected readonly data = inject<{ name: string }>(DIALOG_DATA);
  }

  let service: KitDialogService;

  beforeEach(() => {
    service = TestBed.inject(KitDialogService);
  });

  async function settle() {
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();
  }

  const dialog = () => document.querySelector<HTMLElement>('.cdk-dialog-container');
  const button = (selector: string) => document.querySelector<HTMLButtonElement>(selector)!;
  const pressEscape = () => document.body.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true })
  );

  it('should resolve a confirmation true on the confirming button, and remove the dialog', async () => {
    // Given
    const answer = service.confirm({ message: 'Publish?' });
    await settle();
    expect(dialog()).toBeTruthy();

    // When
    button('.kit-dialog__confirm').click();
    await settle();

    // Then
    await expectAsync(answer).toBeResolvedTo(true);
    expect(dialog()).toBeNull();
  });

  it('should resolve a confirmation false on the cancelling button', async () => {
    // Given
    const answer = service.confirm({ message: 'Publish?' });
    await settle();

    // When
    button('.kit-dialog__cancel').click();
    await settle();

    // Then
    await expectAsync(answer).toBeResolvedTo(false);
  });

  it('should resolve a confirmation false on Escape', async () => {
    // Given
    const answer = service.confirm({ message: 'Publish?' });
    await settle();

    // When
    pressEscape();
    await settle();

    // Then
    await expectAsync(answer).toBeResolvedTo(false);
    expect(dialog()).toBeNull();
  });

  it('should resolve a confirmation false when the backdrop is clicked', async () => {
    // Given
    const answer = service.confirm({ message: 'Publish?' });
    await settle();

    // When
    document.querySelector<HTMLElement>('.kit-dialog-backdrop')!.click();
    await settle();

    // Then
    await expectAsync(answer).toBeResolvedTo(false);
  });

  it('should resolve an alert once its button is pressed', async () => {
    // Given
    const done = service.alert({ message: 'Saved.' });
    await settle();
    expect(document.querySelector('.kit-dialog__message')!.textContent).toBe('Saved.');
    expect(document.querySelectorAll('.cdk-dialog-container button').length).toBe(1);

    // When
    button('.kit-dialog__confirm').click();
    await settle();

    // Then
    await expectAsync(done).toBeResolvedTo(undefined);
  });

  it('should name the dialog by its title, as an alertdialog for a danger confirmation', async () => {
    // Given
    service.confirm({ message: 'Delete?', tone: 'danger' });
    await settle();

    // Then
    const container = dialog()!;
    expect(container.getAttribute('role')).toBe('alertdialog');
    expect(container.getAttribute('aria-modal')).toBe('true');
    expect(container.getAttribute('aria-labelledby')).toBe(container.querySelector('h2')!.id);

    // Cleanup
    pressEscape();
    await settle();
  });

  it('should start with focus on Cancel in a danger confirmation', async () => {
    // Given
    service.confirm({ message: 'Delete?', tone: 'danger' });

    // When
    await settle();
    await new Promise(resolve => setTimeout(resolve));

    // Then
    expect(document.activeElement).toBe(button('.kit-dialog__cancel'));

    // Cleanup
    pressEscape();
    await settle();
  });

  it('should size the pane through classes and leave the width to the dialog', async () => {
    // Given
    service.alert({ message: 'Hi' });
    await settle();

    // Then
    const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
    expect(pane.classList.contains('kit-dialog-panel')).toBeTrue();
    expect(pane.classList.contains('kit-dialog-panel--sm')).toBeTrue();
    expect(pane.style.maxWidth).toBe('100vw');

    // Cleanup
    pressEscape();
    await settle();
  });

  it('should open a component of your own, passing data in and the result out', async () => {
    // Given
    const ref = service.open<string, { name: string }, EditDialog>(EditDialog, { data: { name: 'Ada' } });
    await settle();
    expect(document.querySelector('h2')!.textContent).toBe('Edit Ada');

    // When
    button('.save').click();
    await settle();

    // Then
    await expectAsync(ref.result).toBeResolvedTo('Ada!');
  });

  it('should resolve the result of your own dialog with undefined when dismissed', async () => {
    // Given
    const ref = service.open<string, { name: string }, EditDialog>(EditDialog, { data: { name: 'Ada' } });
    await settle();

    // When
    button('.cancel').click();
    await settle();

    // Then
    await expectAsync(ref.result).toBeResolvedTo(undefined);
  });

  it('should not close on Escape when disableClose is set', async () => {
    // Given
    const ref = service.open<string, { name: string }, EditDialog>(EditDialog, { data: { name: 'Ada' }, disableClose: true });
    await settle();

    // When
    pressEscape();
    await settle();

    // Then
    expect(dialog()).toBeTruthy();

    // Cleanup
    ref.close('x');
    await settle();
  });

});
