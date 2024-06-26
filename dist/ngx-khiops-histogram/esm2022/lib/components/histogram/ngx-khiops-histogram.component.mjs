import { Component, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { format } from 'mathjs';
import { Subject, debounceTime } from 'rxjs';
import * as d3 from 'd3';
import { HistogramType } from '../../model/ngx-khiops-histogram.types';
import { HistogramUIService } from '../../services/ngx-khiops-histogram.ui.service';
import * as i0 from "@angular/core";
import * as i1 from "../../services/ngx-khiops-histogram.service";
import * as i2 from "angular-resize-event";
import * as i3 from "../tooltip/ngx-khiops-histogram.tooltip.component";
export class NgxKhiopsHistogramComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramComponent, deps: [{ token: i1.HistogramService }, { token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.4", type: NgxKhiopsHistogramComponent, selector: "ngx-khiops-histogram", inputs: { datas: "datas", datasLabels: "datasLabels", selectedItem: "selectedItem", graphOptionX: "graphOptionX", graphOptionY: "graphOptionY", options: "options" }, outputs: { selectedItemChanged: "selectedItemChanged" }, viewQueries: [{ propertyName: "chart", first: true, predicate: ["chart"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"app-histogram\" fxFlexFill (resized)=\"onResized($event)\">\r\n  <canvas id=\"histogram-canvas\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-hover\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-selected\" fxFlex> </canvas>\r\n  <div #chart id=\"histogram-chart\"></div>\r\n  <ngx-khiops-histogram-tooltip\r\n    [text]=\"tooltipText\"\r\n    [canvasW]=\"w\"\r\n    [posX]=\"tooltipPosX\"\r\n    [posY]=\"tooltipPosY\"\r\n    [display]=\"tooltipDisplay\"\r\n  >\r\n  </ngx-khiops-histogram-tooltip>\r\n</div>\r\n", styles: [".app-histogram{position:absolute;top:0;width:100%;margin:0;height:100%;overflow:hidden}.app-histogram #histogram-canvas,.app-histogram #histogram-canvas-hover,.app-histogram #histogram-canvas-selected{z-index:2;position:absolute}.app-histogram #histogram-chart{top:0;position:absolute;width:100%;height:100%;margin:0;padding:0}.app-histogram #histogram-chart ::ng-deep .axis-grid .domain{stroke:none}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick line{stroke-dasharray:5}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick text{fill:#999}::ng-deep .tooltip-container .tooltip{display:none;position:absolute;top:0;left:0;padding:10px;border-radius:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;background-color:#000000b3;color:#fff}\n"], dependencies: [{ kind: "directive", type: i2.ResizedDirective, selector: "[resized]", outputs: ["resized"] }, { kind: "component", type: i3.NgxKhiopsHistogramTooltipComponent, selector: "ngx-khiops-histogram-tooltip", inputs: ["text", "posX", "posY", "canvasW", "display"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-khiops-histogram', template: "<div class=\"app-histogram\" fxFlexFill (resized)=\"onResized($event)\">\r\n  <canvas id=\"histogram-canvas\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-hover\" fxFlex> </canvas>\r\n  <canvas id=\"histogram-canvas-selected\" fxFlex> </canvas>\r\n  <div #chart id=\"histogram-chart\"></div>\r\n  <ngx-khiops-histogram-tooltip\r\n    [text]=\"tooltipText\"\r\n    [canvasW]=\"w\"\r\n    [posX]=\"tooltipPosX\"\r\n    [posY]=\"tooltipPosY\"\r\n    [display]=\"tooltipDisplay\"\r\n  >\r\n  </ngx-khiops-histogram-tooltip>\r\n</div>\r\n", styles: [".app-histogram{position:absolute;top:0;width:100%;margin:0;height:100%;overflow:hidden}.app-histogram #histogram-canvas,.app-histogram #histogram-canvas-hover,.app-histogram #histogram-canvas-selected{z-index:2;position:absolute}.app-histogram #histogram-chart{top:0;position:absolute;width:100%;height:100%;margin:0;padding:0}.app-histogram #histogram-chart ::ng-deep .axis-grid .domain{stroke:none}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick line{stroke-dasharray:5}.app-histogram #histogram-chart ::ng-deep .axis-grid .tick text{fill:#999}::ng-deep .tooltip-container .tooltip{display:none;position:absolute;top:0;left:0;padding:10px;border-radius:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;background-color:#000000b3;color:#fff}\n"] }]
        }], ctorParameters: () => [{ type: i1.HistogramService }, { type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { chart: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWtoaW9wcy1oaXN0b2dyYW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWtoaW9wcy1oaXN0b2dyYW0vc3JjL2xpYi9jb21wb25lbnRzL2hpc3RvZ3JhbS9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gta2hpb3BzLWhpc3RvZ3JhbS9zcmMvbGliL2NvbXBvbmVudHMvaGlzdG9ncmFtL25neC1raGlvcHMtaGlzdG9ncmFtLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBR04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFaEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFN0MsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFTekIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdEQUFnRCxDQUFDOzs7OztBQU9wRixNQUFNLE9BQU8sMkJBQTJCO0lBa0V0QyxZQUNVLGdCQUFrQyxFQUNsQyxFQUFjLEVBQ2QsUUFBbUI7UUFGbkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQWpFN0Isa0JBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyx1QkFBdUI7UUFFNUMsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztRQUVwRCxVQUFVO1FBQ0Esd0JBQW1CLEdBQXNCLElBQUksWUFBWSxF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O2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgSW5wdXQsXHJcbiAgT3V0cHV0LFxyXG4gIFJlbmRlcmVyMixcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnbWF0aGpzJztcclxuaW1wb3J0IHsgUmVzaXplZEV2ZW50IH0gZnJvbSAnYW5ndWxhci1yZXNpemUtZXZlbnQnO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBkZWJvdW5jZVRpbWUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgSGlzdG9ncmFtQmFyVk8gfSBmcm9tICcuLi8uLi9tb2RlbC9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5iYXItdm8nO1xyXG5pbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XHJcbmltcG9ydCB7XHJcbiAgSGlzdG9ncmFtVmFsdWVzSSxcclxuICBSYW5nZVhMb2dJLFxyXG4gIFJhbmdlWExpbkksXHJcbiAgUmFuZ2VZTG9nSSxcclxuICBIaXN0b2dyYW1PcHRpb25zLFxyXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvbmd4LWtoaW9wcy1oaXN0b2dyYW0uaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IEhpc3RvZ3JhbVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSGlzdG9ncmFtVHlwZSB9IGZyb20gJy4uLy4uL21vZGVsL25neC1raGlvcHMtaGlzdG9ncmFtLnR5cGVzJztcclxuaW1wb3J0IHsgSGlzdG9ncmFtVUlTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvbmd4LWtoaW9wcy1oaXN0b2dyYW0udWkuc2VydmljZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1raGlvcHMtaGlzdG9ncmFtJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbmd4LWtoaW9wcy1oaXN0b2dyYW0uY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsOiAnLi9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5jb21wb25lbnQuc2NzcycsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hLaGlvcHNIaXN0b2dyYW1Db21wb25lbnQge1xyXG4gIEBWaWV3Q2hpbGQoJ2NoYXJ0JywgeyBzdGF0aWM6IGZhbHNlIH0pXHJcbiAgY2hhcnQhOiBFbGVtZW50UmVmO1xyXG5cclxuICBjb21wb25lbnRUeXBlID0gJ2hpc3RvZ3JhbSc7IC8vIG5lZWRlZCB0byBjb3B5IGRhdGFzXHJcbiAgc3ZnOiBkMy5TZWxlY3Rpb248U1ZHRWxlbWVudCwgdW5rbm93biwgSFRNTEVsZW1lbnQsIGFueT4gfCB1bmRlZmluZWQ7XHJcbiAgcHJpdmF0ZSByZXNpemVTdWJqZWN0ID0gbmV3IFN1YmplY3Q8UmVzaXplZEV2ZW50PigpO1xyXG5cclxuICAvLyBPdXRwdXRzXHJcbiAgQE91dHB1dCgpIHNlbGVjdGVkSXRlbUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAvLyBEeW5hbWljIHZhbHVlc1xyXG4gIEBJbnB1dCgpIGRhdGFzOiBIaXN0b2dyYW1WYWx1ZXNJW10gfCB1bmRlZmluZWQ7XHJcbiAgQElucHV0KCkgZGF0YXNMYWJlbHM6IGFueTtcclxuICBASW5wdXQoKSBzZWxlY3RlZEl0ZW06IG51bWJlciA9IDA7XHJcbiAgQElucHV0KCkgZ3JhcGhPcHRpb25YOiBIaXN0b2dyYW1UeXBlIHwgdW5kZWZpbmVkID0gSGlzdG9ncmFtVHlwZS5ZTE9HO1xyXG4gIEBJbnB1dCgpIGdyYXBoT3B0aW9uWTogSGlzdG9ncmFtVHlwZSB8IHVuZGVmaW5lZCA9IEhpc3RvZ3JhbVR5cGUuWUxPRztcclxuICBASW5wdXQoKSBvcHRpb25zOiBIaXN0b2dyYW1PcHRpb25zID0ge1xyXG4gICAgc2VsZWN0ZWRCYXJDb2xvcjogJ2JsYWNrJyxcclxuICAgIGdyaWRDb2xvcjogJyNlNWU1ZTUnLFxyXG4gICAgeFBhZGRpbmc6IDQwLFxyXG4gICAgeVBhZGRpbmc6IDUwLFxyXG4gICAgbWluQmFySGVpZ2h0OiA0LFxyXG4gIH07XHJcblxyXG4gIGg6IG51bWJlciA9IDA7XHJcbiAgdzogbnVtYmVyID0gMDtcclxuICBiYXJzOiBIaXN0b2dyYW1CYXJWT1tdID0gW107XHJcblxyXG4gIC8vIFN0YXRpYyBjb25maWcgdmFsdWVzXHJcbiAgeFRpY2tDb3VudDogbnVtYmVyID0gMDtcclxuICB5VGlja3NDb3VudCA9IDEwO1xyXG4gIHRpY2tTaXplID0gMDtcclxuXHJcbiAgLy8gc2VsZWN0ZWRCYXJDb2xvcjogc3RyaW5nID1cclxuICAvLyAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFxyXG4gIC8vICAgICBBcHBDb25maWcudmlzdWFsaXphdGlvbkNvbW1vbi5HTE9CQUwuTFNfSUQgKyAnVEhFTUVfQ09MT1InXHJcbiAgLy8gICApID09PSAnZGFyaydcclxuICAvLyAgICAgPyAnd2hpdGUnXHJcbiAgLy8gICAgIDogJ2JsYWNrJztcclxuXHJcbiAgLy8gTG9jYWwgdmFyaWFibGVzXHJcbiAgcmFuZ2VYTG9nOiBSYW5nZVhMb2dJIHwgdW5kZWZpbmVkO1xyXG4gIHJhbmdlWExpbjogUmFuZ2VYTGluSSB8IHVuZGVmaW5lZDtcclxuICByYW5nZVlMaW46IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICByYW5nZVlMb2c6IFJhbmdlWUxvZ0kgfCB1bmRlZmluZWQ7XHJcblxyXG4gIHJhdGlvWSA9IDA7XHJcbiAgcmF0aW86IG51bWJlciA9IDA7XHJcbiAgaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIGNvbG9yU2V0OiBzdHJpbmdbXTtcclxuXHJcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gIGN0eFNlbGVjdGVkOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gIGN0eEhvdmVyOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG5cclxuICBoaXN0b2dyYW1DYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZDtcclxuICBoaXN0b2dyYW1Ib3ZlckNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gIGhpc3RvZ3JhbVNlbGVjdGVkQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XHJcblxyXG4gIHRvb2x0aXBUZXh0OiBzdHJpbmcgPSAnJztcclxuICB0b29sdGlwUG9zWDogbnVtYmVyID0gMDtcclxuICB0b29sdGlwUG9zWTogbnVtYmVyID0gMDtcclxuICB0b29sdGlwRGlzcGxheTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgaGlzdG9ncmFtU2VydmljZTogSGlzdG9ncmFtU2VydmljZSxcclxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjJcclxuICApIHtcclxuICAgIHRoaXMuY29sb3JTZXQgPSBIaXN0b2dyYW1VSVNlcnZpY2UuZ2V0Q29sb3JzKCk7XHJcbiAgICB0aGlzLnJlc2l6ZVN1YmplY3QucGlwZShkZWJvdW5jZVRpbWUoMTAwKSkuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICB0aGlzLmhhbmRsZVJlc2l6ZWQoZXZlbnQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhpc3RvZ3JhbUNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgICAnaGlzdG9ncmFtLWNhbnZhcydcclxuICAgICkgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICB0aGlzLmhpc3RvZ3JhbVNlbGVjdGVkQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICAgICdoaXN0b2dyYW0tY2FudmFzLXNlbGVjdGVkJ1xyXG4gICAgKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHRoaXMuaGlzdG9ncmFtSG92ZXJDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgJ2hpc3RvZ3JhbS1jYW52YXMtaG92ZXInXHJcbiAgICApIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2NsaWNrJyxcclxuICAgICAgdGhpcy5oYW5kbGVDYW52YXNDbGljay5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ21vdXNlbW92ZScsXHJcbiAgICAgIHRoaXMuaGFuZGxlQ2FudmFzTW92ZS5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ21vdXNlb3V0JyxcclxuICAgICAgdGhpcy5oYW5kbGVDYW52YXNPdXQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2NsaWNrJyxcclxuICAgICAgdGhpcy5oYW5kbGVDYW52YXNDbGljay5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ21vdXNlbW92ZScsXHJcbiAgICAgIHRoaXMuaGFuZGxlQ2FudmFzTW92ZS5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ21vdXNlb3V0JyxcclxuICAgICAgdGhpcy5oYW5kbGVDYW52YXNPdXQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNoYW5nZUdyYXBoVHlwZVgodHlwZTogSGlzdG9ncmFtVHlwZSkge1xyXG4gICAgLy8gbG9jYWxTdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAvLyAgIHRoaXMua2hpb3BzTGlicmFyeVNlcnZpY2UuZ2V0QXBwQ29uZmlnKCkuY29tbW9uLkdMT0JBTC5MU19JRCArXHJcbiAgICAvLyAgICAgJ0RJU1RSSUJVVElPTl9HUkFQSF9PUFRJT05fWCcsXHJcbiAgICAvLyAgIHR5cGVcclxuICAgIC8vICk7XHJcbiAgICB0aGlzLmdyYXBoT3B0aW9uWCA9IHR5cGU7XHJcbiAgICB0aGlzLmRhdGFzICYmIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgY2hhbmdlR3JhcGhUeXBlWSh0eXBlOiBIaXN0b2dyYW1UeXBlKSB7XHJcbiAgICAvLyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcclxuICAgIC8vICAgdGhpcy5raGlvcHNMaWJyYXJ5U2VydmljZS5nZXRBcHBDb25maWcoKS5jb21tb24uR0xPQkFMLkxTX0lEICtcclxuICAgIC8vICAgICAnRElTVFJJQlVUSU9OX0dSQVBIX09QVElPTl9ZJyxcclxuICAgIC8vICAgdHlwZVxyXG4gICAgLy8gKTtcclxuICAgIHRoaXMuZ3JhcGhPcHRpb25ZID0gdHlwZTtcclxuICAgIHRoaXMuZGF0YXMgJiYgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICBvblJlc2l6ZWQoZXZlbnQ6IFJlc2l6ZWRFdmVudCkge1xyXG4gICAgdGhpcy5yZXNpemVTdWJqZWN0Lm5leHQoZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlUmVzaXplZChldmVudDogUmVzaXplZEV2ZW50KSB7XHJcbiAgICB0aGlzLmggPSB0aGlzLmNoYXJ0Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgMTAgLSA2MDsgLy8gZ3JhcGggaGVhZGVyID0gNjAsICsxMCB0byB0YWtlIG1vcmUgaGVpZ2h0XHJcbiAgICB0aGlzLncgPSB0aGlzLmNoYXJ0Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgLy8gRG8gaXQgZXZlcnkgdGltZXN0byBiZSBzdXJlIHRoYXQgY2hhcnQgaGVpZ2h0IGhhcyBiZWVuIGNvbXB1dGVkXHJcbiAgICB0aGlzLmRhdGFzICYmIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgaWYgKGNoYW5nZXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAnTmd4S2hpb3BzSGlzdG9ncmFtQ29tcG9uZW50IH4gbmdPbkNoYW5nZXMgfiBjaGFuZ2VzOicsXHJcbiAgICAgICAgY2hhbmdlc1xyXG4gICAgICApO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKFxyXG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudCxcclxuICAgICAgICAnLS1jaGFydC1ib3JkZXInLFxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5ncmlkQ29sb3JcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGlmIChjaGFuZ2VzWydkYXRhcyddICYmICFjaGFuZ2VzWydkYXRhcyddLmZpcnN0Q2hhbmdlKSB7XHJcbiAgICAgIHRoaXMuZGF0YXMgJiYgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hhbmdlc1snZ3JhcGhPcHRpb25YJ10gJiYgIWNoYW5nZXNbJ2dyYXBoT3B0aW9uWCddLmZpcnN0Q2hhbmdlKSB7XHJcbiAgICAgIHRoaXMuZGF0YXMgJiYgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hhbmdlc1snZ3JhcGhPcHRpb25ZJ10gJiYgIWNoYW5nZXNbJ2dyYXBoT3B0aW9uWSddLmZpcnN0Q2hhbmdlKSB7XHJcbiAgICAgIHRoaXMuZGF0YXMgJiYgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hhbmdlc1snc2VsZWN0ZWRJdGVtJ10pIHtcclxuICAgICAgdGhpcy5kcmF3U2VsZWN0ZWRJdGVtKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoYW5kbGVDYW52YXNDbGljayhldmVudDogYW55KSB7XHJcbiAgICBjb25zdCBjYW52YXNQb3NpdGlvbiA9IHRoaXMuaGlzdG9ncmFtQ2FudmFzPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGlmICh0aGlzLmRhdGFzICYmIGNhbnZhc1Bvc2l0aW9uKSB7XHJcbiAgICAgIGNvbnN0IGJhclBvc2l0aW9uID0gSGlzdG9ncmFtVUlTZXJ2aWNlLmdldEN1cnJlbnRCYXJQb3NpdGlvbihcclxuICAgICAgICB0aGlzLmRhdGFzLFxyXG4gICAgICAgIGNhbnZhc1Bvc2l0aW9uLFxyXG4gICAgICAgIGV2ZW50LFxyXG4gICAgICAgIHRoaXMub3B0aW9ucy55UGFkZGluZ1xyXG4gICAgICApO1xyXG4gICAgICBpZiAoYmFyUG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gYmFyUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1DaGFuZ2VkLmVtaXQodGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgICAgIHRoaXMuZHJhd1NlbGVjdGVkSXRlbSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG5vIGJhciBzZWxlY3RlZFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkcmF3U2VsZWN0ZWRJdGVtKCkge1xyXG4gICAgSGlzdG9ncmFtVUlTZXJ2aWNlLmNsZWFuRG9tQ29udGV4dChcclxuICAgICAgdGhpcy5jdHhTZWxlY3RlZCxcclxuICAgICAgdGhpcy5oaXN0b2dyYW1TZWxlY3RlZENhbnZhc1xyXG4gICAgKTtcclxuICAgIC8vIHJlRHJhdyBzZWxlY3RlZCBpdGVtIGluIGZyb250IG9mIG90aGVyc1xyXG4gICAgaWYgKHRoaXMuY3R4U2VsZWN0ZWQgJiYgdGhpcy5kYXRhcykge1xyXG4gICAgICB0aGlzLmRyYXdSZWN0KFxyXG4gICAgICAgIHRoaXMuY3R4U2VsZWN0ZWQsXHJcbiAgICAgICAgdGhpcy5kYXRhc1t0aGlzLnNlbGVjdGVkSXRlbV0sXHJcbiAgICAgICAgdGhpcy5iYXJzW3RoaXMuc2VsZWN0ZWRJdGVtXSxcclxuICAgICAgICB0aGlzLnJhdGlvLFxyXG4gICAgICAgIHRydWVcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhhbmRsZUNhbnZhc091dCgpIHtcclxuICAgIHRoaXMuaGlkZVRvb2x0aXAoKTtcclxuICAgIEhpc3RvZ3JhbVVJU2VydmljZS5jbGVhbkRvbUNvbnRleHQoXHJcbiAgICAgIHRoaXMuY3R4SG92ZXIsXHJcbiAgICAgIHRoaXMuaGlzdG9ncmFtSG92ZXJDYW52YXNcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVDYW52YXNNb3ZlKGV2ZW50OiBhbnkpIHtcclxuICAgIGNvbnN0IGNhbnZhc1Bvc2l0aW9uID0gdGhpcy5oaXN0b2dyYW1DYW52YXM/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgaWYgKHRoaXMuZGF0YXMgJiYgY2FudmFzUG9zaXRpb24pIHtcclxuICAgICAgY29uc3QgYmFyUG9zaXRpb24gPSBIaXN0b2dyYW1VSVNlcnZpY2UuZ2V0Q3VycmVudEJhclBvc2l0aW9uKFxyXG4gICAgICAgIHRoaXMuZGF0YXMsXHJcbiAgICAgICAgY2FudmFzUG9zaXRpb24sXHJcbiAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnlQYWRkaW5nXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAoYmFyUG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnN0IGJhciA9IHRoaXMuZGF0YXNbYmFyUG9zaXRpb25dO1xyXG4gICAgICAgIGNvbnN0IHRvb2x0aXBUZXh0ID0gSGlzdG9ncmFtVUlTZXJ2aWNlLmdlbmVyYXRlVG9vbHRpcChcclxuICAgICAgICAgIHRoaXMuZGF0YXNMYWJlbHMsXHJcbiAgICAgICAgICBiYXIsXHJcbiAgICAgICAgICBiYXJQb3NpdGlvbiA9PT0gMFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5zaG93VG9vbHRpcChldmVudCwgdG9vbHRpcFRleHQpO1xyXG5cclxuICAgICAgICBIaXN0b2dyYW1VSVNlcnZpY2UuY2xlYW5Eb21Db250ZXh0KFxyXG4gICAgICAgICAgdGhpcy5jdHhIb3ZlcixcclxuICAgICAgICAgIHRoaXMuaGlzdG9ncmFtSG92ZXJDYW52YXNcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmICh0aGlzLmN0eEhvdmVyKSB7XHJcbiAgICAgICAgICB0aGlzLmRyYXdSZWN0KFxyXG4gICAgICAgICAgICB0aGlzLmN0eEhvdmVyLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFzW2JhclBvc2l0aW9uXSxcclxuICAgICAgICAgICAgdGhpcy5iYXJzW2JhclBvc2l0aW9uXSxcclxuICAgICAgICAgICAgdGhpcy5yYXRpb1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oaWRlVG9vbHRpcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzaG93VG9vbHRpcChldmVudDogTW91c2VFdmVudCwgdGV4dDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnRvb2x0aXBQb3NYID0gZXZlbnQub2Zmc2V0WCArIDIwO1xyXG4gICAgdGhpcy50b29sdGlwUG9zWSA9IGV2ZW50Lm9mZnNldFkgLSA0MDtcclxuICAgIHRoaXMudG9vbHRpcFRleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy50b29sdGlwRGlzcGxheSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBoaWRlVG9vbHRpcCgpIHtcclxuICAgIHRoaXMudG9vbHRpcERpc3BsYXkgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnSGlzdG9ncmFtQ29tcG9uZW50IH4gbmdPbkluaXQgfiB0aGlzLmRhdGFzOicsIHRoaXMuZGF0YXMpO1xyXG4gICAgaWYgKHRoaXMuaGlzdG9ncmFtQ2FudmFzKSB7XHJcbiAgICAgIEhpc3RvZ3JhbVVJU2VydmljZS5jbGVhbkRvbUNvbnRleHQodGhpcy5jdHgsIHRoaXMuaGlzdG9ncmFtQ2FudmFzKTtcclxuICAgICAgSGlzdG9ncmFtVUlTZXJ2aWNlLmNsZWFuRG9tQ29udGV4dChcclxuICAgICAgICB0aGlzLmN0eEhvdmVyLFxyXG4gICAgICAgIHRoaXMuaGlzdG9ncmFtSG92ZXJDYW52YXNcclxuICAgICAgKTtcclxuICAgICAgSGlzdG9ncmFtVUlTZXJ2aWNlLmNsZWFuRG9tQ29udGV4dChcclxuICAgICAgICB0aGlzLmN0eFNlbGVjdGVkLFxyXG4gICAgICAgIHRoaXMuaGlzdG9ncmFtU2VsZWN0ZWRDYW52YXNcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5jdHggPSBIaXN0b2dyYW1VSVNlcnZpY2UuaW5pdENhbnZhc0NvbnRleHQoXHJcbiAgICAgICAgdGhpcy5oaXN0b2dyYW1DYW52YXMsXHJcbiAgICAgICAgdGhpcy53LFxyXG4gICAgICAgIHRoaXMuaFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmN0eEhvdmVyID0gSGlzdG9ncmFtVUlTZXJ2aWNlLmluaXRDYW52YXNDb250ZXh0KFxyXG4gICAgICAgIHRoaXMuaGlzdG9ncmFtSG92ZXJDYW52YXMsXHJcbiAgICAgICAgdGhpcy53LFxyXG4gICAgICAgIHRoaXMuaFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmN0eFNlbGVjdGVkID0gSGlzdG9ncmFtVUlTZXJ2aWNlLmluaXRDYW52YXNDb250ZXh0KFxyXG4gICAgICAgIHRoaXMuaGlzdG9ncmFtU2VsZWN0ZWRDYW52YXMsXHJcbiAgICAgICAgdGhpcy53LFxyXG4gICAgICAgIHRoaXMuaFxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy54VGlja0NvdW50ID0gNTsgLy8gV2UgbXVzdCByZWluaXQgZWFjaCB0aW1lc1xyXG5cclxuICAgICAgaWYgKHRoaXMuY2hhcnQpIHtcclxuICAgICAgICB0aGlzLmNoYXJ0Lm5hdGl2ZUVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YXMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmRhdGFzLmxlbmd0aCA+IDUwMCkge1xyXG4gICAgICAgICAgICAvLyBkaXNwbGF5IGxvYWRpbmdcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNldFRpbWVvdXQoXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zdCB0MCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmRhdGFzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmFwaE9wdGlvblkgPT09IEhpc3RvZ3JhbVR5cGUuWUxPRykge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnJhbmdlWUxvZyA9IHRoaXMuaGlzdG9ncmFtU2VydmljZS5nZXRMb2dSYW5nZVkoXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhc1xyXG4gICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnJhdGlvWSA9IHRoaXMuaGlzdG9ncmFtU2VydmljZS5nZXRMb2dSYXRpb1koXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy55UGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yYW5nZVlMaW4gPSB0aGlzLmhpc3RvZ3JhbVNlcnZpY2UuZ2V0TGluUmFuZ2VZKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YXNcclxuICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yYXRpb1kgPSB0aGlzLmhpc3RvZ3JhbVNlcnZpY2UuZ2V0TGluUmF0aW9ZKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMueVBhZGRpbmdcclxuICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaGFydCh0aGlzLncpO1xyXG5cclxuICAgICAgICAgICAgICAgIFt0aGlzLnJhbmdlWExpbiwgdGhpcy5yYW5nZVhMb2ddID1cclxuICAgICAgICAgICAgICAgICAgdGhpcy5oaXN0b2dyYW1TZXJ2aWNlLmdldFJhbmdlWCh0aGlzLmRhdGFzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VYTG9nLm5lZ1ZhbHVlc0NvdW50ID09PSAwIHx8XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VYTG9nLnBvc1ZhbHVlc0NvdW50ID09PSAwXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy54VGlja0NvdW50ID0gdGhpcy54VGlja0NvdW50ICogMjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdZQXhpcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SGlzdG9ncmFtKHRoaXMuZGF0YXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyYXBoT3B0aW9uWCA9PT0gSGlzdG9ncmFtVHlwZS5YTElOKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxldCBzaGlmdCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgIGxldCB3aWR0aCA9IHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICAgIGxldCBkb21haW4gPSBbdGhpcy5yYW5nZVhMaW4ubWluLCB0aGlzLnJhbmdlWExpbi5tYXhdO1xyXG4gICAgICAgICAgICAgICAgICBsZXQgdGlja1ZhbHVlcyA9IHRoaXMuZGF0YXMubWFwKFxyXG4gICAgICAgICAgICAgICAgICAgIChlOiBIaXN0b2dyYW1WYWx1ZXNJKSA9PiBlLnBhcnRpdGlvblswXVxyXG4gICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICB0aWNrVmFsdWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhc1t0aGlzLmRhdGFzLmxlbmd0aCAtIDFdLnBhcnRpdGlvblsxXVxyXG4gICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1hBeGlzKGRvbWFpbiwgc2hpZnQsIHdpZHRoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIERyYXcgcG9zaXRpdmUgYXhpc1xyXG4gICAgICAgICAgICAgICAgICBsZXQgc2hpZnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICBsZXQgd2lkdGggPSAwO1xyXG4gICAgICAgICAgICAgICAgICBsZXQgZG9tYWluOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VYTG9nLnBvc1N0YXJ0ICE9PSB0aGlzLnJhbmdlWExvZy5tYXggJiZcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJhbmdlWExvZy5wb3NWYWx1ZXNDb3VudFxyXG4gICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbiA9IFt0aGlzLnJhbmdlWExvZy5wb3NTdGFydCwgdGhpcy5yYW5nZVhMb2cubWF4XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaWZ0SW5mID0gMjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yYW5nZVhMb2cuaW5mICYmICF0aGlzLnJhbmdlWExvZy5uZWdTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2hpZnRJbmYgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAhdGhpcy5yYW5nZVhMb2cuaW5mICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJhbmdlWExvZy5uZWdWYWx1ZXNDb3VudCA9PT0gMFxyXG4gICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2hpZnRJbmYgPSAwOyAvLyBvbmx5IHBvc2l0aXZlIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzaGlmdCArPVxyXG4gICAgICAgICAgICAgICAgICAgICAgKCh0aGlzLncgLSAyICogdGhpcy5vcHRpb25zLnhQYWRkaW5nKSAvIHRoaXMucmF0aW8pICpcclxuICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgIE1hdGgubG9nMTAodGhpcy5yYW5nZVhMb2cubWlkZGxld2lkdGgpICpcclxuICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0SW5mO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yYW5nZVhMb2cubmVnVmFsdWVzQ291bnQgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0ICs9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgodGhpcy53IC0gMiAqIHRoaXMub3B0aW9ucy54UGFkZGluZykgLyB0aGlzLnJhdGlvKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5sb2cxMChNYXRoLmFicyh0aGlzLnJhbmdlWExvZy5taW4pKTtcclxuICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0IC09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgodGhpcy53IC0gMiAqIHRoaXMub3B0aW9ucy54UGFkZGluZykgLyB0aGlzLnJhdGlvKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5sb2cxMChNYXRoLmFicyh0aGlzLnJhbmdlWExvZy5uZWdTdGFydCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmcgLSBzaGlmdDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdYQXhpcyhkb21haW4sIHNoaWZ0LCB3aWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIERyYXcgLUluZiBheGlzXHJcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlWExvZy5pbmYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yYW5nZVhMb2cucG9zVmFsdWVzQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGxldCBtaWRkbGVTaGlmdCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0IC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKCh0aGlzLncgLSAyICogdGhpcy5vcHRpb25zLnhQYWRkaW5nKSAvIHRoaXMucmF0aW8pICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5sb2cxMCh0aGlzLnJhbmdlWExvZy5taWRkbGV3aWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBkb21haW4gPSBbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdYQXhpcyhkb21haW4sIG1pZGRsZVNoaWZ0IC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGxldCBtaWRkbGVTaGlmdCA9IHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICBkb21haW4gPSBbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdYQXhpcyhkb21haW4sIG1pZGRsZVNoaWZ0IC0gMSwgMSk7IC8vIDEgdG8gbWFrZSBiaWdnZXIgbGluZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gRHJhdyBuZWdhdGl2ZSBheGlzXHJcbiAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnJhbmdlWExvZy5pbmYgfHxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJhbmdlWExvZy5uZWdTdGFydCAhPT0gdGhpcy5yYW5nZVhMb2cubWluICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYW5nZVhMb2cubmVnVmFsdWVzQ291bnRcclxuICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0aGlzLncgLSAyICogdGhpcy5vcHRpb25zLnhQYWRkaW5nIC0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbiA9IFt0aGlzLnJhbmdlWExvZy5taW4sIHRoaXMucmFuZ2VYTG9nLm5lZ1N0YXJ0XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmFuZ2VYTG9nLnBvc1ZhbHVlc0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBwb3MgYW5kIG5lZyB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmcpIC8gdGhpcy5yYXRpbykgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmxvZzEwKHRoaXMucmFuZ2VYTG9nLm1pZGRsZXdpZHRoKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgMjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmFuZ2VYTG9nLmluZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICgodGhpcy53IC0gMiAqIHRoaXMub3B0aW9ucy54UGFkZGluZykgLyB0aGlzLnJhdGlvKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmxvZzEwKHRoaXMucmFuZ2VYTG9nLm1pZGRsZXdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3WEF4aXMoZG9tYWluLCAwLCB3aWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1NlbGVjdGVkSXRlbSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkcmF3IGhpc3RvZ3JhbSAnICsgKHQxIC0gdDApICsgJyBtaWxsaXNlY29uZHMuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPyAxMDAgOiAwXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZHJhd0NoYXJ0KGNoYXJ0VzogbnVtYmVyKSB7XHJcbiAgICAvL0B0cy1pZ25vcmVcclxuICAgIHRoaXMuc3ZnID0gZDNcclxuICAgICAgLnNlbGVjdCh0aGlzLmNoYXJ0Lm5hdGl2ZUVsZW1lbnQpXHJcbiAgICAgIC5hcHBlbmQoJ3N2ZycpXHJcbiAgICAgIC5hdHRyKCd3aWR0aCcsIGNoYXJ0VylcclxuICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMuaCArIHRoaXMub3B0aW9ucy55UGFkZGluZyk7XHJcbiAgfVxyXG5cclxuICBkcmF3UmVjdChcclxuICAgIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxyXG4gICAgZDogSGlzdG9ncmFtVmFsdWVzSSxcclxuICAgIGJhcjogSGlzdG9ncmFtQmFyVk8sXHJcbiAgICByYXRpbzogbnVtYmVyID0gMCxcclxuICAgIHNlbGVjdGVkSXRlbTogYm9vbGVhbiA9IGZhbHNlXHJcbiAgKSB7XHJcbiAgICBpZiAoY3R4KSB7XHJcbiAgICAgIGxldCBiYXJYOiBudW1iZXIsIGJhckg6IG51bWJlciwgYmFyVzogbnVtYmVyO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZ3JhcGhPcHRpb25YID09PSBIaXN0b2dyYW1UeXBlLlhMSU4pIHtcclxuICAgICAgICBiYXJYID0gKCh0aGlzLncgLSAyICogdGhpcy5vcHRpb25zLnhQYWRkaW5nKSAvIHJhdGlvKSAqIGJhci5iYXJYbGluO1xyXG4gICAgICAgIGJhclcgPSAoKHRoaXMudyAtIDIgKiB0aGlzLm9wdGlvbnMueFBhZGRpbmcpIC8gcmF0aW8pICogYmFyLmJhcldsaW47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFyWCA9ICgodGhpcy53IC0gMiAqIHRoaXMub3B0aW9ucy54UGFkZGluZykgLyByYXRpbykgKiBiYXIuYmFyWGxvZztcclxuICAgICAgICBiYXJXID0gKCh0aGlzLncgLSAyICogdGhpcy5vcHRpb25zLnhQYWRkaW5nKSAvIHJhdGlvKSAqIGJhci5iYXJXbG9nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5ncmFwaE9wdGlvblkgPT09IEhpc3RvZ3JhbVR5cGUuWUxJTikge1xyXG4gICAgICAgIGJhckggPSBkLnZhbHVlICogdGhpcy5yYXRpb1k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGQubG9nVmFsdWUgIT09IDApIHtcclxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgIGxldCBzaGlmdCA9IE1hdGguYWJzKHRoaXMucmFuZ2VZTG9nLm1heCk7XHJcbiAgICAgICAgICBiYXJIID0gTWF0aC5hYnMoZC5sb2dWYWx1ZSkgKiB0aGlzLnJhdGlvWSAtIHNoaWZ0ICogdGhpcy5yYXRpb1k7XHJcbiAgICAgICAgICBiYXJIID0gdGhpcy5oIC0gdGhpcy5vcHRpb25zLnlQYWRkaW5nIC8gMiAtIGJhckg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJhckggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoYmFySCAhPT0gMCAmJiBiYXJIIDwgdGhpcy5vcHRpb25zLm1pbkJhckhlaWdodCkge1xyXG4gICAgICAgIGJhckggPSB0aGlzLm9wdGlvbnMubWluQmFySGVpZ2h0O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmdyYXBoT3B0aW9uWSA9PT0gSGlzdG9ncmFtVHlwZS5ZTE9HICYmIGJhckggPT09IDApIHtcclxuICAgICAgICBiYXJIID0gdGhpcy5vcHRpb25zLm1pbkJhckhlaWdodDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgeCA9IGJhclggKyB0aGlzLm9wdGlvbnMueFBhZGRpbmcgKyB0aGlzLm9wdGlvbnMueFBhZGRpbmcgLyAyO1xyXG4gICAgICBjb25zdCB5ID0gdGhpcy5oIC0gYmFySDtcclxuXHJcbiAgICAgIC8vIGtlZXAgY3VycmVudCBjb29yZHMgdG8gYmluZCBjbGlja3MgYW5kIHRvb2x0aXBcclxuICAgICAgZC5jb29yZHMgPSB7XHJcbiAgICAgICAgeDogeCxcclxuICAgICAgICB5OiB5LFxyXG4gICAgICAgIGJhclc6IGJhclcsXHJcbiAgICAgICAgYmFySDogYmFySCxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBIaXN0b2dyYW1VSVNlcnZpY2UuaGV4VG9SZ2JhKGJhci5jb2xvciwgMC44KTtcclxuICAgICAgY3R4LmxpbmVXaWR0aCA9IDA7XHJcbiAgICAgIGN0eC5maWxsUmVjdCh4LCB5LCBiYXJXLCBiYXJIKTtcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc2VsZWN0ZWRJdGVtXHJcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2VsZWN0ZWRCYXJDb2xvclxyXG4gICAgICAgIDogYmFyLmNvbG9yO1xyXG4gICAgICBjdHgubGluZVdpZHRoID0gc2VsZWN0ZWRJdGVtID8gMiA6IDE7XHJcbiAgICAgIGN0eC5zdHJva2VSZWN0KHgsIHksIGJhclcsIGJhckgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZHJhd0hpc3RvZ3JhbShkYXRhc1NldDogSGlzdG9ncmFtVmFsdWVzSVtdKSB7XHJcbiAgICB0aGlzLmJhcnMgPSB0aGlzLmhpc3RvZ3JhbVNlcnZpY2UuY29tcHV0ZVhiYXJzRGltZW5zaW9ucyhcclxuICAgICAgZGF0YXNTZXQsXHJcbiAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgdGhpcy5ncmFwaE9wdGlvblhcclxuICAgICk7XHJcbiAgICB0aGlzLnJhdGlvID0gMDtcclxuICAgIGlmICh0aGlzLmdyYXBoT3B0aW9uWCA9PT0gSGlzdG9ncmFtVHlwZS5YTElOKSB7XHJcbiAgICAgIHRoaXMucmF0aW8gPVxyXG4gICAgICAgIHRoaXMuYmFyc1t0aGlzLmJhcnMubGVuZ3RoIC0gMV0uYmFyWGxpbiArXHJcbiAgICAgICAgdGhpcy5iYXJzW3RoaXMuYmFycy5sZW5ndGggLSAxXS5iYXJXbGluO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yYXRpbyA9XHJcbiAgICAgICAgdGhpcy5iYXJzW3RoaXMuYmFycy5sZW5ndGggLSAxXS5iYXJYbG9nICtcclxuICAgICAgICB0aGlzLmJhcnNbdGhpcy5iYXJzLmxlbmd0aCAtIDFdLmJhcldsb2c7XHJcbiAgICB9XHJcblxyXG4gICAgZGF0YXNTZXQuZm9yRWFjaCgoZDogSGlzdG9ncmFtVmFsdWVzSSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgdGhpcy5kcmF3UmVjdCh0aGlzLmN0eCwgZCwgdGhpcy5iYXJzW2ldLCB0aGlzLnJhdGlvKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZHJhd1hBeGlzKGRvbWFpbjogbnVtYmVyW10sIHNoaWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIpIHtcclxuICAgIGlmICh3aWR0aCAhPT0gMCkge1xyXG4gICAgICBsZXQgeEF4aXM7XHJcbiAgICAgIHNoaWZ0ID0gc2hpZnQgKyB0aGlzLm9wdGlvbnMueFBhZGRpbmc7XHJcblxyXG4gICAgICBpZiAodGhpcy5ncmFwaE9wdGlvblggPT09IEhpc3RvZ3JhbVR5cGUuWExJTikge1xyXG4gICAgICAgIHhBeGlzID0gZDMuc2NhbGVMaW5lYXIoKS5kb21haW4oZG9tYWluKS5yYW5nZShbMCwgd2lkdGhdKTsgLy8gVGhpcyBpcyB3aGVyZSB0aGUgYXhpcyBpcyBwbGFjZWQ6IGZyb20gMTAwcHggdG8gODAwcHhcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4QXhpcyA9IGQzLnNjYWxlTG9nKCkuYmFzZSgxMCkuZG9tYWluKGRvbWFpbikucmFuZ2UoWzAsIHdpZHRoXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICBjb25zdCBheGlzOiBkMy5BeGlzPGQzLk51bWJlclZhbHVlPiA9IGQzXHJcbiAgICAgICAgLmF4aXNCb3R0b20oeEF4aXMpXHJcbiAgICAgICAgLnRpY2tzKFt0aGlzLnhUaWNrQ291bnRdKVxyXG4gICAgICAgIC50aWNrQXJndW1lbnRzKFt0aGlzLnhUaWNrQ291bnQsICcuMGUnXSlcclxuICAgICAgICAudGlja1NpemUoLXRoaXMuaCArIHRoaXMub3B0aW9ucy55UGFkZGluZyAvIDIpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZ3JhcGhPcHRpb25YID09PSBIaXN0b2dyYW1UeXBlLlhMSU4pIHtcclxuICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICBheGlzLnRpY2tGb3JtYXQoKGQ6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgbGV0IHZhbDogYW55ID0gZDtcclxuICAgICAgICAgIHJldHVybiAnJyArIGZvcm1hdCh2YWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnN2ZyEuaW5zZXJ0KCdnJywgJzpmaXJzdC1jaGlsZCcpXHJcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2Jhclhsb2cgYXhpcy1ncmlkJylcclxuICAgICAgICAuYXR0cihcclxuICAgICAgICAgICd0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgJ3RyYW5zbGF0ZSgnICtcclxuICAgICAgICAgICAgKHNoaWZ0ICsgdGhpcy5vcHRpb25zLnhQYWRkaW5nIC8gMikgK1xyXG4gICAgICAgICAgICAnLCcgK1xyXG4gICAgICAgICAgICB0aGlzLmggK1xyXG4gICAgICAgICAgICAnKSAnXHJcbiAgICAgICAgKSAvLyBUaGlzIGNvbnRyb2xzIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0aGUgQXhpc1xyXG4gICAgICAgIC5jYWxsKGF4aXMpXHJcbiAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXHJcbiAgICAgICAgLnN0eWxlKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxyXG4gICAgICAgIC5hdHRyKCdkeCcsICctMC40ZW0nKVxyXG4gICAgICAgIC5hdHRyKCdkeScsICcxZW0nKVxyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAncm90YXRlKC0zNSknKTtcclxuXHJcbiAgICAgIGQzLnNlbGVjdEFsbCgnbGluZScpLnN0eWxlKCdzdHJva2UnLCB0aGlzLm9wdGlvbnMuZ3JpZENvbG9yKTsgLy8gU2V0IHRoZSBncmlkIGNvbG9yXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkcmF3WUF4aXMoKSB7XHJcbiAgICBsZXQgeTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNjYWxlXHJcbiAgICBpZiAodGhpcy5ncmFwaE9wdGlvblkgPT09IEhpc3RvZ3JhbVR5cGUuWUxJTikge1xyXG4gICAgICB5ID0gZDNcclxuICAgICAgICAuc2NhbGVMaW5lYXIoKVxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAuZG9tYWluKFswLCB0aGlzLnJhbmdlWUxpbl0pIC8vIFRoaXMgaXMgd2hhdCBpcyB3cml0dGVuIG9uIHRoZSBBeGlzOiBmcm9tIDAgdG8gMTAwXHJcbiAgICAgICAgLnJhbmdlKFt0aGlzLmggLSB0aGlzLm9wdGlvbnMueVBhZGRpbmcgLyAyLCAwXSk7IC8vIE5vdGUgaXQgaXMgcmV2ZXJzZWRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHkgPSBkM1xyXG4gICAgICAgIC5zY2FsZUxpbmVhcigpXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIC5kb21haW4oW3RoaXMucmFuZ2VZTG9nLm1heCwgdGhpcy5yYW5nZVlMb2cubWluXSkgLy8gVGhpcyBpcyB3aGF0IGlzIHdyaXR0ZW4gb24gdGhlIEF4aXM6IGZyb20gMCB0byAxMDBcclxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuaCAtIHRoaXMub3B0aW9ucy55UGFkZGluZyAvIDJdKTsgLy8gTm90ZSBpdCBpcyByZXZlcnNlZFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzaGlmdCA9IHRoaXMub3B0aW9ucy54UGFkZGluZztcclxuICAgIHRoaXMudGlja1NpemUgPSAtKHRoaXMudyAtIHRoaXMub3B0aW9ucy54UGFkZGluZyAqIDIpO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIGF4aXNcclxuICAgIGNvbnN0IGF4aXMgPSBkM1xyXG4gICAgICAuYXhpc0xlZnQoeSlcclxuICAgICAgLnRpY2tTaXplKHRoaXMudGlja1NpemUpXHJcbiAgICAgIC50aWNrUGFkZGluZygxMClcclxuICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAudGlja0Zvcm1hdCgoZDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgbGV0IHZhbDogbnVtYmVyID0gZDtcclxuICAgICAgICBpZiAodGhpcy5ncmFwaE9wdGlvblkgPT09IEhpc3RvZ3JhbVR5cGUuWUxJTikge1xyXG4gICAgICAgICAgcmV0dXJuICcnICsgZm9ybWF0KHZhbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGFudGlMb2cgPSBNYXRoLnBvdygxMCwgdmFsKTtcclxuICAgICAgICAgIHJldHVybiBkMy5mb3JtYXQoJy4wZScpKGFudGlMb2cpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIC50aWNrcyh0aGlzLnlUaWNrc0NvdW50KTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMuc3ZnXHJcbiAgICAgIC5hcHBlbmQoJ2cnKVxyXG4gICAgICAuYXR0cignY2xhc3MnLCAneSBheGlzLWdyaWQnKVxyXG4gICAgICAuYXR0cihcclxuICAgICAgICAndHJhbnNmb3JtJyxcclxuICAgICAgICAndHJhbnNsYXRlKCcgK1xyXG4gICAgICAgICAgKHNoaWZ0ICsgdGhpcy5vcHRpb25zLnhQYWRkaW5nIC8gMikgK1xyXG4gICAgICAgICAgJywnICtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy55UGFkZGluZyAvIDIgK1xyXG4gICAgICAgICAgJyknXHJcbiAgICAgICkgLy8gVGhpcyBjb250cm9scyB0aGUgdmVydGljYWwgcG9zaXRpb24gb2YgdGhlIEF4aXNcclxuICAgICAgLmNhbGwoYXhpcylcclxuICAgICAgLnNlbGVjdEFsbCgnbGluZScpXHJcbiAgICAgIC5zdHlsZSgnc3Ryb2tlJywgdGhpcy5vcHRpb25zLmdyaWRDb2xvcik7IC8vIFNldCB0aGUgZ3JpZCBjb2xvclxyXG4gIH1cclxufVxyXG4iLCI8ZGl2IGNsYXNzPVwiYXBwLWhpc3RvZ3JhbVwiIGZ4RmxleEZpbGwgKHJlc2l6ZWQpPVwib25SZXNpemVkKCRldmVudClcIj5cclxuICA8Y2FudmFzIGlkPVwiaGlzdG9ncmFtLWNhbnZhc1wiIGZ4RmxleD4gPC9jYW52YXM+XHJcbiAgPGNhbnZhcyBpZD1cImhpc3RvZ3JhbS1jYW52YXMtaG92ZXJcIiBmeEZsZXg+IDwvY2FudmFzPlxyXG4gIDxjYW52YXMgaWQ9XCJoaXN0b2dyYW0tY2FudmFzLXNlbGVjdGVkXCIgZnhGbGV4PiA8L2NhbnZhcz5cclxuICA8ZGl2ICNjaGFydCBpZD1cImhpc3RvZ3JhbS1jaGFydFwiPjwvZGl2PlxyXG4gIDxuZ3gta2hpb3BzLWhpc3RvZ3JhbS10b29sdGlwXHJcbiAgICBbdGV4dF09XCJ0b29sdGlwVGV4dFwiXHJcbiAgICBbY2FudmFzV109XCJ3XCJcclxuICAgIFtwb3NYXT1cInRvb2x0aXBQb3NYXCJcclxuICAgIFtwb3NZXT1cInRvb2x0aXBQb3NZXCJcclxuICAgIFtkaXNwbGF5XT1cInRvb2x0aXBEaXNwbGF5XCJcclxuICA+XHJcbiAgPC9uZ3gta2hpb3BzLWhpc3RvZ3JhbS10b29sdGlwPlxyXG48L2Rpdj5cclxuIl19