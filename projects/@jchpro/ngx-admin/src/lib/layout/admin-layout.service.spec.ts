import { TestBed } from '@angular/core/testing';

import { AdminLayoutService } from './admin-layout.service';

describe('AdminLayoutService', () => {
  let service: AdminLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
