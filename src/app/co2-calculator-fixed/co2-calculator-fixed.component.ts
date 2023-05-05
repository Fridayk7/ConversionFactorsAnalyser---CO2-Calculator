import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-co2-calculator-fixed',
  templateUrl: './co2-calculator-fixed.component.html',
  styleUrls: ['./co2-calculator-fixed.component.scss'],
})
export class Co2CalculatorFixedComponent {
  public formResult: any = 0;

  warnings: any = [];
  householdForm: FormGroup;

  constructor(private _data: DataService) {}

  ngOnInit() {
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
