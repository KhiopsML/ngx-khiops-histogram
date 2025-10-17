# 📊 ngx-khiops-histogram

`ngx-khiops-histogram` is an Angular TypeScript component for displaying histograms of numerical values in both linear and logarithmic forms. This component is actively maintained and integrated into the [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) tool.

## ❓ Why use this component?

While linear representation in x and y axes is standard, and logarithmic representation in y is common, logarithmic representation in x presents challenges for values near zero and for negative intervals.

### ➖ Handling negative logarithmic values

Negative logarithmic interval values cannot be represented directly since `Math.log10(-x) = NaN`. To display these values, their absolute values are shown on the negative x-axis: from -1 to -∞.

![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/11dfd7c4-3ecf-4a71-9439-5c498de78a23)

### 🟰 Handling values around zero

Values around [-1; 1] are infinite, so the representation would be infinitely large. To avoid this, an arbitrary width of 1/10 of the graph is assigned to this region.

![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/ef64c77f-a640-46cf-8743-2024d0be5e90)

If 0 is a boundary, the arbitrary histogram in the middle is split into two parts to represent values <0 and >0.

![image](https://github.com/KhiopsML/ngx-khiops-histogram/assets/13203455/ea69a9ba-19bc-4052-bd11-1a31df0c190f)

## ⚙️ Installation

```bash
yarn add ngx-khiops-histogram
# or
npm install ngx-khiops-histogram
```

## 🚀 Usage

Add the package to your NgModule imports:

```typescript
import { NgxKhiopsHistogramModule } from 'ngx-khiops-histogram';

@NgModule({
    ...
    imports: [NgxKhiopsHistogramModule, ...]
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

| Property     | Type             | Default              | Description            |
| ------------ | ---------------- | -------------------- | ---------------------- |
| graphOptionX | HistogramType    | `HistogramType.XLIN` | X axis scale           |
| graphOptionY | HistogramType    | `HistogramType.YLIN` | Y axis scale           |
| options      | HistogramOptions | See example below    | Optional style options |
| datas        | HistogramData    | See example below    | Data inputs            |

**Example for `options` default:**

```typescript
{
    selectedBarColor: 'black',
    gridColor: '#aaa',
    xPadding: 40,
    yPadding: 50,
    minBarHeight: 4
}
```

**Example for `datas` default:**

```typescript
{
    frequency: number,
    partition: [number, number],
    value: number,
    logValue: number
}
```

### Outputs

| Property            | Event type           | Description                                |
| ------------------- | -------------------- | ------------------------------------------ |
| selectedItemChanged | EventEmitter(Number) | Emit new index value when a bar is clicked |

## 📄 License

This software is distributed under the BSD 3-Clause-clear License, the text of which is available at  
[BSD-3-Clause-Clear](https://spdx.org/licenses/BSD-3-Clause-Clear.html) or see the [LICENSE.md](./LICENSE) for more details.

## 🙏 Credits

The ngx-khiops-histogram library is currently developed at [Orange Innovation][o-innov] by the Khiops Team: khiops.team@orange.com.

[o-innov]: https://hellofuture.orange.com/en/
