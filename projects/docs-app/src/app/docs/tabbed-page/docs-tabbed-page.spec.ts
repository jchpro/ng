import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DocPage } from '../types';
import { DocsTabbedPage } from './docs-tabbed-page';

@Component({ template: 'tab content' })
class DummyTab {}

describe('DocsTabbedPage', () => {

  const page = {
    fullName: 'Forms',
    tabs: [
      { label: 'First', path: 'first', component: DummyTab },
      { label: 'Second', path: 'second', component: DummyTab }
    ]
  } as DocPage;

  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{
        path: 'forms',
        component: DocsTabbedPage,
        data: { page },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'first' },
          { path: 'first', component: DummyTab },
          { path: 'second', component: DummyTab }
        ]
      }])]
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    const links = Array.from<HTMLAnchorElement>(harness.routeNativeElement!.querySelectorAll('.kit-tabs__link'));
    return { harness, links };
  }

  it('should open the first tab when the page itself is opened', async () => {
    // When
    const { harness } = await open('/forms');

    // Then
    expect(harness.routeNativeElement!.textContent).toContain('tab content');
  });

  it('should list a link for every tab and mark the open one with aria-current', async () => {
    // When
    const { links } = await open('/forms/second');

    // Then
    expect(links.map(link => link.textContent!.trim())).toEqual(['First', 'Second']);
    expect(links.map(link => link.getAttribute('aria-current'))).toEqual([null, 'page']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/forms/first', '/forms/second']);
  });

});
