// Prints the WCAG contrast of every token pairing the App surface relies on, in both schemes,
// straight from `_tokens.scss`, and fails when one drops under its threshold (4.5:1 for text,
// 3:1 for controls and graphics) unless it is a documented exception. Run it after changing a
// color token: `npm run check:contrast`.
import { readFileSync } from 'node:fs';

const file = new URL('../projects/@jchpro/ngx-kit/styles/_tokens.scss', import.meta.url);
const source = readFileSync(file, 'utf8');

// The light values live in the `_light-values` mixin, the dark ones in the `.kit-theme` block.
const lightPart = source.slice(source.indexOf('@mixin _light-values'), source.indexOf('@mixin root-styles'));
const darkPart = source.slice(source.indexOf('.kit-theme {'), source.indexOf('// Explicit light scheme'));

function parse(part) {
  const tokens = {};
  for (const [, name, value] of part.matchAll(/--kit-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[name] = value;
  }
  return tokens;
}

const schemes = { dark: parse(darkPart), light: parse(lightPart) };

const channel = (value) => {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const TEXT = 4.5;
const UI = 3;
const pairs = [
  ['ink-primary', 'surface-canvas', TEXT],
  ['ink-primary', 'surface-raised', TEXT],
  ['ink-muted', 'surface-canvas', TEXT],
  ['ink-muted', 'surface-raised', TEXT],
  ['ink-on-primary', 'accent-peach-muted', TEXT],
  ['ink-on-accent', 'brand-violet-muted', TEXT],
  ['ink-on-accent', 'brand-magenta', TEXT],
  ['ink-on-accent', 'brand-indigo', TEXT],
  ['ink-on-accent', 'status-danger-fill', TEXT],
  ['ink-on-peach', 'accent-peach', TEXT],
  ...['success', 'warning', 'danger', 'info'].flatMap((s) => [
    [`status-${s}-ink`, 'surface-raised', TEXT],
    [`status-${s}-ink`, 'surface-canvas', TEXT],
  ]),
  ['border-control', 'surface-raised', UI],
  ['border-control', 'surface-canvas', UI],
  ['status-danger', 'surface-raised', UI],
  ['status-danger', 'surface-canvas', UI],
  ['status-success', 'surface-raised', UI],
  ['status-warning', 'surface-raised', UI],
  ['status-info', 'surface-raised', UI],
  ['brand-pink', 'surface-raised', UI],
  ['brand-pink', 'surface-canvas', UI],
  // Known exceptions, each carried by something else:
  ['brand-violet-muted', 'surface-raised', UI, { dark: 'the selected outline (border-control) carries the shape' }],
  ['accent-peach-muted', 'surface-raised', UI, { light: 'the label identifies the button, not its fill' }],
];

// A color blended over a base the way `color-mix(in srgb, tint P%, base)` does, for fills such as
// a badge's tint. A background written `tint@P>base` (e.g. `status-success-ink@14>surface-raised`)
// is resolved this way.
const mix = (tint, percent, base) => '#' + [1, 3, 5].map((i) => {
  const a = parseInt(tint.slice(i, i + 2), 16);
  const b = parseInt(base.slice(i, i + 2), 16);
  return Math.round(a * percent / 100 + b * (1 - percent / 100)).toString(16).padStart(2, '0');
}).join('');
const resolve = (tokens, name) => {
  const [, tint, percent, base] = name.match(/^(.+)@(\d+)>(.+)$/) ?? [];
  return tint ? (tokens[tint] && tokens[base] ? mix(tokens[tint], Number(percent), tokens[base]) : undefined) : tokens[name];
};

// Text on a tint: badges (primary ink on a tint of the status color, with a dot in the status
// color), the table's header row and its hovered rows.
pairs.splice(pairs.length - 2, 0,
  ...['success', 'warning', 'danger', 'info'].flatMap((s) => [
    ['ink-primary', `status-${s}@10>surface-raised`, TEXT],
    [`status-${s}`, `status-${s}@10>surface-raised`, UI],
  ]),
  ['ink-primary', 'ink-muted@10>surface-raised', TEXT],
  ['ink-muted', 'ink-primary@4>surface-raised', TEXT],
  ['ink-primary', 'brand-violet-muted@8>surface-raised', TEXT],
  ['ink-muted', 'brand-violet-muted@8>surface-raised', TEXT],
  ['ink-primary', 'brand-violet-muted@28>surface-raised', TEXT],
);

let failures = 0;
const rows = [];
for (const [fg, bg, need, exceptions = {}] of pairs) {
  const cells = ['dark', 'light'].map((scheme) => {
    const tokens = schemes[scheme];
    const fgValue = tokens[fg];
    const bgValue = resolve(tokens, bg);
    if (!fgValue || !bgValue) {
      failures++;
      return `missing ${!fgValue ? fg : bg}`;
    }
    const value = ratio(fgValue, bgValue);
    const text = value.toFixed(2);
    if (value >= need) {
      return text;
    }
    if (exceptions[scheme]) {
      return `${text} (exception)`;
    }
    failures++;
    return `${text} FAILS ${need}`;
  });
  rows.push([`${fg} on ${bg}`, `${need}:1`, ...cells]);
}

const widths = [0, 1, 2, 3].map((i) => Math.max(...rows.map((row) => row[i].length)));
const header = ['Pairing', 'Needs', 'Dark', 'Light'];
const line = (row) => row.map((cell, i) => cell.padEnd(widths[i])).join('  ');
console.log(line(header.map((h, i) => h.padEnd(widths[i]))));
rows.forEach((row) => console.log(line(row)));

if (failures) {
  console.error(`\n${failures} contrast pairing(s) below their threshold.`);
  process.exit(1);
}
console.log('\nAll pairings pass (documented exceptions aside).');
