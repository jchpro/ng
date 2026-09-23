import { HttpContext, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { KIT_LOADING_SKIP, kitLoadingInterceptor, kitLoadingSkipContext } from './kit-loading.interceptor';
import { KitLoadingService } from './kit-loading.service';

describe('kitLoadingInterceptor', () => {

  function run(request: HttpRequest<unknown>) {
    const tracked = of(new HttpResponse({ status: 200 }));
    const track = jasmine.createSpy('track').and.returnValue(tracked);
    TestBed.configureTestingModule({
      providers: [{ provide: KitLoadingService, useValue: { track } }]
    });
    const handled = of(new HttpResponse({ status: 204 }));
    const next = jasmine.createSpy('next').and.returnValue(handled);
    const result = TestBed.runInInjectionContext(() => kitLoadingInterceptor(request, next)) as Observable<unknown>;
    return { result, track, next, tracked, handled };
  }

  it('should track the request through the loading service', () => {
    // Given
    const request = new HttpRequest('GET', '/api/users');

    // When
    const { result, track, next, tracked, handled } = run(request);

    // Then
    expect(next).toHaveBeenCalledWith(request);
    expect(track).toHaveBeenCalledWith(handled);
    expect(result).toBe(tracked);
  });

  it('should leave requests flagged with KIT_LOADING_SKIP untracked', () => {
    // Given
    const request = new HttpRequest('GET', '/api/poll', null, {
      context: new HttpContext().set(KIT_LOADING_SKIP, true)
    });

    // When
    const { result, track, handled } = run(request);

    // Then
    expect(track).not.toHaveBeenCalled();
    expect(result).toBe(handled);
  });

  it('should build a skip context with kitLoadingSkipContext()', () => {
    expect(kitLoadingSkipContext().get(KIT_LOADING_SKIP)).toBeTrue();
  });

});
