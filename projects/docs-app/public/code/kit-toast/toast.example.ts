readonly #toasts = inject(KitToastService);

protected save() {
  this.#toasts.success('Saved.');
}

protected fail() {
  // An error stays until it is closed
  this.#toasts.error('Could not save the changes.');
}

protected async remove() {
  const reason = await this.#toasts.info('Item deleted.', { action: 'Undo' }).closed;
  if (reason === 'action') {
    this.restore();
  }
}
