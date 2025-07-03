# Pico.css for Angular

This library provides integrations of components and form controls for Angular

## Description

Pico.css provides styling for semantic HTML, allowing for quick and easy building of simple web apps. 

This library doesn't want to against this philosophy, so if a solution works just fine without additional JS logic,
you won't find corresponding mechanisms from Pico.css in here. One example can be buttons: to set them up in Pico.css
you only need some CSS classes and few attributes, so no need to overcomplicate it at the library level.

Most significant are integrations for form controls and modals.

## Installation

Required peer dependencies are:

- `@angular/common`
- `@angular/core`
- `@picocss/pico`

```shell
npm i @jchpro/ngx-pico
```

## Setup

### Stylesheet

You have two options:

1. Include Pico.css SASS in your global project stylesheet ([more about customization](https://picocss.com/docs/sass))
2. Include pre-built CSS file with Pico.css in the styles section inside your project's config in `angular.json`.

**Important!** 

This library won't work properly with "classless" version of Pico.css.

### Angular

You can optionally set some global configuration using `providePicoConfig`, but it's not required.
Please refer to the code comments for more information.
