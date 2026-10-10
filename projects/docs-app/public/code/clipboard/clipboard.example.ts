private readonly clipboard = inject(ClipboardService);

protected async copyLink(url: string) {
  if (await this.clipboard.copy(url)) {
    this.message.set('Link copied.');
    return;
  }
  // No permission or an insecure origin: let the person copy it from here
  this.shownLink.set(url);
}
