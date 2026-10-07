import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitLoadingBar, KIT_LOADING_OPTIONS } from './kit-loading-bar';
import { KitLoadingService } from './kit-loading.service';

describe('KitLoadingBar', () => {

  const SHOW_DELAY = 100;
  const MIN_VISIBLE = 300;

  let isLoading: ReturnType<typeof signal<boolean>>;

  function create() {
    isLoading = signal(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: KitLoadingService, useValue: { isLoading } },
        { provide: KIT_LOADING_OPTIONS, useValue: { showDelay: SHOW_DELAY, minVisible: MIN_VISIBLE } }
      ]
    });
    const fixture = TestBed.createComponent(KitLoadingBar);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const setLoading = (loading: boolean) => {
      isLoading.set(loading);
      fixture.detectChanges();
    };
    const tick = (ms: number) => {
      jasmine.clock().tick(ms);
      fixture.detectChanges();
    };
    const visible = () => element.classList.contains('kit-loading-bar--visible');
    return { element, setLoading, tick, visible };
  }

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be hidden and decorative initially', () => {
    // Given
    const { element, visible } = create();

    // Then
    expect(visible()).toBeFalse();
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('should only appear once loading has lasted longer than the show delay', () => {
    // Given
    const { setLoading, tick, visible } = create();

    // When
    setLoading(true);
    tick(SHOW_DELAY - 1);

    // Then
    expect(visible()).toBeFalse();

    // When
    tick(1);

    // Then
    expect(visible()).toBeTrue();
  });

  it('should never appear for an operation that ends within the show delay', () => {
    // Given
    const { setLoading, tick, visible } = create();

    // When
    setLoading(true);
    tick(SHOW_DELAY - 1);
    setLoading(false);
    tick(SHOW_DELAY * 10);

    // Then
    expect(visible()).toBeFalse();
  });

  it('should stay up for the minimum visible time after loading ends', () => {
    // Given
    const { setLoading, tick, visible } = create();
    setLoading(true);
    tick(SHOW_DELAY);
    tick(50);

    // When
    setLoading(false);
    tick(MIN_VISIBLE - 50 - 1);

    // Then
    expect(visible()).toBeTrue();

    // When
    tick(1);

    // Then
    expect(visible()).toBeFalse();
  });

  it('should hide right away when loading ends after the minimum visible time', () => {
    // Given
    const { setLoading, tick, visible } = create();
    setLoading(true);
    tick(SHOW_DELAY);
    tick(MIN_VISIBLE + 100);

    // When
    setLoading(false);
    tick(0);

    // Then
    expect(visible()).toBeFalse();
  });

  it('should stay up when loading restarts while waiting to hide', () => {
    // Given
    const { setLoading, tick, visible } = create();
    setLoading(true);
    tick(SHOW_DELAY);
    setLoading(false);
    tick(MIN_VISIBLE / 2);

    // When
    setLoading(true);
    tick(MIN_VISIBLE * 2);

    // Then
    expect(visible()).toBeTrue();
  });

});
