import { CdkListbox } from '@angular/cdk/listbox';
import { Directive, effect, inject, model, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * A grid of single-choice tiles: put it on the container of `kitTile`s. It is the CDK's listbox, so it gets
 * `role="listbox"`, arrow-key and typeahead navigation and `aria-selected` on the chosen tile, and one tab
 * stop for the whole grid. Give it an `aria-label`.
 *
 * `[(value)]` holds the `kitTile` value of the chosen tile, `null` while there is none.
 *
 * The arrows follow the reading order, left and right (`orientation="vertical"` makes it up and down): a CDK
 * listbox is a list, so it doesn't move by rows of the grid.
 */
@Directive({
  selector: '[kitTiles]',
  hostDirectives: [{
    directive: CdkListbox,
    inputs: ['cdkListboxDisabled: disabled', 'cdkListboxOrientation: orientation']
  }],
  host: {
    'class': 'kit-tiles'
  }
})
export class KitTiles<T = unknown> {

  /** The `kitTile` value of the chosen tile, or `null`. */
  readonly value = model<T | null>(null);

  readonly #listbox = inject<CdkListbox<T>>(CdkListbox);

  constructor() {
    // The tiles lay out in rows, so left and right are the natural arrows; `orientation` overrides it
    this.#listbox.orientation = 'horizontal';
    effect(() => {
      const value = this.value();
      untracked(() => this.#listbox.value = value === null ? [] : [value]);
    });
    this.#listbox.valueChange
      .pipe(takeUntilDestroyed())
      .subscribe(change => this.value.set(change.value[0] ?? null));
  }

}
