export type KitSortDirection = 'asc' | 'desc';

/** The column a table is sorted by, as `KitDataTable` holds it and `KitSort` headers read and set it. */
export interface KitTableSort {
  /** The `kitSort` name of the column — what your API's sort parameter expects. */
  field: string;
  direction: KitSortDirection;
}
