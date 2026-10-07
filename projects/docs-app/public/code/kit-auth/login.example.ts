@Component({
  imports: [KitLogin, RouterLink],
  host: { class: 'kit-auth-page' },   // centers the card in the viewport
  template: `
    <kit-login [busy]="busy()" [error]="error()" showRememberMe (submitted)="signIn($event)">
      <img kitAuthLogo src="logo.svg" alt="">
      <a kitAuthActions routerLink="/forgot-password">Forgot your password?</a>
    </kit-login>`
})
export class LoginPage {

  readonly #auth = inject(AuthService);   // yours, the kit knows nothing about it
  readonly #router = inject(Router);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async signIn({ identifier, password, remember }: KitLoginCredentials) {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.#auth.signIn(identifier, password, remember);
      await this.#router.navigateByUrl('/');
    } catch {
      this.error.set('Wrong email or password');
    } finally {
      this.busy.set(false);
    }
  }

}
