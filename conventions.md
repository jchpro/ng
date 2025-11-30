When writing code, you MUST follow these principles:

- create readable and easy to understand code
- use strong typing wherever it's possible
- use guard pattern, avoid `else` branches
- omit `public` modifier, but include other ones as is most appropriate
- all components should be standalone
- create SCSS stylesheets

When writing unit test, you MUST follow these principles:

- mock dependencies, unless you're told otherwise
- in case of standalone components use `TestBed.createComponent` instead of `TestBed.configureTestingModule`
