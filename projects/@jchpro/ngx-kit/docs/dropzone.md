[← back to readme](../readme.md)

# File drop zone

Dropping a file on a bigger area is the usual upload experience, the file input's button is a small target. A `<label>` with
the `kit-dropzone` look holds a native `<input type="file">` stretched invisibly over it, so a click and the keyboard work
with no extra code, and the `kitDropzone` directive adds the drag and drop. Include the styles with `primitives`, or
`./styles/dropzone` on its own.

```html
<label class="kit-dropzone" kitDropzone (files)="upload($event)" (rejected)="tell($event)">
  <input class="kit-dropzone__input" type="file" accept="image/*" multiple>
  <span class="kit-dropzone__title">Drop images here or click to choose</span>
  <span class="kit-dropzone__hint">PNG or JPG, up to 5 MB</span>
</label>
```

- **`(files)`** emits the files that were taken, from a drop or from the picker. They are in the input too, so a form that reads
  the input, or listens to its `change`, sees them as with a plain file input.
- **`(rejected)`** emits what wasn't taken: files that the input's `accept` doesn't allow (extensions, MIME types and
  `image/*` wildcards), and all but the first when the input isn't `multiple`. They are left out of the input; tell the
  person why. A drop of nothing but rejected files leaves the previous choice alone. The size limit isn't checked, it is yours:
  check `file.size` in `(files)`.
- **`dragging`** is true while files are dragged over the zone (`#zone="kitDropzone"`, then `zone.dragging()`), and the zone has
  `kit-dropzone--active` for it. A drag that carries no files, text for example, is ignored. A disabled input takes no drops.
- **The look.** A dashed 2px edge at rest. Hover, `:focus-within` and a file over the zone share one look: the same edge, solid
  and pink, with a faint tint. The input has no outline of its own, the zone shows the focus. `kit-dropzone__title` and
  `kit-dropzone__hint` (muted) are the two lines of text.
- **Name and value.** The text of the label names the input for assistive technology. A file input shows nothing of what it
  holds once its own button is hidden, so write the chosen file's name somewhere visible, from `(files)`.
- Without the directive it is still a label around an input: only the drop is missing.
