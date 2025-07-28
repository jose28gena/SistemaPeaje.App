import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { TurnosService } from '../../../../../../libs/data-access/src/lib/services/turnos.service';
import { 
  Turno, 
  TurnoEstado, 
  TurnoEvento 
} from '../../../../../../libs/data-access/src/lib/models/turnos.models';

@Component({
  selector: 'app-turnos-dashboard',
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h2>
              <i class="fas fa-tachometer-alt me-2"></i>
              Dashboard de Turnos
            </h2>
            <div class="text-muted">
              <i class="fas fa-clock me-1"></i>
              Última actualización: {{ ultimaActualizacion | date:'HH:mm:ss' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas Principales -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Turnos Activos
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ estadisticas.turnosActivos }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Recaudación del Día
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ estadisticas.recaudacionDia | currency:'USD':'symbol':'1.2-2' }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Vehículos Procesados
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ estadisticas.vehiculosProcesados }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-car fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Promedio por Hora
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ estadisticas.promedioPorHora | currency:'USD':'symbol':'1.0-2' }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-chart-line fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Turnos Activos en Tiempo Real -->
        <div class="col-lg-8 mb-4">
          <div class="card shadow">
            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-users me-2"></i>
                Turnos Activos en Tiempo Real
              </h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Estación</th>
                      <th>Inicio</th>
                      <th>Duración</th>
                      <th>Recaudado</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let turno of turnosActivos; trackBy: trackByTurnoId">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-sm me-2">
                            <span class="badge bg-primary rounded-circle">
                              {{ getIniciales(turno.empleado?.nombre) }}
                            </span>
                          </div>
                          <div>
                            <div class="font-weight-bold">{{ turno.empleado?.nombre || 'N/A' }}</div>
                            <small class="text-muted">{{ turno.empleado?.codigo || '' }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ turno.estacion?.nombre || 'N/A' }}</span>
                      </td>
                      <td>{{ turno.horaInicio | date:'HH:mm' }}</td>
                      <td>
                        <span class="text-success font-weight-bold">
                          {{ getDuracionTurno(turno) }}
                        </span>
                      </td>
                      <td>{{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td>
                        <span class="badge badge-success blink">
                          <i class="fas fa-circle me-1"></i>
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary btn-sm"
                            (click)="verDetalleTiempoReal(turno)"
                            title="Ver en tiempo real">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-warning btn-sm"
                            (click)="pausarTurno(turno)"
                            title="Pausar turno">
                            <i class="fas fa-pause"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="turnosActivos.length === 0">
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-clock fa-2x mb-2"></i><br>
                        No hay turnos activos en este momento
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Eventos y Alertas -->
        <div class="col-lg-4 mb-4">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Eventos y Alertas
              </h6>
            </div>
            <div class="card-body" style="max-height: 400px; overflow-y: auto;">
              <div *ngFor="let evento of eventosRecientes" class="d-flex mb-3">
                <div class="me-3">
                  <div class="icon-circle" [ngClass]="getEventoIconClass(evento.tipo)">
                    <i [class]="getEventoIcon(evento.tipo)"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="small text-gray-500">{{ evento.fechaHora | date:'HH:mm' }}</div>
                  <div class="font-weight-bold">{{ evento.descripcion }}</div>
                  <div class="small text-muted">{{ evento.turno?.empleado?.nombre }}</div>
                </div>
              </div>
              <div *ngIf="eventosRecientes.length === 0" class="text-center text-muted py-3">
                <i class="fas fa-check-circle fa-2x mb-2"></i><br>
                No hay eventos recientes
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de Turnos del Día -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-list me-2"></i>
                Resumen de Turnos del Día
              </h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Estación</th>
                      <th>Horario</th>
                      <th>Duración Real</th>
                      <th>Recaudado</th>
                      <th>Vehículos</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let turno of turnosDelDia">
                      <td>{{ turno.empleado?.nombre || 'N/A' }}</td>
                      <td>{{ turno.estacion?.nombre || 'N/A' }}</td>
                      <td>
                        {{ turno.horaInicio | date:'HH:mm' }} - 
                        {{ turno.horaFin ? (turno.horaFin | date:'HH:mm') : 'En curso' }}
                      </td>
                      <td>{{ turno.duracionReal || getDuracionTurno(turno) }}</td>
                      <td>{{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td>{{ turno.totalVehiculos || 0 }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadgeClass(turno.estado)">
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary btn-sm"
                            (click)="verDetalle(turno)">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-secondary btn-sm"
                            (click)="exportarTurno(turno)">
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-left-primary {
      border-left: 0.25rem solid #4e73df !important;
    }
    
    .border-left-success {
      border-left: 0.25rem solid #1cc88a !important;
    }
    
    .border-left-info {
      border-left: 0.25rem solid #36b9cc !important;
    }
    
    .border-left-warning {
      border-left: 0.25rem solid #f6c23e !important;
    }
    
    .blink {
      animation: blink 2s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.7; }
    }
    
    .icon-circle {
      height: 2rem;
      width: 2rem;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .bg-primary-circle { background-color: #4e73df; }
    .bg-success-circle { background-color: #1cc88a; }
    .bg-warning-circle { background-color: #f6c23e; }
    .bg-danger-circle { background-color: #e74a3b; }
    
    .card {
      box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .avatar {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class TurnosDashboardComponent implements OnInit, OnDestroy {

  turnosActivos: Turno[] = [];
  turnosDelDia: Turno[] = [];
  eventosRecientes: TurnoEvento[] = [];
  ultimaActualizacion: Date = new Date();
  
  estadisticas = {
    turnosActivos: 0,
    recaudacionDia: 0,
    vehiculosProcesados: 0,
    promedioPorHora: 0
  };

  private intervalSubscription?: Subscription;

  constructor(private turnosService: TurnosService) {}

  ngOnInit() {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  private loadDashboardData() {
    this.loadTurnosActivos();
    this.loadTurnosDelDia();
    this.loadEventosRecientes();
    this.loadEstadisticas();
    this.ultimaActualizacion = new Date();
  }

  private loadTurnosActivos() {
    this.turnosService.getTurnosActivos().subscribe({
      next: (turnos) => {
        this.turnosActivos = turnos.filter(t => t.estado === TurnoEstado.EnCurso);
      },
      error: (error) => {
        console.error('Error al cargar turnos activos:', error);
      }
    });
  }

  private loadTurnosDelDia() {
    const hoy = new Date();
    this.turnosService.getTurnosPorFecha(hoy).subscribe({
      next: (turnos) => {
        this.turnosDelDia = turnos;
      },
      error: (error) => {
        console.error('Error al cargar turnos del día:', error);
      }
    });
  }

  private loadEventosRecientes() {
    // Implementar carga de eventos recientes
    // this.turnoEventosService.getEventosRecientes().subscribe({...});
    
    // Datos mock por ahora
    this.eventosRecientes = [
      {
        id: 1,
        tipo: 'APERTURA',
        descripcion: 'Turno iniciado en Estación Norte',
        fechaHora: new Date(Date.now() - 15 * 60000), // hace 15 minutos
        turno: this.turnosActivos[0] || {} as Turno,
        empleadoId: 1,
        metadata: {}
      }
    ];
  }

  private loadEstadisticas() {
    // Calcular estadísticas basadas en los datos cargados
    this.estadisticas.turnosActivos = this.turnosActivos.length;
    this.estadisticas.recaudacionDia = this.turnosDelDia.reduce(
      (sum, turno) => sum + (turno.totalRecaudado || 0), 0
    );
    this.estadisticas.vehiculosProcesados = this.turnosDelDia.reduce(
      (sum, turno) => sum + (turno.totalVehiculos || 0), 0
    );
    
    // Calcular promedio por hora
    const horasTranscurridas = new Date().getHours() || 1;
    this.estadisticas.promedioPorHora = this.estadisticas.recaudacionDia / horasTranscurridas;
  }

  private startAutoRefresh() {
    // Actualizar cada 30 segundos
    this.intervalSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData();
    });
  }

  trackByTurnoId(index: number, turno: Turno): number {
    return turno.id;
  }

  getIniciales(nombre?: string): string {
    if (!nombre) return '?';
    return nombre.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getDuracionTurno(turno: Turno): string {
    if (!turno.horaInicio) return 'N/A';
    
    const inicio = new Date(turno.horaInicio);
    const fin = turno.horaFin ? new Date(turno.horaFin) : new Date();
    const diferencia = fin.getTime() - inicio.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }

  getEstadoBadgeClass(estado: TurnoEstado): string {
    switch (estado) {
      case TurnoEstado.EnCurso: return 'bg-success';
      case TurnoEstado.Finalizado: return 'bg-primary';
      case TurnoEstado.Cancelado: return 'bg-danger';
      case TurnoEstado.Programado: return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getEventoIconClass(tipo: string): string {
    switch (tipo) {
      case 'APERTURA': return 'bg-success-circle';
      case 'CIERRE': return 'bg-primary-circle';
      case 'PAUSA': return 'bg-warning-circle';
      case 'ERROR': return 'bg-danger-circle';
      default: return 'bg-primary-circle';
    }
  }

  getEventoIcon(tipo: string): string {
    switch (tipo) {
      case 'APERTURA': return 'fas fa-play';
      case 'CIERRE': return 'fas fa-stop';
      case 'PAUSA': return 'fas fa-pause';
      case 'ERROR': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info';
    }
  }

  verDetalleTiempoReal(turno: Turno) {
    // Implementar vista de detalle en tiempo real
    console.log('Ver detalle en tiempo real:', turno);
  }

  pausarTurno(turno: Turno) {
    // Implementar pausa de turno
    console.log('Pausar turno:', turno);
  }

  verDetalle(turno: Turno) {
    // Implementar vista de detalle
    console.log('Ver detalle:', turno);
  }

  exportarTurno(turno: Turno) {
    // Implementar exportación
    console.log('Exportar turno:', turno);
  }
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
