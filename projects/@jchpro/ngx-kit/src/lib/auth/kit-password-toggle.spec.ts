import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitIcon } from '../icon/kit-icon.directive';
import { KIT_AUTH_LABELS_PL, provideKitAuthLabels } from './kit-auth-labels';
import { KitPasswordToggle } from './kit-password-toggle';

@Component({
  imports: [KitPasswordToggle, KitIcon],
  template: `
    <kit-password-toggle [showLabel]="showLabel">
      <input type="password">
      @if (customIcons) {
        <span kitIcon="show" class="custom-show">S</span>
      }
      @if (customIcons) {
        <span kitIcon="hide" class="custom-hide">H</span>
      }
    </kit-password-toggle>`
})
class Host {
  showLabel?: string;
  customIcons = false;
}

describe('KitPasswordToggle', () => {

  function create(configure: (host: Host) => void = () => {}, providers: object[] = []) {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(Host);
    configure(fixture.componentInstance);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    return { fixture, input, button };
  }

  it('should start with the password masked and offer to show it', () => {
    // Given
    const { input, button } = create();

    // Then
    expect(input.type).toBe('password');
    expect(button().getAttribute('aria-label')).toBe('Show password');
  });

  it('should reveal the password on click and offer to hide it', () => {
    // Given
    const { fixture, input, button } = create();

    // When
    button().click();
    fixture.detectChanges();

    // Then
    expect(input.type).toBe('text');
    expect(button().getAttribute('aria-label')).toBe('Hide password');
  });

  it('should mask the password again on a second click', () => {
    // Given
    const { fixture, input, button } = create();

    // When
    button().click();
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();

    // Then
    expect(input.type).toBe('password');
    expect(button().getAttribute('aria-label')).toBe('Show password');
  });

  it('should not submit a form it sits in', () => {
    // Given
    const { button } = create();

    // Then
    expect(button().type).toBe('button');
  });

  it('should take its names from the labels', () => {
    // Given
    const { button } = create(() => {}, [provideKitAuthLabels(KIT_AUTH_LABELS_PL)]);

    // Then
    expect(button().getAttribute('aria-label')).toBe('Pokaż hasło');
  });

  it('should prefer a label set on the instance', () => {
    // Given
    const { button } = create(host => host.showLabel = 'Reveal');

    // Then
    expect(button().getAttribute('aria-label')).toBe('Reveal');
  });

  it('should draw its built-in icon when none is projected', () => {
    // Given
    const { fixture, button } = create();

    // Then
    expect(button().querySelector('svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.custom-show')).toBeNull();
  });

  it('should show a projected icon in place of the built-in one, for the matching state', () => {
    // Given
    const { fixture, button } = create(host => host.customIcons = true);
    expect(button().querySelector('.custom-show')).toBeTruthy();
    expect(button().querySelector('svg')).toBeNull();

    // When
    button().click();
    fixture.detectChanges();

    // Then
    expect(button().querySelector('.custom-hide')).toBeTruthy();
    expect(button().querySelector('.custom-show')).toBeNull();
  });

});
