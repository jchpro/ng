// Manual
const loading = inject(KitLoadingService);
await loading.track(this.api.reload());   // promise or observable

const done = loading.begin();
try {
  await this.api.reload();
} finally {
  done();
}

// app.config.ts: opt-in automatic sources
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([kitLoadingInterceptor])),
    provideKitNavigationLoading()
  ]
};
