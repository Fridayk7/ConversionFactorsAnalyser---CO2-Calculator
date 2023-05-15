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

  repos = { BEIS: 'BEIS', EPA_FUEL_FULL: 'EPA' };

  options: string[] = [];

  rowStyle = { background: '#ff9966' };
  // Ag grid row color scheme

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
  // Ag grid column definitions and behaviour
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
    // Data request for all validation checks
    let init = 'EPA_FUEL_FULL';
    let missingValues$ = this._data.getMissingValues(init);
    let missingTags$ = this._data.getMissingTags(init);
    let missingSourceUnits$ = this._data.getMissingSourceUnits(init);
    let missingTargetUnits$ = this._data.getMissingTargetUnits(init);
    let missingStartDates$ = this._data.getMissingStartDates(init);
    let missingEndDates$ = this._data.getMissingEndDates(init);
    let negativeValues$ = this._data.getNegativeValues(init);
    let missingCountries$ = this._data.getMissingCountries(init);
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
        // Calls processing layer to transform the results
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
  // Re-calculates initializes validation checks based on user input on publisher
  change(event: any) {
    let id = event.srcElement.id;
    for (let i of Array.from(
      document
        .getElementsByClassName('categories')[0]
        .getElementsByClassName('category') as HTMLCollectionOf<HTMLElement>
    )) {
      console.log(i.id);
      if (i.id === id) {
        i.style.backgroundColor = '#8787f4';
        i.style.color = 'white';
      } else {
        i.style.color = 'black';
        i.style.backgroundColor = 'white';
      }
    }
    let missingValues$ = this._data.getMissingValues(id);
    let missingTags$ = this._data.getMissingTags(id);
    let missingSourceUnits$ = this._data.getMissingSourceUnits(id);
    let missingTargetUnits$ = this._data.getMissingTargetUnits(id);
    let missingStartDates$ = this._data.getMissingStartDates(id);
    let missingEndDates$ = this._data.getMissingEndDates(id);
    let negativeValues$ = this._data.getNegativeValues(id);
    let missingCountries$ = this._data.getMissingCountries(id);
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
