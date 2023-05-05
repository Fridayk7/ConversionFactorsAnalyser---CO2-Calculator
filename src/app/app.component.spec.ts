import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { DataValidationComponent } from './data-validation/data-validation.component';
import { EvolutionChartComponent } from './evolution-chart/evolution-chart.component';
import { Co2CalculatorAppliancesComponent } from './co2-calculator-appliances/co2-calculator-appliances.component';
import { Co2CalculatorFixedComponent } from './co2-calculator-fixed/co2-calculator-fixed.component';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        DataValidationComponent,
        EvolutionChartComponent,
        Co2CalculatorAppliancesComponent,
        Co2CalculatorFixedComponent,
      ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        AgGridModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
