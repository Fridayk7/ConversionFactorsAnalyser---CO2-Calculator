import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarRendererComponent } from '../progress-bar-renderer/progress-bar-renderer.component';
import { DataProccessorService } from '../data_processor.service';
import { ColDef } from 'ag-grid-enterprise';

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

  public columnDefs: ColDef[] = [
    { headerName: 'EPA conversion factor', field: 'cf1' },
    { headerName: 'BEIS conversion factor', field: 'cf2' },
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
      headerName: 'Naive strin comparisson',
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
    await this._data.getEvaluation1().subscribe(async (res: any) => {
      this._data.getEvaluation2().subscribe(async (resd: any) => {
        console.log('COMPARISON');
        if (typeof Worker !== 'undefined') {
          // Create a new
          const worker = new Worker(new URL('../app.worker', import.meta.url));
          worker.onmessage = ({ data }) => {
            this.results = data.results;
            this.rowData = data.results;
            console.log(this.results);
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
