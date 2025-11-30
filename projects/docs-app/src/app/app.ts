import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleService } from '@jchpro/ngx-common';
import { ThemesService } from './core/services/themes.service';
import { DocsContextService } from './docs/docs-context.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  #titleService = inject(TitleService);
  #themesService = inject(ThemesService);
  #docsContextService = inject(DocsContextService);

}
