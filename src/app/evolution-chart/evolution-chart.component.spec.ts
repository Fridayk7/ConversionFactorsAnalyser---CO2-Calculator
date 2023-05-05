import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionChartComponent } from './evolution-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('EvolutionChartComponent', () => {
  let component: EvolutionChartComponent;
  let fixture: ComponentFixture<EvolutionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EvolutionChartComponent],
      imports: [RouterTestingModule, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EvolutionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
