import { ApplicationRef } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { KIT_TOAST_LABELS_PL, provideKitToastLabels } from './kit-toast-labels';
import { KitToastService } from './kit-toast.service';
import { KitToastCloseReason, KitToastConfig, provideKitToasts } from './kit-toast.types';

describe('KitToastService', () => {

  function setup(config?: KitToastConfig, labels?: Parameters<typeof provideKitToastLabels>[0]) {
    TestBed.configureTestingModule({
      providers: [...(config ? [provideKitToasts(config)] : []), ...(labels ? [provideKitToastLabels(labels)] : [])]
    });
    const toasts = TestBed.inject(KitToastService);
    const app = TestBed.inject(ApplicationRef);
    // Time passes, then the page is rendered
    const settle = (ms = 0) => {
      tick(ms);
      app.tick();
    };
    const shown = () => Array.from(document.querySelectorAll<HTMLElement>('.kit-toast'));
    const messages = () => shown().map(el => el.querySelector('.kit-toast__message')!.textContent!.trim());
    // Where each message is, which is how it is announced
    const region = (message: string) => shown()
      .find(el => el.textContent!.includes(message))!.closest('[role]')!.getAttribute('role');
    const reasons: Record<string, KitToastCloseReason> = {};
    const track = (name: string, ref: { closed: Promise<KitToastCloseReason> }) => ref.closed.then(reason => reasons[name] = reason);
    return { toasts, settle, shown, messages, region, reasons, track };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(el => el.replaceChildren());
  });

  it('should show a toast once the live regions have had a moment, in the polite one for a success', fakeAsync(() => {
    // Given
    const { toasts, settle, shown, messages, region } = setup();

    // When
    toasts.success('Saved.');
    settle();

    // Then: not yet, the regions are only just in the page
    expect(shown().length).toBe(0);

    // When
    settle(50);

    // Then
    expect(messages()).toEqual(['Saved.']);
    expect(region('Saved.')).toBe('status');
    expect(shown()[0].classList).toContain('kit-toast--success');
    flush();
  }));

  it('should announce an error at once, in the alert region', fakeAsync(() => {
    // Given
    const { toasts, settle, region } = setup();

    // When
    toasts.error('Could not save.');
    settle(50);

    // Then
    expect(region('Could not save.')).toBe('alert');
    toasts.dismissAll();
    flush();
  }));

  it('should close a success after 4 s and an info after 5 s, telling why', fakeAsync(() => {
    // Given
    const { toasts, settle, messages, track, reasons } = setup();
    track('success', toasts.success('Saved.'));
    track('info', toasts.info('FYI'));
    settle(50);

    // When
    settle(3999);

    // Then
    expect(messages()).toEqual(['Saved.', 'FYI']);

    // When
    settle(1);

    // Then
    expect(messages()).toEqual(['FYI']);
    expect(reasons['success']).toBe('timeout');

    // When
    settle(1000);

    // Then
    expect(messages()).toEqual([]);
    expect(reasons['info']).toBe('timeout');
  }));

  it('should keep an error until it is closed', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup();
    toasts.error('Could not save.');
    settle(50);

    // When
    settle(10 * 60 * 1000);

    // Then
    expect(messages()).toEqual(['Could not save.']);
    toasts.dismissAll();
    flush();
  }));

  it('should keep a toast with an action for at least 8 s', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup();
    toasts.success('Deleted.', { action: 'Undo' });
    settle(50);

    // When
    settle(7999);

    // Then
    expect(messages()).toEqual(['Deleted.']);

    // When
    settle(1);

    // Then
    expect(messages()).toEqual([]);
  }));

  it('should use the duration of the call as it is, also with an action', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup();
    toasts.success('Deleted.', { action: 'Undo', duration: 1000 });
    toasts.error('Soon gone', { duration: 2000 });
    settle(50);

    // When
    settle(1000);

    // Then
    expect(messages()).toEqual(['Soon gone']);

    // When
    settle(1000);

    // Then
    expect(messages()).toEqual([]);
  }));

  it('should keep any toast until it is closed for a duration of null', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup();
    toasts.success('Stays', { duration: null });
    settle(50);

    // When
    settle(60 * 1000);

    // Then
    expect(messages()).toEqual(['Stays']);
    toasts.dismissAll();
    flush();
  }));

  it('should refuse a duration that is not a positive number of milliseconds', () => {
    // Given
    const { toasts } = setup();

    // Then
    expect(() => toasts.success('x', { duration: 0 })).toThrowError(/positive number/);
    expect(() => toasts.success('x', { duration: -5 })).toThrowError(/positive number/);
    expect(() => toasts.success('x', { duration: NaN })).toThrowError(/positive number/);
  });

  it('should take the durations from provideKitToasts, and let the call override them', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup({ durations: { success: 1000, error: 2000, info: null }, actionMinDuration: 3000 });
    toasts.success('a');
    toasts.error('b');
    toasts.info('c');
    toasts.success('d', { action: 'Undo' });
    toasts.success('e', { duration: 500 });
    settle(50);

    // When
    settle(500);

    // Then: the polite region comes before the alert one, so the error is listed last
    expect(messages()).toEqual(['a', 'c', 'd', 'b']);

    // When
    settle(500);

    // Then
    expect(messages()).toEqual(['c', 'd', 'b']);

    // When
    settle(1000);

    // Then
    expect(messages()).toEqual(['c', 'd']);

    // When
    settle(1000);

    // Then: the action raised 1 s to 3 s
    expect(messages()).toEqual(['c']);
    toasts.dismissAll();
    flush();
  }));

  it('should stop the clock while the pointer is over a toast and go on from what is left, at least a second', fakeAsync(() => {
    // Given
    const { toasts, settle, shown, messages } = setup();
    toasts.success('Saved.');
    settle(50);
    settle(3900);

    // When
    shown()[0].dispatchEvent(new MouseEvent('mouseenter'));
    settle(60 * 1000);

    // Then
    expect(messages()).toEqual(['Saved.']);

    // When
    shown()[0].dispatchEvent(new MouseEvent('mouseleave'));
    settle(999);

    // Then
    expect(messages()).toEqual(['Saved.']);

    // When
    settle(1);

    // Then
    expect(messages()).toEqual([]);
  }));

  it('should hold a toast while the focus is on one of its buttons', fakeAsync(() => {
    // Given
    const { toasts, settle, shown, messages } = setup();
    toasts.success('Saved.', { action: 'Undo' });
    settle(50);

    // When: the focus goes in, moves between the buttons, and leaves
    const toast = shown()[0];
    const [action, dismiss] = Array.from(toast.querySelectorAll('button'));
    toast.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    settle(60 * 1000);
    action.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: dismiss }));
    settle(60 * 1000);

    // Then
    expect(messages()).toEqual(['Saved.']);

    // When: the focus leaves, and the clock goes on from what was left
    dismiss.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    settle(7999);

    // Then
    expect(messages()).toEqual(['Saved.']);

    // When
    settle(1);

    // Then
    expect(messages()).toEqual([]);
  }));

  it('should close with dismissed from the close button, with action from the action button', fakeAsync(() => {
    // Given
    const { toasts, settle, shown, track, reasons } = setup();
    track('closed', toasts.error('Could not save.'));
    track('acted', toasts.info('Deleted.', { action: 'Undo' }));
    settle(50);

    // When
    const toast = (message: string) => shown().find(el => el.textContent!.includes(message))!;
    toast('Could not save.').querySelector<HTMLButtonElement>('.kit-toast__dismiss')!.click();
    toast('Deleted.').querySelector<HTMLButtonElement>('.kit-toast__action')!.click();
    settle();

    // Then
    expect(reasons['closed']).toBe('dismissed');
    expect(reasons['acted']).toBe('action');
    expect(shown().length).toBe(0);
  }));

  it('should close the toast of dismiss() and of the Escape key', fakeAsync(() => {
    // Given
    const { toasts, settle, shown, messages, track, reasons } = setup();
    const ref = toasts.error('One');
    track('one', ref);
    toasts.error('Two');
    settle(50);

    // When
    shown()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ref.dismiss();
    ref.dismiss();
    settle();

    // Then
    expect(messages()).toEqual([]);
    expect(reasons['one']).toBe('dismissed');
  }));

  it('should show at most max toasts, the rest wait for room', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup({ max: 2 });
    const first = toasts.error('1');
    toasts.error('2');
    toasts.error('3');
    settle(50);

    // Then
    expect(messages()).toEqual(['1', '2']);

    // When
    first.dismiss();
    settle();

    // Then
    expect(messages()).toEqual(['2', '3']);
    toasts.dismissAll();
    flush();
  }));

  it('should not start the clock of a toast that is still waiting', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup({ max: 1 });
    const first = toasts.error('1');
    toasts.success('2');
    settle(50);
    settle(60 * 1000);

    // When
    first.dismiss();
    settle();

    // Then: it has all of its 4 s
    settle(3999);
    expect(messages()).toEqual(['2']);
    settle(1);
    expect(messages()).toEqual([]);
  }));

  it('should close every toast, the waiting ones too, with dismissed', fakeAsync(() => {
    // Given
    const { toasts, settle, messages, track, reasons } = setup({ max: 1 });
    track('a', toasts.error('a'));
    track('b', toasts.error('b'));
    settle(50);

    // When
    toasts.dismissAll();
    settle();

    // Then
    expect(messages()).toEqual([]);
    expect(reasons).toEqual({ a: 'dismissed', b: 'dismissed' });
  }));

  it('should close a toast before it ever showed, without it showing later', fakeAsync(() => {
    // Given
    const { toasts, settle, messages } = setup();
    const ref = toasts.error('Too quick');

    // When
    ref.dismiss();
    settle(50);

    // Then
    expect(messages()).toEqual([]);
  }));

  it('should name the region and the close button from the labels', fakeAsync(() => {
    // Given
    const { toasts, settle, shown } = setup(undefined, KIT_TOAST_LABELS_PL);

    // When
    toasts.error('Błąd');
    settle(50);

    // Then
    expect(document.querySelector('.kit-toasts')!.getAttribute('aria-label')).toBe('Powiadomienia');
    expect(shown()[0].querySelector('.kit-toast__dismiss')!.getAttribute('aria-label')).toBe('Zamknij');
    toasts.dismissAll();
    flush();
  }));

});
