import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from "@angular/core";
import { LOCAL_STORAGE, SESSION_STORAGE } from "../tokens/storage";

/**
 * Configure storage configuration, everything is optional
 * and the mechanism will work without providing anything.
 */
export function provideStorage(config?: StorageConfig): EnvironmentProviders {
  const providers: Provider[] = [];
  if (config?.namespace) {
    const options: StorageOptions = {
      namespace: config.namespace
    };
    providers.push({
      provide: STORAGE_OPTIONS,
      useValue: options,
    });
  }
  if (config?.local) {
    providers.push({
      provide: LOCAL_STORAGE,
      useValue: config.local
    });
  }
  if (config?.session) {
    providers.push({
      provide: SESSION_STORAGE,
      useValue: config.session
    })
  }
  return makeEnvironmentProviders(providers);
}

/**
 * Storage configuration
 */
export interface StorageConfig {

  /**
   * No namespace in any situation as default.
   */
  namespace?: StorageNamespaceConfig;

  /**
   * What should be used as localStorage, falls backs to the global object.
   */
  local?: Storage;

  /**
   * What should be used as sessionStorage, falls backs to the global object.
   */
  session?: Storage;
}

/**
 * Storage options provided using {@link STORAGE_OPTIONS}.
 */
export interface StorageOptions {

  /**
   * Namespace for storage keys, which will prepended using dot notation like "${namespace}.${key}".
   */
  namespace?: StorageNamespaceConfig;
}

/**
 * When string is used, the namespace will be used all the time.
 *
 * When object with `localhostOnly` flag is used, the namespace will only be enabled when hostname is "localhost".
 * The idea is that when serving many apps for development purposes at the same port there can be conflicting keys,
 * but when the hostname is different for each app such conflicts cannot occur, so namespace is not needed.
 */
export type StorageNamespaceConfig = string | {
  localhostOnly: true;
  value: string;
};

/**
 * Injection token for {@link StorageOptions}.
 */
export const STORAGE_OPTIONS = new InjectionToken<StorageOptions>('STORAGE_OPTIONS');
