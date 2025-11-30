import { Component, input, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RenderContent } from '@jchpro/ngx-common';
import { ProIconRenderer } from '../../icons/pro-icon-renderer';
import { CommonDialog } from './common-dialog';

type MockDialogData = any;

@Component({
  selector: 'pro-render',
  standalone: true,
  template: `<div class="mock-pro-render">{{ content() }}</div>`,
})
class MockProRenderComponent {
  readonly content = input.required<any>();
  readonly templateContext = input<any>();
}

@Component({
  selector: 'pro-icon',
  standalone: true,
  template: `<span class="mock-pro-icon">{{ icon() }}</span>`,
})
class MockProIconComponent {
  readonly icon = input.required<string>();
}

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [CommonDialog],
  template: `<app-common-dialog />`,
})
class HostComponent {
  @ViewChild(CommonDialog)
  dialog!: CommonDialog;
}

describe('CommonDialog', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  let dialogRefCloseSpy: jasmine.Spy;
  let dialogRefMock: Pick<MatDialogRef<any, any>, 'close' | 'disableClose'>;

  function createComponent(data: MockDialogData) {
    dialogRefCloseSpy = jasmine.createSpy('close');
    dialogRefMock = {
      close: dialogRefCloseSpy,
      disableClose: false,
    };

    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: data,
    });
    TestBed.overrideProvider(MatDialogRef, {
      useValue: dialogRefMock,
    })
    TestBed.overrideComponent(CommonDialog, {
      remove: { imports: [RenderContent, ProIconRenderer] },
      add: { imports: [MockProRenderComponent, MockProIconComponent] },
    })
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  function getTitleText(): string {
    const titleEl = fixture.debugElement.query(By.css('h2[mat-dialog-title]'))?.nativeElement as HTMLElement | undefined;
    return (titleEl?.textContent ?? '').trim();
  }

  function getButtons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css('mat-dialog-actions button'))
      .map(de => de.nativeElement as HTMLButtonElement);
  }

  it('should display title as a static string', () => {
    createComponent({
      title: 'My title',
      content: 'Hello',
      buttons: [],
    });

    expect(getTitleText()).toBe('My title');
  });

  it('should display title as a signal', () => {
    const titleSig = signal('Initial title');

    createComponent({
      title: titleSig,
      content: 'Hello',
      buttons: [],
    });

    expect(getTitleText()).toBe('Initial title');

    titleSig.set('Updated title');
    fixture.detectChanges();

    expect(getTitleText()).toBe('Updated title');
  });

  it('should wrap content in a <div> when ngFormSubmit is not provided', () => {
    createComponent({
      title: 'Title',
      content: 'Content',
      buttons: [],
    });

    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeNull();

    const wrapperDiv = fixture.debugElement.query(By.css('div.dialog-content-wrapper'));
    expect(wrapperDiv).not.toBeNull();
  });

  it('should wrap content in a <form> when ngFormSubmit is provided', () => {
    const ngFormSubmit = jasmine.createSpy('ngFormSubmit');

    createComponent({
      title: 'Title',
      content: 'Content',
      ngFormSubmit,
      buttons: [],
    });

    const form = fixture.debugElement.query(By.css('form'));
    expect(form).not.toBeNull();

    const wrapperDiv = fixture.debugElement.query(By.css('div > ng-container'));
    expect(wrapperDiv).toBeNull();

    (form!.nativeElement as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(ngFormSubmit).toHaveBeenCalled();
  });

  it('should render buttons with correct type defaults and close dialog with static result', () => {
    createComponent({
      title: 'Title',
      content: 'Content',
      buttons: [
        { label: 'Cancel', role: 'secondary', result: 'cancel' },
        { label: 'Ok', role: 'primary', result: 'ok' },
      ],
    });

    const buttons = getButtons();
    expect(buttons.length).toBe(2);

    expect(buttons[0].getAttribute('type')).toBe('button');
    expect(buttons[1].getAttribute('type')).toBe('button');

    buttons[0].click();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith('cancel');

    buttons[1].click();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith('ok');
  });

  it('should set primary button type="submit" when ngFormSubmit is provided', () => {
    createComponent({
      title: 'Title',
      content: 'Content',
      ngFormSubmit: () => undefined,
      buttons: [
        { label: 'Cancel', role: 'secondary', result: 'cancel' },
        { label: 'Save', role: 'primary', result: 'save' },
      ],
    });

    const buttons = getButtons();
    expect(buttons.length).toBe(2);

    expect(buttons[0].getAttribute('type')).toBe('button');
    expect(buttons[1].getAttribute('type')).toBe('submit');
  });

  it('should close dialog with result from function', () => {
    const resultFn = jasmine.createSpy('resultFn').and.returnValue({ ok: true });

    createComponent({
      title: 'Title',
      content: 'Content',
      buttons: [
        { label: 'Do', role: 'primary', result: resultFn },
      ],
    });

    const buttons = getButtons();
    buttons[0].click();

    expect(resultFn).toHaveBeenCalled();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith({ ok: true });
  });

  it('should support label as a signal', () => {
    const labelSig = signal('Initial');

    createComponent({
      title: 'Title',
      content: 'Content',
      buttons: [
        { label: labelSig, role: 'primary', result: true },
      ],
    });

    const buttonText = (getButtons()[0].textContent ?? '').trim();
    expect(buttonText).toContain('Initial');

    labelSig.set('Updated');
    fixture.detectChanges();

    const updatedText = (getButtons()[0].textContent ?? '').trim();
    expect(updatedText).toContain('Updated');
  });

  it('should disable primary button when primaryDisabled signal returns true', () => {
    const primaryDisabled = signal(true);

    createComponent({
      title: 'Title',
      content: 'Content',
      primaryDisabled,
      buttons: [
        { label: 'Ok', role: 'primary', result: 'ok' },
      ],
    });

    const button = getButtons()[0];
    expect(button.disabled).toBeTrue();

    primaryDisabled.set(false);
    fixture.detectChanges();

    expect(button.disabled).toBeFalse();
  });

  it('should render pro-icon when icon is a string and add pro-has-icon class', () => {
    createComponent({
      title: 'Title',
      content: 'Content',
      buttons: [
        { label: 'Ok', role: 'primary', result: 'ok', icon: 'accept' },
      ],
    });

    const buttonDe = fixture.debugElement.query(By.css('mat-dialog-actions button'));
    expect(buttonDe).not.toBeNull();

    const buttonEl = buttonDe!.nativeElement as HTMLButtonElement;
    expect(buttonEl.classList.contains('pro-has-icon')).toBeTrue();

    const iconEl = fixture.debugElement.query(By.css('.mock-pro-icon'))?.nativeElement as HTMLElement | undefined;
    expect(iconEl?.textContent?.trim()).toBe('accept');
  });

  it('should render template icon when icon is a TemplateRef', () => {
    @Component({
      selector: 'app-icon-template-host',
      standalone: true,
      imports: [CommonDialog],
      template: `
        <ng-template #iconTpl>
          <span class="template-icon">T</span>
        </ng-template>
        <app-common-dialog />
      `,
    })
    class IconTemplateHostComponent {
      @ViewChild('iconTpl', { static: true })
      iconTpl!: TemplateRef<any>;

      @ViewChild(CommonDialog)
      dialog!: CommonDialog;
    }

    const dialogRefClose = jasmine.createSpy('close');
    const dialogRef: Pick<MatDialogRef<any, any>, 'close' | 'disableClose'> = {
      close: dialogRefClose,
      disableClose: false,
    };

    const data: MockDialogData = {
      title: 'Title',
      content: 'Content',
      buttons: [],
    };

    TestBed.configureTestingModule({
      imports: [IconTemplateHostComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    const iconHostFixture = TestBed.createComponent(IconTemplateHostComponent);
    iconHostFixture.detectChanges();

    const iconHost = iconHostFixture.componentInstance;
    data.buttons = [
      { label: 'Ok', role: 'primary', result: 'ok', icon: iconHost.iconTpl },
    ];

    iconHostFixture.detectChanges();

    const templateIcon = iconHostFixture.debugElement.query(By.css('.template-icon'));
    expect(templateIcon).not.toBeNull();
  });

  it('should pass content to pro-render (mocked)', () => {
    createComponent({
      title: 'Title',
      content: 'Some content',
      buttons: [],
    });

    const render = fixture.debugElement.query(By.directive(MockProRenderComponent));
    expect(render).not.toBeNull();

    const renderText = fixture.debugElement.query(By.css('.mock-pro-render'))?.nativeElement as HTMLElement | undefined;
    expect(renderText?.textContent?.trim()).toBe('Some content');
  });
});
