import { Component, OnInit } from '@angular/core';

interface Lane {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  vehicleCount: number;
  lastActivity: Date;
}

@Component({
  selector: 'op-lane-control',
  template: `
    <div class="lane-control-container">
      <h1>Control de Carriles</h1>
      
      <div class="lanes-grid">
        <mat-card *ngFor="let lane of lanes" class="lane-card">
          <mat-card-header>
            <mat-card-title>{{lane.name}}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [class]="'status-' + lane.status">
                {{getStatusText(lane.status)}}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="lane-info">
              <div class="info-item">
                <mat-icon>directions_car</mat-icon>
                <span>{{lane.vehicleCount}} vehículos</span>
              </div>
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <span>{{formatLastActivity(lane.lastActivity)}}</span>
              </div>
            </div>
            
            <div class="lane-controls">
              <mat-slide-toggle 
                [checked]="lane.status === 'active'"
                (change)="toggleLane(lane)">
                {{lane.status === 'active' ? 'Activo' : 'Inactivo'}}
              </mat-slide-toggle>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" (click)="viewDetails(lane)">
              <mat-icon>visibility</mat-icon>
              Ver Detalles
            </button>
            <button mat-button color="warn" (click)="reportIssue(lane)">
              <mat-icon>report_problem</mat-icon>
              Reportar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div class="global-controls">
        <h2>Controles Globales</h2>
        <button mat-raised-button color="primary" (click)="activateAllLanes()">
          <mat-icon>play_arrow</mat-icon>
          Activar Todos
        </button>
        <button mat-raised-button color="warn" (click)="deactivateAllLanes()">
          <mat-icon>stop</mat-icon>
          Desactivar Todos
        </button>
        <button mat-raised-button (click)="refreshStatus()">
          <mat-icon>refresh</mat-icon>
          Actualizar Estado
        </button>
      </div>
    </div>
  `,
  styles: [`
    .lane-control-container {
      padding: 20px;
    }

    .lanes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .lane-card {
      height: fit-content;
    }

    .lane-info {
      margin: 15px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .lane-controls {
      margin: 15px 0;
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

    .global-controls button {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  `]
})
export class LaneControlComponent implements OnInit {
  lanes: Lane[] = [
    {
      id: 1,
      name: 'Carril 1',
      status: 'active',
      vehicleCount: 45,
      lastActivity: new Date()
    },
    {
      id: 2,
      name: 'Carril 2',
      status: 'active',
      vehicleCount: 38,
      lastActivity: new Date(Date.now() - 2 * 60000)
    },
    {
      id: 3,
      name: 'Carril 3',
      status: 'inactive',
      vehicleCount: 0,
      lastActivity: new Date(Date.now() - 30 * 60000)
    },
    {
      id: 4,
      name: 'Carril 4',
      status: 'active',
      vehicleCount: 52,
      lastActivity: new Date(Date.now() - 1 * 60000)
    },
    {
      id: 5,
      name: 'Carril 5',
      status: 'maintenance',
      vehicleCount: 0,
      lastActivity: new Date(Date.now() - 120 * 60000)
    },
    {
      id: 6,
      name: 'Carril 6',
      status: 'active',
      vehicleCount: 17,
      lastActivity: new Date(Date.now() - 5 * 60000)
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  }

  formatLastActivity(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes === 1) return 'Hace 1 minuto';
    return `Hace ${minutes} minutos`;
  }

  toggleLane(lane: Lane): void {
    lane.status = lane.status === 'active' ? 'inactive' : 'active';
    console.log(`Carril ${lane.name} ${lane.status === 'active' ? 'activado' : 'desactivado'}`);
  }

  viewDetails(lane: Lane): void {
    console.log('Ver detalles del carril:', lane);
  }

  reportIssue(lane: Lane): void {
    console.log('Reportar problema en carril:', lane);
  }

  activateAllLanes(): void {
    this.lanes.forEach(lane => {
      if (lane.status !== 'maintenance') {
        lane.status = 'active';
      }
    });
    console.log('Todos los carriles activados');
  }

  deactivateAllLanes(): void {
    this.lanes.forEach(lane => {
      if (lane.status !== 'maintenance') {
        lane.status = 'inactive';
      }
    });
    console.log('Todos los carriles desactivados');
  }

  refreshStatus(): void {
    console.log('Actualizando estado de carriles...');
    // Aquí iría la lógica para actualizar desde el servidor
  }
}
