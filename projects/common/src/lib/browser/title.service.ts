import { EnvironmentProviders, inject, Injectable, InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd } from "@angular/router";
import { map } from "rxjs";
import { RouterEventsService } from "../routing/router-events.service";

/**
 * Observes `NavigationEnd` event and tries to resolve route data containing
 * the title to set as `<title>` tag content, assuming the data object implements {@link RouteTitleData}.
 */
@Injectable({
  providedIn: 'root'
})
export class TitleService {

  protected readonly routerEventsService = inject(RouterEventsService);
  protected readonly title = inject(Title);
  protected readonly formatFn = inject(ROUTE_TITLE_FORMAT_FN, { optional: true });

  constructor() {
    this.observeNavigationEnd();
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
   * Formats the title using function provided with {@link ROUTE_TITLE_FORMAT_FN},
   * if not just returns the passed string.
   */
  public format(dynamic: string): string {
    return this.formatFn?.(dynamic) ?? dynamic;
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

/**
 * Holder of the view title for usage in routing data.
 */
export interface RouteTitleData {
  title?: string;
}

/**
 * Allows formating the title, great for adding postfixes, prefixes, etc.
 */
export type RouteTitleFormatFn = (dynamic: string) => string;

/**
 * Injection token for providing {@link RouteTitleFormatFn}, please use {@link provideRouteTitleFormat}.
 */
export const ROUTE_TITLE_FORMAT_FN = new InjectionToken<RouteTitleFormatFn>('ROUTE_TITLE_FORMAT_FN');

/**
 * Provides a function which will be used to dynamically format the title.
 */
export function provideRouteTitleFormat(formatFn: RouteTitleFormatFn): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: ROUTE_TITLE_FORMAT_FN,
    useValue: formatFn
  }]);
}
