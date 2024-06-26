import { Injectable } from '@angular/core';
// import { TranslateService } from '@ngstack/translate';
import * as d3 from 'd3';
import { HistogramValuesI } from '../interfaces/ngx-khiops-histogram.interfaces';

@Injectable({
  providedIn: 'root',
})
export class HistogramUIService {
  static readonly chartColors: string[] = ['#6e93d5', '#ffbe46'];
  // static translate: TranslateService;

  static setTranslationService() {
    // translate: TranslateService
    // this.translate = translate;
  }

  static getColor(i: number): string {
    return this.chartColors[i];
  }

  static getColors(): string[] {
    return this.chartColors;
  }

  // @ts-ignore
  static getCurrentBarPosition(
    datas: HistogramValuesI[],
    canvasPosition: DOMRect,
    event: MouseEvent,
    yPadding: number = 0
  ) {
    if (datas) {
      let x = event.pageX - canvasPosition.left;
      let y = event.pageY - canvasPosition.top;

      for (let i = 0; i < datas.length; i++) {
        if (
          // @ts-ignore
          y > datas?.[i].coords?.y &&
          // @ts-ignore
          y < datas?.[i].coords?.y + datas?.[i].coords?.barH + yPadding / 2 &&
          // @ts-ignore
          x > datas?.[i].coords?.x &&
          // @ts-ignore
          x < datas?.[i].coords?.x + datas?.[i].coords?.barW
        ) {
          return i;
        }
      }
    }

    return undefined;
  }

  static generateTooltip(
    datasLabels: any,
    d: HistogramValuesI,
    isFirstInterval: boolean
  ): string {
    let bounds = '';
    if (isFirstInterval) {
      bounds += '[';
    } else {
      bounds += ']';
    }
    bounds += d.partition[0] + ', ' + d.partition[1] + ']';
    return (
      // this.translate.get('GLOBAL.DENSITY') +
      datasLabels.value +
      ': ' +
      d3.format('.2e')(d.value) +
      '<br>' +
      // this.translate.get('GLOBAL.FREQUENCY') +
      datasLabels.frequency +
      ': ' +
      d.frequency +
      '<br>' +
      // this.translate.get('GLOBAL.INTERVAL') +
      datasLabels.partition +
      ': ' +
      bounds
    );
  }

  static initCanvasContext(
    canvas: HTMLCanvasElement | undefined | null,
    w: number,
    h: number
  ) {
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.imageSmoothingEnabled = true;
      canvas.width = w;
      canvas.height = h;
    }
    return ctx;
  }

  /**
   * Before draw canvas, clean dom
   */
  static cleanDomContext(
    ctx: CanvasRenderingContext2D | undefined | null,
    canvas: HTMLCanvasElement | undefined | null
  ) {
    if (canvas) {
      // @ts-ignore
      ctx = canvas.getContext('2d');
      // @ts-ignore
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  static hexToRgba(hex: string, alpha: number) {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      throw new Error('Invalid Hex format');
    }
    let c;
    if (hex.length === 4) {
      c = '#' + [hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
    } else {
      c = hex;
    }
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
