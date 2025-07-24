import { Component, OnInit } from '@angular/core';
import { TurnosService, TurnoAsignacionesService, Turno, TurnoAsignacion, TurnoEstado } from '@toll-suite/data-access';

@Component({
  selector: 'rd-turnos',
  template: `
    <div class="turnos-container">
      <div class="turnos-header">
        <h1>Gestión de Turnos</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="mostrarFormularioApertura()">
            <i class="icon-plus"></i> Abrir Nuevo Turno
          </button>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="stats-grid">
        <div class="stat-card active">
          <h3>Turnos Activos</h3>
          <div class="stat-number">{{ turnosActivos.length }}</div>
          <small>En curso ahora</small>
        </div>
        <div class="stat-card programmed">
          <h3>Turnos Programados</h3>
          <div class="stat-number">{{ turnosProgramados.length }}</div>
          <small>Para hoy</small>
        </div>
        <div class="stat-card completed">
          <h3>Turnos Finalizados</h3>
          <div class="stat-number">{{ turnosFinalizados.length }}</div>
          <small>Hoy</small>
        </div>
        <div class="stat-card revenue">
          <h3>Recaudación Total</h3>
          <div class="stat-number">{{ totalRecaudacion | currency:'USD':'symbol':'1.2-2' }}</div>
          <small>Del día</small>
        </div>
      </div>

      <!-- Formulario de Apertura de Turno -->
      <div class="modal-overlay" *ngIf="mostrandoFormulario" (click)="cerrarFormulario()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <rd-apertura-turno 
            (turnoCreado)="onTurnoCreado($event)"
            (cancelar)="cerrarFormulario()">
          </rd-apertura-turno>
        </div>
      </div>

      <!-- Lista de Turnos Activos -->
      <div class="turnos-section">
        <h2>Turnos Activos</h2>
        <div class="turnos-grid" *ngIf="turnosActivos.length > 0; else noTurnosActivos">
          <div class="turno-card active" *ngFor="let turno of turnosActivos">
            <div class="turno-header">
              <div class="turno-info">
                <h3>{{ turno.turnoTemplate?.nombre }}</h3>
                <p class="empleado">{{ turno.empleado?.nombre || 'Sin asignar' }}</p>
                <p class="estacion">{{ turno.estacion?.nombre }}</p>
              </div>
              <div class="turno-estado">
                <span class="estado-badge activo">{{ turno.estado }}</span>
                <small>{{ turno.horaInicio | date:'shortTime' }}</small>
              </div>
            </div>
            
            <div class="turno-detalles">
              <div class="detalle-item">
                <label>Saldo Inicial:</label>
                <span class="valor">{{ getSaldoInicial(turno.id) | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detalle-item">
                <label>Recaudación:</label>
                <span class="valor positivo">{{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detalle-item">
                <label>Duración:</label>
                <span class="valor">{{ getDuracionTurno(turno) }} min</span>
              </div>
            </div>

            <div class="turno-acciones">
              <button class="btn btn-warning" (click)="mostrarFormularioCierre(turno)">
                <i class="icon-stop"></i> Cerrar Turno
              </button>
              <button class="btn btn-info" (click)="verDetalle(turno)">
                <i class="icon-eye"></i> Ver Detalle
              </button>
            </div>
          </div>
        </div>

        <ng-template #noTurnosActivos>
          <div class="no-turnos">
            <i class="icon-clock large"></i>
            <h3>No hay turnos activos</h3>
            <p>Todos los turnos están cerrados o no hay turnos programados</p>
          </div>
        </ng-template>
      </div>

      <!-- Lista de Turnos del Día -->
      <div class="turnos-section">
        <h2>Turnos del Día</h2>
        <div class="tabla-turnos">
          <table class="turnos-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Estación/Carril</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Estado</th>
                <th>Recaudación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let turno of todosLosTurnos" [ngClass]="getEstadoClass(turno.estado)">
                <td>{{ turno.empleado?.nombre || 'Sin asignar' }}</td>
                <td>{{ turno.estacion?.nombre }}</td>
                <td>{{ turno.horaInicio | date:'shortTime' }}</td>
                <td>{{ turno.horaFin | date:'shortTime' || '-' }}</td>
                <td>
                  <span class="estado-badge" [ngClass]="turno.estado.toLowerCase()">
                    {{ turno.estado }}
                  </span>
                </td>
                <td class="recaudacion">{{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</td>
                <td class="acciones">
                  <button class="btn btn-sm btn-info" (click)="verDetalle(turno)">Ver</button>
                  <button 
                    class="btn btn-sm btn-warning" 
                    *ngIf="turno.estado === 'EnCurso'"
                    (click)="mostrarFormularioCierre(turno)">
                    Cerrar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Cierre de Turno -->
      <div class="modal-overlay" *ngIf="turnoParaCerrar" (click)="cancelarCierre()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <rd-cierre-turno 
            [turno]="turnoParaCerrar"
            (turnoCerrado)="onTurnoCerrado($event)"
            (cancelar)="cancelarCierre()">
          </rd-cierre-turno>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .turnos-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .turnos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
    }

    .turnos-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 2rem;
    }

    .header-actions .btn {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.active { border-left-color: #28a745; }
    .stat-card.programmed { border-left-color: #17a2b8; }
    .stat-card.completed { border-left-color: #6c757d; }
    .stat-card.revenue { border-left-color: #ffc107; }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .stat-card small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .turnos-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .turnos-section h2 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.5rem;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }

    .turnos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .turno-card {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .turno-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .turno-card.active {
      border-left: 4px solid #28a745;
      background: #f8fff9;
    }

    .turno-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .turno-info h3 {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .turno-info p {
      margin: 0.25rem 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .turno-estado {
      text-align: right;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.activo {
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

    .turno-detalles {
      margin-bottom: 1rem;
    }

    .detalle-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .detalle-item label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .valor {
      font-weight: 600;
      color: #2c3e50;
    }

    .valor.positivo {
      color: #28a745;
    }

    .turno-acciones {
      display: flex;
      gap: 0.75rem;
    }

    .turno-acciones .btn {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .no-turnos {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-turnos .icon-clock.large {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .tabla-turnos {
      overflow-x: auto;
    }

    .turnos-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .turnos-table th,
    .turnos-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .turnos-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    .turnos-table tr:hover {
      background: #f8f9fa;
    }

    .turnos-table tr.encurso {
      background: #f8fff9;
    }

    .turnos-table tr.finalizado {
      background: #fff8f8;
    }

    .recaudacion {
      font-weight: 600;
      color: #28a745;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
    }

    .acciones .btn {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary { background: #007bff; color: white; }
    .btn-primary:hover { background: #0056b3; }

    .btn-warning { background: #ffc107; color: #212529; }
    .btn-warning:hover { background: #e0a800; }

    .btn-info { background: #17a2b8; color: white; }
    .btn-info:hover { background: #138496; }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  `]
})
export class TurnosComponent implements OnInit {
  turnosActivos: Turno[] = [];
  turnosProgramados: Turno[] = [];
  turnosFinalizados: Turno[] = [];
  todosLosTurnos: Turno[] = [];
  asignaciones: TurnoAsignacion[] = [];
  
