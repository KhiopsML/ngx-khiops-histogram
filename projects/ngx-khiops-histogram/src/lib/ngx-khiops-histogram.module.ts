import { NgModule } from '@angular/core';
import { NgxKhiopsHistogramComponent } from './components/histogram/ngx-khiops-histogram.component';
import { CommonModule } from '@angular/common';
import { NgxKhiopsHistogramTooltipComponent } from './components/tooltip/ngx-khiops-histogram.tooltip.component';
import { AngularResizeEventModule } from 'angular-resize-event';

@NgModule({
  imports: [CommonModule, AngularResizeEventModule],
  declarations: [
    NgxKhiopsHistogramComponent,
    NgxKhiopsHistogramTooltipComponent,
  ],
  exports: [NgxKhiopsHistogramComponent, NgxKhiopsHistogramTooltipComponent],
})
export class NgxKhiopsHistogramModule {}
