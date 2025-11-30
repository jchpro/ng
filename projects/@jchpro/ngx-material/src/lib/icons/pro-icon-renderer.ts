import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { IconInstanceInitializer, ProIcon } from './icons';
import { IconsService } from './icons.service';

@Component({
  selector: 'pro-icon',
  imports: [
    NgComponentOutlet
  ],
  template: `
    @if (init()) {
      <ng-container
        [ngComponentOutlet]="init()!.type"
        [ngComponentOutletInputs]="inputs()">
      </ng-container>
    }
  `,
  styles: ':host { display: contents; }'
})
export class ProIconRenderer implements OnInit {

  readonly icon = input.required<ProIcon>();

  readonly #service = inject(IconsService);

  init = signal<IconInstanceInitializer | undefined>(undefined);
  inputs = computed(() => {
    const init = this.init();
    if (!init) {
      return {};
    }
    return {
      [init.inputName]: init.value,
    }
  });

  ngOnInit() {
    this.init.set(this.#service.getInitializer(this.icon()));
  }

}

