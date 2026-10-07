import { TestBed } from '@angular/core/testing';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { KitLoadingService } from './kit-loading.service';
import { provideKitNavigationLoading } from './provide-kit-navigation-loading';

describe('provideKitNavigationLoading', () => {

  let events: Subject<Event>;
  let ends: jasmine.Spy[];
  let begin: jasmine.Spy;

  beforeEach(() => {
    events = new Subject<Event>();
    ends = [];
    begin = jasmine.createSpy('begin').and.callFake(() => {
      const end = jasmine.createSpy(`end ${ends.length}`);
      ends.push(end);
      return end;
    });
    TestBed.configureTestingModule({
      providers: [
        provideKitNavigationLoading(),
        { provide: Router, useValue: { events } },
        { provide: KitLoadingService, useValue: { begin } }
      ]
    });
    TestBed.inject(Router);
  });

  it('should start loading on NavigationStart', () => {
    // When
    events.next(new NavigationStart(1, '/a'));

    // Then
    expect(begin).toHaveBeenCalledTimes(1);
    expect(ends[0]).not.toHaveBeenCalled();
  });

  const endings: [string, (id: number) => Event][] = [
    ['NavigationEnd', id => new NavigationEnd(id, '/a', '/a')],
    ['NavigationCancel', id => new NavigationCancel(id, '/a', 'cancelled')],
    ['NavigationError', id => new NavigationError(id, '/a', new Error('boom'))],
    ['NavigationSkipped', id => new NavigationSkipped(id, '/a', 'skipped')]
  ];

  for (const [name, create] of endings) {
    it(`should stop loading on ${name}`, () => {
      // Given
      events.next(new NavigationStart(1, '/a'));

      // When
      events.next(create(1));

      // Then
      expect(ends[0]).toHaveBeenCalledTimes(1);
    });
  }

  it('should end each navigation on its own, even when a superseded one is cancelled late', () => {
    // Given
    events.next(new NavigationStart(1, '/a'));
    events.next(new NavigationStart(2, '/b'));

    // When
    events.next(new NavigationCancel(1, '/a', 'superseded'));

    // Then
    expect(ends[0]).toHaveBeenCalledTimes(1);
    expect(ends[1]).not.toHaveBeenCalled();

    // When
    events.next(new NavigationEnd(2, '/b', '/b'));

    // Then
    expect(ends[1]).toHaveBeenCalledTimes(1);
  });

  it('should ignore events of navigations it never saw start', () => {
    // When
    events.next(new NavigationEnd(9, '/a', '/a'));

    // Then
    expect(begin).not.toHaveBeenCalled();
  });

});
