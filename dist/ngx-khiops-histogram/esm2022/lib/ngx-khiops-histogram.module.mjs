import { NgModule } from '@angular/core';
import { NgxKhiopsHistogramComponent } from './components/histogram/ngx-khiops-histogram.component';
import { CommonModule } from '@angular/common';
import { NgxKhiopsHistogramTooltipComponent } from './components/tooltip/ngx-khiops-histogram.tooltip.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import * as i0 from "@angular/core";
export class NgxKhiopsHistogramModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, declarations: [NgxKhiopsHistogramComponent,
            NgxKhiopsHistogramTooltipComponent], imports: [CommonModule, AngularResizeEventModule], exports: [NgxKhiopsHistogramComponent, NgxKhiopsHistogramTooltipComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, imports: [CommonModule, AngularResizeEventModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.4", ngImport: i0, type: NgxKhiopsHistogramModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, AngularResizeEventModule],
                    declarations: [
                        NgxKhiopsHistogramComponent,
                        NgxKhiopsHistogramTooltipComponent,
                    ],
                    exports: [NgxKhiopsHistogramComponent, NgxKhiopsHistogramTooltipComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWtoaW9wcy1oaXN0b2dyYW0ubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWtoaW9wcy1oaXN0b2dyYW0vc3JjL2xpYi9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNwRyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sNkRBQTZELENBQUM7QUFDakgsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sc0JBQXNCLENBQUM7O0FBVWhFLE1BQU0sT0FBTyx3QkFBd0I7OEdBQXhCLHdCQUF3QjsrR0FBeEIsd0JBQXdCLGlCQUxqQywyQkFBMkI7WUFDM0Isa0NBQWtDLGFBSDFCLFlBQVksRUFBRSx3QkFBd0IsYUFLdEMsMkJBQTJCLEVBQUUsa0NBQWtDOytHQUU5RCx3QkFBd0IsWUFQekIsWUFBWSxFQUFFLHdCQUF3Qjs7MkZBT3JDLHdCQUF3QjtrQkFScEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsd0JBQXdCLENBQUM7b0JBQ2pELFlBQVksRUFBRTt3QkFDWiwyQkFBMkI7d0JBQzNCLGtDQUFrQztxQkFDbkM7b0JBQ0QsT0FBTyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsa0NBQWtDLENBQUM7aUJBQzNFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmd4S2hpb3BzSGlzdG9ncmFtQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2hpc3RvZ3JhbS9uZ3gta2hpb3BzLWhpc3RvZ3JhbS5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBOZ3hLaGlvcHNIaXN0b2dyYW1Ub29sdGlwQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3Rvb2x0aXAvbmd4LWtoaW9wcy1oaXN0b2dyYW0udG9vbHRpcC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBBbmd1bGFyUmVzaXplRXZlbnRNb2R1bGUgfSBmcm9tICdhbmd1bGFyLXJlc2l6ZS1ldmVudCc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIEFuZ3VsYXJSZXNpemVFdmVudE1vZHVsZV0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBOZ3hLaGlvcHNIaXN0b2dyYW1Db21wb25lbnQsXHJcbiAgICBOZ3hLaGlvcHNIaXN0b2dyYW1Ub29sdGlwQ29tcG9uZW50LFxyXG4gIF0sXHJcbiAgZXhwb3J0czogW05neEtoaW9wc0hpc3RvZ3JhbUNvbXBvbmVudCwgTmd4S2hpb3BzSGlzdG9ncmFtVG9vbHRpcENvbXBvbmVudF0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hLaGlvcHNIaXN0b2dyYW1Nb2R1bGUge31cclxuIl19