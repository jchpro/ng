import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  KitDataTable,
  KitMenu,
  KitMenuItem,
  KitMenuTrigger,
  KitPaginator,
  KitSort,
  KitTableSort
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

@Component({
  selector: 'app-table',
  imports: [
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    LibPageTitle,
    CodeExample,
    KitDataTable,
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

  // The demo's own "backend": filter, sort and page a local array. In a real view this is the
  // request your API gets, and `rows` / `total` are what it returns.
  protected readonly query = signal('');
  protected readonly role = signal<Role | ''>('');
  protected readonly sort = signal<KitTableSort | null>({ field: 'name', direction: 'asc' });
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);

  // Switches for looking at the states and densities.
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly compact = signal(false);
  protected readonly noUsers = signal(false);

  protected readonly lastAction = signal('none yet');

  protected readonly filtering = computed(() => this.query().trim() !== '' || this.role() !== '');

  protected readonly matching = computed(() => {
    if (this.noUsers()) {
      return [];
    }
    const query = this.query().trim().toLowerCase();
    const role = this.role();
    const sort = this.sort();
    const rows = USERS.filter(user =>
      (!role || user.role === role)
      && (!query || user.name.toLowerCase().includes(query) || user.email.includes(query))
    );
    if (!sort) {
      return rows;
    }
    const factor = sort.direction === 'asc' ? 1 : -1;
    const key = (user: DemoUser) => user[sort.field as keyof DemoUser] ?? '';
    return rows.sort((a, b) => factor * (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
  });

  protected readonly rows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.matching().slice(start, start + this.pageSize());
  });

  protected search(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  protected filterRole(value: string) {
    this.role.set(value as Role | '');
    this.page.set(1);
  }

  protected clearFilters() {
    this.query.set('');
    this.role.set('');
    this.page.set(1);
  }

  protected sortChange(sort: KitTableSort | null) {
    this.sort.set(sort);
    this.page.set(1);
  }

}
