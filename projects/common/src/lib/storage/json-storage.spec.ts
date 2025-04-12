import { JSONStorage } from './json-storage';
import { getMockStorage } from './mock-storage.spec';

describe('JSONStorage', () => {

  it('should return `null` if key doesn\'t exist in storage', () => {
    // Given
    const storage = new JSONStorage(getMockStorage());

    // When
    const value = storage.get<string>('key');

    expect(value).toBeNull();
  });

  it('should return initial value if key doesn\'t exist in storage but initial value was passed', () => {
    // Given
    const storage = new JSONStorage(getMockStorage());

    // When
    const value = storage.get('key', 'value');

    // Then
    expect(value).toBe('value');
  });

  it('should return value stored at given key as JSON', () => {
    // Given
    const storage = new JSONStorage(getMockStorage({ key: '"value"' }));

    // When
    const value = storage.get('key');

    // Then
    expect(value).toBe('value');
  });

  it('should return `null` is value stored at given key is not valid JSON', () => {
    // Given
    const storage = new JSONStorage(getMockStorage({ key: '"value...' }));

    // When
    const value = storage.get('key');

    // Then
    expect(value).toBeNull();
  });

  it('should store value as JSON at given key', () => {
    // Given
    const holder = getMockStorage();
    const storage = new JSONStorage(holder);

    // When
    storage.set('key', { hello: 'world' });

    // Then
    expect(holder.getRawData()['key']).toEqual('{"hello":"world"}');
  });

  it('should store value with prefix from provided key formatting function', () => {
    // Given
    const holder = getMockStorage();
    const storage = new JSONStorage(holder, input => `namespace.${input}`);

    // When
    storage.set('key', 'value');

    // Then
    expect(holder.getRawData()['namespace.key']).toEqual('"value"');
  });

  it('should return all keys prefixed with provided key formatting function and ignore others', () => {
    // Given
    const storage = new JSONStorage(getMockStorage({ other: 'value', another: 'here' }), input => `ns.${input}`);
    storage.set('1', '1');
    storage.set('2', '2');

    // When
    const keys = storage.getKeys();

    // Then
    expect(keys).toEqual(['1', '2']);
  });

  it('should return all raw keys regardless of how they were set', () => {
    // Given
    const storage = new JSONStorage(getMockStorage({ other: 'value', another: 'here' }), input => `ns.${input}`);
    storage.set('1', '1');
    storage.set('2', '2');

    // When
    const keys = storage.getRawKeys();

    // Then
    expect(keys).toEqual(['other', 'another', 'ns.1', 'ns.2']);
  });

});
