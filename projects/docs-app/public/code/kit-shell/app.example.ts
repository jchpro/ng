import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { KitShell, KitShellFooter, KitShellHeader, KitShellRoot, KitShellSidenav } from '@jchpro/ngx-kit';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, KitShell, KitShellHeader, KitShellSidenav, KitShellFooter],
  hostDirectives: [KitShellRoot],   // Required, the shell's CSS only applies below an element marked with it
  templateUrl: './app.html',
})
export class App {}
