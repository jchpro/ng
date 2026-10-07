[← back to readme](../readme.md)

# Tokens & theming

Include the App-surface design tokens in your global stylesheet:

```scss
@use '@jchpro/ngx-kit/styles/tokens';

@include tokens.root-styles();
```

This defines the `kit-theme` class (dark by default) plus two modifiers — `kit-light` (explicit
light) and `kit-system` (follows the OS's `prefers-color-scheme`, resolved in pure CSS, no
re-application needed as the OS setting changes) — all exposing the tokens as CSS custom
properties (`--kit-surface-canvas`, `--kit-app-h1-size`, `--kit-space-3`, `--kit-radius-md`,
...). Apply the class to `document.body` yourself, or inject `KitThemeService` and let it do
so — it also persists the chosen scheme, and defaults to `system`:

```ts
import { inject } from '@angular/core';
import { KitThemeService } from '@jchpro/ngx-kit';

const theme = inject(KitThemeService);
theme.scheme(); // Signal<'system' | 'dark' | 'light'> — the stored preference
theme.effectiveScheme(); // Signal<'dark' | 'light'> — resolved, tracks the OS live while 'system'
theme.set('dark');
theme.toggle(); // cycles system -> dark -> light -> system
```

**Prose headings.** The App type scale (`--kit-app-*`) suits dense UI, but its h2/h3 sit too close to 14px body text
in long-form content. For documentation, help pages, changelogs and policy text use the prose tokens instead:
`--kit-prose-h1-*` (28/36, weight 700), `--kit-prose-h2-*` (21/28, weight 600) and `--kit-prose-h3-*` (18/24, weight 600), each with `-size`, `-line-height`
and `-weight`, set in `--kit-font-display`. Body text stays `--kit-app-body-*`. Use them directly under the page
title; inside a panel or card that has its own `app-h2`/`app-h3` title, keep the App scale. The `kit-prose`
class applies them to plain elements, see [Prose](prose.md).

The two required Google Fonts (Dosis for headings, Inter for body/UI text) aren't bundled — add them to your
`index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dosis:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
