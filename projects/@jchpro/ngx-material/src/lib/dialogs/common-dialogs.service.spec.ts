import { Signal, TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NEVER } from 'rxjs';
import { PRO_DIALOGS_INTL, ProDialogsIntl } from '../intl/pro-dialogs-intl';
import { CommonDialogsService } from './common-dialogs.service';
import { CommonDialog } from './common/common-dialog';
import { CommonDialogData, ConfirmDialogData, InfoDialogData } from './types';

describe('CommonDialogsService', () => {
  let service: CommonDialogsService;
  let capturedArgs: any[];
  let intl: ProDialogsIntl;

  class MockMatDialog {
    open(...args: any[]) {
      capturedArgs = args;
      return {
        afterClosed: () => NEVER,
      };
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useClass: MockMatDialog
        }
      ]
    });
    service = TestBed.inject(CommonDialogsService);
    intl = TestBed.inject(PRO_DIALOGS_INTL);
    capturedArgs = [];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('infoRef', () => {

    it('should properly map dialog data for the simplest case', () => {
      // Given
      const data: InfoDialogData = {
        content: 'plain content'
      };
      const intlSpy = spyOn(intl, 'getLabel').and.callThrough();

      // When
      service.infoRef(data);

      // Then
      expect(capturedArgs[0]).toBe(CommonDialog);
      expect(capturedArgs[1].data).toBeTruthy();

      // And
      const { title, buttons } = capturedArgs[1].data as CommonDialogData;
      expect(title).toBeInstanceOf(Function);

      // And
      expect(buttons).toHaveSize(1);
      expect(buttons[0].label).toBeInstanceOf(Function);

      // And
      expect(intlSpy).toHaveBeenCalledWith('okButton');
      expect(intlSpy).toHaveBeenCalledWith('infoTitle');
    });

    it('should properly map dialog data for simple custom button and title', () => {
      // Given
      const data: InfoDialogData = {
        title: 'dialog title',
        content: 'plain content',
        button: 'button'
      };

      // When
      service.infoRef(data);

      // Then
      expect(capturedArgs[1]).toEqual({
        data: {
          title: 'dialog title',
          content: 'plain content',
          templateContext: undefined,
          buttons: [
            {
              label: 'button',
              role: 'secondary',
              result: undefined,
              icon: 'accept',
            }
          ]
        }
      });
    });

    it('should properly map dialog data for fully custom button and template context', () => {
      // Given
      const data: InfoDialogData = {
        content: new TemplateRef(),
        templateContext: { foo: 'bar' },
        button: {
          label: 'my button',
          role: 'primary',
          result: true,
          icon: 'accept',
        }
      };

      // When
      service.infoRef(data);

      // Then
      expect(capturedArgs[1].data).toBeTruthy();

      // And
      const { content, templateContext, buttons } = capturedArgs[1].data as CommonDialogData;
      expect(content).toBeInstanceOf(TemplateRef);
      expect(templateContext).toEqual({ foo: 'bar' });
      expect(buttons).toHaveSize(1);
      expect(buttons[0]).toEqual({
        label: 'my button',
        role: 'primary',
        result: true,
        icon: 'accept',
      })
    });

  });

  describe('confirmRef', () => {

    it('should properly map dialog data for the simplest case', () => {
      // Given
      const data: ConfirmDialogData = {
        content: 'plain content'
      };
      const intlSpy = spyOn(intl, 'getLabel').and.callThrough();

      // When
      service.confirmRef(data);

      // Then
      expect(capturedArgs[0]).toBe(CommonDialog);
      expect(capturedArgs[1].data).toBeTruthy();

      // And
      const { title, content, buttons } = capturedArgs[1].data as CommonDialogData;
      expect(title).toBeInstanceOf(Function);
      expect(content).toBe('plain content')

      // And
      expect(buttons).toHaveSize(2);
      expect(buttons[0].label).toBeInstanceOf(Function);
      expect(buttons[0].icon).toBe('decline');
      expect(buttons[0].result).toBe(false);
      expect(buttons[0].role).toBe('secondary');
      expect(buttons[1].label).toBeInstanceOf(Function);
      expect(buttons[1].icon).toBe('accept');
      expect(buttons[1].result).toBe(true);
      expect(buttons[1].role).toBe('primary');

      // And
      expect(intlSpy).toHaveBeenCalledWith('noButton');
      expect(intlSpy).toHaveBeenCalledWith('yesButton');
    });

    it('should properly map dialog data for confirm_cancel buttons set', () => {
      // Given
      const data: ConfirmDialogData = {
        content: '',
        buttons: 'confirm_cancel'
      };
      const intlSpy = spyOn(intl, 'getLabel').and.callThrough();

      // When
      service.confirmRef(data);

      // Then
      expect(capturedArgs[1].data).toBeTruthy();

      // And
      const { buttons } = capturedArgs[1].data as CommonDialogData;
      expect(buttons).toHaveSize(2);
      expect(buttons[0].label).toBeInstanceOf(Function);
      expect(buttons[0].icon).toBe('decline');
      expect(buttons[0].result).toBe(false);
      expect(buttons[0].role).toBe('secondary');
      expect(buttons[1].label).toBeInstanceOf(Function);
      expect(buttons[1].icon).toBe('accept');
      expect(buttons[1].result).toBe(true);
      expect(buttons[1].role).toBe('primary');

      // And
      expect(intlSpy).toHaveBeenCalledWith('cancelButton');
      expect(intlSpy).toHaveBeenCalledWith('confirmButton');
    });

  });

});
