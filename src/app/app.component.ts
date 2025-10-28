import { Component } from '@angular/core';
import {
  HistogramData,
  HistogramOptions,
  HistogramType,
} from '../../projects/ngx-khiops-histogram/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent {
  options: HistogramOptions = {
    selectedBarColor: 'black',
    gridColor: '#aaa',
    xPadding: 40,
    yPadding: 50,
    minBarHeight: 4,
  };

  graphOptionX: HistogramType = HistogramType.XLOG;
  graphOptionY: HistogramType = HistogramType.YLIN;

  selectOptionsX = [HistogramType.XLIN, HistogramType.XLOG];
  selectOptionsY = [HistogramType.YLIN, HistogramType.YLOG];

  selectedItem = -1;

  datasLabels = {
    frequency: 'Frequency',
    partition: 'Bounds',
    value: 'Density',
  };

  datas: HistogramData[] = [
    {
      frequency: 3262,
      partition: [-30, -2],
      value: 0.022,
      logValue: -1.652,
    },
    {
      frequency: 9796,
      partition: [-2, -0.1],
      value: 0.025,
      logValue: -1.6,
    },
    {
      frequency: 11723,
      partition: [-0.1, 0],
      value: 0.066,
      logValue: -1.18,
    },
    {
      frequency: 4793,
      partition: [0, 42.5],
      value: 0.024,
      logValue: -1.61,
    },
    {
      frequency: 5445,
      partition: [42.5, 47.5],
      value: 0.05,
      logValue: -1.3,
    },
    {
      frequency: 545,
      partition: [47.5, 400],
      value: 0.022,
      logValue: -1.65,
    },
  ];

  selectedItemChanged(event: number): void {
    this['selectedItem'] = event;
  }
}
