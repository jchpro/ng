import { Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  KitAuthCard, KitBusy, KitForgotPassword, KitLogin, KitLoginCredentials, KitPasswordToggle, KitSetPassword
} from '@jchpro/ngx-kit';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-auth',
  imports: [
    LibPageTitle,
    CodeExample,
    KitLogin,
    KitForgotPassword,
    KitSetPassword,
    KitAuthCard,
    KitPasswordToggle,
    KitBusy,
    FormField,
    FormRoot
  ],
  templateUrl: './auth.page.html'
})
export class AuthPage {

  protected readonly loginBusy = signal(false);
  protected readonly loginError = signal<string | null>(null);

  protected readonly forgotBusy = signal(false);
  protected readonly forgotSent = signal(false);

  protected readonly setBusy = signal(false);
  protected readonly setResult = signal('nothing yet');

  protected readonly ownError = signal<string | null>(null);
  readonly #ownModel = signal({ email: '', password: '' });
  protected readonly own = form(this.#ownModel, path => {
    required(path.email);
    email(path.email);
    required(path.password);
  }, {
    submission: {
      action: async () => {
        this.ownError.set(null);
        await this.#wait();
        this.ownError.set('Wrong email or password (this demo never accepts)');
      }
    }
  });

  protected async signIn({ password }: KitLoginCredentials) {
    this.loginBusy.set(true);
    this.loginError.set(null);
    await this.#wait();
    this.loginBusy.set(false);
    this.loginError.set(password === 'secret' ? null : 'Wrong email or password. This demo accepts the password "secret".');
  }

  protected async requestReset() {
    this.forgotBusy.set(true);
    await this.#wait();
    this.forgotBusy.set(false);
    this.forgotSent.set(true);
  }

  protected async setPassword(flow: string) {
    this.setBusy.set(true);
    await this.#wait();
    this.setBusy.set(false);
    this.setResult.set(`${flow}: password accepted`);
  }

  #wait(ms = 1200) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

}
