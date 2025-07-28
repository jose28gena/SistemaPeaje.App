import { Component, OnInit } from '@angular/core';
import { TurnoEventosService, TurnoEvento, TipoEventoTurno } from '@toll-suite/data-access';

@Component({
  selector: 'op-turno-eventos',
  template: `
    <div class="eventos-container">
      <h1>Eventos de Turnos</h1>
      
      <div class="content-section">
        <div class="eventos-list" *ngIf="eventos.length > 0">
          <div class="evento-card" *ngFor="let evento of eventos">
            <div class="evento-header">
              <h3>{{ evento.tipoEvento }}</h3>
              <span class="fecha">{{ evento.fechaEvento | date:'short' }}</span>
            </div>
            <div class="evento-details">
              <p><strong>Turno:</strong> {{ evento.turno?.turnoTemplate?.nombre || 'No especificado' }}</p>
              <p><strong>Descripción:</strong> {{ evento.descripcion }}</p>
              <p *ngIf="evento.montoAfectado"><strong>Monto Afectado:</strong> {{ evento.montoAfectado | currency:'USD':'symbol':'1.2-2' }}</p>
              <p *ngIf="evento.empleado"><strong>Empleado:</strong> {{ evento.empleado?.nombre }}</p>
            </div>
          </div>
        </div>
        
        <div *ngIf="eventos.length === 0" class="no-data">
          <p>No hay eventos registrados</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .eventos-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .content-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .eventos-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }

    .evento-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #f8f9fa;
    }

    .evento-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.5rem;
    }

    .evento-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .fecha {
      font-size: 0.9rem;
      color: #666;
    }

    .evento-details p {
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
export class TurnoEventosComponent implements OnInit {
  eventos: TurnoEvento[] = [];

  constructor(private eventosService: TurnoEventosService) {}

  ngOnInit() {
    this.loadEventos();
  }

  loadEventos() {
    this.eventosService.getAll().subscribe({
      next: (response) => {
        this.eventos = response.data;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
      }
    });
  }
}
