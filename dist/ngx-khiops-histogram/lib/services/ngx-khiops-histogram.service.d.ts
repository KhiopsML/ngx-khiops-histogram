import { HistogramBarVO } from '../model/ngx-khiops-histogram.bar-vo';
import { HistogramValuesI, RangeXLinI, RangeXLogI, RangeYLogI } from '../interfaces/ngx-khiops-histogram.interfaces';
import * as i0 from "@angular/core";
export declare class HistogramService {
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
