import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class NgxKhiopsHistogramTooltipComponent {
    constructor() {
        this.text = '';
        this.posX = 0;
        this.posY = 0;
        this.canvasW = 0;
        this.display = false;
    }
    computeYPos() {
        let top = this.posY - 0;
        if (top < 10) {
            top = 10;
        }
        return top;
    }
    computeXPos() {
        let left = this.posX + 20;
        if (left < 10) {
            left = 10;
        }
        if (left > this.canvasW - 170) {
            left = this.posX - 170;
        }
        return left;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.4", type: NgxKhiopsHistogramTooltipComponent, selector: "ngx-khiops-histogram-tooltip", inputs: { text: "text", posX: "posX", posY: "posY", canvasW: "canvasW", display: "display" }, ngImport: i0, template: `
    <div
      [ngStyle]="{
        'left.px': this.computeXPos(),
        'top.px': this.computeYPos()
      }"
      class="tooltip"
      [style.display]="display ? 'block' : 'none'"
    >
      <p [innerHTML]="text"></p>
    </div>
  `, isInline: true, styles: [".tooltip{font-family:verdana;position:absolute;background-color:#000c;color:#fff;font-weight:200;z-index:2;padding:0 10px;border-radius:5px;font-size:.8rem;pointer-events:none}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramTooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-khiops-histogram-tooltip', template: `
    <div
      [ngStyle]="{
        'left.px': this.computeXPos(),
        'top.px': this.computeYPos()
      }"
      class="tooltip"
      [style.display]="display ? 'block' : 'none'"
    >
      <p [innerHTML]="text"></p>
    </div>
  `, styles: [".tooltip{font-family:verdana;position:absolute;background-color:#000c;color:#fff;font-weight:200;z-index:2;padding:0 10px;border-radius:5px;font-size:.8rem;pointer-events:none}\n"] }]
        }], ctorParameters: () => [], propDecorators: { text: [{
                type: Input
            }], posX: [{
                type: Input
            }], posY: [{
                type: Input
            }], canvasW: [{
                type: Input
            }], display: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWtoaW9wcy1oaXN0b2dyYW0udG9vbHRpcC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gta2hpb3BzLWhpc3RvZ3JhbS9zcmMvbGliL2NvbXBvbmVudHMvdG9vbHRpcC9uZ3gta2hpb3BzLWhpc3RvZ3JhbS50b29sdGlwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBaUNqRCxNQUFNLE9BQU8sa0NBQWtDO0lBTzdDO1FBTlMsU0FBSSxHQUFXLEVBQUUsQ0FBQztRQUNsQixTQUFJLEdBQVcsQ0FBQyxDQUFDO1FBQ2pCLFNBQUksR0FBVyxDQUFDLENBQUM7UUFDakIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixZQUFPLEdBQVksS0FBSyxDQUFDO0lBRW5CLENBQUM7SUFFaEIsV0FBVztRQUNULElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ2IsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDZCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDOUIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OEdBMUJVLGtDQUFrQztrR0FBbEMsa0NBQWtDLGtLQTdCbkM7Ozs7Ozs7Ozs7O0dBV1Q7OzJGQWtCVSxrQ0FBa0M7a0JBL0I5QyxTQUFTOytCQUNFLDhCQUE4QixZQUM5Qjs7Ozs7Ozs7Ozs7R0FXVDt3REFtQlEsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LWtoaW9wcy1oaXN0b2dyYW0tdG9vbHRpcCcsXHJcbiAgdGVtcGxhdGU6IGBcclxuICAgIDxkaXZcclxuICAgICAgW25nU3R5bGVdPVwie1xyXG4gICAgICAgICdsZWZ0LnB4JzogdGhpcy5jb21wdXRlWFBvcygpLFxyXG4gICAgICAgICd0b3AucHgnOiB0aGlzLmNvbXB1dGVZUG9zKClcclxuICAgICAgfVwiXHJcbiAgICAgIGNsYXNzPVwidG9vbHRpcFwiXHJcbiAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImRpc3BsYXkgPyAnYmxvY2snIDogJ25vbmUnXCJcclxuICAgID5cclxuICAgICAgPHAgW2lubmVySFRNTF09XCJ0ZXh0XCI+PC9wPlxyXG4gICAgPC9kaXY+XHJcbiAgYCxcclxuICBzdHlsZXM6IFtcclxuICAgIGBcclxuICAgICAgLnRvb2x0aXAge1xyXG4gICAgICAgIGZvbnQtZmFtaWx5OiB2ZXJkYW5hO1xyXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuOCk7XHJcbiAgICAgICAgY29sb3I6ICNmZmY7XHJcbiAgICAgICAgZm9udC13ZWlnaHQ6IDIwMDtcclxuICAgICAgICB6LWluZGV4OiAyO1xyXG4gICAgICAgIHBhZGRpbmc6IDAgMTBweDtcclxuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XHJcbiAgICAgICAgZm9udC1zaXplOiAwLjhyZW07XHJcbiAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgICAgIH1cclxuICAgIGAsXHJcbiAgXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neEtoaW9wc0hpc3RvZ3JhbVRvb2x0aXBDb21wb25lbnQge1xyXG4gIEBJbnB1dCgpIHRleHQ6IHN0cmluZyA9ICcnO1xyXG4gIEBJbnB1dCgpIHBvc1g6IG51bWJlciA9IDA7XHJcbiAgQElucHV0KCkgcG9zWTogbnVtYmVyID0gMDtcclxuICBASW5wdXQoKSBjYW52YXNXOiBudW1iZXIgPSAwO1xyXG4gIEBJbnB1dCgpIGRpc3BsYXk6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBjb21wdXRlWVBvcygpIHtcclxuICAgIGxldCB0b3AgPSB0aGlzLnBvc1kgLSAwO1xyXG4gICAgaWYgKHRvcCA8IDEwKSB7XHJcbiAgICAgIHRvcCA9IDEwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvcDtcclxuICB9XHJcblxyXG4gIGNvbXB1dGVYUG9zKCkge1xyXG4gICAgbGV0IGxlZnQgPSB0aGlzLnBvc1ggKyAyMDtcclxuICAgIGlmIChsZWZ0IDwgMTApIHtcclxuICAgICAgbGVmdCA9IDEwO1xyXG4gICAgfVxyXG4gICAgaWYgKGxlZnQgPiB0aGlzLmNhbnZhc1cgLSAxNzApIHtcclxuICAgICAgbGVmdCA9IHRoaXMucG9zWCAtIDE3MDtcclxuICAgIH1cclxuICAgIHJldHVybiBsZWZ0O1xyXG4gIH1cclxufVxyXG4iXX0=