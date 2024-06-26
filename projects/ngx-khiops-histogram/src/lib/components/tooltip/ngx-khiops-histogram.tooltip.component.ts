import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-khiops-histogram-tooltip',
  template: `
    <div
      [ngStyle]="{
        'left.px': this.computeXPos(),
        'top.px': this.computeYPos()
      }"
      class="tooltip"
      [style.display]="display ? 'block' : 'none'"
    >
      <p [innerHTML]="text"></p>
    </div>
  `,
  styles: [
    `
      .tooltip {
        font-family: verdana;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-weight: 200;
        z-index: 2;
        padding: 0 10px;
        border-radius: 5px;
        font-size: 0.8rem;
        pointer-events: none;
      }
    `,
  ],
})
export class NgxKhiopsHistogramTooltipComponent {
  @Input() text: string = '';
  @Input() posX: number = 0;
  @Input() posY: number = 0;
  @Input() canvasW: number = 0;
  @Input() display: boolean = false;

  constructor() {}

  computeYPos() {
    let top = this.posY - 0;
    if (top < 10) {
      top = 10;
    }
    return top;
  }

  computeXPos() {
    let left = this.posX + 20;
    if (left < 10) {
      left = 10;
    }
    if (left > this.canvasW - 170) {
      left = this.posX - 170;
    }
    return left;
  }
}
