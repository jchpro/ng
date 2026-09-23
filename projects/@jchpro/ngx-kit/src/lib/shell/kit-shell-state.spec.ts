import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { KitShellState } from './kit-shell-state';

describe('KitShellState', () => {
  let service: KitShellState;
  let matches$: BehaviorSubject<BreakpointState>;

  function create(initialMatches: boolean) {
    matches$ = new BehaviorSubject<BreakpointState>({ matches: initialMatches, breakpoints: {} });
    const mockBreakpoints: Partial<BreakpointObserver> = {
      observe: () => matches$.asObservable(),
      isMatched: () => initialMatches,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpoints },
        KitShellState,
      ]
    });
    service = TestBed.inject(KitShellState);
  }

  it('should be docked when the mobile query does not match', () => {
    // Given
    create(false);

    // Then
    expect(service.sidenavMode()).toBe('docked');
  });

  it('should be overlay when the mobile query matches', () => {
    // Given
    create(true);

    // Then
    expect(service.sidenavMode()).toBe('overlay');
  });

  it('should react to the breakpoint changing at runtime', () => {
    // Given
    create(false);

    // When
    matches$.next({ matches: true, breakpoints: {} });

    // Then
    expect(service.sidenavMode()).toBe('overlay');
  });

  it('should open, close and toggle the sidenav', () => {
    // Given
    create(true);
    expect(service.sidenavOpen()).toBe(false);

    // When
    service.openSidenav();

    // Then
    expect(service.sidenavOpen()).toBe(true);

    // When
    service.toggleSidenav();

    // Then
    expect(service.sidenavOpen()).toBe(false);

    // When
    service.closeSidenav();

    // Then
    expect(service.sidenavOpen()).toBe(false);
  });

});
