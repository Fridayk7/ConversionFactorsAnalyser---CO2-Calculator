import { Component } from '@angular/core';
import { DataService } from './data.service';
import { DataProccessorService } from './data_processor.service';

import { ColDef } from 'ag-grid-community';
import * as echarts from 'echarts';
import { combineLatest } from 'rxjs';

interface CF {
  conversionFactors: { type: string; value: string };
  values: { datatype: string; type: string; value: string };
  sourceUnitNames: { type: string; value: string };
  targetUnitNames: { type: string; value: string };
  lookUpNames: { type: string; value: string };
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}
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
  public allCF: any;
  public cf_evolution_series: any = [];
  public cf_groups: any;
  public flux: any = [];
  chartDom: any = '';
  myChart: any;
  option = {
    title: {
      text: 'Stacked Line',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2014', '2015', '2018', '2020', '2021', '2022'],
    },
    yAxis: {
      type: 'value',
    },
    series: this.cf_evolution_series,
  };

  title = 'carbon-layer1';

  public missingTagsResult: any;
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

    this._data.getConversionFactors().subscribe(async (res: any) => {
      res = this._processing.convertDate(res);
      this.allCF = this._processing.sortByName(res);

      let resD = this._processing.sortByDate(res);

      this.cf_groups = this._processing.groupSimilar(resD);
      this.flux = this._processing.findFluctuations(this.cf_groups);
      for (let i in this.flux) {
        let newEntry = {
          name: i,
          type: 'line',
          stack: 'Total',
          smooth: true,
          data: this.flux[i],
          id: i,
        };
        this.cf_evolution_series.push(newEntry);
      }
      console.log(this.cf_groups);
      console.log('QUALITY CHECKS');
      this.chartDom = document.getElementById('cf-evolution');
      this.myChart = echarts.init(this.chartDom);
      this.option.series = this.cf_evolution_series;

      this.option && this.myChart.setOption(this.option, true);
    });
  }

  selectCF(event: any) {
    if (
      this.cf_evolution_series.length &&
      this.cf_evolution_series.filter((x: any) => x.id === event.srcElement.id)
        .length
    ) {
      this.cf_evolution_series = this.cf_evolution_series.filter(
        (x: any) => x.id != event.srcElement.id
      );
      this.cf_evolution_series = this.cf_evolution_series.filter(
        (x: any) => x.id != event.srcElement.id
      );
    } else {
      let cf = this.cf_groups[event.srcElement.id];
      let newEntry = {
        name: event.srcElement.id,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: cf,
        id: event.srcElement.id,
      };
      this.cf_evolution_series.push(newEntry);
    }
    this.option.series = this.cf_evolution_series;
    this.option && this.myChart.setOption(this.option, true);
    console.log(this.cf_evolution_series);
  }
}
