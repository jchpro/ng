
import { ComponentRef, inject, Injectable, Injector, Provider, DOCUMENT } from "@angular/core";
import { PICO_CONFIG } from '../../config';
import { PICO_DIALOG_REF, PicoDialogConfig, PicoDialogRef } from './pico-dialog';
import { PicoDialogHostComponent } from './pico-dialog-host.component';
import { PicoDialogOutletService } from './pico-dialog-outlet.service';

@Injectable({
  providedIn: "root",
})
export class PicoDialogService {

  private static OPEN_CLS = 'modal-is-open';
  private static OPENING_CLS = 'modal-is-opening';
  private static CLOSING_CLS = 'modal-is-closing';
  private static ANIMATION_DUR = 600;

  private readonly outletService = inject(PicoDialogOutletService);
  private readonly htmlElement: HTMLHtmlElement;
  private readonly globalConfig = inject(PICO_CONFIG).dialog;
  private readonly injector = inject(Injector);

  constructor() {
    this.htmlElement = inject(DOCUMENT).querySelector('html')!
  }

  /**
   * Opens the dialog, returns the `Promise` with result of type R.
   * Please note that if you enable `closeOnOverlayClick` the result can be `undefined`
   */
  open<D = any, R = any>(config: PicoDialogConfig<D>): Promise<R> {
    const effectiveConfig = {
      ...this.globalConfig,
      ...config
    };
    return new Promise<R>(resolve => {
      let hostRef: ComponentRef<PicoDialogHostComponent>;
      const dialogRef: PicoDialogRef<D, R> = {
        data: effectiveConfig.data,
        close: (result: R) => {
          resolve(result);
          const dispose = () => {
            hostRef!.destroy();
          }
          if (effectiveConfig.animation) {
            this.processAnimation(false, dispose);
            return;
          }
          dispose();
          this.htmlElement.classList.remove(PicoDialogService.OPEN_CLS);
        }
      };
      const providers: Provider[] = [
        { provide: PICO_DIALOG_REF, useValue: dialogRef }
      ];
      hostRef = this.attachHost(providers, effectiveConfig.injector);
      const host = hostRef.instance;
      host.projectContent(
        effectiveConfig.content,
        dialogRef,
        effectiveConfig.closeOnOverlayClick === true
      );
      host.open({ styles: effectiveConfig.styles });
      if (effectiveConfig.animation) {
        this.processAnimation(true);
        return
      }
      this.htmlElement.classList.add(PicoDialogService.OPEN_CLS);
    });

  }

  private attachHost(providers: Provider[], injector?: Injector): ComponentRef<PicoDialogHostComponent> {
    const viewRef = this.outletService.viewContainer;
    return viewRef.createComponent(PicoDialogHostComponent, {
      injector: Injector.create({
        providers,
        parent: injector ?? this.injector
      })
    });
  }

  private processAnimation(on: boolean, cb?: () => void): void {
    const htmlClasses = this.htmlElement.classList;
    if (on) {
      htmlClasses.add(PicoDialogService.OPENING_CLS);
      setTimeout(() => {
        htmlClasses.add(PicoDialogService.OPEN_CLS);
        htmlClasses.remove(PicoDialogService.OPENING_CLS);
        cb?.();
      }, PicoDialogService.ANIMATION_DUR);
      return;
    }
    htmlClasses.add(PicoDialogService.CLOSING_CLS);
    setTimeout(() => {
      htmlClasses.remove(PicoDialogService.OPEN_CLS, PicoDialogService.CLOSING_CLS);
      cb?.();
    }, PicoDialogService.ANIMATION_DUR);
  }

}
