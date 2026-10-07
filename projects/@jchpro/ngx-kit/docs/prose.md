[← back to readme](../readme.md)

# Prose

Styling for long-form, documentation-style content — help pages, release notes, terms, docs — as
opposed to the dense UI the App type scale is for. Put `kit-prose` on the container and its plain
elements are styled; nothing else is touched.

```html
<article class="kit-prose">
  <h2>Release notes</h2>
  <p>Plain elements, <a href="/changelog">links</a> and <code>code</code> need no classes.</p>
  <blockquote>A quote, set apart.</blockquote>

  <div class="kit-table-frame">
    <table>
      <tr><th>Name</th><th>What it does</th></tr>
      <tr><td><code>kit-btn</code></td><td>A button</td></tr>
    </table>
  </div>
</article>
```

## Setup

Part of `primitives`, or on its own as `@jchpro/ngx-kit/styles/prose`:

```scss
@use '@jchpro/ngx-kit/styles/prose';
@include prose.classes();
```

## What is styled

| Element | Look |
|---|---|
| `h1` | Display font, `--kit-prose-h1-*` (28/36, bold) |
| `h2`, `h3` | Display font, `--kit-prose-h2-*` and `--kit-prose-h3-*` |
| `p`, `ul`, `ol` | Body text, spacing below, indented lists |
| `a` | Text color with a brand pink underline, thicker on hover, focus ring |
| `blockquote` | Pink rule at the start, muted text |
| `code` | Inline chip |
| `table` | Padded cells, tinted header row, hairlines between rows, row hover |

Elements not listed here are the browser's default for now. The prose headings are provisional
tokens, see [issue #10](https://github.com/jchpro/ng/issues/10).

## Rules

- **Unclassed elements only.** Rules sit in `:where()` and, for text elements, `:not([class])`, so
  the container adds no specificity and any kit class — or your own — on an element wins. A
  `kit-btn` link or a card inside prose keeps its own look.
- **Don't use prose inside panels.** Its headings are larger relative to the text than the App
  scale's. A card or panel that has its own title uses the App scale (`--kit-app-*`) and not prose.
- **Tables** take the cell styling with or without a class on `<table>`. Wrap one in
  `kit-table-frame` for the rounded frame and horizontal scroll on narrow screens; the wrapper also
  works outside `kit-prose`.
