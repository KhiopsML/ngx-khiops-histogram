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
      partition: [-10, -1],
      value: 0.022262260622688126,
      logValue: -1.652430737300943,
    },
    {
      frequency: 9796,
      partition: [-1, 1],
      value: 0.02507063592809467,
      logValue: -1.6008346498248047,
    },
    {
      frequency: 11723,
      partition: [1, 8.5],
      value: 0.026668759583054657,
      logValue: -1.5739971837387918,
    },
    // {
    //   frequency: 4793,
    //   partition: [38.5, 42.5],
    //   value: 0.02453318864911347,
    //   logValue: -1.6102460016217122,
    // },
    // {
    //   frequency: 5445,
    //   partition: [42.5, 47.5],
    //   value: 0.022296384259448833,
    //   logValue: -1.6517655595297627,
    // },
  ];

  selectedItemChanged(event: number): void {
    this['selectedItem'] = event;
  }
}
