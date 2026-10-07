import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KitScheme, KitThemeService } from '@jchpro/ngx-kit';
import { LucideCircle, LucideCircleDot, LucideDynamicIcon } from '@lucide/angular';
import { ThemeColor, ThemesService } from '../../core/services/themes.service';
import { DocsThemeSelector } from './docs-theme-selector';

describe('DocsThemeSelector', () => {

  async function create() {
    const color = signal<ThemeColor>('jchPRO');
    const scheme = signal<KitScheme>('system');
    const changeSpy = jasmine.createSpy('change').and.callFake((next: ThemeColor) => color.set(next));
    const setSpy = jasmine.createSpy('set').and.callFake((next: KitScheme) => scheme.set(next));

    TestBed.configureTestingModule({
      providers: [
        { provide: ThemesService, useValue: { color: color.asReadonly(), change: changeSpy } },
        { provide: KitThemeService, useValue: { scheme: scheme.asReadonly(), set: setSpy } },
      ]
    });
    const fixture = TestBed.createComponent(DocsThemeSelector);
    fixture.detectChanges();
    return { fixture, color, scheme, changeSpy, setSpy };
  }

  async function settle(fixture: ComponentFixture<unknown>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function openMenu(fixture: ComponentFixture<unknown>) {
    fixture.nativeElement.querySelector('button')!.click();
    await settle(fixture);
  }

  function findButton(label: string): HTMLButtonElement {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('.kit-menu button'))
      .find(btn => btn.textContent?.includes(label))!;
  }

  function iconFor(fixture: any, button: HTMLButtonElement) {
    const svg = button.querySelector('svg')!;
    const debugEl = fixture.debugElement.query((el: any) => el.nativeElement === svg);
    return (debugEl.componentInstance as LucideDynamicIcon).lucideIcon();
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(el => el.replaceChildren());
  });

  it('should list colors and schemes in one menu under group labels', async () => {
    // Given
    const { fixture } = await create();

    // When
    await openMenu(fixture);

    // Then
    const labels = Array.from(document.querySelectorAll('.kit-menu .kit-menu__label')).map(el => el.textContent?.trim());
    expect(labels).toEqual(['Color', 'Scheme']);
  });

  it('should mark only the active color and scheme options as selected', async () => {
    // Given
    const { fixture } = await create();

    // When
    await openMenu(fixture);

    // Then
    expect(iconFor(fixture, findButton('jchPRO'))).toBe(LucideCircleDot);
    expect(iconFor(fixture, findButton('Azure & blue'))).toBe(LucideCircle);
    expect(iconFor(fixture, findButton('Green & yellow'))).toBe(LucideCircle);
    expect(iconFor(fixture, findButton('System'))).toBe(LucideCircleDot);
    expect(iconFor(fixture, findButton('Dark'))).toBe(LucideCircle);
    expect(iconFor(fixture, findButton('Light'))).toBe(LucideCircle);
  });

  it('should notify ThemesService and close the menu when a color is picked', async () => {
    // Given
    const { fixture, color, changeSpy } = await create();
    await openMenu(fixture);

    // When
    findButton('Azure & blue').click();
    await settle(fixture);

    // Then
    expect(changeSpy).toHaveBeenCalledOnceWith('azure');
    expect(color()).toBe('azure');
    expect(document.querySelector('.kit-menu')).toBeNull();
  });

  it('should notify KitThemeService and close the menu when a scheme is picked', async () => {
    // Given
    const { fixture, scheme, setSpy } = await create();
    await openMenu(fixture);

    // When
    findButton('Dark').click();
    await settle(fixture);

    // Then
    expect(setSpy).toHaveBeenCalledOnceWith('dark');
    expect(scheme()).toBe('dark');
    expect(document.querySelector('.kit-menu')).toBeNull();
  });

});
