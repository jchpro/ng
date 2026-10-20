import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export interface ScriptLoadOptions {
  /** The `id` of the element. A script with this id already in the document counts as loaded. */
  id?: string;
  /** More attributes of the element, e.g. `integrity`, `crossorigin`, `nonce` or `data-*`. */
  attributes?: Readonly<Record<string, string>>;
}

/** A script that could not be loaded: the network, a wrong URL, a blocker. */
export class ScriptLoadError extends Error {

  constructor(readonly url: string) {
    super(`Failed to load the script ${url}`);
    this.name = 'ScriptLoadError';
  }

}

/**
 * Loads an external script on demand (a captcha or an analytics SDK), through the `DOCUMENT` token.
 */
@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

  protected readonly document = inject(DOCUMENT);

  // The scripts that are loading or have loaded, by URL. A failed one is taken out, so it can be tried again.
  readonly #scripts = new Map<string, Promise<void>>();

  /**
   * Appends a `<script>` for `url` to the head, and resolves when it has loaded. A URL is loaded once: a call while
   * the first one is still loading gets the same promise, so it never resolves before the script is there, and a call
   * after it has loaded resolves at once. A script already in the document (`src` is `url`, or its `id` is the
   * given one), say from `index.html`, counts as loaded.
   *
   * Rejects with a `ScriptLoadError` when the script fails to load. The element is removed then, and the next call tries again.
   */
  load(url: string, options: ScriptLoadOptions = {}): Promise<void> {
    const known = this.#scripts.get(url);
    if (known) {
      return known;
    }
    if (this.#isInDocument(url, options.id)) {
      return Promise.resolve();
    }
    const loading = this.#append(url, options).catch(error => {
      this.#scripts.delete(url);
      throw error;
    });
    this.#scripts.set(url, loading);
    return loading;
  }

  #isInDocument(url: string, id: string | undefined): boolean {
    if (id && this.document.getElementById(id)?.tagName === 'SCRIPT') {
      return true;
    }
    return Array.from(this.document.scripts).some(script => script.getAttribute('src') === url);
  }

  #append(url: string, { id, attributes = {} }: ScriptLoadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = url;
      if (id) {
        script.id = id;
      }
      Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => {
        script.remove();
        reject(new ScriptLoadError(url));
      }, { once: true });
      this.document.head.appendChild(script);
    });
  }

}
