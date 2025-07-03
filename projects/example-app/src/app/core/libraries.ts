export const libraries = {
  common: '@jchpro/ngx-common',
  pico: '@jchpro/ngx-pico',
} as const;

export type Library = keyof typeof libraries;
