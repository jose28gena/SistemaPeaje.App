import { Component, OnInit } from '@angular/core';
import { TurnoAsignacionesService, TurnoAsignacion } from '@toll-suite/data-access';

@Component({
  selector: 'op-turno-asignaciones',
  template: `
    <div class="asignaciones-container">
      <h1>Asignaciones de Turnos</h1>
      
      <div class="content-section">
        <p>Gestión de asignaciones de turnos en desarrollo...</p>
        
        <div class="asignaciones-list" *ngIf="asignaciones.length > 0">
          <div class="asignacion-card" *ngFor="let asignacion of asignaciones">
            <h3>Asignación #{{ asignacion.id }}</h3>
            <p><strong>Turno:</strong> {{ asignacion.turno?.turnoTemplate?.nombre }}</p>
            <p><strong>Empleado:</strong> {{ asignacion.empleado?.nombre || 'No especificado' }}</p>
            <p><strong>Fecha Asignación:</strong> {{ asignacion.fechaAsignacion | date:'short' }}</p>
            <p><strong>Monto Inicial:</strong> {{ asignacion.montoInicialCajaAsignado | currency:'USD':'symbol':'1.2-2' }}</p>
          </div>
        </div>
        
        <div *ngIf="asignaciones.length === 0" class="no-data">
          <p>No hay asignaciones registradas</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asignaciones-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .content-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .asignaciones-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .asignacion-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #f8f9fa;
    }

    .asignacion-card h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }

    .asignacion-card p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class TurnoAsignacionesComponent implements OnInit {
  asignaciones: TurnoAsignacion[] = [];

  constructor(private asignacionesService: TurnoAsignacionesService) {}

  ngOnInit() {
    this.loadAsignaciones();
  }

  loadAsignaciones() {
    this.asignacionesService.getAll().subscribe({
      next: (response) => {
        this.asignaciones = response.data;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
      }
    });
  }
}
