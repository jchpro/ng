import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { RouterEventsService } from './router-events.service';

describe('RouterEventsService', () => {
  let service: RouterEventsService;

  @Component({ selector: 'pro-cmp-a', template: '' }) class CmpA {}
  @Component({ selector: 'pro-cmp-b', template: '' }) class CmpB {}
  @Component({ selector: 'pro-cmp-b-1', template: '' }) class CmpB1 {}

  const routes: Routes = [
    { path: 'a', component: CmpA, data: { is: 'a' } },
    {
      path: 'b',
      component: CmpB,
      data: { is: 'b' },
      children: [
        { path: '1', component: CmpB1, data: { is: 'b1' } },
      ]
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot(routes)
      ]
    });
    service = TestBed.inject(RouterEventsService);
  });

  it('should emit event of provided type on navigation', async () => {
    // Given
    const router = TestBed.inject(Router);
    let emitted: any;
    const sub = service.onEvent(NavigationEnd)
      .subscribe(event => {
        emitted = event;
      });

    // When
    await router.navigateByUrl('/a');

    // Then
    expect(emitted).toBeInstanceOf(NavigationEnd);

    sub.unsubscribe();
  });

  it('should resolve activated route of the component to which the router navigated', async () => {
    // Given
    const router = TestBed.inject(Router);
    let emitted: any;
    service.onEvent(NavigationEnd)
      .pipe(service.resolveActivatedRoute())
      .subscribe(route => {
        emitted = route.snapshot.data;
      });

    // When
    await router.navigateByUrl('/b');

    // Then
    expect(emitted).toEqual({ is: 'b' });

    // When
    await router.navigateByUrl('/b/1');

    // Then
    expect(emitted).toEqual({ is: 'b1' });
  });

});
