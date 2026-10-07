import { computed, signal } from '@angular/core';

/** One column the person can show or hide. */
export interface KitTableColumn {
  /** The name `kitCol` uses on the header and cells. */
  id: string;

  /** What the column picker shows. */
  label: string;

  /** Hidden at the start. */
  hidden?: boolean;

  /** Can't be hidden (the name column, say): shown ticked and disabled in the picker. */
  locked?: boolean;
}

export interface KitTableColumnsOptions {
  /**
   * Remember the choice in `localStorage` under this key, so it survives a reload. The columns
   * hidden then win over `hidden` in the definitions; a column added later keeps its own default.
   */
  storageKey?: string;
}

/**
 * Which columns of a table are shown. Create it with `kitTableColumns()`, pass it to
 * `<kit-data-table [columns]>`, mark the header and cells with `kitCol="id"` and add a
 * `<kit-column-picker />` to the toolbar.
 */
export class KitTableColumns {

  readonly #hidden;
  readonly #storageKey: string | undefined;

  /** The definitions, in the order the picker lists them. */
  readonly columns: readonly KitTableColumn[];

  /** The ids of the hidden columns. */
  readonly hidden;

  /** How many columns are shown. */
  readonly visibleCount;

  constructor(columns: readonly KitTableColumn[], options: KitTableColumnsOptions = {}) {
    this.columns = columns;
    this.#storageKey = options.storageKey;
    this.#hidden = signal<ReadonlySet<string>>(this.#initialHidden());
    this.hidden = this.#hidden.asReadonly();
    this.visibleCount = computed(() => this.columns.length - this.#hidden().size);
  }

  /** Whether a column is shown. A name that isn't a defined column counts as shown. */
  isVisible(id: string): boolean {
    return !this.#hidden().has(id);
  }

  /** Whether a column can't be hidden. */
  isLocked(id: string): boolean {
    return !!this.columns.find(column => column.id === id)?.locked;
  }

  toggle(id: string) {
    this.setVisible(id, !this.isVisible(id));
  }

  setVisible(id: string, visible: boolean) {
    if (this.isLocked(id) || this.isVisible(id) === visible) {
      return;
    }
    const hidden = new Set(this.#hidden());
    if (visible) {
      hidden.delete(id);
    } else {
      hidden.add(id);
    }
    this.#set(hidden);
  }

  /** Back to the definitions' own `hidden`. */
  reset() {
    this.#set(this.#defaultHidden());
  }

  #set(hidden: Set<string>) {
    this.#hidden.set(hidden);
    if (!this.#storageKey) {
      return;
    }
    try {
      localStorage.setItem(this.#storageKey, JSON.stringify([...hidden]));
    } catch {
      // No storage (private mode, blocked): the choice just lasts until the page is closed.
    }
  }

  #defaultHidden(): Set<string> {
    return new Set(this.columns.filter(column => column.hidden && !column.locked).map(column => column.id));
  }

  #initialHidden(): Set<string> {
    const defaults = this.#defaultHidden();
    if (!this.#storageKey) {
      return defaults;
    }
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.#storageKey) ?? 'null');
      if (!Array.isArray(stored)) {
        return defaults;
      }
      const known = new Set(this.columns.filter(column => !column.locked).map(column => column.id));
      return new Set(stored.filter((id): id is string => typeof id === 'string' && known.has(id)));
    } catch {
      return defaults;
    }
  }

}

/**
 * Creates the column visibility of a table, see `KitTableColumns`.
 *
 * ```ts
 * protected readonly columns = kitTableColumns([
 *   { id: 'name', label: 'User', locked: true },
 *   { id: 'role', label: 'Role' },
 *   { id: 'id', label: 'ID', hidden: true }
 * ], { storageKey: 'users-columns' });
 * ```
 */
export function kitTableColumns(columns: readonly KitTableColumn[], options: KitTableColumnsOptions = {}): KitTableColumns {
  return new KitTableColumns(columns, options);
}
