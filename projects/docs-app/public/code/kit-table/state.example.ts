// import KitDataTable, KitSearchInput, KitFilter, KitSort, KitPaginator into the component
protected readonly state = kitTableState({
  pageSize: 25,
  sort: { field: 'name', direction: 'asc' },
  filters: { role: null as string | null },   // every filter, with its starting value
  urlSync: true                               // opt-in: the state lives in the query string
});

// `params` changes whenever the query, a filter, the sort or the page does: the resource reloads.
protected readonly users = httpResource<Page<User>>(() => {
  const { query, filters, sort, page, pageSize } = this.state.params();
  return {
    url: '/api/users',
    params: {
      q: query,
      ...(filters.role && { role: filters.role }),
      ...(sort && { sort: `${sort.field}:${sort.direction}` }),
      page,
      size: pageSize
    }
  };
});

// Optional: keep the previous page on screen while the next one loads.
protected readonly page = linkedSignal<Page<User> | undefined, Page<User> | undefined>({
  source: () => this.users.hasValue() ? this.users.value() : undefined,
  computation: (value, previous) => value ?? previous?.value
});
