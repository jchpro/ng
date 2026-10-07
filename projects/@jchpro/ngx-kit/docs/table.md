[← back to readme](../readme.md)

# Data tables

The usual admin-app list view: rows from an API, with a search, filters, sorting and paging.

The rows are a plain `<table class="kit-table">` with an `@for` in **your** template, so every cell is typed
(`user` below is the row type) and there are no column definitions to learn. The kit supplies the look, the frame
around it, the sortable header and the paginator.

> This is the design pass. The parts look and behave right on their own, but nothing is wired together yet: you hold the
> search, filter, sort and page state and make the request. A `kitTableState()` that bundles them and builds the request
> parameters is planned (see the roadmap).

## Setup

The styles are part of `primitives` (or `./styles/table`, `./styles/badge`, `./styles/button`, `./styles/field`,
`./styles/loading` on their own), and the row menu needs the [overlay styles](menu.md). Import `KitDataTable`, `KitSort`
and `KitPaginator` where you use them.

## Usage

```html
<kit-data-table [(sort)]="sort" [loading]="users.isLoading()" [empty]="!users.value()?.items.length">
  <div kitTableSearch class="kit-data-table__search">
    <svg lucideSearch></svg>
    <input #search class="kit-field__control" type="search" aria-label="Search users"
           [value]="query()" (input)="query.set(search.value)">
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

  <kit-paginator [total]="users.value()?.total ?? 0" [(page)]="page" [(pageSize)]="pageSize" />
</kit-data-table>
```

Always `track` by a stable id: when a re-sort returns the same rows in another order, Angular moves their DOM nodes
instead of rebuilding them. A page of 25 to 100 rows costs nothing either way, and with server-side paging you never
render more. Why not Material-style column templates: the context of an `<ng-template>` is untyped unless a guard directive
is told the row type, with `@for` it just is.

## `KitDataTable`

The frame: a toolbar, an optional row of applied-filter chips, the scroll region for your table and a footer.
Slots are marked by attribute; every part is optional and an empty toolbar, chips row or footer is not drawn.

| Slot | Goes to |
|---|---|
| `kitTableSearch` | toolbar, left. `.kit-data-table__search` is an icon over a native `type="search"` input |
| `kitTableFilters` | toolbar, left, after the search. `.kit-data-table__filters` for a row of native `<select class="kit-field__control">` |
| `kitTableActions` | toolbar, right: the view's actions, the primary one last |
| `kitTableChips` | the applied filters, one `.kit-data-table__chip` button each (and a `--clear` one for "Clear all"); render it only while a filter is applied |
| *(default)* | the scroll region: your table |
| `kitTableEmpty` | replaces the default empty message |
| `<kit-paginator>`, `kitTableFooter` | the footer |

| Input / output | |
|---|---|
| `[loading]` | the table is dimmed under a spinner and can't be reached by pointer or keyboard (`kitBusy`) |
| `[empty]` | the request succeeded with no rows: shows the empty state under the header row. Ignored while loading |
| `[filtered]` | the empty result comes from a search or filters: the message becomes "No results" with a clear button |
| `(clearFilters)` | the clear button of the filtered empty state |
| `[error]` | a message, or `true` for the default one: replaces the table with the error and a retry button |
| `(retry)` | the retry button |
| `[(sort)]` | the sorted column, `{ field, direction } \| null`, set by the `kitSort` headers |
| `[label]` | accessible name of the scroll region (also makes it a `region` landmark) |

The scroll region is focusable so a keyboard can scroll a wide table. For a table that scrolls under its sticky header
instead of growing with its rows, set `--kit-data-table-max-height` on the frame.

A custom `kitTableEmpty` must be an unconditional element: wrapped in an `@if` it counts as present even when hidden,
and the default message never shows.

## Sorting

`<th kitSort="name">` turns the header label into a button and keeps `aria-sort` up to date. A click sorts ascending,
then descending, then ascending again; add `cycle` (`<th kitSort="name" cycle>`) for a third click that clears the sort.
One column at a time. `field` is the name your API's sort parameter expects. `KitSort` only records the choice in the
frame's `sort`; sorting rows (or asking the API to) is yours. Numeric headers (`kit-cell--num`) put the arrow before
the label so the label stays flush right.

## `KitPaginator`

`[(page)]` (1-based), `[(pageSize)]`, `[total]`, `[pageSizes]` (default `10, 25, 50, 100`; the current size is added if
it isn't among them). It shows a page-size select, "1–25 of 340" and first / previous / next / last buttons. Changing the
page size goes back to page 1. It holds no data and doesn't clamp the page when the total shrinks: that is yours.

For an API without a total (cursor paging) leave `total` out and bind `[hasNext]`: the range becomes "Page 3" and
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
