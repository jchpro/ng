protected readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');

protected reset() {
  // form().reset(value) and the native formElement.reset(): an emptied required field no longer looks invalid
  resetKitForm(this.form, this.formElement(), { name: '', email: '' });
}
