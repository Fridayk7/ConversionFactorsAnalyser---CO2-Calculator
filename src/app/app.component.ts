import { Component } from '@angular/core';
import { DataService } from './data.service';
import { DataProccessorService } from './data_processor.service';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';

import { ColDef } from 'ag-grid-community';
import * as echarts from 'echarts';
import { Observable, combineLatest, map, startWith, tap } from 'rxjs';

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
  warnings: any = [];
  flexCalculatorArray: any[];
  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  addInputControl() {
    let newFormControl = new FormControl('', Validators.required);
    this.cfsArray.push(newFormControl);
    this.filteredOptions = newFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  calcControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  householdForm: FormGroup;
  cfsArray = new FormArray([new FormControl('', Validators.required)]);
  rowStyle = { background: '#ff9966' };
  appliancesData;
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
  public formResult: any = 0;
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
  flexCalculatorValue: any = 0;
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
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  flexCalcSubmit(event) {
    let inputarray = [];

    for (let step = 0; step < event.target.length - 2; step++) {
      if (step % 4 === 0 || step === 0) {
        inputarray.push({ appliance: event.target[step].value });
      } else if (step % 3 === 0) {
        inputarray[inputarray.length - 1].powerRating =
          event.target[step].value;
      } else if (step % 2 === 0) {
        inputarray[inputarray.length - 1].days = event.target[step].value;
      } else {
        inputarray[inputarray.length - 1].hours = event.target[step].value;
      }
    }
    console.log(this.appliancesData);
    for (let i of inputarray) {
      let cf = this.appliancesData.filter(
        (x: any) => x.title.value === i.appliance
      )[0].tagnames.value;
      if (
        ['electric light', 'home appliance', 'electrical device'].includes(cf)
      ) {
        cf = this.appliancesData.filter((x: any) => x.title.value === cf)[0]
          .tagnames.value;
      }
      i.conversionfactor = cf;
    }
    let naturalGas$ = this._data.getFormData('Natural Gas', 'scf', 'kg CO2');
    let electricity$ = this._data.getFormData(
      'Mixed (Electric Power Sector)',
      'mmbtu',
      'kg CO2'
    );
    combineLatest(naturalGas$, electricity$).subscribe(
      ([naturalGas, electricity]) => {
        let res = [
          naturalGas[naturalGas.length - 1],
          electricity[electricity.length - 1],
        ];
        for (let i of inputarray) {
          if (i.conversionfactor === 'electricity') {
            i.cfValue = +electricity[electricity.length - 1].values.value;
            i.cfName = 'electricity';
            i.cfDate = electricity[electricity.length - 1].endDate.value;
            i.cfOrigin = 'EPA';
            this.flexCalculatorValue +=
              ((+i.hours * +i.days * +i.powerRating) / 1000) * +i.cfValue;
          } else if (i.conversionfactor === 'natural gas') {
            i.cfValue = +naturalGas[naturalGas.length - 1].values.value;
            i.cfName = 'natural gas';
            i.cfDate = electricity[electricity.length - 1].endDate.value;
            i.cfOrigin = 'EPA';
            this.flexCalculatorValue +=
              ((+i.hours * +i.days * +i.powerRating) / 1000) * +i.cfValue;
          }
        }
        this.flexCalculatorArray = inputarray;
      }
    );
  }

  changeClient(event) {
    console.log(event);
  }
  ngOnInit() {
    this._data.search2();
    this.filteredOptions = this.cfsArray.controls[0].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
    this._data.getAppliances().subscribe((res: any) => {
      this.options = this._processing.getAppliances(res);
      this.appliancesData = res;
    });
    this.householdForm = new FormGroup({
      naturalGasValue: new FormControl(null),
      naturalGasUom: new FormControl(null),
      electricityValue: new FormControl(null),
      electricityUom: new FormControl(null),
      fuelOilValue: new FormControl(null),
      fuelOilUom: new FormControl(null),
      propaneValue: new FormControl(null),
      propaneUom: new FormControl(null),
    });
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
      this._data.getDefra().subscribe(async (resd: any) => {
        console.log(this._processing.compareDataSets(res, resd));
      });
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

  onSubmit() {
    let naturalGas$ = this._data.getFormData(
      'Natural Gas',
      this.householdForm.value.naturalGasUom,
      'kg CO2'
    );
    let electricity$ = this._data.getFormData(
      'Mixed (Electric Power Sector)',
      this.householdForm.value.electricityUom,
      'kg CO2'
    );
    let fuelOil$ = this._data.getFormData(
      'Residual Fuel Oil No. 6',
      this.householdForm.value.fuelOilUom,
      'kg CO2'
    );
    let propane$ = this._data.getFormData(
      'Propane Gas',
      this.householdForm.value.propaneUom,
      'kg CO2'
    );

    combineLatest(naturalGas$, electricity$, fuelOil$, propane$).subscribe(
      ([naturalGas, electricity, fuelOil, propane]) => {
        let res = [
          naturalGas[naturalGas.length - 1],
          electricity[electricity.length - 1],
          fuelOil[fuelOil.length - 1],
          propane[propane.length - 1],
        ];
        this.formResult +=
          +naturalGas[naturalGas.length - 1].values.value *
          +this.householdForm.value.naturalGasValue;
        this.formResult +=
          +electricity[electricity.length - 1].values.value *
          +this.householdForm.value.electricityValue;
        this.formResult +=
          +fuelOil[fuelOil.length - 1].values.value *
          +this.householdForm.value.fuelOilValue;
        this.formResult +=
          +propane[propane.length - 1].values.value *
          +this.householdForm.value.propaneValue;

        for (let i of res) {
          if (new Date(i.endDate.value) < new Date())
            this.warnings.push(
              `Conversion factor for Blah is dated ${new Date(i.endDate.value)}`
            );
        }
      }
    );
  }
}
