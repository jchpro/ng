import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucidePackage, LucideDynamicIcon } from '@lucide/angular';
import { DocLib } from '../types';
import { compareVersions } from './compare-versions';
import { NpmLatestService } from './npm-latest.service';

/**
 * The version baked into this build, linked to the package on npm. The deploy happens on merge, before the
 * release is published, so when the baked version is newer than npm's `latest` it is flagged as unreleased.
 */
@Component({
  selector: 'app-lib-version',
  imports: [LucideDynamicIcon],
  template: `
    <a class="version" target="_blank" rel="noopener" [href]="npmUrl()" [title]="'Open ' + lib().libName + ' on npm'">
      <svg [lucideIcon]="icon"></svg>
      <code>{{ lib().version ?? 'npm' }}</code>
    </a>
    @if (unreleased()) {
      <span class="kit-badge kit-badge--warning" [title]="'Not on npm yet, the latest published version is ' + published()">
        unreleased
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--kit-space-2);
    }
    .version {
      display: inline-flex;
      align-items: center;
      gap: var(--kit-space-1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LibVersion {

  readonly lib = input.required<DocLib>();

  readonly #npmLatest = inject(NpmLatestService);

  protected readonly icon = LucidePackage;

  protected readonly npmUrl = computed(() => `https://www.npmjs.com/package/${this.lib().libName}`);

  readonly #latest = computed(() => this.#npmLatest.latest(this.lib().libName)());

  protected readonly published = computed(() => {
    const latest = this.#latest();
    return latest.status === 'ok' ? latest.version : null;
  });

  protected readonly unreleased = computed(() => {
    const { version } = this.lib();
    const published = this.published();
    return !!version && !!published && compareVersions(version, published) > 0;
  });

}
