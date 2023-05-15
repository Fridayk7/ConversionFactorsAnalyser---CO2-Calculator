import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarRendererComponent } from '../progress-bar-renderer/progress-bar-renderer.component';
import { DataProccessorService } from '../data_processor.service';
import { ColDef } from 'ag-grid-enterprise';
import { FormControl, FormGroup } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-knowledge-comparison',
  templateUrl: './knowledge-comparison.component.html',
  styleUrls: ['./knowledge-comparison.component.scss'],
})
export class KnowledgeComparisonComponent {
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;
  results;
  knowledgeGraphs: FormGroup;
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
  // Ag grid column definitions
  public columnDefs: ColDef[] = [
    { headerName: 'EPA conversion factor', field: 'cf1' },
    { headerName: 'EPA source unit', field: 'cf1su' },
    { headerName: 'EPA target unit', field: 'cf1tu' },
    { headerName: 'BEIS conversion factor', field: 'cf2' },
    { headerName: 'BEIS source unit', field: 'cf2su' },
    { headerName: 'BEIS target unit', field: 'cf2tu' },
    {
      headerName: 'Dice Similarity',
      field: 'dice',
      cellRenderer: ProgressBarRendererComponent,
    },
    {
      headerName: 'Cosine Similarity',
      field: 'cosine',
      cellRenderer: ProgressBarRendererComponent,
    },
    {
      headerName: 'Naive string comparison',
      field: 'naive',
      cellRenderer: ProgressBarRendererComponent,
    },
  ];
  public defaultColDef: ColDef = {
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  };
  public rowData = [];
  constructor(
    private _data: DataService,
    private _processing: DataProccessorService
  ) {}

  async ngOnInit() {
    // Initialize input form
    this.knowledgeGraphs = new FormGroup({
      kg1: new FormControl(null),
      kg2: new FormControl(null),
    });
  }
  // Handles form submition
  onSubmit() {
    document.getElementById('overlay').style.display = 'flex';
    // Request all conversion factors from API from BEIS and EPA and only include the year according to the user input
    this._data.getAllCFs('EPA_FUEL_FULL').subscribe(async (res: any) => {
      this._data.getAllCFs('BEIS').subscribe(async (resd: any) => {
        res = res.filter((x: any) =>
          x.endDate.value.includes(this.knowledgeGraphs.value.kg1)
        );
        resd = resd.filter((x: any) =>
          x.endDate.value.includes(this.knowledgeGraphs.value.kg2)
        );

        console.log('COMPARISON');
        if (typeof Worker !== 'undefined') {
          // Create a new webworker to start comparing the knowledge graphs
          const worker = new Worker(new URL('../app.worker', import.meta.url));
          worker.onmessage = ({ data }) => {
            this.results = data.results;
            this.rowData = data.results;
            document.getElementById('overlay').style.display = 'none';
          };
          worker.postMessage([res, resd]);
        } else {
          // Web Workers are not supported in this environment.
          // You should add a fallback so that your program still executes correctly.
        }
      });
    });
  }
}
