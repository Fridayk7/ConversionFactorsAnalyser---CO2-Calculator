import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2CalculatorFixedComponent } from './co2-calculator-fixed.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('Co2CalculatorFixedComponent', () => {
  let component: Co2CalculatorFixedComponent;
  let fixture: ComponentFixture<Co2CalculatorFixedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Co2CalculatorFixedComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Co2CalculatorFixedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
