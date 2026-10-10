protected readonly form = form(this.model, path => {
  required(path.name);        // "This field is required."
  minLength(path.name, 3);    // "Enter at least 3 characters."
  validate(path.nickname, ({ value }) => value() === 'admin' ? { kind: 'reserved' } : undefined);
});

// Polish, or any language that changes at runtime: provideKitLabels(languageSignal).
// A single text: provideKitFormLabels({ errors: { required: 'Fill this in.' } }).
