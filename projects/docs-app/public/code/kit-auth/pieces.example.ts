// A form of your own on signal forms: the card and classes of the kit, your model.
@Component({
  imports: [KitAuthCard, KitPasswordToggle, KitBusy, FormField, FormRoot],
  template: `
    <kit-auth-card heading="Sign in" [error]="error()" [kitBusy]="credentials().submitting()">
      <form class="kit-auth-form" [formRoot]="credentials">
        <div class="kit-field">
          <label class="kit-field__label" for="email">Email</label>
          <input class="kit-field__control" id="email" type="email" autocomplete="username"
                 [formField]="credentials.email"
                 [attr.aria-invalid]="credentials.email().touched() && credentials.email().invalid() ? 'true' : null">
        </div>
        <div class="kit-field">
          <label class="kit-field__label" for="password">Password</label>
          <kit-password-toggle>
            <input class="kit-field__control" id="password" type="password" autocomplete="current-password"
                   [formField]="credentials.password">
          </kit-password-toggle>
        </div>
        <button class="kit-btn kit-btn--primary kit-btn--lg">Sign in</button>
      </form>
    </kit-auth-card>`
})
export class LoginPage {

  protected readonly error = signal<string | null>(null);
  readonly #model = signal({ email: '', password: '' });

  protected readonly credentials = form(this.#model, path => {
    required(path.email);
    email(path.email);
    required(path.password);
  }, {
    submission: {
      action: async () => {
        this.error.set(null);
        // …make the request, then
        this.error.set('Wrong email or password');
      }
    }
  });

}

// Replace a built-in icon with anything: another icon library, inline SVG, an emoji
// <kit-password-toggle>
//   <input type="password" …>
//   <span kitIcon="show">👁</span>
//   <span kitIcon="hide">🙈</span>
// </kit-password-toggle>
