import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, linkedSignal, resource, signal } from '@angular/core';
import {
  KitDataTable,
  KitFilter,
  KitMenu,
  KitMenuItem,
  KitMenuTrigger,
  KitPaginator,
  KitSearchInput,
  KitSort,
  KitTableParams,
  kitTableState
} from '@jchpro/ngx-kit';
import {
  LucideCheck,
  LucideEllipsisVertical,
  LucideMinus,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash,
  LucideX
} from '@lucide/angular';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

type Role = 'Admin' | 'Editor' | 'Viewer';
type Status = 'active' | 'invited' | 'suspended';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  mfa: boolean;
  seats: number;
  lastSeen: Date | null;
}

interface UserPage {
  items: DemoUser[];
  total: number;
}

const NAMES = [
  'Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton', 'Dennis Ritchie',
  'Barbara Liskov', 'Ken Thompson', 'Radia Perlman', 'Tim Berners-Lee', 'Katherine Johnson', 'Donald Knuth',
  'Hedy Lamarr', 'Edsger Dijkstra', 'Frances Allen', 'Guido van Rossum', 'Sophie Wilson', 'Brian Kernighan',
  'Annie Easley', 'John Carmack', 'Lynn Conway', 'Bjarne Stroustrup', 'Karen Spärck Jones', 'Anders Hejlsberg',
  'Jean Sammet', 'Rob Pike', 'Mary Allen Wilkes', 'Yukihiro Matsumoto', 'Shafi Goldwasser', 'James Gosling',
  'Evelyn Boyd Granville', 'Leslie Lamport', 'Dorothy Vaughan', 'Vint Cerf', 'Joan Clarke', 'Larry Wall',
  'Adele Goldberg'
];

const ROLES: Role[] = ['Admin', 'Editor', 'Viewer'];
const STATUSES: Status[] = ['active', 'active', 'invited', 'active', 'suspended'];
const DAY = 24 * 60 * 60 * 1000;

const USERS: DemoUser[] = NAMES.map((name, index) => ({
  id: `usr_${(48210 + index * 37).toString(16)}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
  role: ROLES[index % ROLES.length],
  status: STATUSES[index % STATUSES.length],
  mfa: index % 3 !== 1,
  seats: (index * 7) % 23 === 0 ? 0 : 1 + ((index * 13) % 240),
  lastSeen: index % 8 === 5 ? null : new Date(Date.UTC(2026, 9, 7, 8, 30) - index * 1.7 * DAY)
}));

/** What the demo "API" does with a request: filter, sort and page the local array. */
function queryUsers(params: KitTableParams<{ role: string | null }>, noUsers: boolean): UserPage {
  if (noUsers) {
    return { items: [], total: 0 };
  }
  const query = params.query.toLowerCase();
  const sort = params.sort;
  const matching = USERS.filter(user =>
    (!params.filters.role || user.role === params.filters.role)
    && (!query || user.name.toLowerCase().includes(query) || user.email.includes(query))
  );
  if (sort) {
    const factor = sort.direction === 'asc' ? 1 : -1;
    const key = (user: DemoUser) => user[sort.field as keyof DemoUser] ?? '';
    matching.sort((a, b) => factor * (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
  }
  const start = (params.page - 1) * params.pageSize;
  return { items: matching.slice(start, start + params.pageSize), total: matching.length };
}

@Component({
  selector: 'app-table',
  imports: [
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    LibPageTitle,
    CodeExample,
    KitDataTable,
    KitFilter,
    KitSearchInput,
    KitSort,
    KitPaginator,
    KitMenuTrigger,
    KitMenu,
    KitMenuItem,
    LucideCheck,
    LucideEllipsisVertical,
    LucideMinus,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideTrash,
    LucideX
  ],
  templateUrl: './table.page.html'
})
export class TablePage {

  protected readonly roles = ROLES;
  protected readonly badgeClass: Record<Status, string> = {
    active: 'kit-badge--success',
    invited: 'kit-badge--info',
    suspended: 'kit-badge--danger'
  };

  // The table's state: search, filters, sort and page as signals, kept in the URL (try reloading the
  // page after paging or searching). `state.params()` is what a real request is built from.
  protected readonly state = kitTableState({
    pageSize: 10,
    sort: { field: 'name', direction: 'asc' },
    filters: { role: null as string | null },
    urlSync: true
  });

  // Switches for looking at the states and densities.
  protected readonly failing = signal(false);
  protected readonly compact = signal(false);
  protected readonly noUsers = signal(false);

  protected readonly lastAction = signal('none yet');

  // The demo's own "backend": a resource that answers after a short delay. In a real view this is
  // an `httpResource` whose request is built from `state.params()`.
  protected readonly users = resource({
    params: () => ({ ...this.state.params(), noUsers: this.noUsers() }),
    loader: async ({ params }) => {
      await new Promise(resolve => setTimeout(resolve, 450));
      if (this.failing()) {
        throw new Error('The demo server is down');
      }
      return queryUsers(params, params.noUsers);
    }
  });

  // The previous page stays on screen while the next one loads, instead of an empty table.
  protected readonly page = linkedSignal<UserPage | undefined, UserPage | undefined>({
    source: () => this.users.hasValue() ? this.users.value() : undefined,
    computation: (value, previous) => value ?? previous?.value
  });

  protected toggleFailing() {
    this.failing.update(failing => !failing);
    this.users.reload();
  }

}
