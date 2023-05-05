import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2CalculatorAppliancesComponent } from './co2-calculator-appliances.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Co2CalculatorAppliancesComponent', () => {
  let component: Co2CalculatorAppliancesComponent;
  let fixture: ComponentFixture<Co2CalculatorAppliancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Co2CalculatorAppliancesComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Co2CalculatorAppliancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
