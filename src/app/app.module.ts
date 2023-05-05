import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { DataValidationComponent } from './data-validation/data-validation.component';
import { EvolutionChartComponent } from './evolution-chart/evolution-chart.component';
import { KnowledgeComparisonComponent } from './knowledge-comparison/knowledge-comparison.component';
import { Co2CalculatorFixedComponent } from './co2-calculator-fixed/co2-calculator-fixed.component';
import { Co2CalculatorAppliancesComponent } from './co2-calculator-appliances/co2-calculator-appliances.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { ProgressBarRendererComponent } from './progress-bar-renderer/progress-bar-renderer.component';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    DataValidationComponent,
    EvolutionChartComponent,
    KnowledgeComparisonComponent,
    Co2CalculatorFixedComponent,
    Co2CalculatorAppliancesComponent,
    ProgressBarRendererComponent,
  ],
  imports: [
    RouterModule.forRoot([
      { path: '', component: AppComponent },
      { path: 'data-validation', component: DataValidationComponent },
      { path: 'cf-evolution', component: EvolutionChartComponent },
      { path: 'kg-comparison', component: KnowledgeComparisonComponent },
      { path: 'CO2-calculator', component: Co2CalculatorFixedComponent },
      {
        path: 'CO2-calculator-appliances',
        component: Co2CalculatorAppliancesComponent,
      },

      // { path: '**', component: NotFoundComponent }
    ]),
    NgxSpinnerModule,
    ScrollingModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatInputModule,
    BrowserModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    AgGridModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  exports: [NgxSpinnerModule],
  providers: [DataService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
