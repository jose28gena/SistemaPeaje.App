import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-metric-display',
  template: `
    <div class="metric-display">
      <div class="metric-header">
        <mat-icon *ngIf="icon">{{icon}}</mat-icon>
        <span class="metric-label">{{label}}</span>
      </div>
      <div class="metric-value">
        <span class="value" [style.color]="color">{{value}}</span>
        <span class="unit" *ngIf="unit">{{unit}}</span>
      </div>
      <div class="metric-change" *ngIf="change !== undefined">
        <mat-icon [class]="getChangeClass()">{{getChangeIcon()}}</mat-icon>
        <span [class]="getChangeClass()">{{Math.abs(change)}}%</span>
      </div>
    </div>
  `,
  styles: [`
    .metric-display {
      padding: 16px;
      text-align: center;
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 0.9em;
      color: #666;
      font-weight: 500;
    }

    .metric-value {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .value {
      font-size: 2.5em;
      font-weight: bold;
      line-height: 1;
    }

    .unit {
      font-size: 0.8em;
      color: #666;
    }

    .metric-change {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.9em;
    }

    .positive {
      color: #4caf50;
    }

    .negative {
      color: #f44336;
    }

    .neutral {
      color: #666;
    }
  `]
})
export class MetricDisplayComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() unit: string = '';
  @Input() icon: string = '';
  @Input() color: string = '#1976d2';
  @Input() change: number | undefined;

  Math = Math;

  getChangeIcon(): string {
    if (this.change === undefined) return '';
    if (this.change > 0) return 'trending_up';
    if (this.change < 0) return 'trending_down';
    return 'trending_flat';
  }

  getChangeClass(): string {
    if (this.change === undefined) return 'neutral';
    if (this.change > 0) return 'positive';
    if (this.change < 0) return 'negative';
    return 'neutral';
  }
}
