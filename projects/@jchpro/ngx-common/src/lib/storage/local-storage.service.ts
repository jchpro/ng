import { Inject, Injectable, Optional } from "@angular/core";
import { LOCAL_STORAGE } from "../tokens/storage";
import { WINDOW } from '../tokens/window';
import { STORAGE_OPTIONS, StorageOptions } from './provide-storage';
import { StorageService } from "./storage.service";

/**
 * {@link StorageService} using `localStorage`.
 */
@Injectable({
  providedIn: "root",
})
export class LocalStorageService extends StorageService {

  constructor(
    @Inject(LOCAL_STORAGE) storage: Storage,
    @Inject(WINDOW) window: Window,
    @Inject(STORAGE_OPTIONS) @Optional() options?: StorageOptions,
  ) {
    super(storage, StorageService.getEffectiveNamespace(window.location.hostname, options?.namespace));
  }

}
