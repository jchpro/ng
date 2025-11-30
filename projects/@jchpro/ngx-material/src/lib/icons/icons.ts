import { Type } from '@angular/core';

/**
 * Abstract icon types used in this library and possibly beyond.
 */
export type ProIcon
  = 'accept'
  | 'decline'
  | 'browse_files'
  | 'clear_files';

/**
 * Default mapping of abstract icon types to Material icons.
 */
export const DEFAULT_PRO_MAT_ICONS_MAPPING = {
  accept: 'check',
  decline: 'close',
  browse_files: 'folder_open',
  clear_files: 'close'
} as const satisfies ProMatIconsMapping;

/**
 * Mapping of abstract icon types to Material icons.
 */
export type ProMatIconsMapping = Record<ProIcon, string>;

/**
 * Configuration for custom icon components creation.
 */
export interface CustomIconConfig {

  /**
   * Component class.
   */
  readonly type: Type<any>;

  /**
   * Which input of the component should be used to select the icon?
   */
  readonly inputName: string;

  /**
   * Mapping of an abstract icon name to the value of the input in your component.
   * Return `null` or `undefined` to skip the icon, the default mapping will be used.
   */
  readonly mapping: (icon: ProIcon) => any;
}

export interface IconInstanceInitializer {
  readonly type: Type<any>;
  readonly inputName: string;
  readonly value: any;
}
