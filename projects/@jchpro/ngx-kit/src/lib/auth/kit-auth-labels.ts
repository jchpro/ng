import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';

/**
 * Every user-facing string of the auth views. Where a message carries a value it has a
 * placeholder, replaced by the component: `{min}` for a minimum length, `{identifier}` for what
 * the person typed.
 */
export interface KitAuthLabels {
  /** Shared by every auth view. */
  common: {
    /** Accessible name of the button that reveals what was typed in a password field. */
    showPassword: string;
    /** Accessible name of the button that masks it again. */
    hidePassword: string;
    /** Label of the identifier field, by what it holds. */
    identifier: {
      email: string;
      username: string;
    };
    required: string;
    invalidEmail: string;
  };
  login: {
    title: string;
    password: string;
    rememberMe: string;
    submit: string;
  };
  forgotPassword: {
    title: string;
    description: string;
    submit: string;
    /** Title of the confirmation shown once `sent` is set. */
    sentTitle: string;
    /** Body of the confirmation. Deliberately says nothing about whether the account exists. */
    sentMessage: string;
  };
  setPassword: {
    newPassword: string;
    confirmPassword: string;
    mismatch: string;
    tooShort: string;
    /** Used with `flow="reset"`: a person who forgot their password picks a new one. */
    reset: {
      title: string;
      description: string;
      submit: string;
    };
    /** Used with `flow="invite"`: a person invited to an account chooses their first password. */
    invite: {
      title: string;
      description: string;
      submit: string;
    };
  };
}

/** What `provideKitAuthLabels` accepts: any part of the labels, the rest stays as is. */
export type KitAuthLabelsOverride = KitLabelsOverride<KitAuthLabels>;

export const KIT_AUTH_LABELS_EN: KitAuthLabels = {
  common: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    identifier: {
      email: 'Email',
      username: 'Username'
    },
    required: 'Fill in this field.',
    invalidEmail: 'Enter a valid email address.'
  },
  login: {
    title: 'Sign in',
    password: 'Password',
    rememberMe: 'Remember me',
    submit: 'Sign in'
  },
  forgotPassword: {
    title: 'Forgot your password?',
    description: 'Enter your details and we will send you instructions to set a new one.',
    submit: 'Send instructions',
    sentTitle: 'Check your inbox',
    sentMessage: 'If an account exists for {identifier}, we have sent instructions to set a new password.'
  },
  setPassword: {
    newPassword: 'New password',
    confirmPassword: 'Repeat the password',
    mismatch: 'The passwords do not match.',
    tooShort: 'Use at least {min} characters.',
    reset: {
      title: 'Set a new password',
      description: 'Choose a password to sign in with from now on.',
      submit: 'Set password'
    },
    invite: {
      title: 'Accept the invitation',
      description: 'Choose a password to finish setting up your account.',
      submit: 'Create account'
    }
  }
};

export const KIT_AUTH_LABELS_PL: KitAuthLabels = {
  common: {
    showPassword: 'Pokaż hasło',
    hidePassword: 'Ukryj hasło',
    identifier: {
      email: 'E-mail',
      username: 'Nazwa użytkownika'
    },
    required: 'Uzupełnij to pole.',
    invalidEmail: 'Podaj poprawny adres e-mail.'
  },
  login: {
    title: 'Zaloguj się',
    password: 'Hasło',
    rememberMe: 'Zapamiętaj mnie',
    submit: 'Zaloguj się'
  },
  forgotPassword: {
    title: 'Nie pamiętasz hasła?',
    description: 'Podaj swoje dane, a wyślemy Ci instrukcję ustawienia nowego hasła.',
    submit: 'Wyślij instrukcję',
    sentTitle: 'Sprawdź skrzynkę',
    sentMessage: 'Jeśli istnieje konto dla {identifier}, wysłaliśmy instrukcję ustawienia nowego hasła.'
  },
  setPassword: {
    newPassword: 'Nowe hasło',
    confirmPassword: 'Powtórz hasło',
    mismatch: 'Hasła nie są takie same.',
    tooShort: 'Użyj co najmniej {min} znaków.',
    reset: {
      title: 'Ustaw nowe hasło',
      description: 'Wybierz hasło, którego będziesz używać do logowania.',
      submit: 'Ustaw hasło'
    },
    invite: {
      title: 'Przyjmij zaproszenie',
      description: 'Wybierz hasło, aby dokończyć zakładanie konta.',
      submit: 'Utwórz konto'
    }
  }
};

/**
 * The labels the auth views read, as a signal so they can follow a runtime language switch.
 * English unless overridden with `provideKitAuthLabels` or `provideKitLabels`.
 */
export const KIT_AUTH_LABELS = new InjectionToken<Signal<KitAuthLabels>>('KIT_AUTH_LABELS', {
  factory: () => signal(KIT_AUTH_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the auth labels, merged over the English defaults — pass only what
 * differs, or a complete set such as `KIT_AUTH_LABELS_PL`. A signal works for labels that
 * change at runtime (e.g. fed from your i18n library).
 */
export function provideKitAuthLabels(labels: KitAuthLabelsOverride | Signal<KitAuthLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_AUTH_LABELS, KIT_AUTH_LABELS_EN, labels);
}
