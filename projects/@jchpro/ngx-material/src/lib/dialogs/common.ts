import { Signal } from '@angular/core';

/**
 * String or signal of strings.
 */
export type DynamicLabel = string | Signal<string>;

/**
 * Anything or a function returning anything.
 */
export type DynamicResult = any | (() => any);

/**
 * Signal of booleans.
 */
export type DynamicDisabledState = Signal<boolean>;
