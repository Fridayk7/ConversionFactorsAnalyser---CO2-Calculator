import { Component } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'total-value-component',
  templateUrl: './progress-bar-renderer.component.html',
  styleUrls: ['./progress-bar-renderer.component.scss'],
})
export class ProgressBarRendererComponent implements ICellRendererAngularComp {
  public cellValue;
  public params;
  mode: ProgressBarMode = 'determinate';

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    console.log(this.params);
    this.cellValue = this.getValueToDisplay(params);
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    // set value into cell again
    this.cellValue = this.getValueToDisplay(params);
    return true;
  }

  buttonClicked() {
    alert(`${this.cellValue} medals won!`);
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
}
