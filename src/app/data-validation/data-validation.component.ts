import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-enterprise';
import { DataService } from '../data.service';
import { DataProccessorService } from '../data_processor.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-data-validation',
  templateUrl: './data-validation.component.html',
  styleUrls: ['./data-validation.component.scss'],
})
export class DataValidationComponent {
  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  options: string[] = [];

  rowStyle = { background: '#ff9966' };

  getRowStyle = (params: any) => {
    console.log(params);

    if (
      params.node.allLeafChildren &&
      params.node.allLeafChildren[0].data.lookupName === 'No Data Found'
    ) {
      return { background: '#99cc33' };
    } else if (params.data && params.data.lookupName === 'No Data Found') {
      return { background: '#99cc33' };
    }
    return { background: '#ff9966' };
  };
  rowData = [];
  public columnDefs: ColDef[] = [
    {
      headerName: 'Check Name',
      field: 'checkName',
      width: 400,
      rowGroup: true,
      hide: true,
    },
    { headerName: 'Lookup Name', field: 'lookupName', width: 400 },
    { headerName: 'Source Unit', field: 'sourceUnit', width: 400 },
    { headerName: 'Target Unit', field: 'targeUnit', width: 400 },
    { headerName: 'Year', field: 'year', width: 400 },
  ];

  ngOnInit() {
    let missingValues$ = this._data.getMissingValues();
    let missingTags$ = this._data.getMissingTags();
    let missingSourceUnits$ = this._data.getMissingSourceUnits();
    let missingTargetUnits$ = this._data.getMissingTargetUnits();
    let missingStartDates$ = this._data.getMissingStartDates();
    let missingEndDates$ = this._data.getMissingEndDates();
    let negativeValues$ = this._data.getNegativeValues();
    let missingCountries$ = this._data.getMissingCountries();
    combineLatest(
      missingValues$,
      missingTags$,
      missingSourceUnits$,
      missingTargetUnits$,
      missingStartDates$,
      missingEndDates$,
      negativeValues$,
      missingCountries$
    ).subscribe(
      ([
        missingValues,
        missingTags,
        missingSourceUnits,
        missingTargetUnits,
        missingStartDates,
        missingEndDates,
        negativeValues,
        missingCountries,
      ]) => {
        let rowData = this._processing.transformQualityChecks(
          missingValues,
          missingTags,
          missingSourceUnits,
          missingTargetUnits,
          negativeValues,
          missingStartDates,
          missingEndDates,
          missingCountries
        );

        this.rowData = rowData;
      }
    );
  }
}
