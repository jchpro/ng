import { Component, resource, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { openMenu, settle } from './table';

describe('testing helpers for tables', () => {

  @Component({
    selector: 'kit-testing-table',
    template: `<button type="button" id="trigger" (click)="clicks.update(n => n + 1)">Open</button><p id="out">{{ loaded.value() ?? 'loading' }}</p>`
  })
  class TestCmp {
    readonly clicks = signal(0);
    readonly loaded = resource({ loader: () => new Promise<string>(done => setTimeout(() => done('loaded'))) });
  }

  describe('settle()', () => {

    it('should wait for a resource and show what it loaded', async () => {
      // Given
      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).querySelector('#out')!.textContent).toBe('loading');

      // When
      await settle(fixture);

      // Then
      expect((fixture.nativeElement as HTMLElement).querySelector('#out')!.textContent).toBe('loaded');
    });

  });

  describe('openMenu()', () => {

    afterEach(() => document.querySelectorAll('.test-overlay').forEach(node => node.remove()));

    it('should click the trigger and give the items found in the overlay container', () => {
      // Given
      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      const container = document.createElement('div');
      container.className = 'cdk-overlay-container test-overlay';
      container.innerHTML = '<div class="kit-menu"><button class="kit-menu__item">One</button><button class="kit-menu__item">Two</button></div>';
      document.body.appendChild(container);

      // When
      const items = openMenu(fixture, (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('#trigger')!);

      // Then
      expect(fixture.componentInstance.clicks()).toBe(1);
      expect(items.map(item => item.textContent)).toEqual(['One', 'Two']);
    });

  });

});
