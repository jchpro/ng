import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, effect, inject, input, signal, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCopy, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import hljs from 'highlight.js/lib/core';
import { ThemesService } from '../../core/services/themes.service';
import { ToTablet } from '../../core/to-tablet';

@Component({
  selector: 'app-code-example',
  imports: [
    FaIconComponent,
    CdkCopyToClipboard
  ],
  templateUrl: './code-example.html',
  styleUrl: './code-example.scss',
  host: {
    '[class.scheme-dark]': 'effectiveScheme() === "dark"',
    '[class.scheme-light]': 'effectiveScheme() === "light"',
  },
  hostDirectives: [
    ToTablet
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class CodeExample {

  readonly source = input.required<string>();
  readonly lang = input.required<CodeLang>();

  protected readonly fetching = signal(true);
  protected readonly effectiveScheme = inject(ThemesService).effectiveScheme;
  protected readonly faSpinner = faSpinner;
  protected readonly html = signal('');
  protected readonly isValid = signal(true);
  protected readonly prettyLang = computed(() => {
    switch (this.lang()) {
      case 'ts': return 'typescript';
      default: return this.lang();
    }
  });
  protected readonly sourceFilename = computed(() => this.source().split('/').pop());
  protected readonly code = signal('');
  protected readonly copied = signal(false);

  constructor() {
    // Fetch code
    effect(() => {
      const url = this.source();
      this.fetching.set(true);
      this.#fetchSource(url)
          .then(code => this.code.set(code))
          .catch((err) => {
            this.code.set(this.#getMockCodeOnFailure(url));
            this.isValid.set(false);
            console.error(err);
          })
          .finally(() => this.fetching.set(false));
    });
    // Highlight syntax
    effect(() => {
      this.html.set(
        hljs.highlight(this.code(), {
          language: this.lang(),
        }).value
      );
    });
  }

  protected onCopied() {
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  async #fetchSource(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch source code from URL: ${url}`);
    }
    return await response.text();
  }

  #getMockCodeOnFailure(url: string) {
    const staticPart = 'Failed to fetch source code from URL';
    switch (this.lang()) {
      case 'ts':
      case 'scss': return `// ${staticPart}: ${url}`;
      case 'json': return `{ "${staticPart}": "${url}" }`;
      case 'html': return `<!-- ${staticPart}: ${url} -->`;
    }
  }

  protected readonly faCopy = faCopy;
  protected readonly faDownload = faDownload;
}

export type CodeLang = 'ts' | 'scss' | 'json' | 'html';
