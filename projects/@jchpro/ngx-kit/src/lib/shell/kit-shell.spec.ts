import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { KitLoadingService } from '../loading/kit-loading.service';
import { KitShell } from './kit-shell';
import { KitShellRoot } from './kit-shell-root.directive';
import { KitShellState } from './kit-shell-state';

describe('KitShell', () => {

  @Component({
    imports: [KitShell],
    template: `<kit-shell><div id="content">hi</div></kit-shell>`
  })
  class TestHost {
  }

  @Component({
    imports: [KitShell, KitShellRoot],
    template: `<div kitShellRoot><kit-shell><div id="content">hi</div></kit-shell></div>`
  })
  class TestHostWithRoot {
  }

  function create(mobile: boolean, hostType: typeof TestHost | typeof TestHostWithRoot = TestHost) {
    const mockBreakpoints: Partial<BreakpointObserver> = {
      observe: () => of<BreakpointState>({ matches: mobile, breakpoints: {} }),
      isMatched: () => mobile,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpoints },
      ]
    });
    const fixture = TestBed.createComponent(hostType);
    fixture.detectChanges();
    const shellState = fixture.debugElement.query(By.directive(KitShell)).injector.get(KitShellState);
    return { fixture, shellState };
  }

  it('should project default content into the main area', () => {
    // Given
    const { fixture } = create(false);

    // Then
    expect(fixture.nativeElement.querySelector('#content')).toBeTruthy();
  });

  it('should only show the scrim while the sidenav is open in overlay mode', () => {
    // Given
    const { fixture, shellState } = create(true);
    expect(fixture.nativeElement.querySelector('.kit-shell__scrim')).toBeNull();

    // When
    shellState.openSidenav();
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell__scrim')).toBeTruthy();

    // When
    shellState.closeSidenav();
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell__scrim')).toBeNull();
  });

  it('should never show the scrim while docked', () => {
    // Given
    const { fixture, shellState } = create(false);

    // When
    shellState.openSidenav();
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement.querySelector('.kit-shell__scrim')).toBeNull();
  });

  it('should render the global loading bar', () => {
    // Given
    const { fixture } = create(false);

    // Then
    expect(fixture.nativeElement.querySelector('kit-loading-bar')).toBeTruthy();
  });

  it('should mark the main area as busy while the loading service is loading', () => {
    // Given
    const { fixture } = create(false);
    const main: HTMLElement = fixture.nativeElement.querySelector('main');
    expect(main.hasAttribute('aria-busy')).toBeFalse();

    // When
    const done = TestBed.inject(KitLoadingService).begin();
    fixture.detectChanges();

    // Then
    expect(main.getAttribute('aria-busy')).toBe('true');

    // When
    done();
    fixture.detectChanges();

    // Then
    expect(main.hasAttribute('aria-busy')).toBeFalse();
  });

  it('should warn to the console when no ancestor has KitShellRoot applied', () => {
    // Given
    spyOn(console, 'warn');

    // When
    create(false, TestHost);

    // Then
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('KitShellRoot'));
  });

  it('should not warn when an ancestor has KitShellRoot applied', () => {
    // Given
    spyOn(console, 'warn');

    // When
    create(false, TestHostWithRoot);

    // Then
    expect(console.warn).not.toHaveBeenCalled();
  });

});
