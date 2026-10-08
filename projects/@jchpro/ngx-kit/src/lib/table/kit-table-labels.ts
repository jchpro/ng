import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';

/**
 * Every user-facing string of the data table, its paginator and toolbar parts. `{from}`, `{to}`,
 * `{total}`, `{page}` and `{count}` are placeholders, replaced by the component that shows them.
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
  /** The bar that replaces the toolbar while rows are selected. */
  bulk: {
    selected: string;
    clear: string;
  };
  /** The button that expands a row. `{row}` is the name of the row, e.g. "Ada Lovelace". */
  expansion: {
    expand: string;
    collapse: string;
  };
  /** The toolbar's popovers and toggles. */
  toolbar: {
    filters: string;
    /** Empties the filters inside the filters popover. */
    resetFilters: string;
    /** Closes a popover. */
    close: string;
    /** The text-only button of the applied-filter chips that empties them all. */
    clearAll: string;
    /** Accessible name of a chip's remove button; `{filter}` is the chip's text, e.g. "Role: Admin". */
    removeFilter: string;
    columns: string;
    /** Shows the columns the table started with. */
    resetColumns: string;
    compactRows: string;
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
  },
  bulk: {
    selected: '{count} selected',
    clear: 'Clear selection'
  },
  expansion: {
    expand: 'Show details of {row}',
    collapse: 'Hide details of {row}'
  },
  toolbar: {
    filters: 'Filters',
    resetFilters: 'Reset filters',
    close: 'Done',
    clearAll: 'Clear all',
    removeFilter: 'Remove filter {filter}',
    columns: 'Columns',
    resetColumns: 'Reset columns',
    compactRows: 'Compact rows'
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
  },
  bulk: {
    selected: 'Zaznaczono: {count}',
    clear: 'Wyczyść zaznaczenie'
  },
  expansion: {
    expand: 'Pokaż szczegóły: {row}',
    collapse: 'Ukryj szczegóły: {row}'
  },
  toolbar: {
    filters: 'Filtry',
    resetFilters: 'Resetuj filtry',
    close: 'Gotowe',
    clearAll: 'Wyczyść wszystko',
    removeFilter: 'Usuń filtr {filter}',
    columns: 'Kolumny',
    resetColumns: 'Resetuj kolumny',
    compactRows: 'Zagęszczone wiersze'
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
