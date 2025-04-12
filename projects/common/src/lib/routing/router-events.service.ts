import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Event, Router } from "@angular/router";
import { filter, map, Observable, OperatorFunction } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RouterEventsService {

  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);


  /**
   * Filters router events by class.
   */
  onEvent<T extends Event>(eventType: new (...args: any[]) => T): Observable<T> {
    return this.router.events
     .pipe(
       filter(event => event instanceof eventType)
     ) as Observable<T>;
  }

  /**
   * Resolves `ActivatedRoute`
   */
  resolveActivatedRoute<T = any>(): OperatorFunction<T, ActivatedRoute> {
    return map(() => {
      let route = this.route;
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    });
  }

}

