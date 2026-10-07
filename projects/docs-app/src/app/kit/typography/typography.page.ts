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

  /** What the doc pages' prose styling covers, element by element. */
  protected readonly coverage = [
    { element: 'h1', styled: true, note: 'Display font, 28/36 bold (provisional token, the design system has no prose h1 yet)' },
    { element: 'h2, h3', styled: true, note: 'Prose scale, display font' },
    { element: 'p', styled: true, note: 'Body text, spacing below' },
    { element: 'ul, ol', styled: true, note: 'Indent and spacing; nested lists are not looked at yet' },
    { element: 'table', styled: true, note: 'Tinted header, row lines; wrap in .kit-table-frame for the frame and scroll' },
    { element: 'code', styled: true, note: 'Inline chip' },
    { element: 'a', styled: true, note: 'Text color, pink underline, thicker on hover, focus ring' },
    { element: 'blockquote', styled: true, note: 'Pink rule at the start, muted text' },
    { element: 'h4, h5, h6', styled: false, note: 'Browser default' },
    { element: 'strong, em, small, mark, del, sub, sup', styled: false, note: 'Browser default' },
    { element: 'kbd, samp, var', styled: false, note: 'Browser default' },
    { element: 'dl', styled: false, note: 'Browser default' },
    { element: 'hr', styled: false, note: 'Browser default' },
    { element: 'pre', styled: false, note: 'Browser default; code examples use app-code-example' },
    { element: 'figure, figcaption', styled: false, note: 'Browser default' },
  ] as const;

}
