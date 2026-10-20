import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ScriptLoaderService, ScriptLoadError } from './script-loader.service';

describe('ScriptLoaderService', () => {

  // A document of its own: its scripts are never fetched, so the tests decide when one loads or fails
  function create() {
    const document = globalThis.document.implementation.createHTMLDocument('test');
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: document }] });
    const scripts = () => Array.from(document.querySelectorAll('script'));
    const settle = (script: HTMLScriptElement, event: 'load' | 'error') => script.dispatchEvent(new Event(event));
    return { service: TestBed.inject(ScriptLoaderService), document, scripts, settle };
  }

  /** What a promise is right now, without waiting for it */
  async function state(promise: Promise<unknown>): Promise<'pending' | 'resolved' | 'rejected'> {
    return Promise.race([
      promise.then(() => 'resolved' as const, () => 'rejected' as const),
      new Promise<'pending'>(resolve => setTimeout(() => resolve('pending'), 0))
    ]);
  }

  it('should append a script with the URL to the head and resolve once it has loaded', async () => {
    // Given
    const { service, scripts, settle } = create();

    // When
    const loading = service.load('https://example.com/sdk.js');

    // Then
    expect(scripts().length).toBe(1);
    expect(scripts()[0].parentElement!.tagName).toBe('HEAD');
    expect(scripts()[0].getAttribute('src')).toBe('https://example.com/sdk.js');
    expect(await state(loading)).toBe('pending');

    // When
    settle(scripts()[0], 'load');

    // Then
    expect(await state(loading)).toBe('resolved');
  });

  it('should give the script the id and the attributes it is asked for', () => {
    // Given
    const { service, scripts } = create();

    // When
    service.load('https://example.com/sdk.js', { id: 'sdk', attributes: { integrity: 'sha384-abc', crossorigin: 'anonymous', 'data-site': 'x' } });

    // Then
    const script = scripts()[0];
    expect(script.id).toBe('sdk');
    expect(script.getAttribute('integrity')).toBe('sha384-abc');
    expect(script.getAttribute('crossorigin')).toBe('anonymous');
    expect(script.getAttribute('data-site')).toBe('x');
  });

  it('should reject with a ScriptLoadError naming the URL when the script fails, and take the element out', async () => {
    // Given
    const { service, scripts, settle } = create();
    const loading = service.load('https://example.com/missing.js');

    // When
    settle(scripts()[0], 'error');

    // Then
    const error = await loading.catch(caught => caught);
    expect(error).toBeInstanceOf(ScriptLoadError);
    expect((error as ScriptLoadError).url).toBe('https://example.com/missing.js');
    expect((error as ScriptLoadError).message).toContain('https://example.com/missing.js');
    expect(scripts().length).toBe(0);
  });

  it('should hand the same promise, and add one element, to calls for a URL while it is still loading', async () => {
    // Given
    const { service, scripts, settle } = create();

    // When
    const first = service.load('https://example.com/sdk.js');
    const second = service.load('https://example.com/sdk.js');

    // Then: the second does not resolve ahead of the script
    expect(second).toBe(first);
    expect(scripts().length).toBe(1);
    expect(await state(second)).toBe('pending');

    // When
    settle(scripts()[0], 'load');

    // Then
    expect(await state(first)).toBe('resolved');
    expect(await state(second)).toBe('resolved');
  });

  it('should resolve at once, without another element, for a URL that has loaded', async () => {
    // Given
    const { service, scripts, settle } = create();
    const first = service.load('https://example.com/sdk.js');
    settle(scripts()[0], 'load');
    await first;

    // When
    const again = service.load('https://example.com/sdk.js');

    // Then
    expect(await state(again)).toBe('resolved');
    expect(scripts().length).toBe(1);
  });

  it('should resolve for a script that is already in the document by its src', async () => {
    // Given
    const { service, document, scripts } = create();
    const existing = document.createElement('script');
    existing.setAttribute('src', 'https://example.com/sdk.js');
    document.head.appendChild(existing);

    // When
    const loading = service.load('https://example.com/sdk.js');

    // Then
    expect(await state(loading)).toBe('resolved');
    expect(scripts().length).toBe(1);
  });

  it('should resolve for a script that is already in the document by its id', async () => {
    // Given
    const { service, document, scripts } = create();
    const existing = document.createElement('script');
    existing.id = 'sdk';
    document.head.appendChild(existing);

    // When
    const loading = service.load('https://example.com/other-url.js', { id: 'sdk' });

    // Then
    expect(await state(loading)).toBe('resolved');
    expect(scripts().length).toBe(1);
  });

  it('should not take an element that only has the id of a script for a script', async () => {
    // Given
    const { service, document, scripts } = create();
    const div = document.createElement('div');
    div.id = 'sdk';
    document.body.appendChild(div);

    // When
    const loading = service.load('https://example.com/sdk.js', { id: 'sdk' });

    // Then
    expect(await state(loading)).toBe('pending');
    expect(scripts().length).toBe(1);
  });

  it('should try again after a failure, with a new element', async () => {
    // Given
    const { service, scripts, settle } = create();
    const failed = service.load('https://example.com/flaky.js');
    settle(scripts()[0], 'error');
    await failed.catch(() => undefined);

    // When
    const retry = service.load('https://example.com/flaky.js');

    // Then
    expect(retry).not.toBe(failed);
    expect(scripts().length).toBe(1);

    // When
    settle(scripts()[0], 'load');

    // Then
    expect(await state(retry)).toBe('resolved');
  });

  it('should load different URLs independently', async () => {
    // Given
    const { service, scripts, settle } = create();

    // When
    const first = service.load('https://example.com/a.js');
    const second = service.load('https://example.com/b.js');
    settle(scripts()[1], 'load');

    // Then
    expect(scripts().length).toBe(2);
    expect(await state(first)).toBe('pending');
    expect(await state(second)).toBe('resolved');
  });

});
