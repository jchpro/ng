import { inject, Injectable } from '@angular/core';
import { RouterEventsService } from '@jchpro/ngx-common';
import { NavigationEnd } from '@angular/router';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageAnalyticsService {

  #routerEvents = inject(RouterEventsService);

  constructor() {
    this.#routerEvents.onEvent(NavigationEnd)     // fires on every completed navigation
      .pipe(
        this.#routerEvents.resolveActivatedRoute(), // maps to the deepest ActivatedRoute
        map(route => route.snapshot.data)
      )
      .subscribe(data => {
        // e.g. send `data` to your analytics provider
      });
  }

}
