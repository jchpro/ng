import { Component } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-typography',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './typography.page.html',
  styleUrl: './typography.page.scss'
})
export class TypographyPage {

  /** The App scale as the tokens define it. `name` is the token stem: --kit-app-{name}-size etc. */
  protected readonly scale = [
    { name: 'h1', label: 'Page title', usedBy: 'kit-page-header__title' },
    { name: 'h2', label: 'Panel title', usedBy: 'Dialog title' },
    { name: 'h3', label: 'Section title', usedBy: 'kit-card__title, kit-fieldset__legend' },
    { name: 'body', label: 'Body text', usedBy: 'Everything, the default' },
    { name: 'body-sm', label: 'Secondary text', usedBy: 'No class yet' },
    { name: 'label', label: 'Label', usedBy: 'kit-field__label' },
    { name: 'caption', label: 'Caption', usedBy: 'No class yet' },
  ] as const;

  /**
   * What the kit's prose styling covers, element by element. `html` is the preview, our own literal
   * markup rendered into the table cell.
   */
  protected readonly coverage = [
    { element: 'h1', styled: false, note: "The page title is the page header's, prose stops at h3", html: '<h1>Heading</h1>' },
    { element: 'h2, h3', styled: true, note: 'Prose scale, display font', html: '<h2>Heading</h2><h3>Heading</h3>' },
    { element: 'h4, h5, h6', styled: false, note: 'Prose stops at h3: a fourth level means the page should be split', html: '<h4>Heading</h4><h5>Heading</h5><h6>Heading</h6>' },
    { element: 'p', styled: true, note: 'Body text, spacing below, stops at 72 characters', html: '<p>A paragraph of text.</p><p>Another one.</p>' },
    { element: 'ul, ol', styled: true, note: 'Indent, items spaced apart, a nested list sits tight under its item', html: '<ul><li>One<ul><li>Nested</li></ul></li><li>Two</li></ul><ol><li>One</li><li>Two</li></ol>' },
    { element: 'dl', styled: true, note: 'Semibold term, indented description', html: '<dl><dt>Term</dt><dd>Its description.</dd><dt>Another</dt><dd>Its description.</dd></dl>' },
    { element: 'a', styled: true, note: 'Text color, pink underline, thicker on hover, focus ring', html: '<a href="#typography-links">A link</a>' },
    { element: 'blockquote', styled: true, note: 'Pink rule at the start, muted text', html: '<blockquote><p>A quotation.</p></blockquote>' },
    { element: 'code, samp', styled: true, note: 'Inline chip in the text color, system monospace at 0.9em; samp is monospace without the chip', html: '<code>inline code</code> <samp>exit code 0</samp>' },
    { element: 'strong, em, small', styled: true, note: 'Semibold, the browser italic, the small body size', html: '<strong>strong</strong> <em>emphasis</em> <small>small print</small>' },
    { element: 'mark, ins, del', styled: true, note: 'Peach highlight, faint green with a dotted underline, muted line-through', html: '<mark>marked</mark> <ins>added</ins> <del>removed</del>' },
    { element: 'kbd, var', styled: true, note: 'Key cap, monospace', html: '<kbd>Ctrl</kbd> + <kbd>K</kbd> <var>x</var>' },
    { element: 'abbr', styled: true, note: 'Dotted underline, help cursor', html: '<abbr title="Application programming interface">API</abbr>' },
    { element: 'sub, sup', styled: true, note: 'Browser look, without widening the line', html: 'H<sub>2</sub>O and x<sup>2</sup>' },
    { element: 'hr', styled: true, note: 'A hairline', html: '<hr>' },
    { element: 'pre', styled: true, note: 'Raised box, monospace, scrolls sideways', html: '<pre>A preformatted block&#10;  keeps its spacing</pre>' },
    { element: 'figure, figcaption', styled: true, note: 'Muted small caption below', html: '<figure><pre>const answer = 42;</pre><figcaption>A figure with a caption</figcaption></figure>' },
    { element: 'details', styled: true, note: 'Bordered disclosure box, bold summary, chevron at the end that flips up', html: '<details open><summary>Summary</summary><p>Hidden until opened.</p></details>' },
    { element: 'table', styled: true, note: 'Tinted header, row lines; wrap in .kit-table-frame for the frame and scroll', html: '<div class="kit-table-frame"><table><tr><th>Name</th><th>Role</th></tr><tr><td>kit-btn</td><td>Button</td></tr></table></div>' },
    { element: 'img', styled: true, note: 'Fits the width, rounded corners', html: 'Not previewed here' },
  ] as const;

}
