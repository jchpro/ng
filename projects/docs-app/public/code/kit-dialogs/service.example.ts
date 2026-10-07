const dialogs = inject(KitDialogService);

// Tell the user something, resolves once it's dismissed
await dialogs.alert({ message: 'Saved.' });
await dialogs.alert({ tone: 'error', message: error.message });

// Ask something: true when confirmed, false when cancelled or dismissed
const confirmed = await dialogs.confirm({
  tone: 'danger',
  message: `Delete ${user.name}? This can't be undone.`,
  confirmLabel: 'Delete'
});
if (confirmed) {
  await this.users.delete(user.id);
}

// Per call: title, buttons, yes/no labels
await dialogs.confirm({ message: 'Publish the page?', buttons: 'yes-no', title: 'Publish' });
