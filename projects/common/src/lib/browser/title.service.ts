import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd } from "@angular/router";
import { map } from "rxjs";
import { RouterEventsService } from "../routing/router-events.service";
import { BROWSER_TITLE_CONFIG, RouteTitleData } from './title-config';

/**
 * Wrapper around Angular's `Title` with:
 * - `NavigationEnd` observing and resolving title from route data
 * - using format function to dynamically augment the title.
 */
@Injectable({
  providedIn: 'root'
})
export class TitleService {

  protected readonly routerEventsService = inject(RouterEventsService);
  protected readonly title = inject(Title);
  protected readonly config = inject(BROWSER_TITLE_CONFIG, { optional: true });

  constructor() {
    if (this.config?.observeRouteData) {
      this.observeNavigationEnd();
    }
  }

  /**
   * Sets the `<title>` tag content, uses format function if provided.
   */
  public set(title: string): void {
    this.title.setTitle(
      this.format(title)
    );
  }

  /**
   * Returns the raw title from the Angular's service
   */
  public get(): string {
    return this.title.getTitle();
  }

  /**
   * Formats the title using function provided in config,
   * if not provided just returns the passed string.
   */
  public format(dynamic: string): string {
    return this.config?.formatFn?.(dynamic) ?? dynamic;
  }

  private observeNavigationEnd(): void {
    this.routerEventsService.onEvent(NavigationEnd)
      .pipe(
        this.routerEventsService.resolveActivatedRoute(),
        map(route => (route.snapshot.data as RouteTitleData).title)
      )
      .subscribe(title => {
        if (!title) {
          return;
        }
        this.set(title);
      });
  }

}
