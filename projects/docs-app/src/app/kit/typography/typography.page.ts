import { Component } from '@angular/core';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-typography',
  imports: [
    LibPageTitle
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
    { element: 'h2, h3', styled: true, note: 'Prose scale, display font' },
    { element: 'p', styled: true, note: 'Body text, spacing below' },
    { element: 'ul, ol', styled: true, note: 'Indent and spacing; nested lists are not looked at yet' },
    { element: 'table', styled: true, note: 'Inside a .table-fit frame, tinted header, row lines' },
    { element: 'code', styled: true, note: 'Inline chip' },
    { element: 'h1, h4, h5, h6', styled: false, note: 'Browser default' },
    { element: 'a', styled: false, note: 'Browser default' },
    { element: 'strong, em, small, mark, del, sub, sup', styled: false, note: 'Browser default' },
    { element: 'kbd, samp, var', styled: false, note: 'Browser default' },
    { element: 'dl', styled: false, note: 'Browser default' },
    { element: 'blockquote', styled: false, note: 'Browser default' },
    { element: 'hr', styled: false, note: 'Browser default' },
    { element: 'pre', styled: false, note: 'Browser default; code examples use app-code-example' },
    { element: 'figure, figcaption', styled: false, note: 'Browser default' },
  ] as const;

}
