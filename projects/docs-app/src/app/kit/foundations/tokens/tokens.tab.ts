import { Component } from '@angular/core';

@Component({
  selector: 'app-foundations-tokens',
  templateUrl: './tokens.tab.html',
  styleUrl: './tokens.tab.scss'
})
export class TokensTab {

  protected readonly surfaces = [
    { token: 'canvas', use: 'The page behind everything' },
    { token: 'raised', use: 'Cards, fields, panels: anything sitting on the canvas' },
    { token: 'overlay', use: 'Dialogs, menus and popovers; also the scrim of a dialog' },
    { token: 'sunken', use: 'Code blocks, wells, the background of tiles: set into the surface, not on it' }
  ];

}
