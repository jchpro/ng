import { CdkOption } from '@angular/cdk/listbox';
import { Directive } from '@angular/core';

/**
 * One tile of a `kitTiles` grid, with the value it stands for: `<div kitTile="a.png">`. A preview and a name go
 * inside, as `kit-tile__preview` and `kit-tile__name`.
 *
 * Bind `[disabled]` for a tile that can't be chosen (it doesn't match what the field accepts): it is dimmed,
 * skipped by the keys and exposed as `aria-disabled`. The tile's text is what typeahead looks for; set
 * `cdkOptionTypeaheadLabel` when it should be something else.
 */
@Directive({
  selector: '[kitTile]',
  hostDirectives: [{
    directive: CdkOption,
    inputs: ['cdkOption: kitTile', 'cdkOptionDisabled: disabled', 'cdkOptionTypeaheadLabel: typeaheadLabel']
  }],
  host: {
    'class': 'kit-tile'
  }
})
export class KitTile {
}
