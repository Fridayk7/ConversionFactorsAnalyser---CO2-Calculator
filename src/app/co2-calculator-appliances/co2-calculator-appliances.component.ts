import { Component } from '@angular/core';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { DataService } from '../data.service';
import { DataProccessorService } from '../data_processor.service';
import { FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-co2-calculator-appliances',
  templateUrl: './co2-calculator-appliances.component.html',
  styleUrls: ['./co2-calculator-appliances.component.scss'],
})
export class Co2CalculatorAppliancesComponent {
  flexCalculatorValue: any = 0;
  flexCalculatorArray: any[];

  options: string[] = [];
  filteredOptions: Observable<string[]>;
  appliancesData;
  cfsArray = new FormArray([new FormControl('', Validators.required)]);

  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  ngOnInit() {
    this.filteredOptions = this.cfsArray.controls[0].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
    this._data.getAppliances().subscribe((res: any) => {
      this.options = this._processing.getAppliances(res);
      this.appliancesData = res;
    });
  }

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
  addInputControl() {
    let newFormControl = new FormControl('', Validators.required);
    this.cfsArray.push(newFormControl);
    this.filteredOptions = newFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
}
