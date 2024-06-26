import { HistogramValuesI } from '../interfaces/ngx-khiops-histogram.interfaces';
export declare class HistogramBarVO {
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
