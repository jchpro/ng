import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, DOCUMENT, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageService } from '@jchpro/ngx-common';
import { map, startWith } from 'rxjs';

export type KitScheme = 'system' | 'dark' | 'light';
export type KitEffectiveScheme = 'dark' | 'light';

const STORAGE_KEY = 'kit.scheme';
const DEFAULT_SCHEME: KitScheme = 'system';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/** `toggle()` cycles through the schemes in this order. */
const SCHEME_CYCLE: readonly KitScheme[] = ['system', 'dark', 'light'];

/**
 * Applies the jchPRO App-surface tokens' scheme to `document.body` (via the
 * `kit-theme`/`kit-light`/`kit-system` classes from `@jchpro/ngx-kit/styles/tokens`) and
 * persists the choice across visits. Defaults to `system`, which resolves the tokens to
 * dark/light via `prefers-color-scheme` in pure CSS — no re-application needed as the OS
 * setting changes.
 */
@Injectable({
  providedIn: 'root'
})
export class KitThemeService {

  #storage = inject(LocalStorageService);
  #body = inject(DOCUMENT).body;
  #breakpoints = inject(BreakpointObserver);

  #scheme = signal(this.#storage.get<KitScheme>(STORAGE_KEY, DEFAULT_SCHEME));
  #prefersDark = toSignal(
    this.#breakpoints.observe(PREFERS_DARK_QUERY).pipe(
      map(state => state.matches),
      startWith(this.#breakpoints.isMatched(PREFERS_DARK_QUERY))
    ),
    { requireSync: true }
  );

  constructor() {
    this.#apply();
  }

  get scheme(): Signal<KitScheme> {
    return this.#scheme.asReadonly();
  }

  /** The stored scheme, resolved to an actual `dark`/`light` value — tracks OS changes live while `scheme()` is `system`. */
  readonly effectiveScheme: Signal<KitEffectiveScheme> = computed(() => {
    const scheme = this.#scheme();
    if (scheme === 'system') {
      return this.#prefersDark() ? 'dark' : 'light';
    }
    return scheme;
  });

  set(scheme: KitScheme) {
    this.#storage.set(STORAGE_KEY, scheme);
    this.#scheme.set(scheme);
    this.#apply();
  }

  toggle() {
    const next = SCHEME_CYCLE[(SCHEME_CYCLE.indexOf(this.#scheme()) + 1) % SCHEME_CYCLE.length];
    this.set(next);
  }

  #apply() {
    const scheme = this.#scheme();
    this.#body.classList.remove('kit-theme', 'kit-light', 'kit-system');
    this.#body.classList.add('kit-theme');
    if (scheme === 'dark') {
      return;
    }
    this.#body.classList.add(scheme === 'light' ? 'kit-light' : 'kit-system');
  }

}
