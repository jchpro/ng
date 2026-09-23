import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { KitShellSidenav } from './kit-shell-sidenav';
import { KitShellState } from './kit-shell-state';

describe('KitShellSidenav', () => {

  function create(mobile: boolean) {
    const mockBreakpoints: Partial<BreakpointObserver> = {
      observe: () => of<BreakpointState>({ matches: mobile, breakpoints: {} }),
      isMatched: () => mobile,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpoints },
        KitShellState,
      ]
    });
    const fixture = TestBed.createComponent(KitShellSidenav);
    fixture.detectChanges();
    return { fixture, state: TestBed.inject(KitShellState) };
  }

  it('should ignore clicks while docked', () => {
    // Given
    const { fixture, state } = create(false);
    state.openSidenav();

    // When
    fixture.nativeElement.click();

    // Then
    expect(state.sidenavOpen()).toBe(true);
  });

  it('should close on click while in overlay mode', () => {
    // Given
    const { fixture, state } = create(true);
    state.openSidenav();

    // When
    fixture.nativeElement.click();

    // Then
    expect(state.sidenavOpen()).toBe(false);
  });

  it('should close on Escape while in overlay mode', () => {
    // Given
    const { fixture, state } = create(true);
    state.openSidenav();

    // When
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    // Then
    expect(state.sidenavOpen()).toBe(false);
  });

  it('should be hidden and inert only while closed in overlay mode', () => {
    // Given
    const { fixture, state } = create(true);

    // Then
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.hasAttribute('inert')).toBe(true);

    // When
    state.openSidenav();
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBeNull();
    expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);
  });

  it('should never be hidden or inert while docked', () => {
    // Given
    const { fixture } = create(false);

    // Then
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBeNull();
    expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);
  });

  describe('focus capture/restore', () => {

    @Component({
      imports: [KitShellSidenav],
      template: `
        <button id="trigger">Trigger</button>
        <kit-shell-sidenav><a href="javascript:void(0)" id="link">Link</a></kit-shell-sidenav>
      `
    })
    class TestHost {
    }

    function createHost(mobile: boolean) {
      const mockBreakpoints: Partial<BreakpointObserver> = {
        observe: () => of<BreakpointState>({ matches: mobile, breakpoints: {} }),
        isMatched: () => mobile,
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: BreakpointObserver, useValue: mockBreakpoints },
          KitShellState,
        ]
      });
      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();
      const state = fixture.debugElement.query(By.directive(KitShellSidenav)).injector.get(KitShellState);
      return { fixture, state };
    }

    // Regression test: CdkTrapFocus's own `autoCapture` only fires on the directive's
    // ngAfterContentInit/ngOnDestroy, not on `enabled` toggling — which is all that happens
    // here since the sidenav stays mounted. Capture/restore must keep working across repeats.
    it('should move focus into the sidenav on open and restore it on close, repeatedly', async () => {
      // Given
      const { fixture, state } = createHost(true);
      const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger');
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#link');
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      // When
      state.openSidenav();
      fixture.detectChanges();
      await fixture.whenStable();

      // Then
      expect(document.activeElement).toBe(link);

      // When
      state.closeSidenav();
      fixture.detectChanges();

      // Then
      expect(document.activeElement).toBe(trigger);

      // When — open a second time, proving capture isn't a one-shot init-only effect
      state.openSidenav();
      fixture.detectChanges();
      await fixture.whenStable();

      // Then
      expect(document.activeElement).toBe(link);
    });

  });

});
