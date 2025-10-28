import * as i0 from '@angular/core';
import { ElementRef, EventEmitter, Renderer2, SimpleChanges } from '@angular/core';
import * as i4 from 'angular-resize-event';
import { ResizedEvent } from 'angular-resize-event';
import * as d3 from 'd3';
import * as i3 from '@angular/common';

interface RangeXLogI {
    inf?: HistogramValuesI;
    max?: number;
    middlewidth?: number;
    min?: number;
    negStart?: number;
    negValuesCount?: number;
    posStart?: number;
    posValuesCount?: number;
}
interface RangeYLogI {
    min?: number;
    max?: number;
}
interface RangeXLinI {
    min?: number;
    max?: number;
}
interface HistogramValuesI {
    frequency: number;
    logValue: number;
    partition: number[];
    value: number;
    coords?: {
        x: number;
        y: number;
        barW: number;
        barH: number;
    };
}
interface HistogramOptions {
    selectedBarColor: string;
    gridColor: string;
    xPadding: number;
    yPadding: number;
    minBarHeight: number;
}
interface HistogramData {
    frequency: number;
    partition: [number, number];
    value: number;
    logValue: number;
}

declare class HistogramBarVO {
    barWlog: number;
    barXlog: number;
    barWlin: number;
    barXlin: number;
    color: string;
    partition: never[];
    constructor(d: HistogramValuesI, middlewidth: number, xType: string);
    computeXLog(bars: HistogramBarVO[]): void;
    computeXLin(bars: HistogramBarVO[]): void;
}

declare class HistogramService {
    rangeXLin: RangeXLinI;
    rangeYLin: number;
    rangeYLog: RangeYLogI;
    rangeXLog: RangeXLogI;
    getRangeX(datas: HistogramValuesI[]): [RangeXLinI, RangeXLogI];
    getLinRangeY(datas: HistogramValuesI[]): number;
    getLogRangeY(datas: HistogramValuesI[]): RangeXLinI;
    getLinRatioY(h: number, padding?: number): number;
    getLogRatioY(h: number, padding?: number): number;
    computeXbarsDimensions(datas: HistogramValuesI[], xType: string): HistogramBarVO[];
    static ɵfac: i0.ɵɵFactoryDeclaration<HistogramService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HistogramService>;
}

declare enum HistogramType {
    XLOG = "xLog",
    XLIN = "xLin",
    YLOG = "yLog",
    YLIN = "yLin"
}

declare class NgxKhiopsHistogramComponent {
    private histogramService;
    private el;
    private renderer;
    chart: ElementRef;
    componentType: string;
    svg: d3.Selection<SVGElement, unknown, HTMLElement, any> | undefined;
    private resizeSubject;
    selectedItemChanged: EventEmitter<any>;
    datas: HistogramValuesI[] | undefined;
    datasLabels: any;
    selectedItem: number;
    graphOptionX: HistogramType | undefined;
    graphOptionY: HistogramType | undefined;
    options: HistogramOptions;
    h: number;
    w: number;
    bars: HistogramBarVO[];
    xTickCount: number;
    yTicksCount: number;
    tickSize: number;
    rangeXLog: RangeXLogI | undefined;
    rangeXLin: RangeXLinI | undefined;
    rangeYLin: number | undefined;
    rangeYLog: RangeYLogI | undefined;
    ratioY: number;
    ratio: number;
    isLoading: boolean;
    colorSet: string[];
    ctx: CanvasRenderingContext2D | null | undefined;
    ctxSelected: CanvasRenderingContext2D | null | undefined;
    ctxHover: CanvasRenderingContext2D | null | undefined;
    histogramCanvas: HTMLCanvasElement | null | undefined;
    histogramHoverCanvas: HTMLCanvasElement | null | undefined;
    histogramSelectedCanvas: HTMLCanvasElement | null | undefined;
    tooltipText: string;
    tooltipPosX: number;
    tooltipPosY: number;
    tooltipDisplay: boolean;
    constructor(histogramService: HistogramService, el: ElementRef, renderer: Renderer2);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    changeGraphTypeX(type: HistogramType): void;
    changeGraphTypeY(type: HistogramType): void;
    onResized(event: ResizedEvent): void;
    handleResized(event: ResizedEvent): void;
    ngOnChanges(changes: SimpleChanges): void;
    handleCanvasClick(event: any): void;
    drawSelectedItem(): void;
    handleCanvasOut(): void;
    handleCanvasMove(event: any): void;
    showTooltip(event: MouseEvent, text: string): void;
    hideTooltip(): void;
    init(): void;
    drawChart(chartW: number): void;
    drawRect(ctx: CanvasRenderingContext2D, d: HistogramValuesI, bar: HistogramBarVO, ratio?: number, selectedItem?: boolean): void;
    drawHistogram(datasSet: HistogramValuesI[]): void;
    drawXAxis(domain: number[], shift: number, width: number): void;
    drawYAxis(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxKhiopsHistogramComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxKhiopsHistogramComponent, "ngx-khiops-histogram", never, { "datas": { "alias": "datas"; "required": false; }; "datasLabels": { "alias": "datasLabels"; "required": false; }; "selectedItem": { "alias": "selectedItem"; "required": false; }; "graphOptionX": { "alias": "graphOptionX"; "required": false; }; "graphOptionY": { "alias": "graphOptionY"; "required": false; }; "options": { "alias": "options"; "required": false; }; }, { "selectedItemChanged": "selectedItemChanged"; }, never, never, false, never>;
}

declare class NgxKhiopsHistogramTooltipComponent {
    text: string;
    posX: number;
    posY: number;
    canvasW: number;
    display: boolean;
    constructor();
    computeYPos(): number;
    computeXPos(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxKhiopsHistogramTooltipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxKhiopsHistogramTooltipComponent, "ngx-khiops-histogram-tooltip", never, { "text": { "alias": "text"; "required": false; }; "posX": { "alias": "posX"; "required": false; }; "posY": { "alias": "posY"; "required": false; }; "canvasW": { "alias": "canvasW"; "required": false; }; "display": { "alias": "display"; "required": false; }; }, {}, never, never, false, never>;
}

declare class NgxKhiopsHistogramModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxKhiopsHistogramModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NgxKhiopsHistogramModule, [typeof NgxKhiopsHistogramComponent, typeof NgxKhiopsHistogramTooltipComponent], [typeof i3.CommonModule, typeof i4.AngularResizeEventModule], [typeof NgxKhiopsHistogramComponent, typeof NgxKhiopsHistogramTooltipComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NgxKhiopsHistogramModule>;
}

export { HistogramService, HistogramType, NgxKhiopsHistogramComponent, NgxKhiopsHistogramModule, NgxKhiopsHistogramTooltipComponent };
export type { HistogramData, HistogramOptions, HistogramValuesI, RangeXLinI, RangeXLogI, RangeYLogI };
