import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DataProccessorService } from '../data_processor.service';
import * as echarts from 'echarts';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-evolution-chart',
  templateUrl: './evolution-chart.component.html',
  styleUrls: ['./evolution-chart.component.scss'],
})
export class EvolutionChartComponent implements OnInit, AfterViewInit {
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

  constructor(
    private _data: DataService,
    private _processing: DataProccessorService,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    this.spinner.show();
    await this._data.getBEIS().subscribe(async (res: any) => {
      res = this._processing.convertDate(res);
      if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('../app.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
          this.allCF = data.results;
          console.log('DONE');
        };
        worker.postMessage([res, '', '']);
      } else {
        // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }

      if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('../app.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
          this.cf_groups = data.results;
          console.log('DONE');
        };
        worker.postMessage([res]);
      } else {
        // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }

      // this.cf_groups = this._processing.groupSimilarTags(resD);
      // this.flux = this._processing.findFluctuations(this.cf_groups);
      // console.log(this.flux);
      // for (let i in this.flux) {
      //   let newEntry = {
      //     name: i,
      //     type: 'line',
      //     stack: 'Total',
      //     smooth: true,
      //     data: this.flux[i],
      //     id: i,
      //   };
      //   this.cf_evolution_series.push(newEntry);
      // }
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
  }

  selectCategory(event: any) {
    this.cf_evolution_series = [];
    let category = this.cf_groups[event.srcElement.id];
    console.log(category);
    let flux = this._processing.findSingleFluctuations(category);
    console.log(flux);
    for (let i in flux) {
      console.log(i);
      let newEntry = {
        name: i,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: flux[i],
        id: i,
      };
      this.cf_evolution_series.push(newEntry);
    }
    this.option.series = this.cf_evolution_series;
    this.option && this.myChart.setOption(this.option, true);
  }

  singleFluctuationsLength(data) {
    return Object.keys(
      this._processing.findSingleFluctuations(this.cf_groups[data])
    ).length;
  }
  ngAfterViewInit() {
    this.spinner.hide();
  }
}
