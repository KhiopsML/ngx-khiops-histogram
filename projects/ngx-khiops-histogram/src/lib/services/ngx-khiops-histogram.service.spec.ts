import { TestBed } from '@angular/core/testing';

import { NgxKhiopsHistogramService } from './ngx-khiops-histogram.service';

describe('NgxKhiopsHistogramService', () => {
  let service: NgxKhiopsHistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxKhiopsHistogramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
