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

// Appliances CO2 calculator component
export class Co2CalculatorAppliancesComponent {
  // Final Score
  flexCalculatorValue: any = 0;
  // Concersion factors used
  flexCalculatorArray: any[];
  // Appliance options
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  // All apliances
  appliancesData;
  // All conversion factors
  cfsArray = new FormArray([new FormControl('', Validators.required)]);

  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  ngOnInit() {
    //  Form control, handles the appliances name suggestions while user is typing
    this.filteredOptions = this.cfsArray.controls[0].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
    // Data request to receive all avaiable appliances
    this._data.getAppliances().subscribe((res: any) => {
      this.options = this._processing.getAppliances(res);
      this.appliancesData = res;
    });
  }
  // Local function to filter appliance options while user is typing
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  // Calculator submittion handler
  flexCalcSubmit(event) {
    // Initialize score and conversion factors array
    this.flexCalculatorArray = [];
    this.flexCalculatorValue = 0;
    let inputarray = [];
    let count = -1;
    // Constructs objects with the information for each appliance based on the user input
    for (let step = 0; step < event.target.length - 2; step++) {
      if (step % 4 === 0 || step === 0) {
        count += 1;
        inputarray.push({ appliance: event.target[step].value });
      } else {
        inputarray[count][event.target[step].name] = event.target[step].value;
      }
    }
    // Gather sources of energy values from appliances
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
    // Get conversion factor for natural gas
    let naturalGas$ = this._data.getFormData(
      'Natural gas',
      'cubic metres',
      'kg CO2'
    );

    // Get conversion factor for electricity
    let electricity$ = this._data.getFormData(
      'Electricity: UK',
      'kWh',
      'kg CO2'
    );
    combineLatest(naturalGas$, electricity$).subscribe(
      ([naturalGas, electricity]) => {
        let res = [naturalGas[0], electricity[0]];
        let count = 0;
        for (let i of inputarray) {
          //Match conversion factors to appliance's source of energy and Calculate carbon emissions
          if (i.conversionfactor === 'electricity') {
            i.cfValue = +electricity[3].values.value;
            i.cfName = 'Electricity: UK';
            i.cfDate = electricity[3].endDate.value;
            i.cfOrigin = 'BEIS';
            this.flexCalculatorValue +=
              ((+i[`hours${count}`] *
                +i[`days${count}`] *
                +i[`powerrating${count}`]) /
                1000) *
              +i.cfValue;
          } else if (i.conversionfactor === 'natural gas') {
            i.cfValue = +naturalGas[0].values.value;
            i.cfName = 'Natural gas';
            i.cfDate = electricity[3].endDate.value;
            i.cfOrigin = 'BEIS';
            this.flexCalculatorValue +=
              ((+i[`hours${count}`] *
                +i[`days${count}`] *
                +i[`powerrating${count}`]) /
                1000) *
              +i.cfValue;
          }
          count += 1;
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
