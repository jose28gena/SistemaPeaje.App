import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-toll-card',
  template: `
    <mat-card class="toll-card">
      <mat-card-header>
        <mat-card-title>{{title}}</mat-card-title>
        <mat-card-subtitle>{{subtitle}}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="card-value">
          <span class="value">{{value}}</span>
          <span class="unit" *ngIf="unit">{{unit}}</span>
        </div>
        <mat-icon *ngIf="icon" class="card-icon">{{icon}}</mat-icon>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .toll-card {
      position: relative;
      overflow: hidden;
    }

    .card-value {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .value {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .unit {
      color: #666;
      font-size: 0.9em;
    }

    .card-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      opacity: 0.3;
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class TollCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() value: string | number = '';
  @Input() unit: string = '';
  @Input() icon: string = '';
}
