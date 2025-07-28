import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TurnosService, Turno, TurnoEstado } from '@toll-suite/data-access';

@Component({
  selector: 'op-turnos-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Dashboard de Turnos</h1>
      
      <!-- Resumen de estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Turnos Activos</h3>
          <div class="stat-number">{{ turnosActivos?.length || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Turnos del Día</h3>
          <div class="stat-number">{{ turnosHoy?.length || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Total Recaudado</h3>
          <div class="stat-number">{{ totalRecaudadoHoy | currency:'USD':'symbol':'1.2-2' }}</div>
        </div>
      </div>

      <!-- Turnos activos -->
      <div class="section">
        <h2>Turnos Activos</h2>
        <div class="turnos-grid" *ngIf="turnosActivos && turnosActivos.length > 0; else noTurnos">
          <div class="turno-card" *ngFor="let turno of turnosActivos">
            <div class="turno-header">
              <h4>{{ turno.turnoTemplate?.nombre }}</h4>
              <span class="estado-badge" [ngClass]="getEstadoClass(turno.estado)">
                {{ turno.estado }}
              </span>
            </div>
            <div class="turno-details">
              <p><strong>Empleado:</strong> {{ turno.empleado?.nombre || 'No asignado' }}</p>
              <p><strong>Estación:</strong> {{ turno.estacion?.nombre || 'No especificada' }}</p>
              <p><strong>Inicio:</strong> {{ turno.horaInicio | date:'short' }}</p>
              <p><strong>Recaudado:</strong> {{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</p>
            </div>
            <div class="turno-actions">
              <button class="btn btn-primary" (click)="verDetalleTurno(turno.id)">
                Ver Detalle
              </button>
              <button class="btn btn-warning" (click)="finalizarTurno(turno.id)" 
                      *ngIf="turno.estado === 'EnCurso'">
                Finalizar
              </button>
            </div>
          </div>
        </div>
        
        <ng-template #noTurnos>
          <div class="no-data">
            <p>No hay turnos activos en este momento</p>
            <button class="btn btn-primary" (click)="crearNuevoTurno()">
              Crear Nuevo Turno
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Acciones rápidas -->
      <div class="section">
        <h2>Acciones Rápidas</h2>
        <div class="quick-actions">
          <button class="btn btn-success" (click)="crearNuevoTurno()">
            <i class="icon-plus"></i> Nuevo Turno
          </button>
          <button class="btn btn-info" (click)="verPlantillas()">
            <i class="icon-template"></i> Gestionar Plantillas
          </button>
          <button class="btn btn-secondary" (click)="verReportes()">
            <i class="icon-chart"></i> Ver Reportes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .section h2 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }

    .turnos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .turno-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #f8f9fa;
    }

    .turno-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .turno-header h4 {
      margin: 0;
      color: #2c3e50;
    }

    .estado-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .estado-badge.en-curso {
      background: #d4edda;
      color: #155724;
    }

    .estado-badge.programado {
      background: #d1ecf1;
      color: #0c5460;
    }

    .estado-badge.finalizado {
      background: #f8d7da;
      color: #721c24;
    }

    .turno-details p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .turno-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-primary { background: #3498db; color: white; }
    .btn-primary:hover { background: #2980b9; }

    .btn-success { background: #27ae60; color: white; }
    .btn-success:hover { background: #229954; }

    .btn-warning { background: #f39c12; color: white; }
    .btn-warning:hover { background: #e67e22; }

    .btn-info { background: #17a2b8; color: white; }
    .btn-info:hover { background: #138496; }

    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }

    .quick-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class TurnosDashboardComponent implements OnInit {
  turnosActivos: Turno[] = [];
  turnosHoy: Turno[] = [];
  totalRecaudadoHoy: number = 0;

  constructor(private turnosService: TurnosService) {}

  ngOnInit() {
    this.cargarTurnosActivos();
    this.cargarTurnosDelDia();
  }

  cargarTurnosActivos() {
    this.turnosService.getTurnosActivos().subscribe({
      next: (turnos) => {
        this.turnosActivos = turnos;
      },
      error: (error) => {
        console.error('Error al cargar turnos activos:', error);
      }
    });
  }

  cargarTurnosDelDia() {
    const hoy = new Date();
    // Aquí podrías implementar un método específico para obtener turnos del día
    this.turnosService.getAll().subscribe({
      next: (response) => {
        this.turnosHoy = response.data.filter(turno => {
          const fechaTurno = new Date(turno.fechaTurno);
          return fechaTurno.toDateString() === hoy.toDateString();
        });
        
        this.totalRecaudadoHoy = this.turnosHoy.reduce((total, turno) => 
          total + (turno.totalRecaudado || 0), 0);
      },
      error: (error) => {
        console.error('Error al cargar turnos del día:', error);
      }
    });
  }

  getEstadoClass(estado: TurnoEstado): string {
    switch (estado) {
      case TurnoEstado.EnCurso:
        return 'en-curso';
      case TurnoEstado.Programado:
        return 'programado';
      case TurnoEstado.Finalizado:
        return 'finalizado';
      default:
        return '';
    }
  }

  verDetalleTurno(turnoId: number) {
    // Implementar navegación a detalle del turno
    console.log('Ver detalle del turno:', turnoId);
  }

  finalizarTurno(turnoId: number) {
    // Implementar lógica para finalizar turno
    console.log('Finalizar turno:', turnoId);
  }

  crearNuevoTurno() {
    // Implementar navegación para crear nuevo turno
    console.log('Crear nuevo turno');
  }

  verPlantillas() {
    // Navegar a templates
    console.log('Ver plantillas');
  }

  verReportes() {
    // Navegar a reportes
    console.log('Ver reportes');
  }
}
