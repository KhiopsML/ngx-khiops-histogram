import { TestBed } from '@angular/core/testing';
import { HistogramService } from './ngx-khiops-histogram.service';

describe('NgxKhiopsHistogramService', () => {
  let service: HistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistogramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
