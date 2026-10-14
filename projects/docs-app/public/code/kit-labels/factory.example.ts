// The language lives in a service, which can't be injected while the providers are listed:
// pass a factory, it runs in an injection context, once, and every feature shares its signal.
providers: [
  provideKitLabels(() => inject(LanguageService).language)   // Signal<'en' | 'pl'>
]
