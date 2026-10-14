import { Routes } from '@angular/router';
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
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DocsStart,
        data: {
          title: 'Overview'
        }
      },
      {
        path: 'lib',
        children: LIBS.map(lib => {
          return {
            path: lib.path,
            data: {
              lib,
              title: lib.name
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
                  title: page.fullName + ' | ' + lib.name
                },
                component: page.component,
                children: page.tabs && [
                  {
                    path: '',
                    pathMatch: 'full' as const,
                    redirectTo: page.tabs[0].path
                  },
                  ...page.tabs.map(tab => ({
                    path: tab.path,
                    data: {
                      lib,
                      page,
                      tab,
                      title: tab.label + ' | ' + page.fullName + ' | ' + lib.name
                    },
                    component: tab.component
                  }))
                ]
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
