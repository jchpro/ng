import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Provider, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LucideGlobe } from '@lucide/angular';
import { of } from 'rxjs';
import { provideKitLabels } from '../labels/provide-kit-labels';
import { KitShellHeader } from './kit-shell-header';
import { KitShellLabelsOverride, provideKitShellLabels } from './kit-shell-labels';
import { KitShellNavItem } from './kit-shell-nav-item';
import { KitShellState } from './kit-shell-state';

describe('KitShellHeader', () => {

  function create(mobile: boolean, providers: Provider[] = []) {
    const mockBreakpoints: Partial<BreakpointObserver> = {
      observe: () => of<BreakpointState>({ matches: mobile, breakpoints: {} }),
      isMatched: () => mobile,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BreakpointObserver, useValue: mockBreakpoints },
        KitShellState,
        ...providers,
      ]
    });
    const fixture = TestBed.createComponent(KitShellHeader);
    fixture.detectChanges();
    return { fixture, state: TestBed.inject(KitShellState) };
  }

  it('should not render a toggle button while docked', () => {
    // Given
    const { fixture } = create(false);

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell-header__toggle')).toBeNull();
  });

  it('should render a toggle button in overlay mode and toggle the sidenav on click', () => {
    // Given
    const { fixture, state } = create(true);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.kit-shell-header__toggle');
    expect(button).toBeTruthy();
    expect(state.sidenavOpen()).toBe(false);

    // When
    button.click();
    fixture.detectChanges();

    // Then
    expect(state.sidenavOpen()).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  describe('toggle label', () => {

    const toggle = (fixture: ComponentFixture<KitShellHeader>) =>
      fixture.nativeElement.querySelector('.kit-shell-header__toggle') as HTMLButtonElement;

    it('should be English by default', () => {
      // Given
      const { fixture } = create(true);

      // Then
      expect(toggle(fixture).getAttribute('aria-label')).toBe('Toggle navigation');
    });

    it('should follow the app-wide shell labels', () => {
      // Given
      const { fixture } = create(true, [provideKitShellLabels({ toggleNavigation: 'Menu' })]);

      // Then
      expect(toggle(fixture).getAttribute('aria-label')).toBe('Menu');
    });

    it('should be Polish with provideKitLabels(pl)', () => {
      // Given
      const { fixture } = create(true, [provideKitLabels('pl')]);

      // Then
      expect(toggle(fixture).getAttribute('aria-label')).toBe('Przełącz nawigację');
    });

    it('should follow a runtime change of the labels', () => {
      // Given
      const labels = signal<KitShellLabelsOverride>({ toggleNavigation: 'One' });
      const { fixture } = create(true, [provideKitShellLabels(labels)]);

      // When
      labels.set({ toggleNavigation: 'Two' });
      fixture.detectChanges();

      // Then
      expect(toggle(fixture).getAttribute('aria-label')).toBe('Two');
    });

    it('should let the toggleNavigationLabel input win over the app-wide labels', () => {
      // Given
      const { fixture } = create(true, [provideKitShellLabels({ toggleNavigation: 'Menu' })]);

      // When
      fixture.componentRef.setInput('toggleNavigationLabel', 'Sections');
      fixture.detectChanges();

      // Then
      expect(toggle(fixture).getAttribute('aria-label')).toBe('Sections');
    });

  });

  it('should render no nav chrome when nothing is projected', () => {
    // Given
    const { fixture } = create(false);

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell-header__nav')).toBeNull();
  });

  describe('top navigation', () => {

    @Component({
      imports: [KitShellHeader, KitShellNavItem],
      template: `
        <kit-shell-header>
          <kit-shell-nav-item [link]="['/dashboard']" [icon]="icon">Dashboard</kit-shell-nav-item>
          <kit-shell-nav-item [disabled]="true">Reports</kit-shell-nav-item>
        </kit-shell-header>
      `
    })
    class TestHost {
      protected readonly icon = LucideGlobe;
    }

    function createHost(mobile: boolean) {
      const mockBreakpoints: Partial<BreakpointObserver> = {
        observe: () => of<BreakpointState>({ matches: mobile, breakpoints: {} }),
        isMatched: () => mobile,
      };
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: BreakpointObserver, useValue: mockBreakpoints },
          KitShellState,
        ]
      });
      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();
      return { fixture };
    }

    it('should render projected items inline, in a single row, while docked', () => {
      // Given
      const { fixture } = createHost(false);

      // Then
      const inlineNav: HTMLElement = fixture.nativeElement.querySelector('.kit-shell-header__nav:not(.kit-shell-header__nav--row2)');
      expect(inlineNav).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.kit-shell-header__nav--row2')).toBeNull();

      const items: HTMLElement[] = Array.from(inlineNav.querySelectorAll('.kit-shell-header__nav-item'));
      expect(items.map(i => i.textContent?.trim())).toEqual(['Dashboard', 'Reports']);
      expect(items[0].tagName).toBe('A');
      expect(items[1].tagName).toBe('BUTTON');
      expect((items[1] as HTMLButtonElement).disabled).toBe(true);
    });

    it('should move projected items to a second row once the sidenav collapses to overlay', () => {
      // Given
      const { fixture } = createHost(true);

      // Then
      expect(fixture.nativeElement.querySelector('.kit-shell-header__nav:not(.kit-shell-header__nav--row2)')).toBeNull();
      const row2: HTMLElement = fixture.nativeElement.querySelector('.kit-shell-header__nav--row2');
      expect(row2).toBeTruthy();

      const items: HTMLElement[] = Array.from(row2.querySelectorAll('.kit-shell-header__nav-item'));
      expect(items.map(i => i.textContent?.trim())).toEqual(['Dashboard', 'Reports']);
    });

  });

  describe('top navigation linkActiveOptions', () => {

    @Component({ template: '' })
    class Page {}

    @Component({
      imports: [KitShellHeader, KitShellNavItem],
      template: `
        <kit-shell-header>
          <kit-shell-nav-item [link]="['/docs', 'a']">Prefix</kit-shell-nav-item>
          <kit-shell-nav-item [link]="['/docs', 'a']" [linkActiveOptions]="{ exact: true }">Exact</kit-shell-nav-item>
        </kit-shell-header>
      `
    })
    class OptionsHost {}

    it('should pass them through to the link, so an exact link is inactive on a child route', async () => {
      // Given
      const mockBreakpoints: Partial<BreakpointObserver> = {
        observe: () => of<BreakpointState>({ matches: false, breakpoints: {} }),
        isMatched: () => false,
      };
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{ path: '**', component: Page }]),
          { provide: BreakpointObserver, useValue: mockBreakpoints },
          KitShellState,
        ]
      });
      const fixture = TestBed.createComponent(OptionsHost);

      // When
      await TestBed.inject(Router).navigateByUrl('/docs/a/child');
      fixture.detectChanges();
      await fixture.whenStable();

      // Then
      const host: HTMLElement = fixture.nativeElement;
      const [prefix, exact] = Array.from(host.querySelectorAll<HTMLElement>('.kit-shell-header__nav-item'));
      expect(prefix.classList.contains('kit-shell-header__nav-item--active')).toBe(true);
      expect(exact.classList.contains('kit-shell-header__nav-item--active')).toBe(false);
    });

  });

});
