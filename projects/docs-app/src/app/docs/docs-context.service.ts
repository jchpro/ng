import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { RouterEventsService } from '@jchpro/ngx-common';
import { map } from 'rxjs';
import { DocLib, DocPage } from './types';

@Injectable({
  providedIn: 'root'
})
export class DocsContextService {

  #context = signal<DocsContext>({});

  constructor() {
    const route = inject(ActivatedRoute);
    inject(RouterEventsService)
       .onEvent(NavigationEnd)
       .pipe(
         map(() => {
           let child: ActivatedRouteSnapshot | null = route.snapshot.root;
           let data: any = {};
           while (child) {
             data = child.data;
             child = child.firstChild;
           }
           return data;
         })
       )
      .subscribe(data => {
        this.#context.set({
          lib: data.lib,
          page: data.page
        });
      })
  }

  get context() {
    return this.#context.asReadonly();
  }

  get hasMenu() {
    return computed(() => {
      const context = this.context();
      return !!context.lib?.pages.length || !!context.page;
    });
  }

}

export interface DocsContext {
  lib?: DocLib;
  page?: DocPage;
}
