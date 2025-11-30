import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RenderContent, HtmlContent, RenderableContent } from './render-content';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <ng-template #tpl let-value="value">
      <span class="template-content">Template: {{ value }}</span>
    </ng-template>
    <pro-render [content]="content" [templateContext]="templateContext"></pro-render>
  `,
  standalone: true,
  imports: [RenderContent]
})
class HostComponent {
  content: RenderableContent = '';
  templateContext: any = undefined;
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<any>;
}

describe('RenderContent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function getRenderedText() {
    fixture.detectChanges();
    return fixture.nativeElement.textContent.trim();
  }

  it('should render plain text', () => {
    host.content = 'Hello world';
    fixture.detectChanges();
    expect(getRenderedText()).toBe('Hello world');
  });

  it('should render HTML content', () => {
    const htmlContent: HtmlContent = { html: '<b>Bold</b> and <i>Italic</i>' };
    host.content = htmlContent;
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeTruthy();
    expect(span.nativeElement.innerHTML).toBe(htmlContent.html);
  });

  it('should render TemplateRef content', () => {
    host.content = host.tpl;
    host.templateContext = { value: 'TestValue' };
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('.template-content'));
    expect(span).toBeTruthy();
    expect(span.nativeElement.textContent.trim()).toBe('Template: TestValue');
  });

  it('should pass templateContext to TemplateRef', () => {
    host.content = host.tpl;
    host.templateContext = { value: 'ContextValue' };
    fixture.detectChanges();
    let span = fixture.debugElement.query(By.css('.template-content'));
    expect(span).toBeTruthy();
    expect(span.nativeElement.textContent.trim()).toBe('Template: ContextValue');

    // Change context and check update
    host.templateContext = { value: 'ChangedValue' };
    fixture.detectChanges();
    span = fixture.debugElement.query(By.css('.template-content'));
    expect(span.nativeElement.textContent.trim()).toBe('Template: ChangedValue');
  });

  it('should switch between content types', () => {
    // Start with text
    host.content = 'Text';
    fixture.detectChanges();
    expect(getRenderedText()).toBe('Text');

    // Switch to HTML
    host.content = { html: '<b>HTML</b>' };
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.innerHTML).toBe('<b>HTML</b>');

    // Switch to TemplateRef
    host.content = host.tpl;
    fixture.detectChanges();
    const tplSpan = fixture.debugElement.query(By.css('.template-content'));
    expect(tplSpan).toBeTruthy();

    // Switch back to text
    host.content = 'Back to text';
    fixture.detectChanges();
    expect(getRenderedText()).toBe('Back to text');
  });
});
