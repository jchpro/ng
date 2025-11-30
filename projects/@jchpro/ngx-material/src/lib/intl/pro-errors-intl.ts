import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { ProBaseRxIntl } from './pro-base-intl';

/**
 * Translations for common validation errors. By default, the translations are in English.
 * Emit on `changes` subject to notify components when the translations have changed for any reason.
 *
 * When extending this class, you can add string translations or methods for your own custom validators, which should be available globally:
 *   - each field or method name should match the name of your custom error
 *   - the object from the `AbstractControl#errors` will be passed down as the argument of each custom method
 *   - refer to the code for examples, the core mechanism is the same for built-in translations.
 */
export class ProErrorsIntl extends ProBaseRxIntl {

  /**
   * For `Validators.required`
   */
  required = 'This field is required';

  /**
   * For `Validators.email`
   */
  email = 'Invalid email address';

  /**
   * For `Validators.requiredTrue`
   */
  requiredTrue = 'This field must be checked';

  /**
   * For `Validators.pattern`
   */
  pattern = 'Invalid format';

  /**
   * For `Validators.min`
   */
  min(obj: { min: number; actual: number; }) {
    return `Value must be at least ${obj.min}, but is ${obj.actual}`;
  }

  /**
   * For `Validators.min`
   */
  max(obj: { max: number; actual: number; }) {
    return `Value must be at most ${obj.max}, but is ${obj.actual}`;
  }

  /**
   * For `Validators.minLength`
   */
  minlength(obj: { requiredLength: number; actualLength: number; }) {
    return `Length of the text must be at least ${obj.requiredLength}, but is ${obj.actualLength}`;
  }

  /**
   * For `Validators.minLength`
   */
  maxlength(obj: { requiredLength: number; actualLength: number; }) {
    return `Length of the text must be at most ${obj.requiredLength}, but is ${obj.actualLength}`;
  }

}

export const PRO_ERRORS_INTL = new InjectionToken<ProErrorsIntl>('PRO_ERRORS_INTL', {
  factory: () => new ProErrorsIntl()
});

/**
 * Provides {@link PRO_ERRORS_INTL} globally.
 */
export function provideErrorsIntl(intlFactory: () => ProErrorsIntl): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PRO_ERRORS_INTL,
      useFactory: intlFactory
    }
  ])
}
