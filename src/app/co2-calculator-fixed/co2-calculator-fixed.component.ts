import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { DataProccessorService } from '../data_processor.service';

@Component({
  selector: 'app-co2-calculator-fixed',
  templateUrl: './co2-calculator-fixed.component.html',
  styleUrls: ['./co2-calculator-fixed.component.scss'],
})
export class Co2CalculatorFixedComponent {
  public formResult: any = 0;

  warnings: any = [];
  householdForm: FormGroup;
  total = 0;
  conversionFactorsUsed: any = [];
  errors: any = [];

  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  ngOnInit() {
    // Initialize user interface form fields programmatically
    this.householdForm = new FormGroup({
      country: new FormControl(null),
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
  //Form submission handler
  onSubmit() {
    //  Spinner begins
    document.getElementById('overlay').style.display = 'flex';
    // Initialize final score and conversion factor / warnings/errors array
    this.total = 0;
    this.conversionFactorsUsed = [];
    this.warnings = [];
    this.errors = [];
    // Data request for all conversion factors
    this._data
      .getAllCFs(this.householdForm.value.country)
      .subscribe(async (res: any) => {
        // Represent each of the user inputs as its own knowledge graph
        let resd = [
          this._processing.transformCFtoKGstructure(
            'Natural gas',
            this.householdForm.value.naturalGasUom,
            'kg CO2',
            this.householdForm.value.naturalGasValue
          ),
          this._processing.transformCFtoKGstructure(
            'Electricity UK',
            this.householdForm.value.electricityUom,
            'kg CO2',
            this.householdForm.value.electricityValue,
            'UK electricity'
          ),
          this._processing.transformCFtoKGstructure(
            'Fuel Oil',
            this.householdForm.value.fuelOilUom,
            'kg CO2',
            this.householdForm.value.fuelOilValue
          ),
          this._processing.transformCFtoKGstructure(
            'Propane',
            this.householdForm.value.propaneUom,
            'kg CO2',
            this.householdForm.value.propaneValue
          ),
        ];
        // Call webworker to compare each of the above 'knowledge graphs' with the Knowledge graph form the selected publisher
        for (let i of resd) {
          if (typeof Worker !== 'undefined') {
            // Create a new
            const worker = new Worker(
              new URL('../app.worker', import.meta.url)
            );
            worker.onmessage = ({ data }) => {
              console.log(data);
              let max =
                data.results.length > 0
                  ? data.results.reduce(function (prev, current) {
                      //Remove conversion factors that are not classified as identical
                      return (prev.cf1similarityValue <
                        current.cf1similarityValue &&
                        new Date(prev.cf1date) < new Date(current.cf1date)) ||
                        (prev.cf1excludeSU && !current.cf1excludeSU) ||
                        (!prev.tagsConsidered && current.tagsConsidered)
                        ? current
                        : prev;
                    })
                  : {};
              if (max.cf1 && !max.cf1excludeSU) {
                // Gather conversion factors for the calculations
                this.conversionFactorsUsed.push(
                  `Name: ${max.cf1}, Source Unit: ${max.cf1su}, Target Unit:${max.cf1tu}, Value:${max.cf1value}`
                );

                // Gather outdated conversion factors
                if (new Date(max.cf1date) < new Date()) {
                  this.warnings.push(
                    `Conversion factor ${max.cf1} is dated ${max.cf1date}`
                  );
                }

                this.total += +max.cf1value * +i.values.value;
              } else {
                // Gather missing conversion factors
                this.errors.push(
                  `Conversion factor for ${i.lookUpNames.value} not found`
                );
              }

              setTimeout(function () {
                document.getElementById('overlay').style.display = 'none';
              }, 1000);
            };
            worker.postMessage([res, [i]]);
          } else {
            document.getElementById('overlay').style.display = 'none';

            // Web Workers are not supported in this environment.
            // You should add a fallback so that your program still executes correctly.
          }
        }
      });
  }
}
