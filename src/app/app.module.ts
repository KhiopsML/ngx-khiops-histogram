import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxKhiopsHistogramModule } from '../../projects/ngx-khiops-histogram/src/public-api';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [FormsModule, BrowserModule, CommonModule, NgxKhiopsHistogramModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
