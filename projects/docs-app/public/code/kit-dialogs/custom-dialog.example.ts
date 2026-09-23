@Component({
  imports: [KitDialogTitle, KitDialogClose],
  templateUrl: './edit-user.dialog.html',
  host: { 'class': 'kit-dialog' }
})
export class EditUserDialog {
  protected readonly data = inject<{ user: User }>(DIALOG_DATA);
  protected readonly name = signal(this.data.user.name);
}

// Opening it
const ref = dialogs.open<User, { user: User }, EditUserDialog>(EditUserDialog, {
  data: { user },
  size: 'md'
});
const updated = await ref.result;   // the bound value, or undefined if dismissed
