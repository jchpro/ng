import { bootstrapApplication } from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import scss from 'highlight.js/lib/languages/scss';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { appConfig } from './app/app.config';
import { App } from './app/app';

hljs.registerLanguage('json', json);
hljs.registerLanguage('ts', ts);
hljs.registerLanguage('html', html);
hljs.registerLanguage('scss', scss);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
