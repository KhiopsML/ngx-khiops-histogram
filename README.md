# ngx-khiops-histogram

```ngx-khiops-histogram``` is an Angular Typescript component that allows you to display histograms of numerical values in linear and logarithmic form.
This component is maintained and is integrated into the [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) tool.

## Why ?

If the linear representation in x and y is classic, as is the logarithmic representation in y, the logarithmic representation in x poses a problem for values ​​around zero and for negative interval values.

### Negative logarithmic values

Negative logarithmic interval values ​​cannot be represented since Math.log10(-x) = NaN.
In order to represent these values, ​​we will take their absolute values ​​which we will display on the negative axis of x: from -1 to -inf

![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/11dfd7c4-3ecf-4a71-9439-5c498de78a23)

### Values around 0

Values ​​around [-1; 1] are infinite so the representation should be infinitely large. To avoid this, we then arbitrarily assign a width of 1/10 of the width of the graph.

![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/ef64c77f-a640-46cf-8743-2024d0be5e90)

If 0 is a bound, the arbitrary histogram in the middle is divided into two parts to represent the value <0 and the value >0


![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/ea69a9ba-19bc-4052-bd11-1a31df0c190f)


## Installation

```yarn add ngx-khiops-histogram```

or

```npm install ngx-khiops-histogram```

## Usage

Add wanted package to NgModule imports:

```
import { NgxKhiopsHistogramModule } from 'ngx-khiops-histogram';

@NgModule({
...
imports: [NgxKhiopsHistogramModule,...]
...
})
```

Add component to your page:
```
<ngx-khiops-histogram
    [datas]="datas"
    [datasLabels]="datasLabels"
    [options]="options"
    [graphOptionX]="graphOptionX"
    [graphOptionY]="graphOptionY"
    (selectedItemChanged)="selectedItemChanged($event)">
</ngx-khiops-histogram>
```

### Params

| Property | Type | Default | Description |
|--|--|--|--|
| graphOptionX | HistogramType | HistogramType.XLIN | X axis scale |
| graphOptionY| HistogramType | HistogramType.YLIN| Y axis scale | 
| options| HistogramOptions| {<br>selectedBarColor: 'black',<br>gridColor: '#aaa',<br>xPadding: 40,<br>yPadding: 50,<br>minBarHeight: 4<br>} | Optional styles options |
| datas| HistogramData| {<br>frequency: number,<br>partition: [number, number],<br>value: number,<br>logValue: number<br>} | Datas inputs |


### Outputs

| Property | Event type | Description|
|--|--|--|
| selectedItemChanged | EventEmitter(Number) | Emit new index value when a bar is clicked|
