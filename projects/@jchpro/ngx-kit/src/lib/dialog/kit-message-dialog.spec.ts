import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { KitMessageDialog, KitMessageDialogData } from './kit-message-dialog';

describe('KitMessageDialog', () => {

  const CONFIRM: KitMessageDialogData = {
    tone: 'info',
    title: 'Publish',
    message: 'Publish the page?',
    confirmLabel: 'Publish',
    cancelLabel: 'Not yet'
  };

  function create(data: KitMessageDialogData) {
    const ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: ref }
      ]
    });
    const fixture = TestBed.createComponent(KitMessageDialog);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return {
      ref,
      element,
      title: element.querySelector('h2')!,
      message: element.querySelector<HTMLElement>('.kit-dialog__message')!,
      confirm: element.querySelector<HTMLButtonElement>('.kit-dialog__confirm')!,
      cancel: element.querySelector<HTMLButtonElement>('.kit-dialog__cancel')
    };
  }

  it('should show the title and message', () => {
    // Given
    const { title, message } = create(CONFIRM);

    // Then
    expect(title.textContent).toBe('Publish');
    expect(title.classList.contains('kit-dialog__title')).toBeTrue();
    expect(message.textContent).toBe('Publish the page?');
  });

  it('should carry the dialog class and one for its tone', () => {
    // Given
    const { element } = create({ ...CONFIRM, tone: 'warning' });

    // Then
    expect(element.classList.contains('kit-dialog')).toBeTrue();
    expect(element.classList.contains('kit-dialog--warning')).toBeTrue();
  });

  it('should show an icon for the tone', () => {
    // Given
    const { element } = create(CONFIRM);

    // Then
    expect(element.querySelector('.kit-dialog__icon svg')).toBeTruthy();
  });

  it('should render a confirmation as two buttons, cancel first', () => {
    // Given
    const { element, confirm, cancel } = create(CONFIRM);

    // Then
    const buttons = Array.from(element.querySelectorAll('button'));
    expect(buttons).toEqual([cancel!, confirm]);
    expect(confirm.textContent).toBe('Publish');
    expect(cancel!.textContent).toBe('Not yet');
  });

  it('should render an alert as a single button', () => {
    // Given
    const { element, cancel } = create({ ...CONFIRM, cancelLabel: undefined });

    // Then
    expect(cancel).toBeNull();
    expect(element.querySelectorAll('button').length).toBe(1);
  });

  it('should close with true on the confirming button', () => {
    // Given
    const { ref, confirm } = create(CONFIRM);

    // When
    confirm.click();

    // Then
    expect(ref.close).toHaveBeenCalledOnceWith(true);
  });

  it('should close with false on the cancelling button', () => {
    // Given
    const { ref, cancel } = create(CONFIRM);

    // When
    cancel!.click();

    // Then
    expect(ref.close).toHaveBeenCalledOnceWith(false);
  });

  it('should use a primary confirm button, and not focus cancel first, for most tones', () => {
    // Given
    const { confirm, cancel } = create(CONFIRM);

    // Then
    expect(confirm.classList.contains('kit-btn--primary')).toBeTrue();
    expect(confirm.classList.contains('kit-btn--danger')).toBeFalse();
    expect(cancel!.hasAttribute('cdkFocusInitial')).toBeFalse();
  });

  it('should use a danger confirm button and focus cancel first for a danger tone', () => {
    // Given
    const { confirm, cancel } = create({ ...CONFIRM, tone: 'danger' });

    // Then
    expect(confirm.classList.contains('kit-btn--danger')).toBeTrue();
    expect(confirm.classList.contains('kit-btn--primary')).toBeFalse();
    expect(cancel!.hasAttribute('cdkFocusInitial')).toBeTrue();
  });

});
