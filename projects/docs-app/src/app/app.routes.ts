import { Routes } from '@angular/router';
import { Docs } from './docs/docs';
import { DocsStart } from './docs/start/docs-start';
import { LIBS } from './libs';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'docs'
  },
  {
    path: 'docs',
    component: Docs,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DocsStart,
        title: '@jchpro/ngx libraries documentation'
      },
      {
        path: 'lib',
        children: LIBS.map(lib => {
          return {
            path: lib.path,
            data: {
              lib,
              title: lib.libName
            },
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: lib.component
              },
              ...lib.pages.map(page => ({
                path: page.path,
                data: {
                  lib,
                  page,
                  title: page.fullName + '/' + lib.libName
                },
                component: page.component
              }))
            ]
          };
        })
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'docs'
  }
];
