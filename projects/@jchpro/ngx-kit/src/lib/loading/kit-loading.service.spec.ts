import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { KitLoadingService } from './kit-loading.service';

describe('KitLoadingService', () => {

  let service: KitLoadingService;

  beforeEach(() => {
    service = TestBed.inject(KitLoadingService);
  });

  it('should not be loading initially', () => {
    expect(service.isLoading()).toBeFalse();
  });

  it('should be loading between begin() and its done callback', () => {
    // When
    const done = service.begin();

    // Then
    expect(service.isLoading()).toBeTrue();

    // When
    done();

    // Then
    expect(service.isLoading()).toBeFalse();
  });

  it('should stay loading until the last of overlapping operations ends', () => {
    // Given
    const first = service.begin();
    const second = service.begin();

    // When
    first();

    // Then
    expect(service.isLoading()).toBeTrue();

    // When
    second();

    // Then
    expect(service.isLoading()).toBeFalse();
  });

  it('should ignore a done callback called more than once', () => {
    // Given
    const first = service.begin();
    service.begin();

    // When
    first();
    first();

    // Then
    expect(service.isLoading()).toBeTrue();
  });

  describe('track(promise)', () => {

    it('should be loading until the promise resolves, and pass its value through', async () => {
      // Given
      let resolve!: (value: string) => void;
      const promise = new Promise<string>(res => resolve = res);

      // When
      const tracked = service.track(promise);

      // Then
      expect(service.isLoading()).toBeTrue();

      // When
      resolve('value');

      // Then
      await expectAsync(tracked).toBeResolvedTo('value');
      expect(service.isLoading()).toBeFalse();
    });

    it('should stop loading when the promise rejects, and pass the error through', async () => {
      // Given
      const error = new Error('boom');

      // When
      const tracked = service.track(Promise.reject(error));

      // Then
      await expectAsync(tracked).toBeRejectedWith(error);
      expect(service.isLoading()).toBeFalse();
    });

  });

  describe('track(observable)', () => {

    it('should not be loading until subscribed', () => {
      // When
      service.track(new Subject<number>());

      // Then
      expect(service.isLoading()).toBeFalse();
    });

    it('should be loading from subscription until completion', () => {
      // Given
      const source = new Subject<number>();
      const emitted: number[] = [];

      // When
      service.track(source).subscribe(value => emitted.push(value));

      // Then
      expect(service.isLoading()).toBeTrue();

      // When
      source.next(1);
      source.complete();

      // Then
      expect(emitted).toEqual([1]);
      expect(service.isLoading()).toBeFalse();
    });

    it('should stop loading when the observable errors', () => {
      // Given
      const source = new Subject<number>();
      const errors: unknown[] = [];

      // When
      service.track(source).subscribe({ error: error => errors.push(error) });
      source.error('boom');

      // Then
      expect(errors).toEqual(['boom']);
      expect(service.isLoading()).toBeFalse();
    });

    it('should stop loading when unsubscribed early', () => {
      // Given
      const subscription = service.track(new Subject<number>()).subscribe();

      // When
      subscription.unsubscribe();

      // Then
      expect(service.isLoading()).toBeFalse();
    });

    it('should count each subscription separately', () => {
      // Given
      const source = new Subject<number>();
      const tracked = service.track(source);
      const first = tracked.subscribe();
      const second = tracked.subscribe();

      // When
      first.unsubscribe();

      // Then
      expect(service.isLoading()).toBeTrue();

      // When
      second.unsubscribe();

      // Then
      expect(service.isLoading()).toBeFalse();
    });

  });

});
