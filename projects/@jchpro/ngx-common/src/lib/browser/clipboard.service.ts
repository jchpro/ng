import { inject, Injectable } from '@angular/core';
import { WINDOW } from '../tokens/window';

/**
 * Puts text on the clipboard of the browser, through the `WINDOW` token.
 */
@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  protected readonly window = inject(WINDOW);

  /**
   * Copies `text`. Answers `false` instead of throwing when the page cannot write to the clipboard
   * (no permission, an insecure origin, no Clipboard API at all), so the caller can offer the text to copy by hand.
   */
  async copy(text: string): Promise<boolean> {
    try {
      await this.window.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

}
