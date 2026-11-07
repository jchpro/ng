# Icons in ngx-kit

`@lucide/angular` (peer dependency of `ngx-kit`) — decided and migrated 2026-09-24, replacing
Font Awesome entirely (repo-wide, not just the library). Static icons: `<svg lucideGlobe>` +
import the class into `imports`. Data-driven icons (icon chosen at runtime, e.g. from a config
object): `<svg [lucideIcon]="value">` + `LucideDynamicIcon` in `imports`, where `value` is the
imported icon *class* (type `LucideIcon`) — no `provideLucideIcons()` registry needed unless
looking icons up by string name. `size` is a raw CSS length (not Font Awesome's `"2x"` tokens)
and defaults to a fixed 24px; `docs-app` sets `provideLucideConfig({ size: '1em' })` so icons
scale with surrounding text.

**Override pattern** (`KitIcon`, the `[kitIcon="slot"]` marker; implemented in `KitPasswordToggle`
only so far, the shell header's mobile toggle is the next candidate): a content-projection slot for components that render a built-in icon but should let a consumer swap it for
literally anything (a different icon library, inline SVG, emoji) — not a plain token swap, which
is enough when the only need is picking a different icon from Lucide itself:
```html
@if (customIcon()) {
  <ng-content select="[kitIcon=slotname]"></ng-content>
} @else {
  <svg lucideDefaultIcon></svg>
}
```
with `contentChildren(KitIcon, { descendants: false })` checked for the slot name (`icon.slot()`)
detecting whether anything was projected. A projected `@if` block only matches `select` when it
has a single root element. Reserve this for spots where a different icon *source* is plausible, not every icon.
