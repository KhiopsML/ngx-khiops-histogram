import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { format } from 'mathjs';
import { ResizedEvent } from 'angular-resize-event';
import { Subject, debounceTime } from 'rxjs';
import { HistogramBarVO } from '../../model/ngx-khiops-histogram.bar-vo';
import * as d3 from 'd3';
import {
  HistogramValuesI,
  RangeXLogI,
  RangeXLinI,
  RangeYLogI,
  HistogramOptions,
} from '../../interfaces/ngx-khiops-histogram.interfaces';
import { HistogramService } from '../../services/ngx-khiops-histogram.service';
import { HistogramType } from '../../model/ngx-khiops-histogram.types';
import { HistogramUIService } from '../../services/ngx-khiops-histogram.ui.service';

@Component({
  selector: 'ngx-khiops-histogram',
  templateUrl: './ngx-khiops-histogram.component.html',
  styleUrl: './ngx-khiops-histogram.component.scss',
  standalone: false,
})
export class NgxKhiopsHistogramComponent {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;

  componentType = 'histogram'; // needed to copy datas
  svg: d3.Selection<SVGElement, unknown, HTMLElement, any> | undefined;
  private resizeSubject = new Subject<ResizedEvent>();

  // Outputs
  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();

  // Dynamic values
  @Input() datas: HistogramValuesI[] | undefined;
  @Input() datasLabels: any;
  @Input() selectedItem: number = 0;
  @Input() graphOptionX: HistogramType | undefined = HistogramType.YLOG;
  @Input() graphOptionY: HistogramType | undefined = HistogramType.YLOG;
  @Input() options: HistogramOptions = {
    selectedBarColor: 'black',
    gridColor: '#e5e5e5',
    xPadding: 40,
    yPadding: 50,
    minBarHeight: 4,
  };

  h: number = 0;
  w: number = 0;
  bars: HistogramBarVO[] = [];

  // Static config values
  xTickCount: number = 0;
  yTicksCount = 10;
  tickSize = 0;

  // selectedBarColor: string =
  //   localStorage.getItem(
  //     AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR'
  //   ) === 'dark'
  //     ? 'white'
  //     : 'black';

  // Local variables
  rangeXLog: RangeXLogI | undefined;
  rangeXLin: RangeXLinI | undefined;
  rangeYLin: number | undefined;
  rangeYLog: RangeYLogI | undefined;

  ratioY = 0;
  ratio: number = 0;
  isLoading: boolean = false;

  colorSet: string[];

  ctx: CanvasRenderingContext2D | null | undefined;
  ctxSelected: CanvasRenderingContext2D | null | undefined;
  ctxHover: CanvasRenderingContext2D | null | undefined;

  histogramCanvas: HTMLCanvasElement | null | undefined;
  histogramHoverCanvas: HTMLCanvasElement | null | undefined;
  histogramSelectedCanvas: HTMLCanvasElement | null | undefined;

  tooltipText: string = '';
  tooltipPosX: number = 0;
  tooltipPosY: number = 0;
  tooltipDisplay: boolean = false;

  constructor(
    private histogramService: HistogramService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.colorSet = HistogramUIService.getColors();
    this.resizeSubject.pipe(debounceTime(100)).subscribe((event) => {
      this.handleResized(event);
    });
  }

