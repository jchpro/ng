import { Injectable, Signal, signal } from '@angular/core';

export type NpmLatest =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; version: string };

/** The `latest` dist-tag of a package, read from the public registry (it allows CORS) once per package. */
@Injectable({
  providedIn: 'root'
})
export class NpmLatestService {

  readonly #cache = new Map<string, Signal<NpmLatest>>();

  latest(packageName: string): Signal<NpmLatest> {
    let latest = this.#cache.get(packageName);
    if (!latest) {
      const state = signal<NpmLatest>({ status: 'loading' });
      fetch(`https://registry.npmjs.org/${packageName}/latest`)
        .then(response => response.ok ? response.json() : Promise.reject(response.status))
        .then(({ version }) => state.set({ status: 'ok', version }))
        .catch(() => state.set({ status: 'error' }));
      latest = state.asReadonly();
      this.#cache.set(packageName, latest);
    }
    return latest;
  }

}
