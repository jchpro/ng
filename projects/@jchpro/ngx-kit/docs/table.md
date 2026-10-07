[← back to readme](../readme.md)

# Data tables

The usual admin-app list view: rows from an API, with a search, filters, sorting and paging.

The rows are a plain `<table class="kit-table">` with an `@for` in **your** template, so every cell is typed
(`user` below is the row type) and there are no column definitions to learn. The kit supplies the look, the frame
around it, the sortable header, the paginator, and `kitTableState()`, the signals behind search, filters, sort and
page. What you load, and how the state's `params` map to your API, stays yours.

## Setup

The styles are part of `primitives` (or `./styles/table`, `./styles/badge`, `./styles/button`, `./styles/field`,
`./styles/loading` on their own), and the row menu needs the [overlay styles](menu.md). Import `KitDataTable`,
`KitSort`, `KitPaginator`, `KitSearchInput` and `KitFilter` where you use them (and `KitCol`, `KitFilterPanel`, `KitColumnPicker`,
`KitDensityToggle` for the parts under [Selection, filters panel, columns, density](#selection-filters-panel-columns-density)).

## Usage

```ts
protected readonly state = kitTableState({
  pageSize: 25,
  sort: { field: 'name', direction: 'asc' },
  filters: { role: null as string | null },
  urlSync: true
});

protected readonly users = httpResource<Page<User>>(() => {
  const { query, filters, sort, page, pageSize } = this.state.params();
  return { url: '/api/users', params: { q: query, role: filters.role ?? '', sort: sort ? `${sort.field}:${sort.direction}` : '', page, size: pageSize } };
});
```

```html
<kit-data-table [state]="state" [resource]="users" [total]="users.value()?.total" [empty]="!users.value()?.items.length">
  <div kitTableSearch class="kit-data-table__search">
    <svg lucideSearch></svg>
    <input kitSearch class="kit-field__control" type="search" aria-label="Search users">
  </div>

  <div kitTableFilters class="kit-data-table__filters">
    <select kitFilter="role" class="kit-field__control" aria-label="Role">
      <option value="">All roles</option>
      <option value="Admin">Admin</option>
    </select>
  </div>

  <button kitTableActions type="button" class="kit-btn kit-btn--primary">Add user</button>

  <table class="kit-table">
    <thead>
      <tr>
        <th kitSort="name">User</th>
        <th kitSort="seats" class="kit-cell--num">Seats</th>
        <th class="kit-cell--actions"><span class="kit-table__sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      @for (user of users.value()?.items; track user.id) {
        <tr>
          <td><a class="kit-table__link" [routerLink]="['/users', user.id]">{{ user.name }}</a></td>
          <td class="kit-cell--num">{{ user.seats | number }}</td>
          <td class="kit-cell--actions">…</td>
        </tr>
      }
    </tbody>
  </table>

  <kit-paginator />
</kit-data-table>
```

Always `track` by a stable id: when a re-sort returns the same rows in another order, Angular moves their DOM nodes
instead of rebuilding them. A page of 25 to 100 rows costs nothing either way, and with server-side paging you never
render more. Why not Material-style column templates: the context of an `<ng-template>` is untyped unless a guard directive
is told the row type, with `@for` it just is.

Reading `resource.value()` while the resource is in its error state throws; use `hasValue()` first. To keep the previous
page on screen while the next one loads (a resource's value is `undefined` meanwhile), put it in a `linkedSignal`:

```ts
protected readonly page = linkedSignal<Page<User> | undefined, Page<User> | undefined>({
  source: () => this.users.hasValue() ? this.users.value() : undefined,
  computation: (value, previous) => value ?? previous?.value
});
```

## State

`kitTableState(options)` returns a `KitTableState`. Call it in an injection context (a field of a component).

| Option | |
|---|---|
| `pageSize` | rows per page at the start, default 25 |
| `sort` | `{ field, direction }` at the start, default none |
| `filters` | every filter the table has, with its starting value (`null` for "not filtering"). Its type is the type of `state.filters()` |
| `searchDebounce` | ms the search waits after the last keystroke, default 300; 0 applies at once |
| `urlSync` | `true` or `{ prefix }`, see below |

| Member | |
|---|---|
| `searchText` | what the search box shows, updates with every keystroke |
| `query` | the search that counts: trimmed, after the debounce. Use this one in requests |
| `filters`, `sort`, `pageSize`, `page` | writable signals. `page` is 1-based |
| `params` | `{ query, filters, sort, page, pageSize }`, changes when any of them does: feed it to a `resource()` / `httpResource()` |
| `offset` | rows to skip for the current page |
| `activeFilters` | `{ key, value }` for each filter that isn't empty, e.g. to render a chip each |
| `filtered` | the search or a filter is narrowing the rows |
| `search(text)`, `flushSearch()` | what `kitSearch` calls: set the text (debounced), apply it now |
| `setFilter(key, value)` | `''` and `null` both mean "not filtering" |
| `clearFilters()` | empties the search and every filter; the sort and page size stay |

Whatever narrows or reorders the rows (the search, a filter, the sort, the page size) takes the table back to page 1; changing
`page` itself doesn't.

Filter values from a native control are strings; keep filters as `string | null` and convert in the request, or give a
filter a number or boolean starting value and the URL sync reads it back as that type.

### Keeping the state in the URL

`urlSync: true` (opt-in) writes the state to the route's query string and reads it back: `?q=ada&sort=-seats&page=2&size=50&role=Admin`.

- Names: `q`, `sort` (`-` prefix for descending, `none` for explicitly unsorted), `page`, `size`, and each filter under its own name.
  `{ prefix: 'users.' }` puts a prefix before every name, for a second table on the same route.
- A value equal to the starting state is left out, so a fresh table has a clean URL. A sort or filter cleared from a non-empty
  start is written explicitly (`sort=none`, `role=`) so it survives a reload.
- A reload or a shared link restores the view; a navigation from outside (a link with query params) is applied to the state.
  Other query params are left alone.
- Uses `replaceUrl`, so typing and paging don't fill the history.
- Needs the router, and must be called where the route is injectable: a routed component, or anything under one.

## `KitDataTable`

The frame: a toolbar, an optional row of applied-filter chips, the scroll region for your table and a footer.
Slots are marked by attribute; every part is optional and an empty toolbar, chips row or footer is not drawn.

| Slot | Goes to |
|---|---|
| `kitTableSearch` | toolbar, left. `.kit-data-table__search` is an icon over a native `type="search"` input |
| `kitTableFilters` | toolbar, left, after the search. `.kit-data-table__filters` for a row of native `<select class="kit-field__control">` |
| `kitTableActions` | toolbar, right: the view's actions, the primary one last |
| `kitTableBulk` | actions of the bulk bar (shown only while rows are selected) |
| `kitTableChips` | the applied filters, one `.kit-data-table__chip` button each (and a `--clear` one for "Clear all"); render it only while a filter is applied |
| *(default)* | the scroll region: your table |
| `kitTableEmpty` | replaces the default empty message |
| `<kit-paginator>`, `kitTableFooter` | the footer |

| Input / output | |
|---|---|
| `[state]` | the `kitTableState()`: the search input, filters, sort headers and paginator inside bind to it |
| `[resource]` | an `httpResource()` / `resource()` (anything with `isLoading()`, `error()`, `reload()`): the table is loading while it loads, shows the error when it fails, and "Try again" reloads it |
| `[total]` | number of rows across all pages, for the paginator; `null` when unknown |
| `[selection]` | the `kitTableSelection()`: while it holds rows the toolbar gives way to the bulk-action bar |
| `[columns]` | the `kitTableColumns()`: which `kitCol` headers and cells are shown |
| `[(density)]` | `'default'` or `'compact'` rows; the `<kit-density-toggle>` sets it |
| `[loading]` | the table is dimmed under a spinner and can't be reached by pointer or keyboard (`kitBusy`); also true while the `resource` loads |
| `[empty]` | the request succeeded with no rows: shows the empty state under the header row. Ignored while loading |
| `[filtered]` | the empty result comes from a search or filters: the message becomes "No results" with a clear button. Follows the `state` by itself |
| `(clearFilters)` | the clear button of the filtered empty state (the state is cleared too) |
| `[error]` | a message, or `true` for the default one: replaces the table with the error and a retry button. A failed `resource` does this by itself |
| `(retry)` | the retry button (the `resource` is reloaded too) |
| `[(sort)]` | the sorted column, `{ field, direction } \| null`. Only used without a `state`, which holds the sort itself |
| `[label]` | accessible name of the scroll region (also makes it a `region` landmark) |

Without a `[state]` every part works on its own bindings (`[(sort)]` here, `[(page)]` on the paginator): use that for a
table whose state lives somewhere else.

The scroll region is focusable so a keyboard can scroll a wide table. For a table that scrolls under its sticky header
instead of growing with its rows, set `--kit-data-table-max-height` on the frame.

A custom `kitTableEmpty` must be an unconditional element: wrapped in an `@if` it counts as present even when hidden,
and the default message never shows.

### Search and filters

`input[kitSearch]` shows `state.searchText`, calls `state.search()` as the person types (debounced into `state.query`) and
applies the search at once on Enter. `[kitFilter="name"]` on a native `<select>` (or input) shows `state.filters()[name]` and
sets it on change; an option with value `""` is "no filter".

## Selection, filters panel, columns, density

Each piece is optional and binds to the frame.

### Selection and bulk actions

`kitTableSelection(key, { state })` keeps the selected rows by their key (`user => user.id`), so a selection survives paging,
sorting and a refresh of the rows.

| Member | |
|---|---|
| `isSelected(row)`, `toggle(row, selected?)` | one row |
| `select(rows)`, `deselect(rows)`, `clear()` | many rows, or none |
| `toggleAll(rows)`, `allSelected(rows)`, `someSelected(rows)` | the header checkbox for the rows on the page (`someSelected` is its `indeterminate`) |
| `count`, `keys` | signals: how many (across all pages), and which keys |

The checkboxes are plain `kit-check__input`s bound by hand, which keeps the row type:

```html
<th class="kit-cell--select">
  <input type="checkbox" class="kit-check__input" aria-label="Select all on this page"
         [checked]="selection.allSelected(rows)" [indeterminate]="selection.someSelected(rows)" (change)="selection.toggleAll(rows)">
</th>
…
<tr [class.kit-table__row--selected]="selection.isSelected(user)">
  <td class="kit-cell--select">
    <input type="checkbox" class="kit-check__input" [attr.aria-label]="'Select ' + user.name"
           [checked]="selection.isSelected(user)" (change)="selection.toggle(user)">
  </td>
```

With `[selection]` on the frame and a `kitTableBulk` slot, selecting rows swaps the toolbar for a bar: "N selected", the bulk actions, and "Clear selection".
With `{ state }` the selection empties when the search or a filter changes (a bulk action never reaches rows the person can't see);
paging, sorting and the page size keep it. Call `kitTableSelection` in an injection context when passing a state.

### More filters than fit inline

Up to three simple filters sit inline as selects in `kitTableFilters`. For more, `<kit-filter-panel kitTableFilters>` puts
the controls you project into a "Filters" popover, with the count of applied filters on the button and "Reset filters" /
"Done" at the bottom. `[filters]="['status', 'plan']"` names the filters inside, so inline ones aren't counted or reset with them.
It is built on `<kit-popover label [badge] [(open)]>`, a button that opens any content (kit `kitPopoverFooter` for its buttons)
in an overlay anchored to it. Unlike a menu it stays open while you use what is inside; Escape (focus returns to the button)
and a click outside close it. Needs the overlay styles.

### Columns

```ts
protected readonly columns = kitTableColumns([
  { id: 'name', label: 'User', locked: true },
  { id: 'role', label: 'Role' },
  { id: 'id', label: 'ID', hidden: true }
], { storageKey: 'users-columns' });
```

Mark each header and its cells with `kitCol="role"` (a hidden column gets the `hidden` attribute), pass `[columns]`, and add
`<kit-column-picker />` to `kitTableActions`: a "Columns" popover of checkboxes. `locked` columns can't be hidden, `hidden` ones
start hidden, `storageKey` remembers the choice in `localStorage` (a column added later keeps its own default; unreadable or
blocked storage is ignored). `columns.isVisible(id)`, `toggle(id)`, `setVisible(id, visible)` and `reset()` are there for your own controls.

### Density

`<kit-density-toggle />` in `kitTableActions` switches the frame's `[(density)]` between `'default'` and `'compact'`; compact
rows use the same height as `kit-table--compact`.

## Data in memory

For a table without a server, `kitClientTable(rows, state, options)` returns `{ rows, total }` signals: the rows of the current
page and the number matching across all pages, from a list you already have.

```ts
protected readonly view = kitClientTable(this.users, this.state, {
  search: user => [user.name, user.email],
  filters: { status: (user, status) => user.status === status },
  sort: { name: user => user.lastName }
});
```

`applyKitTableParams(rows, params, options)` is the same as a plain function, e.g. for the loader of a `resource()` or a test.

- **Search**: `search` returns the text of a row to look in; a row matches when every word of the query is found in it, ignoring case and
  accents (where Unicode decomposes them). Without `search` the query is ignored.
- **Filters**: called only for a filter that has a value. Without a function for a filter, `String(row[name]) === String(value)`.
- **Sort**: accessor per column (default `row[field]`). Numbers, dates and booleans compare as such, text in natural order ignoring case
  (`Item 9` before `Item 10`), empty values last whichever way it sorts; equal values keep their order.

## Sorting

`<th kitSort="name">` turns the header label into a button and keeps `aria-sort` up to date. A click sorts ascending,
then descending, then ascending again; add `cycle` (`<th kitSort="name" cycle>`) for a third click that clears the sort.
One column at a time. `field` is the name your API's sort parameter expects. `KitSort` only records the choice, in the
state's `sort` (or the frame's `[(sort)]` without one); sorting rows (or asking the API to) is yours. Numeric headers
(`kit-cell--num`) put the arrow before the label so the label stays flush right.

## `KitPaginator`

Inside a frame with a state it needs nothing: `<kit-paginator />` takes the page and page size from the state and the total
from the frame's `[total]`. On its own: `[(page)]` (1-based), `[(pageSize)]`, `[total]`. `[pageSizes]` (default
`10, 25, 50, 100`; the current size is added if it isn't among them). It shows a page-size select, "1–25 of 340" and
first / previous / next / last buttons. Changing the page size goes back to page 1. It doesn't clamp the page when the total
shrinks: that is yours.

For an API without a total (cursor paging) leave the total out and bind `[hasNext]`: the range becomes "Page 3" and
first / last are hidden. Its strings come from `KIT_TABLE_LABELS`.

## Column conventions

Modifier classes go on the `<th>` and its `<td>`s alike, so a header lines up with its column.

| Data | Convention |
|---|---|
| Identity (name, title) | `kit-table__link` on the link that opens the row, `kit-table__secondary` for a second line (an email). The link is the way into the row; the row is not clickable |
| Text | left-aligned; `kit-cell--truncate` cuts it with an ellipsis (width from `--kit-cell-max-width`, 20rem by default), give the cell a `title` |
| Numbers | `kit-cell--num`: right-aligned, tabular figures, the header too |
| Dates | `kit-cell--nowrap`, the time (or relative part) in `kit-cell--muted`. Format in the app |
| Status, category | `kit-badge` with `--success`, `--warning`, `--danger` or `--info`; plain is neutral |
| Yes / no | `kit-table__bool`: an icon and a word, never color alone; `--off` mutes the "no" |
| IDs, codes | `kit-cell--mono`, usually with `kit-cell--muted` |
| No value | `kit-table__empty`: an em dash with `role="img"` and an `aria-label` |
| Row actions | last column, `kit-cell--actions`: one icon button that opens a [menu](menu.md) (or at most one inline action next to it), always with an `aria-label` naming the row |

`kit-table--compact` on the table makes the rows denser. `kit-table__sr-only` is text for screen readers only, for the
header of an icon-only column.

`.kit-badge` is primary ink on a 10% tint of the state color with a dot in that color: the status `-ink` tokens can't hold
4.5:1 on their own tint in both schemes. The pairings are in `npm run check:contrast`.

## Labels

`KIT_TABLE_LABELS`, `provideKitTableLabels()` and `KIT_TABLE_LABELS_EN` / `KIT_TABLE_LABELS_PL`, covered by
`provideKitLabels()`. See [Labels and translations](labels.md). The strings: the empty, filtered-empty and error states
(titles, message, "Clear filters", "Try again") and the paginator (navigation name, "Rows per page", the range
`{from}–{to} of {total}`, `Page {page}`, and the four buttons).
