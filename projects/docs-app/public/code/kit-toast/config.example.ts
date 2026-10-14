providers: [
  provideKitToasts({
    durations: { success: 3000, info: 5000, error: null },   // null: until closed
    actionMinDuration: 8000,                                 // the least a toast with an action stays
    max: 5,
    position: 'bottom-end'
  })
]

// a call's own duration wins over all of it
toasts.error('Offline', { duration: 8000 });
toasts.success('Copied', { duration: null });
