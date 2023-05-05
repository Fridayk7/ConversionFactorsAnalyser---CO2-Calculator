import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataValidationComponent } from './data-validation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';
import { DataService } from '../data.service';
import { DataProccessorService } from '../data_processor.service';

describe('DataValidationComponent', () => {
  let component: DataValidationComponent;
  let fixture: ComponentFixture<DataValidationComponent>;

  let mockDataService;
  let mockProcessorService;

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj<DataService>('DataService', [
      'getMissingValues',
      'getMissingTags',
      'getMissingSourceUnits',
      'getMissingTargetUnits',
      'getNegativeValues',
      'getMissingStartDates',
      'getMissingEndDates',
      'getMissingCountries',
    ]);
    mockProcessorService = jasmine.createSpyObj<DataProccessorService>(
      'DataProccessorService',
      ['transformQualityChecks']
    );
    await TestBed.configureTestingModule({
      declarations: [DataValidationComponent],
      imports: [RouterTestingModule, HttpClientModule, AgGridModule],
      providers: [
        { provide: DataService, useValue: mockDataService },
        { provide: DataProccessorService, useValue: mockProcessorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include validation checks', () => {
    expect(component.rowData).toBeDefined;
  });
});
