import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

/**
 * Renders content in DOM.
 */
@Component({
  selector: 'pro-render',
  imports: [
    NgTemplateOutlet,
  ],
  template: `
    @let c = content();
    @if (isTextContent(c)) {
      {{ c }}
    } @else if (isHtmlContent(c)) {
      <span [innerHTML]="c.html"></span>
    } @else if (isTemplateRef(c)) {
      <ng-container
        [ngTemplateOutlet]="c"
        [ngTemplateOutletContext]="templateContext() ?? {}">
      </ng-container>
    }
  `,
  styles: `
    :host, span { display: contents; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenderContent {

  readonly content = input.required<RenderableContent>();
  readonly templateContext = input<any>();

  protected readonly isTextContent = isTextContent;
  protected readonly isHtmlContent = isHtmlContent;
  protected readonly isTemplateRef = isTemplateRef;

}

/**
 * Static content that can be rendered in DOM, either simple text or HTML.
 */
export type StaticContent = string | HtmlContent;

export type HtmlContent = { readonly html: string; };

/**
 * Dynamic content that can be rendered in DOM, currently only `TemplateRef` is supported.
 */
export type DynamicContent = TemplateRef<any>;

/**
 * Various types of content that can be rendered in DOM by Angular.
 */
export type RenderableContent = StaticContent | DynamicContent;

export function isTextContent(content: RenderableContent): content is string {
  return typeof content === 'string';
}

export function isHtmlContent(content: RenderableContent): content is HtmlContent {
  return typeof content === 'object' && 'html' in content;
}

export function isTemplateRef(content: RenderableContent): content is TemplateRef<any> {
  return content instanceof TemplateRef;
}

