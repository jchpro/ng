import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { PRO_ERRORS_INTL, ProErrorsIntl } from '../intl/pro-errors-intl';
import { ProErrors } from './pro-errors';

@Component({
  template: `
    <mat-form-field>
      <mat-label>Test</mat-label>
      <input matInput [formControl]="control">
      <mat-error *proErrors="let message">{{ message }}</mat-error>
    </mat-form-field>
  `,
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    ReactiveFormsModule,
    ProErrors,
  ],
})
class HostComponent {
  control = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.minLength(3)],
  });
}


describe('ProErrors', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let intl: any;

  function createComponent(component: Type<any> = HostComponent, customIntl?: () => ProErrorsIntl) {
    if (customIntl) {
      TestBed.overrideProvider(PRO_ERRORS_INTL, { useFactory: customIntl });
    }
    fixture = TestBed.createComponent(component)
    intl = TestBed.inject(PRO_ERRORS_INTL);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    intl = undefined;
  });

  function getMatErrorElements(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('mat-error')).map(e => e.nativeElement);
  }

  function getMatErrorTexts(): string[] {
    return getMatErrorElements().map(e => e.textContent?.trim() ?? '');
  }

  describe('initialization', () => {

    it('should create the host component', () => {
      // Given
      createComponent();

      // Then
      expect(hostComponent).toBeTruthy();
    });

    it('should warn if there is no control with statusChanges', () => {

      // Given
      const warnSpy = spyOn(console, 'warn');
      @Component({
        template: `
          <mat-form-field>
            <mat-label>Test</mat-label>
            <input matInput />
            <mat-error *proErrors="let message">{{ message }}</mat-error>
          </mat-form-field>
        `,
        standalone: true,
        imports: [
          MatFormField,
          MatLabel,
          MatError,
          MatInput,
          ReactiveFormsModule,
          ProErrors,
        ],
      })
      class BadComponent {}
      createComponent(BadComponent);

      // Then
      expect(warnSpy).toHaveBeenCalledWith('No control found for [proError] directive');
    });

  });

  describe('built-in validator messages', () => {

    it('should show required error message when control has required error', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setValue('');
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['This field is required']);
    });

    it('should show minLength error message when control has minLength error', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setValue('ab');
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Length of the text must be at least 3, but is 2']);
    });

  });

  describe('custom error messages', () => {

    it('should use string translator for custom error', () => {
      class CustomIntl extends ProErrorsIntl {
        customError = 'Custom error message';
      }

      // Given
      createComponent(HostComponent, () => new CustomIntl());

      // When
      hostComponent.control.setErrors({ customError: true })
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Custom error message']);
    });

    it('should use function translator for custom error with args', () => {
      class CustomIntl extends ProErrorsIntl {
        customError(obj: any) { return `Error ${obj.foo}` }
      }

      // Given
      createComponent(HostComponent, () => new CustomIntl());

      // When
      hostComponent.control.setErrors({ customError: { foo: 'bar' } })
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Error bar']);
    });

    it('should show debug message when translator type is invalid', () => {
      class CustomIntl extends ProErrorsIntl {
        customError = false;
      }

      // Given
      createComponent(HostComponent, () => new CustomIntl());

      // When
      hostComponent.control.setErrors({ customError: true })
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['<< INVALID TRANSLATOR TYPE: boolean FOR ERROR customError >>']);
    });

  });

  describe('error selection and clearing', () => {

    it('should display only the first error when multiple errors are present', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setErrors({ required: true, email: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['This field is required']);
    });

    it('should clear the message when there are no errors', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setValue('');
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()[0]).toBeTruthy();

      // When
      hostComponent.control.setValue('abcdef');
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toHaveSize(0);
    });

    it('should update message when error type changes', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setErrors({ required: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['This field is required']);

      // When
      hostComponent.control.setErrors({ email: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Invalid email address']);
    });

  });

  describe('unsupported errors and interaction with other mat-error elements', () => {

    @Component({
      template: `
        <mat-form-field>
          <mat-label>Test</mat-label>
          <input matInput [formControl]="control">
          @if (control.hasError('unknownError')) { <mat-error>Other error</mat-error> }
          <mat-error *proError="let message">{{ message }}</mat-error>
        </mat-form-field>
      `,
      standalone: true,
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        ProErrors,
      ],
    })
    class HostWithOtherErrorComponent {
      control = new FormControl<string | null>(null);
    }

    it('should show UNSUPPORTED ERROR message when error is not in intl and there are no other mat-error children', () => {
      // Given
      createComponent();

      // When
      hostComponent.control.setErrors({ unknownError: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['<< UNSUPPORTED ERROR: "unknownError" >>']);
    });

    it('should NOT show UNSUPPORTED ERROR message when there are other mat-error children', () => {
      // Given
      createComponent(HostWithOtherErrorComponent);

      // When
      hostComponent.control.setErrors({ unknownError: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Other error']);
    });

  });

  describe('intl changes', () => {

    it('should update the message when intl.changes emits', () => {
      class CustomIntl extends ProErrorsIntl {
        customError = 'Error lang 1';
        changeError() { this.customError = 'Error lang 2'; this.changes.next(); }
      }

      // Given
      createComponent(HostComponent, () => new CustomIntl());

      // When
      hostComponent.control.setErrors({ customError: true });
      hostComponent.control.markAsTouched();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Error lang 1']);

      // When
      intl.changeError();
      fixture.detectChanges();

      // Then
      expect(getMatErrorTexts()).toEqual(['Error lang 2']);
    });

  });

});
