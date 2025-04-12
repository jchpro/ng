import { JSONStorage } from "./json-storage";
import { StorageNamespaceConfig } from './provide-storage';

/**
 * Wrapper around `Storage` interface extending {@link JSONStorage}
 * and adding keys namespace and "active object" capabilities.
 */
export class StorageService extends JSONStorage {

  constructor(

    /**
     * `Storage` interface to use.
     */
    storage: Storage,

    /**
     * Optional namespace for the storage keys, prepended using dot notation like "${namespace}.${key}".
     */
    namespace?: string
  ) {
    super(storage, namespace ? StorageService.getKeyCreator(namespace) : undefined);
  }

  /**
   * Returns "active object", which is a specially created JS object whose
   * fields have getters and setters connected to a storage interface.
   * The object will return proper keys when using `Object.keys()` on it.
   *
   * @param name Namespace of the property keys.
   * @param defaults Must be provided with explicitly defined properties in order to properly create property descriptors.
   *                 Because of this optional fields should be defined with `T | null` rather than `?: T`.
   *                 Setting `null` values will clear values stored at given key in underlying `Storage`.
   * @param dynamicKeys When passed, Proxy object is returned which will handle properties with names not known statically.
   *                    Known properties can still be passed in `defaults` object, but are not required.
   *
   * @example
   *
   * ```typescript
   * const obj = storageService.getActiveObject<{ one: number | null; two: string }>({
   *   one: null,
   *   two: 'default'
   * });
   * console.log(one); // null
   * obj.one = 1;
   * console.log(one); // 1
   * console.log(two); // 'default'
   * ```
   */
  getActiveObject<T extends object>(name: string,
                                    defaults: T,
                                    dynamicKeys?: boolean): T {
    const descriptors: PropertyDescriptorMap = {};
    const storage = this.spawnChild(name);
    const knownKeys = Object.keys(defaults);
    knownKeys.forEach(key => {
      descriptors[key] = {
        enumerable: true,
        get: () => {
          return storage.get(key, defaults[key as keyof T]);
        },
        set: (value: any) => {
          storage.set(key, value);
        }
      }
    });
    const object = Object.defineProperties<T>({} as T, descriptors);
    if (!dynamicKeys) {
      return object;
    }
    let lastKeys: string[] = [];
    return new Proxy<T>(object, {
      get(target, key: string) {
        if (knownKeys.includes(key)) {
          return target[key as keyof T];
        }
        return storage.get(key, defaults[key as keyof T]);
      },
      set(target: T, key: string, newValue: any): boolean {
        if (knownKeys.includes(key)) {
          target[key as keyof T] = newValue;
          return true;
        }
        storage.set(key, newValue);
        return true;
      },
      ownKeys(): string[] {
        lastKeys = storage.getKeys();
        return lastKeys;
      },
      getOwnPropertyDescriptor(target: T, key: string | symbol): PropertyDescriptor | undefined {
        if (typeof key === 'symbol') {
          return;
        }
        if (knownKeys.includes(key)) {
          return Object.getOwnPropertyDescriptor(target, key as keyof T);
        }
        if (lastKeys.includes(key)) {
          return { configurable: true, enumerable: true };
        }
        return;
      }
    });
  }

  /**
   * Returns new instance of the storage service with child namespace.
   */
  spawnChild(namespace: string): StorageService {
    const parentNamespace = this.key?.(namespace) ?? namespace;
    return new StorageService(this.storage, parentNamespace);
  }

  /**
   * Create keys by prepending namespace using dot notation like "${namespace}.${key}".
   */
  static getKeyCreator(namespace: string) {
    return (key: string) => `${namespace}.${key}`;
  }

  /**
   * Returns effective namespace based on the location's hostname and config object.
   */
  static getEffectiveNamespace(hostname: string,
                               config?: StorageNamespaceConfig): string | undefined {
    if (!config) {
      return;
    }
    if (typeof config === 'object' && config.localhostOnly) {
      return hostname === 'localhost' ? config.value : undefined;
    }
    return config as string;
  }

}
