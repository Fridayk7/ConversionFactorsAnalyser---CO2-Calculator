import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DataService } from '../data.service';
import { DataProccessorService } from '../data_processor.service';
import * as echarts from 'echarts';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-evolution-chart',
  templateUrl: './evolution-chart.component.html',
  styleUrls: ['./evolution-chart.component.scss'],
})
export class EvolutionChartComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  categoryActive = false;
  repos = { EPA_FUEL_FULL: 'EPA', BEIS: 'BEIS' };
  private readonly destroy$ = new Subject();
  public allCF: any;
  public cf_evolution_series: any = [];
  public cf_groups: any;
  public flux: any = [];
  chartDom: any = '';

  myChart: any;
  option = {
    title: {
      text: 'Evolution',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
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
  cf_individual: any;

  constructor(
    private _data: DataService,
    private _processing: DataProccessorService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    let init = 'EPA_FUEL_FULL';
    document.getElementById('overlay').style.display = 'flex';
    // Get all conversion factor data from API
    this._data.getAllCFs(init).subscribe(async (res: any) => {
      res = this._processing.convertDate(res);
      // Call web worker to calculate evolutions for categories
      if (typeof Worker !== 'undefined') {
        // Create a new webworker
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
        // Call webworker to calculate individual evolutions
        const worker = new Worker(new URL('../app.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
          this.cf_groups = data.results;
          if (typeof Worker !== 'undefined') {
            // Create a new webworker
            const worker = new Worker(
              new URL('../app.worker', import.meta.url)
            );
            worker.onmessage = ({ data }) => {
              this.cf_individual = data.results;
              document.getElementById('overlay').style.display = 'none';
            };
            worker.postMessage([res, '', '', '']);
          } else {
            // Web Workers are not supported in this environment.
            // You should add a fallback so that your program still executes correctly.
          }
        };
        worker.postMessage([res]);
      } else {
        // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }

      this.cf_groups = this._processing.groupSimilarTags(res);

      this.chartDom = document.getElementById('cf-evolution');
      this.myChart = echarts.init(this.chartDom);
      this.option.series = this.cf_evolution_series;

      this.option && this.myChart.setOption(this.option, true);
    });
  }

  // User input handler on individual conversion factors
  selectCF(event: any) {
    if (this.categoryActive) {
      this.cf_evolution_series = [];
      this.categoryActive = false;
    }
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
      let cf = this.cf_individual[event.srcElement.id];
      let newEntry = {
        name: event.srcElement.id,
        type: 'line',
        smooth: true,
        data: cf,
        id: event.srcElement.id,
      };
      this.cf_evolution_series.push(newEntry);
    }
    this.option.series = this.cf_evolution_series;
    this.option && this.myChart.setOption(this.option, true);
  }
  // User input handler on categories
  selectCategory(event: any) {
    this.categoryActive = true;
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
  ngAfterViewInit() {}

  ngOnDestroy() {
    this.destroy$.next(1);
    this.destroy$.complete();
  }
  // User input handler on changing publisher
  changePublisher(event: any) {
    let id = event.srcElement.id;

    for (let i of Array.from(
      document
        .getElementsByClassName('categories2')[0]
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
    if (id === 'BEIS') {
      this.option.xAxis.data = ['2016', '2017', '2018', '2019', '2020', '2021'];
    }
    document.getElementById('overlay').style.display = 'flex';
    this._data
      .getAllCFs(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (res: any) => {
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
            if (typeof Worker !== 'undefined') {
              // Create a new
              const worker = new Worker(
                new URL('../app.worker', import.meta.url)
              );
              worker.onmessage = ({ data }) => {
                this.cf_individual = data.results;
                document.getElementById('overlay').style.display = 'none';
              };
              worker.postMessage([res, '', '', '']);
            } else {
              // Web Workers are not supported in this environment.
              // You should add a fallback so that your program still executes correctly.
            }
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
        this.cf_evolution_series = [];
        this.chartDom = document.getElementById('cf-evolution');
        this.myChart = echarts.init(this.chartDom);
        this.option.series = this.cf_evolution_series;

        this.option && this.myChart.setOption(this.option, true);
      });
  }
}
