// Fails when a rule of the kit's own CSS gives an element a size (width, height, min-/max-) and
// padding or a border, without saying which box the size is measured on. The browser default is
// content-box, so in an app without a global `box-sizing: border-box` the padding and border are
// added on top: a `width: 100%` menu item with padding overflows its panel. The docs-app has the
// global reset, which is why the kit looks right there whatever it declares. Run it after adding
// a rule to a stylesheet: `npm run check:box-sizing`.
//
// The styles are compiled with `sass` (brought in by Angular's build) and the flat CSS read with a
// small parser, so the check needs nothing else installed.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sass = require('sass');

const styles = fileURLToPath(new URL('../projects/@jchpro/ngx-kit/styles/', import.meta.url));

// The kit's stylesheets, compiled the way an app includes them.
const source = `
  @use 'primitives';
  @use 'shell';
  @include primitives.classes();
  @include shell.root-styles();
`;

const css = sass
  .compileString(source, { loadPaths: [styles], silenceDeprecations: ['import'], logger: sass.Logger.silent })
  .css
  .replace(/\/\*[\s\S]*?\*\//g, '');

const SIZES = /^(width|min-width|max-width|height|min-height|max-height|inline-size|block-size)$/;
const PADDING = /^padding(-[a-z]+)*$/;
const BORDER = /^border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-width)?$/;

const isZero = (value) => /^(0|0px|none|initial|inherit|unset)$/i.test(value.trim());
// A size that doesn't depend on which box it is measured on.
const isUnboundedSize = (value) => /^(auto|none|min-content|max-content|fit-content|0|0px)$/i.test(value.trim());

// Rules where content-box is the point, or the element already has border-box from another rule.
const FIELD = 'the element is a `.kit-field__control`, whose own rule sets border-box';
const ALLOWED = new Map([
  // `width: 1px` on a table cell only asks for "as narrow as the content": the cell grows to its
  // content and padding whichever box the 1px is on.
  ['.kit-table .kit-cell--select', 'width: 1px shrink-to-fit trick on a table cell'],
  ['.kit-table .kit-cell--expand', 'width: 1px shrink-to-fit trick on a table cell'],
  ['.kit-table .kit-cell--actions', 'width: 1px shrink-to-fit trick on a table cell'],
  ['.kit-password-toggle .kit-field__control', FIELD],
  ['.kit-data-table__search > .kit-field__control', FIELD],
  ['.kit-field__control[type=color]', FIELD],
  ['textarea.kit-field__control', FIELD],
  // A native button: the browser sizes it on the border box.
  ['.kit-field__control::file-selector-button', 'a native button, border-box by the browser\'s own styles']
]);

/** The rules of flat CSS (nested only in at-rules), as `{ selectors, declarations }`. */
function parseRules(text) {
  const rules = [];
  const stack = [];
  for (const [, before, brace] of text.matchAll(/([^{}]*)([{}])/g)) {
    if (brace === '{') {
      stack.push(before.trim());
      continue;
    }
    const header = stack.pop();
    if (header.startsWith('@') || stack.some((ancestor) => /^@(-\w+-)?keyframes/.test(ancestor))) {
      continue;
    }
    const declarations = new Map();
    for (const declaration of before.split(';')) {
      const colon = declaration.indexOf(':');
      if (colon > 0) {
        declarations.set(declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim());
      }
    }
    rules.push({ selectors: header.split(',').map((selector) => selector.trim()), declarations });
  }
  return rules;
}

const problems = [];
for (const { selectors, declarations } of parseRules(css)) {
  if (declarations.has('box-sizing')) {
    continue;
  }
  const sized = [...declarations].filter(([prop, value]) => SIZES.test(prop) && !isUnboundedSize(value)).map(([prop]) => prop);
  const extra = [...declarations].filter(([prop, value]) => (PADDING.test(prop) || BORDER.test(prop)) && !isZero(value)).map(([prop]) => prop);
  if (!sized.length || !extra.length) {
    continue;
  }
  for (const selector of selectors) {
    if (!ALLOWED.has(selector)) {
      problems.push(`${selector}  { ${sized.join(', ')} with ${extra.join(', ')} }`);
    }
  }
}

if (problems.length) {
  console.error('Rules with a size and padding or a border, but no box-sizing:\n');
  problems.forEach((problem) => console.error(`  ${problem}`));
  console.error(`\n${problems.length} rule(s): add \`box-sizing: border-box\` (or list the rule in ALLOWED with the reason).`);
  process.exit(1);
}
console.log('Every sized rule with padding or a border sets box-sizing.');
