// app.config.ts
providers: [
  // Every built-in string of the kit, in Polish
  provideKitLabels('pl'),

  // Or override only some dialog labels, the rest stays as is
  provideKitDialogLabels({
    titles: { danger: 'Please confirm' },
    buttons: { ok: 'Got it' }
  }),

  // The shell's toggle label has its own provider, same idea
  provideKitShellLabels({ toggleNavigation: 'Menu' }),

  // Or follow your own i18n library / a language switch: pass a signal
  provideKitDialogLabels(computed(() => ({
    buttons: { ok: transloco.translate('common.ok') }
  })))
]

// Per call, closest wins: defaults < app-wide < the call
await dialogs.confirm({ message: 'Sure?', confirmLabel: 'Do it' });
