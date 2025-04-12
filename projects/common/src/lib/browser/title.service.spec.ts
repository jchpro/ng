import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule, Routes } from '@angular/router';
import { provideRouteTitleFormat, RouteTitleData, RouteTitleFormatFn, TitleService } from './title.service';

describe('TitleService', () => {
  let service: TitleService;

  @Component({ selector: 'pro-cmp', template: '' }) class Cmp {}

  const routes: Routes = [
    { path: 'path', component: Cmp, data: { title: 'from route' } as RouteTitleData },
  ];

  function configureModule(formatFn?: RouteTitleFormatFn) {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot(routes),
      ],
      providers: formatFn ? [
        provideRouteTitleFormat(formatFn),
      ] : []
    });
    service = TestBed.inject(TitleService);
  }

  it('should call `setTitle` on Angular\'s service', () => {
    // Given
    configureModule();
    const setSpy = spyOn(TestBed.inject(Title), 'setTitle');

    // When
    service.set('hello');

    // Then
    expect(setSpy).toHaveBeenCalledWith('hello');
  });

  it('should format the title if format function was provided', () => {
    // Given
    configureModule(input => `${input} world`);

    // When
    const formatted = service.format('hello');

    // Then
    expect(formatted).toBe('hello world');
  });

  it('should set the title after navigation to a component with route title data', async () => {
    // Given
    configureModule();
    const router = TestBed.inject(Router);
    const setSpy = spyOn(TestBed.inject(Title), 'setTitle');

    // When
    await router.navigate(['/path']);

    // Then
    expect(setSpy).toHaveBeenCalledWith('from route');
  });

});
