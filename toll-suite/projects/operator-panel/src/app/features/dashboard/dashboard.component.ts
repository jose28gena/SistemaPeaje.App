import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'op-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Dashboard del Operador</h1>
      
      <mat-grid-list cols="4" rowHeight="200px" gutterSize="16px">
        <!-- Estado del Sistema -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Estado del Sistema</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-indicator online">
                <mat-icon>check_circle</mat-icon>
                <span>En Línea</span>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Carriles Activos -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Carriles Activos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">
                <span class="number">4</span>
                <span class="label">de 6 carriles</span>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Vehículos por Hora -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Vehículos/Hora</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">
                <span class="number">152</span>
                <span class="label">vehículos</span>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Ingresos del Día -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Ingresos del Día</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">
                <span class="number">$2,450</span>
                <span class="label">pesos</span>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <!-- Acciones Rápidas -->
      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <button mat-raised-button color="primary" routerLink="/lane-control">
          <mat-icon>traffic</mat-icon>
          Control de Carriles
        </button>
        <button mat-raised-button color="accent">
          <mat-icon>report_problem</mat-icon>
          Reportar Incidencia
        </button>
        <button mat-raised-button>
          <mat-icon>settings</mat-icon>
          Configuración
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-indicator.online {
      color: #4caf50;
    }

    .metric {
      text-align: center;
    }

    .metric .number {
      display: block;
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .metric .label {
      color: #666;
    }

    .quick-actions {
      margin-top: 30px;
    }

    .quick-actions button {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
