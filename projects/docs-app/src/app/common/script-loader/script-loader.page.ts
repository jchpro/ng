import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ScriptLoaderService, ScriptLoadError } from '@jchpro/ngx-common';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

const DEMO_SCRIPT = '/demo/script-loader.js';

@Component({
  selector: 'app-script-loader',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './script-loader.page.html',
  styleUrl: './script-loader.page.scss'
})
export class ScriptLoaderPage {

  readonly #scripts = inject(ScriptLoaderService);
  readonly #document = inject(DOCUMENT);

  protected readonly message = signal('Nothing loaded yet.');
  protected readonly elements = signal(this.#countElements());

  protected async load() {
    await this.#run('Loaded.', () => this.#scripts.load(DEMO_SCRIPT));
  }

  protected async loadThreeTimes() {
    await this.#run('Loaded, three calls, one request.', () => Promise.all([
      this.#scripts.load(DEMO_SCRIPT),
      this.#scripts.load(DEMO_SCRIPT),
      this.#scripts.load(DEMO_SCRIPT)
    ]));
  }

  protected async loadMissing() {
    await this.#run('Loaded.', () => this.#scripts.load('/demo/there-is-no-such-script.js'));
  }

  async #run(done: string, action: () => Promise<unknown>) {
    this.message.set('Loading…');
    try {
      await action();
      this.message.set(done);
    } catch (error) {
      this.message.set(error instanceof ScriptLoadError ? `${error.message}. The next call tries again.` : 'Failed.');
    }
    this.elements.set(this.#countElements());
  }

  #countElements(): number {
    return this.#document.querySelectorAll(`script[src="${DEMO_SCRIPT}"]`).length;
  }

}
