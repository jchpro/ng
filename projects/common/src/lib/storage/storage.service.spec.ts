import { getMockStorage } from './mock-storage.spec';
import { StorageService } from './storage.service';

describe('StorageService', () => {

  it('should spawn children with proper namespaces', () => {
    // Given
    const mockStorage = getMockStorage();
    const parent1 = new StorageService(mockStorage);

    // When
    const child1 = parent1.spawnChild('child');

    // Then
    expect(child1.getKey('abc')).toBe('child.abc');

    // Given
    const parent2 = new StorageService(mockStorage, 'ns');

    // When
    const child2 = parent2.spawnChild('child');

    // Then
    expect(child2.getKey('abc')).toBe('ns.child.abc');
  });

  it('should return proper effective namespace for given config and hostname', () => {
    // When
    let ns = StorageService.getEffectiveNamespace('my-domain', 'always');

    // Then
    expect(ns).toBe('always');

    // When
    ns = StorageService.getEffectiveNamespace('localhost', 'always');

    // Then
    expect(ns).toBe('always');

    // When
    ns = StorageService.getEffectiveNamespace('localhost', { localhostOnly: true, value: 'sometimes' });

    // Then
    expect(ns).toBe('sometimes');

    // When
    ns = StorageService.getEffectiveNamespace('my-domain', { localhostOnly: true, value: 'sometimes' });

    // Then
    expect(ns).toBeUndefined();

    // When
    ns = StorageService.getEffectiveNamespace('my-domain');

    // Then
    expect(ns).toBeUndefined();
  });

  it('should return active object with statically known keys which supports reading, storing and key inspection', () => {
    // Given
    const mockStorage = getMockStorage({
      'ns.obj.key1': '"value"',
      'ns.obj.key2': '42',
    });
    const rawData = mockStorage.getRawData();
    const service = new StorageService(mockStorage, 'ns');
    const object = service.getActiveObject<{
      key1: string | null;
      key2: number | null;
      key3: boolean;
    }>('obj', {
      key1: null,
      key2: null,
      key3: false
    });

    // Then
    expect(object.key1).toBe('value');
    expect(object.key2).toBe(42);
    expect(object.key3).toBe(false);

    // When
    object.key1 = 'changed';

    // Then
    expect(rawData['ns.obj.key1']).toBe('"changed"');

    // When
    const keys = Object.keys(object);

    // Then
    expect(keys).toEqual(['key1', 'key2', 'key3']);
  });

  it('should return active object without statically known keys which supports reading, storing and key inspection', () => {
    // Given
    const mockStorage = getMockStorage({
      'obj.key1': '"value"',
    });
    const rawData = mockStorage.getRawData();
    const service = new StorageService(mockStorage);
    const object = service.getActiveObject<Record<string, any>>('obj', {}, true);

    // Then
    expect(object['key1']).toBe('value');
    expect(object['key2']).toBeNull();

    // When
    object['key1'] = 'changed';
    object['key2'] = 42;

    // Then
    expect(rawData['obj.key1']).toBe('"changed"');
    expect(rawData['obj.key2']).toBe('42');

    // When
    const keys = Object.keys(object);

    // Then
    expect(keys).toEqual(['key1', 'key2']);
  });

});
