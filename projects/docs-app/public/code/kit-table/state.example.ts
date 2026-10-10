// import KitDataTable, KitSearchInput, KitFilter, KitSort, KitPaginator into the component
protected readonly state = kitTableState({
  pageSize: 25,
  sort: { field: 'name', direction: 'asc' },
  filters: { role: null as string | null },   // every filter, with its starting value
  urlSync: true                               // opt-in: the state lives in the query string
                                              // ({ history: 'push' }: the back button steps through pages, sorts, filters)
});

// The loader runs again whenever the query, a filter, the sort or the page changes. It answers with
// { items, total }, whatever the API looks like. The rows of the previous page stay while the next one loads.
private readonly http = inject(HttpClient);
protected readonly users = kitPagedList(this.state, ({ query, filters, sort, page, pageSize }) =>
  firstValueFrom(this.http.get<KitPage<User>>('/api/users', {
    params: {
      q: query,
      ...(filters.role && { role: filters.role }),
      ...(sort && { sort: `${sort.field}:${sort.direction}` }),
      page,
      size: pageSize
    }
  }))
);

// After a delete: reload the page, or the one before it when the last row of the last page is gone.
protected async remove(user: User) {
  await firstValueFrom(this.http.delete(`/api/users/${user.id}`));
  this.users.reloadAfterRemoval();
}
