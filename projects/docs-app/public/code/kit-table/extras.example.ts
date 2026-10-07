protected readonly state = kitTableState({ filters: { role: null, status: null } as UserFilters });

// Which columns are shown; `storageKey` remembers the choice in the browser.
protected readonly columns = kitTableColumns([
  { id: 'name', label: 'User', locked: true },       // locked: can't be hidden
  { id: 'role', label: 'Role' },
  { id: 'seats', label: 'Seats' },
  { id: 'id', label: 'ID', hidden: true }            // hidden at the start
], { storageKey: 'users-columns' });

// The selected rows, by key. `state` empties it when the search or a filter changes.
protected readonly selection = kitTableSelection((user: User) => user.id, { state: this.state });

protected deleteSelected() {
  const ids = [...this.selection.keys()];        // across all pages
  // …call the API, then:
  this.selection.clear();
}

// No server? Filter, sort and page an in-memory list by the same state.
protected readonly users = signal<readonly User[]>(ALL_USERS);
protected readonly view = kitClientTable(this.users, this.state, {
  search: user => [user.name, user.email],                 // what the search looks in
  filters: { status: (user, status) => user.status === status },  // default: user[name] === value
  sort: { name: user => user.lastName }                    // default: user[field]
});
// view.rows() is the current page, view.total() the rows matching across all pages.
