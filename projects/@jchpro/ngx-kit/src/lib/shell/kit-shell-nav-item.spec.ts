import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KitShellNavItem } from './kit-shell-nav-item';

describe('KitShellNavItem', () => {

  @Component({
    imports: [KitShellNavItem, NgTemplateOutlet],
    template: `
      <kit-shell-nav-item #item>
        <span id="projected">Dashboard</span>
      </kit-shell-nav-item>
      <div id="outlet"><ng-container [ngTemplateOutlet]="item.content()"></ng-container></div>
    `
  })
  class TestHost {}

  function create() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const item = fixture.debugElement.query(By.directive(KitShellNavItem)).componentInstance as KitShellNavItem;
    return { fixture, item };
  }

  it('should default to no link, enabled, and no icon', () => {
    // Given
    const { item } = create();

    // Then
    expect(item.link()).toBeUndefined();
    expect(item.disabled()).toBe(false);
    expect(item.icon()).toBeUndefined();
  });

  it('should render nothing in its own host, only exposing the projected content as a template', () => {
    // Given
    const { fixture } = create();

    // Then
    expect(fixture.nativeElement.querySelector('kit-shell-nav-item').textContent?.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('#outlet #projected')?.textContent).toBe('Dashboard');
  });

});
