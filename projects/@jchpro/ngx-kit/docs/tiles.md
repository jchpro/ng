[← back to readme](../readme.md)

# Selectable tiles

A grid of single-choice items with a preview and a name, for picking one of the uploaded files, a template, a theme.
The behavior is the CDK's listbox (`role="listbox"` and `"option"`, `aria-selected`, arrow keys, typeahead), through two
directives, and the look is the `kit-tile` classes. Include them with `primitives`, or `./styles/tile` on its own.

```html
<div kitTiles aria-label="Pick a file" [(value)]="selected">
  @for (file of files; track file.id) {
    <div [kitTile]="file.id" [disabled]="!accepts(file)">
      <span class="kit-tile__preview"><img [src]="file.url" alt=""></span>
      <span class="kit-tile__name">{{ file.name }}</span>
    </div>
  }
</div>
```

- **`kitTiles`** on the container: `[(value)]` is the `kitTile` value of the chosen tile, `null` while there is none.
  Give it an `aria-label`. `[disabled]` disables the whole grid. A listbox is one tab stop: Tab enters the grid,
  the arrows move between the tiles, Space or Enter chooses, typing jumps to a tile by its text.
- **`kitTile="value"`** on a tile. `[disabled]` for a tile that can't be chosen, because it doesn't match what the field
  accepts: it is dimmed (`aria-disabled`) and the keys skip it. The text of the tile is what typeahead looks for;
  `typeaheadLabel` replaces it.
- **Classes inside a tile:** `kit-tile__preview` (a fixed 4:3 box on the sunken surface, an `<img>` or `<svg>` fits inside it
  uncropped) and `kit-tile__name` (one line, ellipsis).
- **Look:** a `--kit-border-control` edge, a 2px `--kit-brand-pink` edge and a faint tint on the chosen one. The grid is
  `repeat(auto-fill, minmax(8rem, 1fr))`: set `grid-template-columns` on the container for another tile width.
- **Arrows follow the reading order.** A CDK listbox is a list, so left and right move to the previous and next tile, not
  up and down by rows (`orientation="vertical"` swaps them). For several pages of tiles use `kitPagedList()` from the
  [table docs](table.md) and a paginator row under the grid.
- `ngModel` and reactive forms work on `kitTiles` too (a value accessor, as the CDK's), but the value there is an array.