  totalRecaudacion = 0;
  mostrandoFormulario = false;
  turnoParaCerrar: Turno | null = null;

  constructor(
    private turnosService: TurnosService,
    private asignacionesService: TurnoAsignacionesService
  ) {}

  ngOnInit() {
    this.cargarTurnos();
    this.cargarAsignaciones();
  }

  cargarTurnos() {
    this.turnosService.getAll().subscribe({
      next: (response) => {
        this.todosLosTurnos = response.data;
        this.clasificarTurnos();
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
      }
    });
  }

  cargarAsignaciones() {
    this.asignacionesService.getAll().subscribe({
      next: (response) => {
        this.asignaciones = response.data;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
      }
    });
  }

  clasificarTurnos() {
    const hoy = new Date().toDateString();
    
    this.turnosActivos = this.todosLosTurnos.filter(t => 
      t.estado === TurnoEstado.EnCurso
    );
    
    this.turnosProgramados = this.todosLosTurnos.filter(t => 
      t.estado === TurnoEstado.Programado && 
      new Date(t.fechaTurno).toDateString() === hoy
    );
    
    this.turnosFinalizados = this.todosLosTurnos.filter(t => 
      t.estado === TurnoEstado.Finalizado && 
      new Date(t.fechaTurno).toDateString() === hoy
    );
  }

  calcularEstadisticas() {
    this.totalRecaudacion = this.turnosFinalizados.reduce((total, turno) => 
      total + (turno.totalRecaudado || 0), 0
    );
  }

  mostrarFormularioApertura() {
    this.mostrandoFormulario = true;
  }

  cerrarFormulario() {
    this.mostrandoFormulario = false;
  }

  mostrarFormularioCierre(turno: Turno) {
    this.turnoParaCerrar = turno;
  }

  cancelarCierre() {
    this.turnoParaCerrar = null;
  }

  onTurnoCreado(turno: Turno) {
    this.todosLosTurnos.push(turno);
    this.clasificarTurnos();
    this.cerrarFormulario();
  }

  onTurnoCerrado(turno: Turno) {
    const index = this.todosLosTurnos.findIndex(t => t.id === turno.id);
    if (index !== -1) {
      this.todosLosTurnos[index] = turno;
      this.clasificarTurnos();
      this.calcularEstadisticas();
    }
    this.cancelarCierre();
  }

  getSaldoInicial(turnoId: number): number {
    const asignacion = this.asignaciones.find(a => a.turnoId === turnoId);
    return asignacion?.montoInicialCajaAsignado || 0;
  }

  getDuracionTurno(turno: Turno): number {
    if (!turno.horaInicio) return 0;
    
    const inicio = new Date(turno.horaInicio);
    const fin = turno.horaFin ? new Date(turno.horaFin) : new Date();
    
    return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60));
  }

  getEstadoClass(estado: TurnoEstado): string {
    return estado.toLowerCase();
  }

  verDetalle(turno: Turno) {
    // Implementar navegación a detalle
    console.log('Ver detalle del turno:', turno);
  }
}
