import { Component } from '@angular/core';
import { DataService } from './data.service';
import { DataProccessorService } from './data_processor.service';

import { ColDef, GridApi, GridReadyEvent, IRowNode } from 'ag-grid-community';
import { Grid, GridOptions } from 'ag-grid-community';
import * as echarts from 'echarts';

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
    legend: {
      data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
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

  // public missingTagsResult: any;
  // columnDefs: ColDef[] = [
  //   { headerName: 'Check Name', field: 'check-name', width:120, rowGroup: true },
  //   { headerName: 'Lookup Name', field: 'lookup-name', width:120 },
  //   { headerName: 'Source Unit', field: 'source-unit', width:120 },
  //   { headerName: 'Target Unit', field: 'targe-unit', width:120 },
  //   { headerName: 'Year', field: 'year', width:120 },
  // ];

  // gridOptions ={defaultColDef:{sortble: true,}},
  // columnDefs: this.columnDefs,
  // rowData: null,};

  // rowData = [
  //   { make: 'Toyota', model: 'Celica', price: 35000 },
  //   { make: 'Ford', model: 'Mondeo', price: 32000 },
  //   { make: 'Porsche', model: 'Boxster', price: 72000 },
  // ];
  // public gridOptions: any = {
  //   rowSelection: 'multiple',
  //   onGridReady: function (params: any) {},
  // };

  ngOnInit() {
    this._data.getMissingTags().subscribe((res: any) => console.log(res));
    this._data.getConversionFactors().subscribe((res: any) => {
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
