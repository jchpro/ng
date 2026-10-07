import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from './kit-dialog-labels';
import { KitDialogService } from './kit-dialog.service';
import { KitMessageDialog, KitMessageDialogData } from './kit-message-dialog';

describe('KitDialogService', () => {

  @Component({ template: '' })
  class CustomDialog {
  }

  let opened: { component: unknown; config: DialogConfig; closed: Subject<unknown>; close: jasmine.Spy }[];

  function create(providers: unknown[] = []) {
    opened = [];
    const dialog = {
      open: jasmine.createSpy('open').and.callFake((component: unknown, config: DialogConfig) => {
        const closed = new Subject<unknown>();
        const close = jasmine.createSpy('close').and.callFake((result?: unknown) => {
          closed.next(result);
          closed.complete();
        });
        opened.push({ component, config, closed, close });
        return { closed, close, componentInstance: null } as unknown as DialogRef;
      })
    };
    TestBed.configureTestingModule({
      providers: [{ provide: Dialog, useValue: dialog }, ...(providers as [])]
    });
    return {
      service: TestBed.inject(KitDialogService),
      last: () => opened[opened.length - 1],
      data: () => opened[opened.length - 1].config.data as KitMessageDialogData
    };
  }

  describe('open()', () => {

    it('should open the component with the kit defaults', () => {
      // Given
      const { service, last } = create();

      // When
      service.open(CustomDialog);

      // Then
      expect(last().component).toBe(CustomDialog);
      expect(last().config).toEqual(jasmine.objectContaining({
        role: 'dialog',
        hasBackdrop: true,
        backdropClass: 'kit-dialog-backdrop',
        panelClass: ['kit-dialog-panel', 'kit-dialog-panel--md'],
        maxWidth: '100vw',
        disableClose: false,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        closeOnNavigation: true,
        ariaModal: true
      }));
    });

    it('should pass on the data, size, role, extra classes and the rest of the config', () => {
      // Given
      const { service, last } = create();
      const data = { id: 7 };

      // When
      service.open(CustomDialog, {
        data,
        size: 'lg',
        role: 'alertdialog',
        disableClose: true,
        autoFocus: '.name',
        panelClass: ['mine', 'other']
      });

      // Then
      expect(last().config).toEqual(jasmine.objectContaining({
        data,
        role: 'alertdialog',
        disableClose: true,
        autoFocus: '.name',
        panelClass: ['kit-dialog-panel', 'kit-dialog-panel--lg', 'mine', 'other']
      }));
    });

    it('should accept a single extra panel class', () => {
      // Given
      const { service, last } = create();

      // When
      service.open(CustomDialog, { panelClass: 'mine' });

      // Then
      expect(last().config.panelClass).toEqual(['kit-dialog-panel', 'kit-dialog-panel--md', 'mine']);
    });

    it('should resolve the result with what the dialog was closed with', async () => {
      // Given
      const { service, last } = create();
      const ref = service.open<{ id: number }>(CustomDialog);

      // When
      last().close({ id: 3 });

      // Then
      await expectAsync(ref.result).toBeResolvedTo({ id: 3 });
    });

    it('should resolve the result with undefined when the dialog was dismissed', async () => {
      // Given
      const { service, last } = create();
      const ref = service.open(CustomDialog);

      // When
      last().close();

      // Then
      await expectAsync(ref.result).toBeResolvedTo(undefined);
    });

    it('should resolve the result with undefined when the dialog completes without a value', async () => {
      // Given
      const { service, last } = create();
      const ref = service.open(CustomDialog);

      // When
      last().closed.complete();

      // Then
      await expectAsync(ref.result).toBeResolvedTo(undefined);
    });

    it('should close the dialog through the ref', () => {
      // Given
      const { service, last } = create();
      const ref = service.open<string>(CustomDialog);

      // When
      ref.close('done');

      // Then
      expect(last().close).toHaveBeenCalledOnceWith('done');
    });

  });

  describe('alert()', () => {

    it('should show a message dialog with the default info title and OK button', () => {
      // Given
      const { service, last, data } = create();

      // When
      service.alert({ message: 'Saved.' });

      // Then
      expect(last().component).toBe(KitMessageDialog);
      expect(data()).toEqual({ tone: 'info', title: 'Information', message: 'Saved.', confirmLabel: 'OK' });
    });

    it('should resolve once the dialog closes', async () => {
      // Given
      const { service, last } = create();
      const alert = service.alert({ message: 'Saved.' });

      // When
      last().close(true);

      // Then
      await expectAsync(alert).toBeResolvedTo(undefined);
    });

    it('should resolve when the dialog is dismissed too', async () => {
      // Given
      const { service, last } = create();
      const alert = service.alert({ message: 'Saved.' });

      // When
      last().close();

      // Then
      await expectAsync(alert).toBeResolvedTo(undefined);
    });

    it('should take the default title from the tone', () => {
      // Given
      const { service, data } = create();

      // When
      service.alert({ message: 'Oops', tone: 'error' });

      // Then
      expect(data().tone).toBe('error');
      expect(data().title).toBe('Something went wrong');
    });

    it('should let the call override the title and the button label', () => {
      // Given
      const { service, data } = create();

      // When
      service.alert({ message: 'Done', title: 'Finished', buttonLabel: 'Great' });

      // Then
      expect(data().title).toBe('Finished');
      expect(data().confirmLabel).toBe('Great');
    });

    it('should label the button Close when asked to', () => {
      // Given
      const { service, data } = create();

      // When
      service.alert({ message: 'Done', buttons: 'close' });

      // Then
      expect(data().confirmLabel).toBe('Close');
    });

    it('should be a small dialog, and an alertdialog only for danger and error', () => {
      // Given
      const { service, last } = create();

      // When / Then
      service.alert({ message: 'a', tone: 'info' });
      expect(last().config.panelClass).toContain('kit-dialog-panel--sm');
      expect(last().config.role).toBe('dialog');

      service.alert({ message: 'b', tone: 'error' });
      expect(last().config.role).toBe('alertdialog');

      service.alert({ message: 'c', tone: 'warning' });
      expect(last().config.role).toBe('dialog');
    });

  });

  describe('confirm()', () => {

    it('should show a message dialog with OK and Cancel by default', () => {
      // Given
      const { service, last, data } = create();

      // When
      service.confirm({ message: 'Publish?' });

      // Then
      expect(last().component).toBe(KitMessageDialog);
      expect(data()).toEqual({
        tone: 'info',
        title: 'Information',
        message: 'Publish?',
        confirmLabel: 'OK',
        cancelLabel: 'Cancel'
      });
    });

    it('should resolve true when confirmed', async () => {
      // Given
      const { service, last } = create();
      const answer = service.confirm({ message: 'Sure?' });

      // When
      last().close(true);

      // Then
      await expectAsync(answer).toBeResolvedTo(true);
    });

    it('should resolve false when cancelled', async () => {
      // Given
      const { service, last } = create();
      const answer = service.confirm({ message: 'Sure?' });

      // When
      last().close(false);

      // Then
      await expectAsync(answer).toBeResolvedTo(false);
    });

    it('should resolve false when dismissed', async () => {
      // Given
      const { service, last } = create();
      const answer = service.confirm({ message: 'Sure?' });

      // When
      last().close();

      // Then
      await expectAsync(answer).toBeResolvedTo(false);
    });

    it('should label the buttons Yes and No when asked to', () => {
      // Given
      const { service, data } = create();

      // When
      service.confirm({ message: 'Sure?', buttons: 'yes-no' });

      // Then
      expect(data().confirmLabel).toBe('Yes');
      expect(data().cancelLabel).toBe('No');
    });

    it('should let the call override the title and both labels', () => {
      // Given
      const { service, data } = create();

      // When
      service.confirm({
        message: 'Delete the user?',
        tone: 'danger',
        title: 'Delete user',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep'
      });

      // Then
      expect(data()).toEqual({
        tone: 'danger',
        title: 'Delete user',
        message: 'Delete the user?',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep'
      });
    });

    it('should take the default title from the tone, as an alertdialog for danger', () => {
      // Given
      const { service, last, data } = create();

      // When
      service.confirm({ message: 'Delete?', tone: 'danger' });

      // Then
      expect(data().title).toBe('Are you sure?');
      expect(last().config.role).toBe('alertdialog');
    });

  });

  describe('with app-wide labels', () => {

    it('should use the provided labels for titles and buttons', () => {
      // Given
      const { service, data } = create([provideKitDialogLabels(KIT_DIALOG_LABELS_PL)]);

      // When
      service.confirm({ message: 'Na pewno?', tone: 'danger', buttons: 'yes-no' });

      // Then
      expect(data().title).toBe('Czy na pewno?');
      expect(data().confirmLabel).toBe('Tak');
      expect(data().cancelLabel).toBe('Nie');
    });

    it('should still let a call override them', () => {
      // Given
      const { service, data } = create([provideKitDialogLabels(KIT_DIALOG_LABELS_PL)]);

      // When
      service.alert({ message: 'Gotowe', title: 'Własny tytuł' });

      // Then
      expect(data().title).toBe('Własny tytuł');
      expect(data().confirmLabel).toBe('OK');
    });

  });

});
