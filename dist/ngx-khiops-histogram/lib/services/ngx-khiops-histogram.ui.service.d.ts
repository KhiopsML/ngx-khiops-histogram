import { HistogramValuesI } from '../interfaces/ngx-khiops-histogram.interfaces';
import * as i0 from "@angular/core";
export declare class HistogramUIService {
    static readonly chartColors: string[];
    static setTranslationService(): void;
    static getColor(i: number): string;
    static getColors(): string[];
    static getCurrentBarPosition(datas: HistogramValuesI[], canvasPosition: DOMRect, event: MouseEvent, yPadding?: number): number | undefined;
    static generateTooltip(datasLabels: any, d: HistogramValuesI, isFirstInterval: boolean): string;
    static initCanvasContext(canvas: HTMLCanvasElement | undefined | null, w: number, h: number): CanvasRenderingContext2D | null | undefined;
    /**
     * Before draw canvas, clean dom
     */
    static cleanDomContext(ctx: CanvasRenderingContext2D | undefined | null, canvas: HTMLCanvasElement | undefined | null): void;
    static hexToRgba(hex: string, alpha: number): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HistogramUIService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HistogramUIService>;
}
