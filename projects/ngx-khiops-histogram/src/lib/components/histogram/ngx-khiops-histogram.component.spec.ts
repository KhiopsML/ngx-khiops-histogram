import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxKhiopsHistogramComponent } from './ngx-khiops-histogram.component';

describe('NgxKhiopsHistogramComponent', () => {
  let component: NgxKhiopsHistogramComponent;
  let fixture: ComponentFixture<NgxKhiopsHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxKhiopsHistogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxKhiopsHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