  ngAfterViewInit(): void {
    this.histogramCanvas = document.getElementById(
      'histogram-canvas'
    ) as HTMLCanvasElement;
    this.histogramSelectedCanvas = document.getElementById(
      'histogram-canvas-selected'
    ) as HTMLCanvasElement;
    this.histogramHoverCanvas = document.getElementById(
      'histogram-canvas-hover'
    ) as HTMLCanvasElement;
    this.histogramSelectedCanvas?.addEventListener(
      'click',
      this.handleCanvasClick.bind(this)
    );
    this.histogramSelectedCanvas?.addEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this)
    );
    this.histogramSelectedCanvas?.addEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this)
    );
  }

  ngOnDestroy() {
    this.histogramSelectedCanvas?.removeEventListener(
      'click',
      this.handleCanvasClick.bind(this)
    );
    this.histogramSelectedCanvas?.removeEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this)
    );
    this.histogramSelectedCanvas?.removeEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this)
    );
  }

  changeGraphTypeX(type: HistogramType) {
    // localStorage.setItem(
    //   this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
    //     'DISTRIBUTION_GRAPH_OPTION_X',
    //   type
    // );
    this.graphOptionX = type;
    this.datas && this.init();
  }

  changeGraphTypeY(type: HistogramType) {
    // localStorage.setItem(
    //   this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
    //     'DISTRIBUTION_GRAPH_OPTION_Y',
    //   type
    // );
    this.graphOptionY = type;
    this.datas && this.init();
  }

  onResized(event: ResizedEvent) {
    this.resizeSubject.next(event);
  }

  handleResized(event: ResizedEvent) {
    this.h = this.chart.nativeElement.offsetHeight + 10 - 60; // graph header = 60, +10 to take more height
    this.w = this.chart.nativeElement.offsetWidth;

    // Do it every timesto be sure that chart height has been computed
    this.datas && this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      console.log(
        'NgxKhiopsHistogramComponent ~ ngOnChanges ~ changes:',
        changes
      );
      this.renderer.setStyle(
        this.el.nativeElement,
        '--chart-border',
        this.options.gridColor
      );
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

  handleCanvasClick(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    if (this.datas && canvasPosition) {
      const barPosition = HistogramUIService.getCurrentBarPosition(
        this.datas,
        canvasPosition,
        event,
        this.options.yPadding
      );
      if (barPosition !== undefined) {
        this.selectedItem = barPosition;
        this.selectedItemChanged.emit(this.selectedItem);
        this.drawSelectedItem();
      } else {
        // no bar selected
      }
    }
  }

  drawSelectedItem() {
    HistogramUIService.cleanDomContext(
      this.ctxSelected,
      this.histogramSelectedCanvas
    );
    // reDraw selected item in front of others
    if (this.ctxSelected && this.datas) {
      this.drawRect(
        this.ctxSelected,
        this.datas[this.selectedItem],
        this.bars[this.selectedItem],
        this.ratio,
        true
      );
    }
  }

  handleCanvasOut() {
    this.hideTooltip();
    HistogramUIService.cleanDomContext(
      this.ctxHover,
      this.histogramHoverCanvas
    );
  }

  handleCanvasMove(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    if (this.datas && canvasPosition) {
      const barPosition = HistogramUIService.getCurrentBarPosition(
        this.datas,
        canvasPosition,
        event,
        this.options.yPadding
      );

      if (barPosition !== undefined) {
        const bar = this.datas[barPosition];
        const tooltipText = HistogramUIService.generateTooltip(
          this.datasLabels,
          bar,
          barPosition === 0
        );
        this.showTooltip(event, tooltipText);

        HistogramUIService.cleanDomContext(
          this.ctxHover,
          this.histogramHoverCanvas
        );
        if (this.ctxHover) {
          this.drawRect(
            this.ctxHover,
            this.datas[barPosition],
            this.bars[barPosition],
            this.ratio
          );
        }
      } else {
        this.hideTooltip();
      }
    }
  }

  showTooltip(event: MouseEvent, text: string) {
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
      HistogramUIService.cleanDomContext(
        this.ctxHover,
        this.histogramHoverCanvas
      );
      HistogramUIService.cleanDomContext(
        this.ctxSelected,
        this.histogramSelectedCanvas
      );
      this.ctx = HistogramUIService.initCanvasContext(
        this.histogramCanvas,
        this.w,
        this.h
      );
      this.ctxHover = HistogramUIService.initCanvasContext(
        this.histogramHoverCanvas,
        this.w,
        this.h
      );
      this.ctxSelected = HistogramUIService.initCanvasContext(
        this.histogramSelectedCanvas,
        this.w,
        this.h
      );

      this.xTickCount = 5; // We must reinit each times

      if (this.chart) {
        this.chart.nativeElement.innerHTML = '';
        if (this.datas) {
          if (this.datas.length > 500) {
            // display loading
            this.isLoading = true;
          }

          setTimeout(
            () => {
              // const t0 = performance.now();
              if (this.datas) {
                if (this.graphOptionY === HistogramType.YLOG) {
                  this.rangeYLog = this.histogramService.getLogRangeY(
                    this.datas
                  );
                  this.ratioY = this.histogramService.getLogRatioY(
                    this.h,
                    this.options.yPadding
                  );
                } else {
                  this.rangeYLin = this.histogramService.getLinRangeY(
                    this.datas
                  );
                  this.ratioY = this.histogramService.getLinRatioY(
                    this.h,
                    this.options.yPadding
                  );
                }

                this.drawChart(this.w);

                [this.rangeXLin, this.rangeXLog] =
                  this.histogramService.getRangeX(this.datas);

                if (
                  this.rangeXLog.negValuesCount === 0 ||
                  this.rangeXLog.posValuesCount === 0
                ) {
                  this.xTickCount = this.xTickCount * 2;
                }

                this.drawYAxis();
                this.drawHistogram(this.datas);

                if (this.graphOptionX === HistogramType.XLIN) {
                  let shift = 0;
                  let width = this.w - 2 * this.options.xPadding;
                  let domain = [this.rangeXLin.min, this.rangeXLin.max];
                  let tickValues = this.datas.map(
                    (e: HistogramValuesI) => e.partition[0]
                  );
                  tickValues.push(
                    this.datas[this.datas.length - 1].partition[1]
                  );
                  // @ts-ignore
                  this.drawXAxis(domain, shift, width);
                } else {
                  // Draw positive axis
                  let shift = 0;
                  let width = 0;
                  let domain: number[] = [];

                  if (
                    this.rangeXLog.posStart !== this.rangeXLog.max &&
                    this.rangeXLog.posValuesCount
                  ) {
                    width = this.w - 2 * this.options.xPadding;
                    // @ts-ignore
                    domain = [this.rangeXLog.posStart, this.rangeXLog.max];

                    let shiftInf = 2;
                    if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
                      shiftInf = 1;
                    }
                    if (
                      !this.rangeXLog.inf &&
                      this.rangeXLog.negValuesCount === 0
                    ) {
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
                      let middleShift =
                        shift -
                        ((this.w - 2 * this.options.xPadding) / this.ratio) *
                          // @ts-ignore
                          Math.log10(this.rangeXLog.middlewidth);
                      domain = [1];
                      this.drawXAxis(domain, middleShift - 1, 1);
                    } else {
                      let middleShift = this.w - 2 * this.options.xPadding;
                      domain = [1];
                      this.drawXAxis(domain, middleShift - 1, 1); // 1 to make bigger line
                    }
                  }

                  // Draw negative axis
                  if (
                    // this.rangeXLog.inf ||
                    this.rangeXLog.negStart !== this.rangeXLog.min &&
                    this.rangeXLog.negValuesCount
                  ) {
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
                    } else {
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
            },
            this.isLoading ? 100 : 0
          );
        }
      }
    }
  }

  drawChart(chartW: number) {
    //@ts-ignore
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.options.yPadding);
  }

  drawRect(
    ctx: CanvasRenderingContext2D,
    d: HistogramValuesI,
    bar: HistogramBarVO,
    ratio: number = 0,
    selectedItem: boolean = false
  ) {
    if (ctx) {
      let barX: number, barH: number, barW: number;

      if (this.graphOptionX === HistogramType.XLIN) {
        barX = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barXlin;
        barW = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barWlin;
      } else {
        barX = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barXlog;
        barW = ((this.w - 2 * this.options.xPadding) / ratio) * bar.barWlog;
      }

      if (this.graphOptionY === HistogramType.YLIN) {
        barH = d.value * this.ratioY;
      } else {
        if (d.logValue !== 0) {
          // @ts-ignore
          let shift = Math.abs(this.rangeYLog.max);
          barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
          barH = this.h - this.options.yPadding / 2 - barH;
        } else {
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

      // Tooltip issue on histogram #189
      if (barW < 1) {
        barW = 1.5;
      }

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

  drawHistogram(datasSet: HistogramValuesI[]) {
    this.bars = this.histogramService.computeXbarsDimensions(
      datasSet,
      // @ts-ignore
      this.graphOptionX
    );
    this.ratio = 0;
    if (this.graphOptionX === HistogramType.XLIN) {
      this.ratio =
        this.bars[this.bars.length - 1].barXlin +
        this.bars[this.bars.length - 1].barWlin;
    } else {
      this.ratio =
        this.bars[this.bars.length - 1].barXlog +
        this.bars[this.bars.length - 1].barWlog;
    }

    datasSet.forEach((d: HistogramValuesI, i: number) => {
      // @ts-ignore
      this.drawRect(this.ctx, d, this.bars[i], this.ratio);
    });
  }

  drawXAxis(domain: number[], shift: number, width: number) {
    if (width !== 0) {
      let xAxis;
      shift = shift + this.options.xPadding;

      if (this.graphOptionX === HistogramType.XLIN) {
        xAxis = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
      } else {
        xAxis = d3.scaleLog().base(10).domain(domain).range([0, width]);
      }

      //@ts-ignore
      const axis: d3.Axis<d3.NumberValue> = d3
        .axisBottom(xAxis)
        .ticks([this.xTickCount])
        .tickArguments([this.xTickCount, '.0e'])
        .tickSize(-this.h + this.options.yPadding / 2);

      if (this.graphOptionX === HistogramType.XLIN) {
        //@ts-ignore
        axis.tickFormat((d: number) => {
          let val: any = d;
          return '' + format(val);
        });
      }

      this.svg!.insert('g', ':first-child')
        .attr('class', 'barXlog axis-grid')
        .attr(
          'transform',
          'translate(' +
            (shift + this.options.xPadding / 2) +
            ',' +
            this.h +
            ') '
        ) // This controls the vertical position of the Axis
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
    } else {
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
      .tickFormat((d: number) => {
        let val: number = d;
        if (this.graphOptionY === HistogramType.YLIN) {
          return '' + format(val);
        } else {
          const antiLog = Math.pow(10, val);
          return d3.format('.0e')(antiLog);
        }
      })

      .ticks(this.yTicksCount);
    // @ts-ignore
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr(
        'transform',
        'translate(' +
          (shift + this.options.xPadding / 2) +
          ',' +
          this.options.yPadding / 2 +
          ')'
      ) // This controls the vertical position of the Axis
      .call(axis)
      .selectAll('line')
      .style('stroke', this.options.gridColor); // Set the grid color
  }
}
