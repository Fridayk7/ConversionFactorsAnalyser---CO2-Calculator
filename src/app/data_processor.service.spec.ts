import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { DataProccessorService } from './data_processor.service';

describe('DataService', () => {
  let service: DataProccessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(DataProccessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
