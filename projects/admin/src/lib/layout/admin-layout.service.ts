import { inject, Injectable, Injector, runInInjectionContext, signal, Signal } from '@angular/core';
import { ADMIN_LAYOUT_CONFIG } from '../config/providers';

@Injectable({
  providedIn: 'root'
})
export class AdminLayoutService {

  readonly mobileLayout: Signal<boolean>;
  readonly sidebarAvailable: Signal<boolean>;
  readonly sidebarToggleMode: Signal<boolean>;

  readonly #config = inject(ADMIN_LAYOUT_CONFIG);
  readonly #injector = inject(Injector);

  constructor() {
    const {
      mobileLayout,
      sidebarAvailable,
      sidebarToggleMode
    } = runInInjectionContext(this.#injector, () => {
      return {
        mobileLayout: this.#config.mobileLayout(),
        sidebarAvailable: this.#initBooleanSignal(this.#config.sidebarAvailable),
        sidebarToggleMode: this.#initBooleanSignal(this.#config.sidebarToggleMode),
      };
    });
    this.mobileLayout = mobileLayout;
    this.sidebarAvailable = sidebarAvailable;
    this.sidebarToggleMode = sidebarToggleMode;
  }

  #initBooleanSignal(init: boolean | (() => Signal<boolean>)): Signal<boolean> {
    if (typeof init === 'boolean') {
      return signal(init);
    }
    return init();
  }

}
