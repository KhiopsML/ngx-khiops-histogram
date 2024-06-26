import * as i0 from '@angular/core';
import { Injectable, Component, Input, EventEmitter, ViewChild, Output, NgModule } from '@angular/core';
import { format } from 'mathjs';
import { Subject, debounceTime } from 'rxjs';
import * as d3 from 'd3';
import * as i2 from 'angular-resize-event';
import { AngularResizeEventModule } from 'angular-resize-event';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

var HistogramType;
(function (HistogramType) {
    HistogramType["XLOG"] = "xLog";
    HistogramType["XLIN"] = "xLin";
    HistogramType["YLOG"] = "yLog";
    HistogramType["YLIN"] = "yLin";
})(HistogramType || (HistogramType = {}));

class HistogramUIService {
    static { this.chartColors = ['#6e93d5', '#ffbe46']; }
    // static translate: TranslateService;
    static setTranslationService() {
        // translate: TranslateService
        // this.translate = translate;
    }
    static getColor(i) {
        return this.chartColors[i];
    }
    static getColors() {
        return this.chartColors;
    }
    // @ts-ignore
    static getCurrentBarPosition(datas, canvasPosition, event, yPadding = 0) {
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
                    x < datas?.[i].coords?.x + datas?.[i].coords?.barW) {
                    return i;
                }
            }
        }
        return undefined;
    }
    static generateTooltip(datasLabels, d, isFirstInterval) {
        let bounds = '';
        if (isFirstInterval) {
            bounds += '[';
        }
        else {
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
            bounds);
    }
    static initCanvasContext(canvas, w, h) {
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
    static cleanDomContext(ctx, canvas) {
        if (canvas) {
            // @ts-ignore
            ctx = canvas.getContext('2d');
            // @ts-ignore
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    static hexToRgba(hex, alpha) {
        if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            throw new Error('Invalid Hex format');
        }
        let c;
        if (hex.length === 4) {
            c = '#' + [hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
        }
        else {
            c = hex;
        }
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramUIService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramUIService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramUIService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

class HistogramBarVO {
    constructor(d, middlewidth, xType) {
        this.barWlog = 0;
        this.barXlog = 0;
        this.barWlin = 0;
        this.barXlin = 0;
        this.color = HistogramUIService.getColor(1);
        this.partition = [];
        //@ts-ignore
        this.partition = d.partition;
        if (xType === HistogramType.XLIN) {
            let barWlin = 0;
            if (this.partition[0] < 0 && this.partition[1] > 0) {
                barWlin = Math.abs(this.partition[0]) + Math.abs(this.partition[1]);
            }
            else {
                barWlin = Math.abs(this.partition[0]) - Math.abs(this.partition[1]);
            }
            this.barWlin = Math.abs(barWlin);
        }
        else {
            let barWlog = 0;
            if (d.partition[0] === 0 || d.partition[1] === 0) {
                barWlog = Math.log10(middlewidth);
                this.color = HistogramUIService.getColor(0);
            }
            else {
                barWlog =
                    Math.log10(Math.abs(this.partition[0])) -
                        Math.log10(Math.abs(this.partition[1]));
                if (this.partition[0] < 0 && this.partition[1] > 0) {
                    barWlog = Math.log10(middlewidth) * 2;
                    this.color = HistogramUIService.getColor(0);
                }
            }
            this.barWlog = Math.abs(barWlog);
        }
    }
    computeXLog(bars) {
        let sum = bars.reduce((partialSum, a) => Math.abs(partialSum) + Math.abs(a.barWlog), 0);
        this.barXlog = sum || 0;
    }
    computeXLin(bars) {
        let sum = bars.reduce((partialSum, a) => Math.abs(partialSum) + Math.abs(a.barWlin), 0);
        this.barXlin = sum || 0;
    }
}

class HistogramService {
    constructor() {
        this.rangeXLin = {};
        this.rangeYLin = 0;
        this.rangeYLog = {
            min: 0,
            max: 0,
        };
        this.rangeXLog = {};
    }
    getRangeX(datas) {
        this.rangeXLog.inf = datas.find(function (d) {
            return d.partition[0] === 0 || d.partition[1] === 0;
        });
        this.rangeXLog.min = datas[0].partition[0];
        this.rangeXLog.negValuesCount = datas.filter(function (d) {
            return d.partition[1] < 0;
        })?.length;
        this.rangeXLog.posValuesCount = datas.filter(function (d) {
            return d.partition[1] > 0;
        })?.length;
        if (this.rangeXLog.inf) {
            // 0 exist
            this.rangeXLog.negStart =
                // @ts-ignore update it with es2023
                datas.findLast(function (d) {
                    return d.partition[0] < 0 && d.partition[1] <= 0;
                })?.partition[0] || undefined;
            this.rangeXLog.posStart =
                datas.find(function (d) {
                    return d.partition[0] > 0 && d.partition[1] > 0;
                })?.partition[0] || undefined;
        }
        else {
            this.rangeXLog.negStart =
                // @ts-ignore update it with es2023
                datas.findLast(function (d) {
                    return d.partition[0] < 0 && d.partition[1] <= 0;
                })?.partition[1] || undefined;
            this.rangeXLog.posStart =
                datas.find(function (d) {
                    return d.partition[0] > 0 && d.partition[1] > 0;
                })?.partition[0] || undefined;
        }
        this.rangeXLog.max = datas[datas.length - 1].partition[1];
        this.rangeXLog.middlewidth = 1.2;
        this.rangeXLin.min = datas[0].partition[0];
        this.rangeXLin.max = datas[datas.length - 1].partition[1];
        return [this.rangeXLin, this.rangeXLog];
    }
    getLinRangeY(datas) {
        const dataValues = datas.map((d) => d.value);
        this.rangeYLin = Math.max(...dataValues);
        return this.rangeYLin;
    }
    getLogRangeY(datas) {
        const dataValues = datas.map((e) => e.logValue).filter((e) => e !== 0);
        this.rangeYLog.max = Math.max(...dataValues);
        this.rangeYLog.min = Math.min(...dataValues);
        return this.rangeYLog;
    }
    getLinRatioY(h, padding = 0) {
        let ratioY = (h - padding / 2) / this.rangeYLin;
        return ratioY;
    }
    getLogRatioY(h, padding = 0) {
        let ratioY;
        // @ts-ignore
        let shift = Math.abs(this.rangeYLog.min) - Math.abs(this.rangeYLog.max);
        ratioY = (h - padding / 2) / shift;
        return ratioY;
    }
    computeXbarsDimensions(datas, xType) {
        let bars = [];
        datas.forEach((d, i) => {
            let histogramBar = new HistogramBarVO(d, 
            // @ts-ignore
            this.rangeXLog.middlewidth, xType);
            if (xType === HistogramType.XLIN) {
                histogramBar.computeXLin(bars);
            }
            else {
                histogramBar.computeXLog(bars);
            }
            bars.push(histogramBar);
        });
        return bars;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: HistogramService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

class NgxKhiopsHistogramTooltipComponent {
    constructor() {
        this.text = '';
        this.posX = 0;
        this.posY = 0;
        this.canvasW = 0;
        this.display = false;
    }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.4", type: NgxKhiopsHistogramTooltipComponent, selector: "ngx-khiops-histogram-tooltip", inputs: { text: "text", posX: "posX", posY: "posY", canvasW: "canvasW", display: "display" }, ngImport: i0, template: `
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
  `, isInline: true, styles: [".tooltip{font-family:verdana;position:absolute;background-color:#000c;color:#fff;font-weight:200;z-index:2;padding:0 10px;border-radius:5px;font-size:.8rem;pointer-events:none}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramTooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-khiops-histogram-tooltip', template: `
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
  `, styles: [".tooltip{font-family:verdana;position:absolute;background-color:#000c;color:#fff;font-weight:200;z-index:2;padding:0 10px;border-radius:5px;font-size:.8rem;pointer-events:none}\n"] }]
        }], ctorParameters: () => [], propDecorators: { text: [{
                type: Input
            }], posX: [{
                type: Input
            }], posY: [{
                type: Input
            }], canvasW: [{
                type: Input
            }], display: [{
                type: Input
            }] } });

class NgxKhiopsHistogramComponent {
    constructor(histogramService, el, renderer) {
        this.histogramService = histogramService;
        this.el = el;
        this.renderer = renderer;
        this.componentType = 'histogram'; // needed to copy datas
        this.resizeSubject = new Subject();
        // Outputs
        this.selectedItemChanged = new EventEmitter();
        this.selectedItem = 0;
        this.graphOptionX = HistogramType.YLOG;
        this.graphOptionY = HistogramType.YLOG;
        this.options = {
            selectedBarColor: 'black',
            gridColor: '#e5e5e5',
            xPadding: 40,
            yPadding: 50,
            minBarHeight: 4,
        };
        this.h = 0;
        this.w = 0;
        this.bars = [];
        // Static config values
        this.xTickCount = 0;
        this.yTicksCount = 10;
        this.tickSize = 0;
        this.ratioY = 0;
        this.ratio = 0;
        this.isLoading = false;
        this.tooltipText = '';
        this.tooltipPosX = 0;
        this.tooltipPosY = 0;
        this.tooltipDisplay = false;
        this.colorSet = HistogramUIService.getColors();
        this.resizeSubject.pipe(debounceTime(100)).subscribe((event) => {
            this.handleResized(event);
        });
    }
    ngAfterViewInit() {
        this.histogramCanvas = document.getElementById('histogram-canvas');
        this.histogramSelectedCanvas = document.getElementById('histogram-canvas-selected');
        this.histogramHoverCanvas = document.getElementById('histogram-canvas-hover');
        this.histogramSelectedCanvas?.addEventListener('click', this.handleCanvasClick.bind(this));
        this.histogramSelectedCanvas?.addEventListener('mousemove', this.handleCanvasMove.bind(this));
        this.histogramSelectedCanvas?.addEventListener('mouseout', this.handleCanvasOut.bind(this));
    }
    ngOnDestroy() {
        this.histogramSelectedCanvas?.removeEventListener('click', this.handleCanvasClick.bind(this));
        this.histogramSelectedCanvas?.removeEventListener('mousemove', this.handleCanvasMove.bind(this));
        this.histogramSelectedCanvas?.removeEventListener('mouseout', this.handleCanvasOut.bind(this));
    }
    changeGraphTypeX(type) {
        // localStorage.setItem(
        //   this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        //     'DISTRIBUTION_GRAPH_OPTION_X',
        //   type
        // );
        this.graphOptionX = type;
        this.datas && this.init();
    }
    changeGraphTypeY(type) {
        // localStorage.setItem(
        //   this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        //     'DISTRIBUTION_GRAPH_OPTION_Y',
        //   type
        // );
        this.graphOptionY = type;
        this.datas && this.init();
    }
    onResized(event) {
        this.resizeSubject.next(event);
    }
    handleResized(event) {
        this.h = this.chart.nativeElement.offsetHeight + 10 - 60; // graph header = 60, +10 to take more height
        this.w = this.chart.nativeElement.offsetWidth;
        // Do it every timesto be sure that chart height has been computed
        this.datas && this.init();
    }
    ngOnChanges(changes) {
        if (changes['options']) {
            console.log('NgxKhiopsHistogramComponent ~ ngOnChanges ~ changes:', changes);
            this.renderer.setStyle(this.el.nativeElement, '--chart-border', this.options.gridColor);
        }
        if (changes['datas'] && !changes['datas'].firstChange) {
            this.datas && this.init();
        }
        if (changes['graphOptionX'] && !changes['graphOptionX'].firstChange) {
            this.datas && this.init();
        }
        if (changes['graphOptionY'] && !changes['graphOptionY'].firstChange) {
            this.datas && this.init();
        }
        if (changes['selectedItem']) {
            this.drawSelectedItem();
        }
    }
    handleCanvasClick(event) {
        const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
        if (this.datas && canvasPosition) {
            const barPosition = HistogramUIService.getCurrentBarPosition(this.datas, canvasPosition, event, this.options.yPadding);
            if (barPosition !== undefined) {
                this.selectedItem = barPosition;
                this.selectedItemChanged.emit(this.selectedItem);
                this.drawSelectedItem();
            }
            else {
                // no bar selected
            }
        }
    }
    drawSelectedItem() {
        HistogramUIService.cleanDomContext(this.ctxSelected, this.histogramSelectedCanvas);
        // reDraw selected item in front of others
        if (this.ctxSelected && this.datas) {
            this.drawRect(this.ctxSelected, this.datas[this.selectedItem], this.bars[this.selectedItem], this.ratio, true);
        }
    }
    handleCanvasOut() {
        this.hideTooltip();
        HistogramUIService.cleanDomContext(this.ctxHover, this.histogramHoverCanvas);
    }
    handleCanvasMove(event) {
        const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
        if (this.datas && canvasPosition) {
            const barPosition = HistogramUIService.getCurrentBarPosition(this.datas, canvasPosition, event, this.options.yPadding);
            if (barPosition !== undefined) {
                const bar = this.datas[barPosition];
                const tooltipText = HistogramUIService.generateTooltip(this.datasLabels, bar, barPosition === 0);
                this.showTooltip(event, tooltipText);
                HistogramUIService.cleanDomContext(this.ctxHover, this.histogramHoverCanvas);
                if (this.ctxHover) {
                    this.drawRect(this.ctxHover, this.datas[barPosition], this.bars[barPosition], this.ratio);
                }
            }
            else {
                this.hideTooltip();
            }
        }
    }
    showTooltip(event, text) {
        this.tooltipPosX = event.offsetX + 20;
        this.tooltipPosY = event.offsetY - 40;
        this.tooltipText = text;
        this.tooltipDisplay = true;
    }
    hideTooltip() {
        this.tooltipDisplay = false;
    }
    init() {
        console.log('HistogramComponent ~ ngOnInit ~ this.datas:', this.datas);
        if (this.histogramCanvas) {
            HistogramUIService.cleanDomContext(this.ctx, this.histogramCanvas);
            HistogramUIService.cleanDomContext(this.ctxHover, this.histogramHoverCanvas);
            HistogramUIService.cleanDomContext(this.ctxSelected, this.histogramSelectedCanvas);
            this.ctx = HistogramUIService.initCanvasContext(this.histogramCanvas, this.w, this.h);
            this.ctxHover = HistogramUIService.initCanvasContext(this.histogramHoverCanvas, this.w, this.h);
            this.ctxSelected = HistogramUIService.initCanvasContext(this.histogramSelectedCanvas, this.w, this.h);
            this.xTickCount = 5; // We must reinit each times
            if (this.chart) {
                this.chart.nativeElement.innerHTML = '';
                if (this.datas) {
                    if (this.datas.length > 500) {
                        // display loading
                        this.isLoading = true;
                    }
                    setTimeout(() => {
                        // const t0 = performance.now();
                        if (this.datas) {
                            if (this.graphOptionY === HistogramType.YLOG) {
                                this.rangeYLog = this.histogramService.getLogRangeY(this.datas);
                                this.ratioY = this.histogramService.getLogRatioY(this.h, this.options.yPadding);
                            }
                            else {
                                this.rangeYLin = this.histogramService.getLinRangeY(this.datas);
                                this.ratioY = this.histogramService.getLinRatioY(this.h, this.options.yPadding);
                            }
                            this.drawChart(this.w);
                            [this.rangeXLin, this.rangeXLog] =
                                this.histogramService.getRangeX(this.datas);
                            if (this.rangeXLog.negValuesCount === 0 ||
                                this.rangeXLog.posValuesCount === 0) {
                                this.xTickCount = this.xTickCount * 2;
                            }
                            this.drawYAxis();
                            this.drawHistogram(this.datas);
                            if (this.graphOptionX === HistogramType.XLIN) {
                                let shift = 0;
                                let width = this.w - 2 * this.options.xPadding;
                                let domain = [this.rangeXLin.min, this.rangeXLin.max];
                                let tickValues = this.datas.map((e) => e.partition[0]);
                                tickValues.push(this.datas[this.datas.length - 1].partition[1]);
                                // @ts-ignore
                                this.drawXAxis(domain, shift, width);
                            }
                            else {
                                // Draw positive axis
                                let shift = 0;
                                let width = 0;
                                let domain = [];
                                if (this.rangeXLog.posStart !== this.rangeXLog.max &&
                                    this.rangeXLog.posValuesCount) {
                                    width = this.w - 2 * this.options.xPadding;
                                    // @ts-ignore
                                    domain = [this.rangeXLog.posStart, this.rangeXLog.max];
                                    let shiftInf = 2;
                                    if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
                                        shiftInf = 1;
                                    }
                                    if (!this.rangeXLog.inf &&
                                        this.rangeXLog.negValuesCount === 0) {
                                        shiftInf = 0; // only positive values
                                    }
                                    shift +=
                                        ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                            // @ts-ignore
                                            Math.log10(this.rangeXLog.middlewidth) *
                                            shiftInf;
                                    if (this.rangeXLog.negValuesCount !== 0) {
                                        shift +=
                                            ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                                // @ts-ignore
                                                Math.log10(Math.abs(this.rangeXLog.min));
                                        shift -=
                                            ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                                // @ts-ignore
                                                Math.log10(Math.abs(this.rangeXLog.negStart));
                                    }
                                    width = this.w - 2 * this.options.xPadding - shift;
                                    this.drawXAxis(domain, shift, width);
                                }
                                // Draw -Inf axis
                                if (this.rangeXLog.inf) {
                                    if (this.rangeXLog.posValuesCount) {
                                        let middleShift = shift -
                                            ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                                // @ts-ignore
                                                Math.log10(this.rangeXLog.middlewidth);
                                        domain = [1];
                                        this.drawXAxis(domain, middleShift - 1, 1);
                                    }
                                    else {
                                        let middleShift = this.w - 2 * this.options.xPadding;
                                        domain = [1];
                                        this.drawXAxis(domain, middleShift - 1, 1); // 1 to make bigger line
                                    }
                                }
                                // Draw negative axis
                                if (
                                // this.rangeXLog.inf ||
                                this.rangeXLog.negStart !== this.rangeXLog.min &&
                                    this.rangeXLog.negValuesCount) {
                                    width = this.w - 2 * this.options.xPadding - width;
                                    // @ts-ignore
                                    domain = [this.rangeXLog.min, this.rangeXLog.negStart];
                                    if (this.rangeXLog.posValuesCount) {
                                        // If there is pos and neg values
                                        width =
                                            width -
                                                ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                                    // @ts-ignore
                                                    Math.log10(this.rangeXLog.middlewidth) *
                                                    2;
                                    }
                                    else {
                                        if (this.rangeXLog.inf) {
                                            width =
                                                width -
                                                    ((this.w - 2 * this.options.xPadding) / this.ratio) *
                                                        // @ts-ignore
                                                        Math.log10(this.rangeXLog.middlewidth);
                                        }
                                    }
                                    this.drawXAxis(domain, 0, width);
                                }
                            }
                            this.drawSelectedItem();
                            // const t1 = performance.now();
                            // console.log('draw histogram ' + (t1 - t0) + ' milliseconds.');
                            this.isLoading = false;
                        }
                    }, this.isLoading ? 100 : 0);
                }
            }
        }
    }
    drawChart(chartW) {
        //@ts-ignore
        this.svg = d3
            .select(this.chart.nativeElement)
            .append('svg')
            .attr('width', chartW)
            .attr('height', this.h + this.options.yPadding);
    }
    drawRect(ctx, d, bar, ratio = 0, selectedItem = false) {
        if (ctx) {
            let barX, barH, barW;
            if (this.graphOptionX === HistogramType.XLIN) {
                barX = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barXlin;
                barW = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barWlin;
            }
            else {
                barX = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barXlog;
                barW = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barWlog;
            }
            if (this.graphOptionY === HistogramType.YLIN) {
                barH = d.value * this.ratioY;
            }
            else {
                if (d.logValue !== 0) {
                    // @ts-ignore
                    let shift = Math.abs(this.rangeYLog.max);
                    barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
                    barH = this.h - this.options.yPadding / 2 - barH;
                }
                else {
                    barH = 0;
                }
            }
            if (barH !== 0 && barH < this.options.minBarHeight) {
                barH = this.options.minBarHeight;
            }
            if (this.graphOptionY === HistogramType.YLOG && barH === 0) {
                barH = this.options.minBarHeight;
            }
            const x = barX + this.options.xPadding + this.options.xPadding / 2;
            const y = this.h - barH;
            // keep current coords to bind clicks and tooltip
            d.coords = {
                x: x,
                y: y,
                barW: barW,
                barH: barH,
            };
            ctx.fillStyle = HistogramUIService.hexToRgba(bar.color, 0.8);
            ctx.lineWidth = 0;
            ctx.fillRect(x, y, barW, barH);
            ctx.strokeStyle = selectedItem
                ? this.options.selectedBarColor
                : bar.color;
            ctx.lineWidth = selectedItem ? 2 : 1;
            ctx.strokeRect(x, y, barW, barH);
        }
    }
    drawHistogram(datasSet) {
        this.bars = this.histogramService.computeXbarsDimensions(datasSet, 
        // @ts-ignore
        this.graphOptionX);
        this.ratio = 0;
        if (this.graphOptionX === HistogramType.XLIN) {
            this.ratio =
                this.bars[this.bars.length - 1].barXlin +
                    this.bars[this.bars.length - 1].barWlin;
        }
        else {
            this.ratio =
                this.bars[this.bars.length - 1].barXlog +
                    this.bars[this.bars.length - 1].barWlog;
        }
        datasSet.forEach((d, i) => {
            // @ts-ignore
            this.drawRect(this.ctx, d, this.bars[i], this.ratio);
        });
    }
    drawXAxis(domain, shift, width) {
        if (width !== 0) {
            let xAxis;
            shift = shift + this.options.xPadding;
            if (this.graphOptionX === HistogramType.XLIN) {
                xAxis = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
            }
            else {
                xAxis = d3.scaleLog().base(10).domain(domain).range([0, width]);
            }
            //@ts-ignore
            const axis = d3
                .axisBottom(xAxis)
                .ticks([this.xTickCount])
                .tickArguments([this.xTickCount, '.0e'])
                .tickSize(-this.h + this.options.yPadding / 2);
            if (this.graphOptionX === HistogramType.XLIN) {
                //@ts-ignore
                axis.tickFormat((d) => {
                    let val = d;
                    return '' + format(val);
                });
            }
            this.svg.insert('g', ':first-child')
                .attr('class', 'barXlog axis-grid')
                .attr('transform', 'translate(' +
                (shift + this.options.xPadding / 2) +
                ',' +
                this.h +
                ') ') // This controls the vertical position of the Axis
                .call(axis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-0.4em')
                .attr('dy', '1em')
                .attr('transform', 'rotate(-35)');
            d3.selectAll('line').style('stroke', this.options.gridColor); // Set the grid color
        }
    }
    drawYAxis() {
        let y;
        // Create the scale
        if (this.graphOptionY === HistogramType.YLIN) {
            y = d3
                .scaleLinear()
                // @ts-ignore
                .domain([0, this.rangeYLin]) // This is what is written on the Axis: from 0 to 100
                .range([this.h - this.options.yPadding / 2, 0]); // Note it is reversed
        }
        else {
            y = d3
                .scaleLinear()
                // @ts-ignore
                .domain([this.rangeYLog.max, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
                .range([0, this.h - this.options.yPadding / 2]); // Note it is reversed
        }
        let shift = this.options.xPadding;
        this.tickSize = -(this.w - this.options.xPadding * 2);
        // Draw the axis
        const axis = d3
            .axisLeft(y)
            .tickSize(this.tickSize)
            .tickPadding(10)
            // @ts-ignore
            .tickFormat((d) => {
            let val = d;
            if (this.graphOptionY === HistogramType.YLIN) {
                return '' + format(val);
            }
            else {
                const antiLog = Math.pow(10, val);
                return d3.format('.0e')(antiLog);
            }
        })
            .ticks(this.yTicksCount);
        // @ts-ignore
        this.svg
            .append('g')
            .attr('class', 'y axis-grid')
            .attr('transform', 'translate(' +
            (shift + this.options.xPadding / 2) +
            ',' +
            this.options.yPadding / 2 +
            ')') // This controls the vertical position of the Axis
            .call(axis)
            .selectAll('line')
            .style('stroke', this.options.gridColor); // Set the grid color
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramComponent, deps: [{ token: HistogramService }, { token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.4", type: NgxKhiopsHistogramComponent, selector: "ngx-khiops-histogram", inputs: { datas: "datas", datasLabels: "datasLabels", selectedItem: "selectedItem", graphOptionX: "graphOptionX", graphOptionY: "graphOptionY", options: "options" }, outputs: { selectedItemChanged: "selectedItemChanged" }, viewQueries: [{ propertyName: "chart", first: true, predicate: ["chart"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"app-histogram\" fxFlexFill (resized)=\"onResized($event)\">\r\n  <canvas id=\"histogram-canvas\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-hover\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-selected\" fxFlex> </canvas>\r\n  <div #chart id=\"histogram-chart\"></div>\r\n  <ngx-khiops-histogram-tooltip\r\n    [text]=\"tooltipText\"\r\n    [canvasW]=\"w\"\r\n    [posX]=\"tooltipPosX\"\r\n    [posY]=\"tooltipPosY\"\r\n    [display]=\"tooltipDisplay\"\r\n  >\r\n  </ngx-khiops-histogram-tooltip>\r\n</div>\r\n", styles: [".app-histogram{position:absolute;top:0;width:100%;margin:0;height:100%;overflow:hidden}.app-histogram #histogram-canvas,.app-histogram #histogram-canvas-hover,.app-histogram #histogram-canvas-selected{z-index:2;position:absolute}.app-histogram #histogram-chart{top:0;position:absolute;width:100%;height:100%;margin:0;padding:0}.app-histogram #histogram-chart ::ng-deep .axis-grid .domain{stroke:none}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick line{stroke-dasharray:5}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick text{fill:#999}::ng-deep .tooltip-container .tooltip{display:none;position:absolute;top:0;left:0;padding:10px;border-radius:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;background-color:#000000b3;color:#fff}\n"], dependencies: [{ kind: "directive", type: i2.ResizedDirective, selector: "[resized]", outputs: ["resized"] }, { kind: "component", type: NgxKhiopsHistogramTooltipComponent, selector: "ngx-khiops-histogram-tooltip", inputs: ["text", "posX", "posY", "canvasW", "display"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-khiops-histogram', template: "<div class=\"app-histogram\" fxFlexFill (resized)=\"onResized($event)\">\r\n  <canvas id=\"histogram-canvas\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-hover\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-selected\" fxFlex> </canvas>\r\n  <div #chart id=\"histogram-chart\"></div>\r\n  <ngx-khiops-histogram-tooltip\r\n    [text]=\"tooltipText\"\r\n    [canvasW]=\"w\"\r\n    [posX]=\"tooltipPosX\"\r\n    [posY]=\"tooltipPosY\"\r\n    [display]=\"tooltipDisplay\"\r\n  >\r\n  </ngx-khiops-histogram-tooltip>\r\n</div>\r\n", styles: [".app-histogram{position:absolute;top:0;width:100%;margin:0;height:100%;overflow:hidden}.app-histogram #histogram-canvas,.app-histogram #histogram-canvas-hover,.app-histogram #histogram-canvas-selected{z-index:2;position:absolute}.app-histogram #histogram-chart{top:0;position:absolute;width:100%;height:100%;margin:0;padding:0}.app-histogram #histogram-chart ::ng-deep .axis-grid .domain{stroke:none}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick line{stroke-dasharray:5}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick text{fill:#999}::ng-deep .tooltip-container .tooltip{display:none;position:absolute;top:0;left:0;padding:10px;border-radius:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;background-color:#000000b3;color:#fff}\n"] }]
        }], ctorParameters: () => [{ type: HistogramService }, { type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { chart: [{
                type: ViewChild,
                args: ['chart', { static: false }]
            }], selectedItemChanged: [{
                type: Output
            }], datas: [{
                type: Input
            }], datasLabels: [{
                type: Input
            }], selectedItem: [{
                type: Input
            }], graphOptionX: [{
                type: Input
            }], graphOptionY: [{
                type: Input
            }], options: [{
                type: Input
            }] } });

class NgxKhiopsHistogramModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, declarations: [NgxKhiopsHistogramComponent,
            NgxKhiopsHistogramTooltipComponent], imports: [CommonModule, AngularResizeEventModule], exports: [NgxKhiopsHistogramComponent, NgxKhiopsHistogramTooltipComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, imports: [CommonModule, AngularResizeEventModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, AngularResizeEventModule],
                    declarations: [
                        NgxKhiopsHistogramComponent,
                        NgxKhiopsHistogramTooltipComponent,
                    ],
                    exports: [NgxKhiopsHistogramComponent, NgxKhiopsHistogramTooltipComponent],
                }]
        }] });

/*
 * Public API Surface of ngx-khiops-histogram
 */
// export * from './lib/components/ngx-khiops-histogram.service';

/**
 * Generated bundle index. Do not edit.
 */

export { HistogramType, NgxKhiopsHistogramComponent, NgxKhiopsHistogramModule, NgxKhiopsHistogramTooltipComponent };
//# sourceMappingURL=ngx-khiops-histogram.mjs.map
