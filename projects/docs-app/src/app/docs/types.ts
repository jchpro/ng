import { Type } from '@angular/core';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface DocLib {
  name: string;
  path: string;
  libName: string;
  desc: string;
  component: Type<any>;
  pages: DocPage[];
}

export interface DocPage {
  fullName: string;
  menuName: string;
  path: string;
  icon: IconDefinition;
  desc: string;
  component: Type<any>;
  extraData?: any;
}
