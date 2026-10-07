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
| `h2`, `h3` | Display font, `--kit-prose-h2-*` (21/28) and `--kit-prose-h3-*` (18/24) |
| `p`, `ul`, `ol` | Body text, spacing below, indented lists. With `dl`, `blockquote` and `details` they stop at `--kit-prose-measure` (72 characters); tables, code blocks, figures and images stay full width |
| `ul`, `ol` (nested), `dl` | Items spaced a little apart; a nested list sits tight under its item; `dt` semibold, `dd` indented |
| `a` | Text color with a brand pink underline, thicker on hover, focus ring |
| `blockquote` | Pink rule at the start, muted text |
| `code` | Inline chip: raised surface, border, text color, in the system monospace stack at 0.9em |
| `strong`, `small`, `del` | Semibold, the small body size, muted with the line-through |
| `mark` | A peach highlight behind the text |
| `kbd` | A key cap with a thicker bottom edge |
| `samp`, `var` | Monospace (`--kit-font-mono`) at 0.9em, no chip |
| `ins`, `abbr[title]` | A faint green highlight with a dotted underline; a dotted underline with the help cursor |
| `sub`, `sup` | The browser's look, without widening the line |
| `hr` | A hairline in the subtle border color |
| `pre` | Raised box with a border, monospace, scrolls sideways. Code inside it loses the chip |
| `figure`, `figcaption` | A figure with a muted small caption below |
| `details` | A bordered disclosure box, bold summary, with a chevron at the end that flips up when open (the browser marker is replaced) |
| `img` | Fits the width, rounded corners |
| `table` | Padded cells, tinted header row, hairlines between rows, row hover |

`em` keeps the browser's italic. **Prose stops at h3**, as in the design system: `h1` is the page title (`kit-page-header__title`) and `h4`–`h6` are the browser's default, a fourth level means the page should be split.

## Rules

- **Unclassed elements only.** Rules sit in `:where()` and, for text elements, `:not([class])`, so
  the container adds no specificity and any kit class — or your own — on an element wins. A
  `kit-btn` link or a card inside prose keeps its own look.
- **Don't use prose inside panels.** Its headings are larger relative to the text than the App
  scale's. A card or panel that has its own title uses the App scale (`--kit-app-*`) and not prose.
- **Tables** take the cell styling with or without a class on `<table>`. Wrap one in
  `kit-table-frame` for the rounded frame and horizontal scroll on narrow screens; the wrapper also
  works outside `kit-prose`.
