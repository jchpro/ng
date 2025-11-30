import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { MediaRangesConfig } from './media-ranges';

import { MediaRangesObserverBase } from './media-ranges-observer-base';

describe('MediaRangesObserverService', () => {
  let service: Service;

  const config = {
    sm: ['1', '2'],
    md: ['3', '4', '5'],
    lg: ['6']
  } as const satisfies MediaRangesConfig;

  class Service extends MediaRangesObserverBase<typeof config> {
    constructor() {
      super(config);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BreakpointObserver,
        {
          provide: Service,
          useFactory: () => new Service()
        }
      ]
    });
    service = TestBed.inject(Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should properly map ranges to queries', () => {
    // When
    let queries = service.mapToQueries('sm');

    // Then
    expect(queries).toEqual(['1', '2']);

    // When
    queries = service.mapToQueries(['md', 'lg']);

    // Then
    expect(queries).toEqual(['3', '4', '5', '6']);

    // When
    queries = service.mapToQueries(['lg', 'lg']);

    // Then
    expect(queries).toEqual(['6']);
  });

  // The rest is mostly wrapping of the BreakpointObserver, so we don't need to test it.

});
