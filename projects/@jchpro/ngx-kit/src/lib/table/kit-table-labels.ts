import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';

/**
 * Every user-facing string of the data table and its paginator. `{from}`, `{to}`, `{total}`
 * and `{page}` are placeholders, replaced by `KitPaginator`.
 */
export interface KitTableLabels {
  states: {
    emptyTitle: string;
    /** Title when the search or filters leave no rows. */
    emptyFilteredTitle: string;
    emptyFilteredMessage: string;
    clearFilters: string;
    errorTitle: string;
    retry: string;
  };
  paginator: {
    /** Accessible name of the paginator's `<nav>`. */
    navigation: string;
    rowsPerPage: string;
    range: string;
    /** Shown instead of the range when the total is not known. */
    page: string;
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

/** What `provideKitTableLabels` accepts: any part of the labels, the rest stays as is. */
export type KitTableLabelsOverride = KitLabelsOverride<KitTableLabels>;

export const KIT_TABLE_LABELS_EN: KitTableLabels = {
  states: {
    emptyTitle: 'Nothing here yet',
    emptyFilteredTitle: 'No results',
    emptyFilteredMessage: 'Nothing matches the current search or filters.',
    clearFilters: 'Clear filters',
    errorTitle: 'Could not load the data',
    retry: 'Try again'
  },
  paginator: {
    navigation: 'Pagination',
    rowsPerPage: 'Rows per page',
    range: '{from}–{to} of {total}',
    page: 'Page {page}',
    first: 'First page',
    previous: 'Previous page',
    next: 'Next page',
    last: 'Last page'
  }
};

export const KIT_TABLE_LABELS_PL: KitTableLabels = {
  states: {
    emptyTitle: 'Brak danych',
    emptyFilteredTitle: 'Brak wyników',
    emptyFilteredMessage: 'Nic nie pasuje do wyszukiwania ani filtrów.',
    clearFilters: 'Wyczyść filtry',
    errorTitle: 'Nie udało się wczytać danych',
    retry: 'Spróbuj ponownie'
  },
  paginator: {
    navigation: 'Stronicowanie',
    rowsPerPage: 'Wierszy na stronie',
    range: '{from}–{to} z {total}',
    page: 'Strona {page}',
    first: 'Pierwsza strona',
    previous: 'Poprzednia strona',
    next: 'Następna strona',
    last: 'Ostatnia strona'
  }
};

/**
 * The labels the data table and paginator read, as a signal so they can follow a runtime
 * language switch. English unless overridden with `provideKitTableLabels` or `provideKitLabels`.
 */
export const KIT_TABLE_LABELS = new InjectionToken<Signal<KitTableLabels>>('KIT_TABLE_LABELS', {
  factory: () => signal(KIT_TABLE_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the table labels, merged over the English defaults — pass only what
 * differs, or a complete set such as `KIT_TABLE_LABELS_PL`. A signal works for labels that
 * change at runtime (e.g. fed from your i18n library).
 */
export function provideKitTableLabels(labels: KitTableLabelsOverride | Signal<KitTableLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_TABLE_LABELS, KIT_TABLE_LABELS_EN, labels);
}
