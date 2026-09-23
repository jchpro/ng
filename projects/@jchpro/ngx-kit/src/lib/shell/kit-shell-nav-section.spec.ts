import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LucideGlobe } from '@lucide/angular';
import { KitShellNavItem } from './kit-shell-nav-item';
import { KitShellNavSection } from './kit-shell-nav-section';

describe('KitShellNavSection', () => {

  @Component({
    imports: [KitShellNavSection, KitShellNavItem],
    template: `
      <kit-shell-nav-section title="Common" [disabled]="sectionDisabled()">
        <kit-shell-nav-item [link]="['/docs', 'a']" [icon]="globeIcon">Dashboard</kit-shell-nav-item>
        <kit-shell-nav-item [disabled]="itemDisabled()" (linkClick)="logoutClicked = true">Log out</kit-shell-nav-item>
      </kit-shell-nav-section>
    `
  })
  class TestHost {
    protected readonly globeIcon = LucideGlobe;
    sectionDisabled = signal(false);
    itemDisabled = signal(false);
    logoutClicked = false;
  }

  function create() {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    return { fixture };
  }

  function items(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('.kit-shell-nav-section__item'));
  }

  it('should render a titled nav landmark associated with the visible title', () => {
    // Given
    const { fixture } = create();

    // Then
    const title: HTMLElement = fixture.nativeElement.querySelector('.kit-shell-nav-section__title')!;
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav')!;
    expect(title.textContent?.trim()).toBe('Common');
    expect(nav.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('should render a linked item as an anchor with its icon and projected content', () => {
    // Given
    const { fixture } = create();

    // Then
    const [link] = items(fixture);
    expect(link.tagName).toBe('A');
    expect(link.querySelector('svg')).toBeTruthy();
    expect(link.textContent?.trim()).toBe('Dashboard');
  });

  it('should render a link-less item as a button with no icon, emitting linkClick on click', () => {
    // Given
    const { fixture } = create();
    const [, button] = items(fixture) as HTMLButtonElement[];

    // Then
    expect(button.tagName).toBe('BUTTON');
    expect(button.querySelector('svg')).toBeNull();
    expect(button.textContent?.trim()).toBe('Log out');

    // When
    button.click();

    // Then
    expect(fixture.componentInstance.logoutClicked).toBe(true);
  });

  it('should disable an item individually without affecting its sibling', () => {
    // Given
    const { fixture } = create();

    // When
    fixture.componentInstance.itemDisabled.set(true);
    fixture.detectChanges();

    // Then
    const [link, button] = items(fixture) as [HTMLAnchorElement, HTMLButtonElement];
    expect(link.classList.contains('kit-shell-nav-section__item--disabled')).toBe(false);
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('kit-shell-nav-section__item--disabled')).toBe(true);
  });

  it('should disable every item when the section itself is disabled', () => {
    // Given
    const { fixture } = create();

    // When
    fixture.componentInstance.sectionDisabled.set(true);
    fixture.detectChanges();

    // Then
    const [link, button] = items(fixture) as [HTMLAnchorElement, HTMLButtonElement];
    expect(link.classList.contains('kit-shell-nav-section__item--disabled')).toBe(true);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(button.disabled).toBe(true);
  });

  describe('linkActiveOptions', () => {

    @Component({ template: '' })
    class Page {}

    @Component({
      imports: [KitShellNavSection, KitShellNavItem],
      template: `
        <kit-shell-nav-section title="Common">
          <kit-shell-nav-item [link]="['/docs', 'a']">Prefix</kit-shell-nav-item>
          <kit-shell-nav-item [link]="['/docs', 'a']" [linkActiveOptions]="{ exact: true }">Exact</kit-shell-nav-item>
        </kit-shell-nav-section>
      `
    })
    class OptionsHost {}

    it('should pass them through to the link, so an exact link is inactive on a child route', async () => {
      // Given
      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: '**', component: Page }])]
      });
      const fixture = TestBed.createComponent(OptionsHost);

      // When
      await TestBed.inject(Router).navigateByUrl('/docs/a/child');
      fixture.detectChanges();
      await fixture.whenStable();

      // Then
      const [prefix, exact] = items(fixture);
      expect(prefix.classList.contains('kit-shell-nav-section__item--active')).toBe(true);
      expect(exact.classList.contains('kit-shell-nav-section__item--active')).toBe(false);
    });

  });

});
