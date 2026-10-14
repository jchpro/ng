import { inject, Injectable, signal } from '@angular/core';
import {
  KIT_TOAST_CONFIG,
  KIT_TOAST_DEFAULTS,
  KitToastCloseReason,
  KitToastKind,
  KitToastOptions,
  KitToastRef
} from './kit-toast.types';

/** A toast as the container shows it. */
export interface KitToastEntry {
  readonly id: number;
  readonly kind: KitToastKind;
  readonly message: string;
  readonly action: string | undefined;
}

interface Entry extends KitToastEntry {
  /** How long it stays, `null` until closed. */
  readonly duration: number | null;
  remaining: number;
  startedAt: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Hover and focus each hold the timer; it runs while nothing does. */
  holds: number;
  closed: boolean;
  resolve(reason: KitToastCloseReason): void;
}

/** The least a held toast has left once released, so a quick pass of the pointer doesn't leave it a blink. */
const MIN_REMAINING = 1000;

/**
 * The state of the toasts: which are showing, which wait for room, and the timer of each. Internal, the container
 * reads it and `KitToastService` is the way in.
 */
@Injectable({
  providedIn: 'root'
})
export class KitToastStore {

  readonly #config = (() => {
    const config = inject(KIT_TOAST_CONFIG);
    return {
      durations: { ...KIT_TOAST_DEFAULTS.durations, ...config.durations },
      actionMinDuration: config.actionMinDuration ?? KIT_TOAST_DEFAULTS.actionMinDuration,
      max: Math.max(1, config.max ?? KIT_TOAST_DEFAULTS.max),
      position: config.position ?? KIT_TOAST_DEFAULTS.position
    };
  })();

  readonly #visible = signal<readonly KitToastEntry[]>([]);
  readonly visible = this.#visible.asReadonly();

  readonly #entries = new Map<number, Entry>();
  #waiting: Entry[] = [];
  #nextId = 0;
  // Nothing shows until the container, with its live regions, has been in the page a moment: a message added to a
  // region in the same frame it appears in is often not announced
  #ready = false;

  get position() {
    return this.#config.position;
  }

  show(kind: KitToastKind, message: string, options: KitToastOptions | undefined): KitToastRef {
    let resolve!: (reason: KitToastCloseReason) => void;
    const closed = new Promise<KitToastCloseReason>(done => resolve = done);
    const duration = this.#duration(kind, options);
    const entry: Entry = {
      id: this.#nextId++, kind, message, action: options?.action,
      duration, remaining: duration ?? 0, startedAt: 0, timer: undefined, holds: 0, closed: false, resolve
    };
    this.#entries.set(entry.id, entry);
    this.#waiting.push(entry);
    this.#flush();
    return { closed, dismiss: () => this.#close(entry, 'dismissed') };
  }

  markReady() {
    this.#ready = true;
    this.#flush();
  }

  dismiss(toast: KitToastEntry) {
    this.#close(this.#entries.get(toast.id), 'dismissed');
  }

  act(toast: KitToastEntry) {
    this.#close(this.#entries.get(toast.id), 'action');
  }

  dismissAll() {
    [...this.#entries.values()].forEach(entry => this.#close(entry, 'dismissed'));
  }

  /** The pointer or the focus is on the toast: stop its clock. */
  hold(toast: KitToastEntry) {
    const entry = this.#entries.get(toast.id);
    if (!entry || entry.closed || entry.holds++ || entry.timer === undefined) {
      return;
    }
    clearTimeout(entry.timer);
    entry.timer = undefined;
    entry.remaining = Math.min(entry.duration!, Math.max(MIN_REMAINING, entry.remaining - (Date.now() - entry.startedAt)));
  }

  release(toast: KitToastEntry) {
    const entry = this.#entries.get(toast.id);
    if (!entry || entry.closed || !entry.holds || --entry.holds) {
      return;
    }
    this.#start(entry);
  }

  #duration(kind: KitToastKind, options: KitToastOptions | undefined): number | null {
    if (options?.duration !== undefined) {
      const { duration } = options;
      if (duration !== null && !(duration > 0 && Number.isFinite(duration))) {
        throw new Error('KitToast: duration is a positive number of milliseconds, or null for a toast that stays until it is closed');
      }
      return duration;
    }
    const duration = this.#config.durations[kind];
    return duration !== null && options?.action ? Math.max(duration, this.#config.actionMinDuration) : duration;
  }

  #flush() {
    if (!this.#ready) {
      return;
    }
    while (this.#visible().length < this.#config.max && this.#waiting.length) {
      const entry = this.#waiting.shift()!;
      this.#visible.update(list => [...list, entry]);
      this.#start(entry);
    }
  }

  #start(entry: Entry) {
    if (entry.duration === null || entry.holds) {
      return;
    }
    entry.startedAt = Date.now();
    entry.timer = setTimeout(() => this.#close(entry, 'timeout'), entry.remaining);
  }

  #close(entry: Entry | undefined, reason: KitToastCloseReason) {
    if (!entry || entry.closed) {
      return;
    }
    entry.closed = true;
    clearTimeout(entry.timer);
    this.#entries.delete(entry.id);
    this.#waiting = this.#waiting.filter(waiting => waiting !== entry);
    this.#visible.update(list => list.filter(shown => shown !== entry));
    entry.resolve(reason);
    this.#flush();
  }

}
