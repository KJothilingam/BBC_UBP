import { TestBed } from '@angular/core/testing';

import { ReportRequestService } from './report-request.service';

describe('ReportRequestService', () => {
  let service: ReportRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
