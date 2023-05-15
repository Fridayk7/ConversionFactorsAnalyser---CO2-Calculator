import { TestBed } from '@angular/core/testing';

import { DataService } from './data.service';
import { HttpClientModule } from '@angular/common/http';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of appliances', (done: DoneFn) => {
    service.getAppliances().subscribe((value) => {
      expect(value.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return a list of conversion factors', (done: DoneFn) => {
    service.getAllCFs('EPA_FUEL_FULL').subscribe((value) => {
      expect(value.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return a list of conversion factors', (done: DoneFn) => {
    service.getAllCFs('BEIS').subscribe((value) => {
      expect(value.length).toBeGreaterThan(0);
      done();
    });
  });
});
