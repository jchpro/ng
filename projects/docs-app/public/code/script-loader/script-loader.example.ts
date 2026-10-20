readonly #scripts = inject(ScriptLoaderService);

protected async verifyHuman() {
  try {
    // Loaded on the first call, the same promise for the calls made meanwhile
    await this.#scripts.load('https://captcha.example.com/sdk.js', {
      id: 'captcha-sdk',
      attributes: { crossorigin: 'anonymous', 'data-site-key': this.siteKey }
    });
  } catch (error) {
    if (error instanceof ScriptLoadError) {
      // A blocker or the network: the next call tries again
      this.captchaUnavailable.set(true);
      return;
    }
    throw error;
  }
  window.captcha.render('#captcha');
}
