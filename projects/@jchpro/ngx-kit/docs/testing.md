[← back to readme](../readme.md)

# Testing helpers

`@jchpro/ngx-kit/testing` is a secondary entry point with the helpers the kit's own specs use for tables, menus and
forms. It depends on `@angular/core/testing` only — no Jasmine, so it works unchanged under Vitest — and the main
entry point never imports it, so nothing of it reaches an application bundle.

```ts
import { openCombobox, openMenu, pick, pickOption, settle, submit, type } from '@jchpro/ngx-kit/testing';
```

| Function | |
|---|---|
| `settle(fixture)` | Lets what the component waits for finish — a `resource()`, a request, the promises of a click handler, which `whenStable` doesn't know about — and renders the result. `detectChanges`, one macrotask, `whenStable`, `detectChanges` |
| `openMenu(fixture, trigger)` | Clicks a `kitMenuTriggerFor` button and gives the menu's `.kit-menu__item` elements. The menu lives in the CDK overlay, outside the fixture |
| `openCombobox(fixture, combobox, query?)` | Opens a `<kit-combobox>`, typing `query` into it when given (without a blur, which would put the text back), and gives the `[role=option]` elements it lists. The popup lives in the CDK overlay, outside the fixture |
| `pickOption(fixture, combobox, label, query?)` | Opens a `<kit-combobox>` the same way and clicks the option with this exact label; throws, listing what the popup has, when there is none |
| `type(root, selector, value)` | Types into an `<input>` or `<textarea>` like a person: sets the value, then `input` and `blur` (so the field is touched) |
| `pick(root, selector, value)` | Picks an option of a `<select>`, firing `input` and `change` as a browser does |
| `submit(fixture)` | Submits the component's `<form>` and waits until the submission is done |

`type`, `pick` and `submit` throw a descriptive error when the element isn't there, instead of failing later on
`null`.
