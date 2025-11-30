import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CustomIconConfig, IconInstanceInitializer, ProIcon } from './icons';
import { PRO_ICON_CONFIG } from './icons-config';

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  readonly #customConfig?: CustomIconConfig;

  readonly #config = inject(PRO_ICON_CONFIG);
  readonly #injector = inject(Injector);

  constructor() {
    if (this.#config.custom) {
      this.#customConfig = runInInjectionContext(this.#injector, this.#config.custom);
    }
  }

  getInitializer(icon: ProIcon): IconInstanceInitializer {
    if (this.#customConfig) {
      const value = this.#customConfig.mapping(icon);
      if (!(value === undefined || value === null)) {
        return {
          type: this.#customConfig.type,
          inputName: this.#customConfig.inputName,
          value
        };
      }
    }
    return {
      type: MatIcon,
      inputName: 'fontIcon',
      value: this.#config.matMapping[icon]
    };
  }

}
