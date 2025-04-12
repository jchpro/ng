/**
 * Wrapper around `Storage` interface allowing to set and get
 * objects which can be serialized to JSON.
 */
export class JSONStorage {

  constructor(

    /**
     * Storage interface
     */
    protected readonly storage: Storage,

    /**
     * Optional key formatting function, great for adding prefixes.
     */
    protected readonly key?: (key: string) => string
  ) {
  }

  /**
   * Returns value deserialized from JSON, allows for passing initial value.
   * If object can't be deserialized `null` will be returned.
   */
  get<T>(key: string): T | null;
  get<T>(key: string, init: T): T;
  get<T>(key: string, init?: T): T | null {
    const effectiveKey = this.getKey(key);
    const raw = this.storage.getItem(effectiveKey);
    if (raw === null && typeof init !== 'undefined') {
      return init;
    }
    try {
      return JSON.parse(raw!);
    } catch (e) {
      console.warn(`Invalid JSON at storage key "${effectiveKey}"`, e);
      return null;
    }
  }

  /**
   * Serialized value to JSON and stores it.
   */
  set<T>(key: string, value: T): void {
    const effectiveKey = this.getKey(key);
    this.storage.setItem(effectiveKey, JSON.stringify(value));
  }

  /**
   * Returns all stored keys taking into account the key formatting function, if provided.
   * Only the initially passed key is returned and the part from the formatting function gets discarded.
   * Note that the implementation assumes formatting function adds prefix.
   */
  getKeys(): string[] {
    const rawKeys = this.getRawKeys();
    if (this.getKey) {
      const lookFor = this.getKey('');
      return rawKeys
        .filter(k => k.startsWith(lookFor))
        .map(k => k.replace(lookFor, ''));
    }
    return rawKeys;
  }

  /**
   * Returns all stored keys directly from the Storage interface,
   * without the key formatting function involvement.
   */
  getRawKeys(): string[] {
    const rawKeys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        rawKeys.push(key);
      }
    }
    return rawKeys;
  }

  /**
   * Formats the key using function, if provided.
   */
  getKey(key: string): string {
    return this.key?.(key) ?? key;
  }

}
