import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-lane-status',
  template: `
    <div class="lane-status">
      <mat-chip [class]="'status-' + status">
        <mat-icon>{{getStatusIcon()}}</mat-icon>
        {{getStatusText()}}
      </mat-chip>
      <div class="lane-info" *ngIf="showDetails">
        <span class="lane-name">{{laneName}}</span>
        <span class="vehicle-count">{{vehicleCount}} vehículos</span>
      </div>
    </div>
  `,
  styles: [`
    .lane-status {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #f44336;
      color: white;
    }

    .status-maintenance {
      background-color: #ff9800;
      color: white;
    }

    .lane-info {
      display: flex;
      flex-direction: column;
      font-size: 0.9em;
    }

    .lane-name {
      font-weight: 500;
    }

    .vehicle-count {
      color: #666;
      font-size: 0.8em;
    }
  `]
})
export class LaneStatusComponent {
  @Input() status: 'active' | 'inactive' | 'maintenance' = 'inactive';
  @Input() laneName: string = '';
  @Input() vehicleCount: number = 0;
  @Input() showDetails: boolean = false;

  getStatusIcon(): string {
    switch (this.status) {
      case 'active': return 'check_circle';
      case 'inactive': return 'cancel';
      case 'maintenance': return 'build';
      default: return 'help';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  }
}
