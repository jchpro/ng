import { Type } from '@angular/core';
import { LucideIcon } from '@lucide/angular';

export interface DocLib {
  name: string;
  path: string;
  libName: string;
  /** `version` from the library's own package.json, baked in at build time. */
  version?: string;
  desc: string;
  component: Type<any>;
  pages: DocPage[];
}

export interface DocPage {
  fullName: string;
  menuName: string;
  path: string;
  icon: LucideIcon;
  desc: string;
  component: Type<any>;
  extraData?: any;
}
