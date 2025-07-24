import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ReportesService } from '../../services/reportes.service';
import { TurnosService } from '../../services/turnos.service';
import { 
  DashboardTurnos, 
  AlertaTurnos, 
  TurnoActivo,
  EstacionEstado 
} from '../../models/reportes.models';

@Component({
  selector: 'app-dashboard-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-turnos">
      <!-- Header con métricas principales -->
      <div class="header-metricas">
        <div class="metrica-card activos">
          <div class="icon">🟢</div>
          <div class="content">
            <h3>{{ dashboard.turnosActivosHoy }}</h3>
            <p>Turnos Activos</p>
          </div>
        </div>
        
        <div class="metrica-card empleados">
          <div class="icon">👥</div>
          <div class="content">
            <h3>{{ dashboard.empleadosEnTurno }}</h3>
            <p>Empleados en Turno</p>
          </div>
        </div>
        
        <div class="metrica-card programados">
          <div class="icon">📅</div>
          <div class="content">
            <h3>{{ dashboard.turnosProgramadosHoy }}</h3>
            <p>Turnos Programados</p>
          </div>
        </div>
        
        <div class="metrica-card alertas" [class.warning]="dashboard.alertasActivas > 0">
          <div class="icon">⚠️</div>
          <div class="content">
            <h3>{{ dashboard.alertasActivas }}</h3>
            <p>Alertas Activas</p>
          </div>
        </div>
      </div>

      <!-- Grid principal -->
      <div class="dashboard-grid">
        <!-- Turnos en curso -->
        <div class="panel turnos-activos">
          <div class="panel-header">
            <h3>🔄 Turnos en Curso</h3>
            <span class="badge">{{ dashboard.turnosEnCurso.length }}</span>
          </div>
          <div class="panel-content">
            <div class="turno-item" *ngFor="let turno of dashboard.turnosEnCurso">
              <div class="turno-info">
                <div class="empleado">
                  <strong>{{ turno.turno.empleadoNombre }}</strong>
                  <span class="estacion">{{ turno.turno.estacionNombre }}</span>
                </div>
                <div class="tiempo">
                  <span class="duracion">{{ formatearTiempo(turno.tiempoTranscurrido) }}</span>
                  <span class="estado" [class]="getEstadoClass(turno.estadoDetallado)">
                    {{ turno.estadoDetallado }}
                  </span>
                </div>
              </div>
              <div class="turno-acciones">
                <button 
                  class="btn-sm" 
                  (click)="verDetalleTurno(turno.turno.id)"
                  title="Ver detalle">
                  👁️
                </button>
                <button 
                  class="btn-sm warning" 
                  *ngIf="turno.tieneEventosAbiertos"
                  (click)="verEventos(turno.turno.id)"
                  title="Eventos abiertos">
                  ⚠️ {{ turno.numeroEventosAbiertos }}
                </button>
              </div>
            </div>
            
            <div class="empty-state" *ngIf="dashboard.turnosEnCurso.length === 0">
              <p>No hay turnos en curso actualmente</p>
            </div>
          </div>
        </div>

        <!-- Alertas recientes -->
        <div class="panel alertas-panel">
          <div class="panel-header">
            <h3>🚨 Alertas Recientes</h3>
            <button class="btn-link" (click)="verTodasAlertas()">Ver todas</button>
          </div>
          <div class="panel-content">
            <div class="alerta-item" *ngFor="let alerta of dashboard.alertasRecientes">
              <div class="alerta-info">
                <div class="severity" [class]="alerta.severidad.toLowerCase()">
                  {{ getSeverityIcon(alerta.severidad) }}
                </div>
                <div class="content">
                  <h4>{{ alerta.titulo }}</h4>
                  <p>{{ alerta.descripcion }}</p>
                  <small>{{ formatearFecha(alerta.fechaCreacion) }}</small>
                </div>
              </div>
              <div class="alerta-acciones">
                <button 
                  class="btn-sm primary"
                  (click)="resolverAlerta(alerta.id)"
                  [disabled]="alerta.esResuelta">
                  {{ alerta.esResuelta ? '✅' : '📋' }}
                </button>
              </div>
            </div>
            
            <div class="empty-state" *ngIf="dashboard.alertasRecientes.length === 0">
              <p>No hay alertas recientes</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas del día -->
        <div class="panel estadisticas-dia">
          <div class="panel-header">
            <h3>📊 Estadísticas del Día</h3>
            <span class="fecha">{{ getFechaActual() }}</span>
          </div>
          <div class="panel-content">
            <div class="estadistica-grid">
              <div class="stat-item">
                <div class="value">{{ formatearMoneda(dashboard.estadisticasDelDia.recaudacionAcumulada) }}</div>
                <div class="label">Recaudación</div>
              </div>
              <div class="stat-item">
                <div class="value">{{ dashboard.estadisticasDelDia.transaccionesProcesadas }}</div>
                <div class="label">Transacciones</div>
              </div>
              <div class="stat-item">
                <div class="value">{{ dashboard.estadisticasDelDia.horasTrabajadasTotal }}</div>
                <div class="label">Horas Trabajadas</div>
              </div>
              <div class="stat-item">
                <div class="value">{{ dashboard.estadisticasDelDia.eventosRegistrados }}</div>
                <div class="label">Eventos</div>
              </div>
              <div class="stat-item">
                <div class="value">{{ formatearMoneda(dashboard.estadisticasDelDia.rendimientoPromedio) }}/h</div>
                <div class="label">Rendimiento Promedio</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado por estación -->
        <div class="panel estaciones-estado">
          <div class="panel-header">
            <h3>🏢 Estado por Estación</h3>
            <select [(ngModel)]="estacionSeleccionada" (change)="filtrarPorEstacion()">
              <option value="">Todas las estaciones</option>
              <option *ngFor="let estacion of dashboard.estadoPorEstacion" [value]="estacion.estacionId">
                {{ estacion.estacionNombre }}
              </option>
            </select>
          </div>
          <div class="panel-content">
            <div class="estacion-item" *ngFor="let estacion of dashboard.estadoPorEstacion">
              <div class="estacion-info">
                <div class="nombre">{{ estacion.estacionNombre }}</div>
                <div class="estado" [class]="getEstadoEstacionClass(estacion.estado)">
                  {{ getEstadoEstacionTexto(estacion.estado) }}
                </div>
              </div>
              <div class="estacion-metricas">
                <span class="turnos-count">{{ estacion.turnosActivos }} turnos activos</span>
                <div class="mini-turnos">
                  <div 
                    class="mini-turno" 
                    *ngFor="let turno of estacion.turnosEnCurso"
                    [title]="turno.turno.empleadoNombre">
                    {{ getIniciales(turno.turno.empleadoNombre) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="acciones-rapidas">
        <button class="btn primary" (click)="irACalendario()">
          📅 Ver Calendario de Turnos
        </button>
        <button class="btn secondary" (click)="irAReportes()">
          📊 Generar Reportes
        </button>
        <button class="btn secondary" (click)="irAConfiguracion()">
          ⚙️ Configuración
        </button>
        <button class="btn warning" (click)="optimizarTurnos()">
          🎯 Optimizar Turnos
        </button>
      </div>

      <!-- Indicador de actualización -->
      <div class="update-indicator" *ngIf="actualizando">
        <span class="spinner"></span>
        Actualizando datos...
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-turnos.component.scss']
})
export class DashboardTurnosComponent implements OnInit, OnDestroy {
  dashboard: DashboardTurnos = {
    fechaActualizacion: new Date(),
    turnosActivosHoy: 0,
    empleadosEnTurno: 0,
    turnosProgramadosHoy: 0,
    alertasActivas: 0,
    turnosEnCurso: [],
    alertasRecientes: [],
    estadisticasDelDia: {
      recaudacionAcumulada: 0,
      transaccionesProcesadas: 0,
      horasTrabajadasTotal: '0h 0m',
      eventosRegistrados: 0,
      rendimientoPromedio: 0
    },
    estadoPorEstacion: []
  };

  estacionSeleccionada: string = '';
  actualizando: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private reportesService: ReportesService,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDashboard(): void {
    this.actualizando = true;
    
    this.reportesService.getDashboard(this.estacionSeleccionada ? +this.estacionSeleccionada : undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.actualizando = false;
        },
        error: (error) => {
          console.error('Error al cargar dashboard:', error);
          this.actualizando = false;
        }
      });
  }

  iniciarActualizacionAutomatica(): void {
    // Actualizar cada 30 segundos
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.reportesService.getDashboard(
          this.estacionSeleccionada ? +this.estacionSeleccionada : undefined
        ))
      )
      .subscribe({
        next: (data) => {
          this.dashboard = data;
        },
        error: (error) => {
          console.error('Error en actualización automática:', error);
        }
      });
  }

  filtrarPorEstacion(): void {
    this.cargarDashboard();
  }

  verDetalleTurno(turnoId: number): void {
    // TODO: Navegar a detalle del turno
    console.log('Ver detalle del turno:', turnoId);
  }

  verEventos(turnoId: number): void {
    // TODO: Navegar a eventos del turno
    console.log('Ver eventos del turno:', turnoId);
  }

  verTodasAlertas(): void {
    // TODO: Navegar a página de alertas
    console.log('Ver todas las alertas');
  }

  resolverAlerta(alertaId: number): void {
    // TODO: Implementar resolución de alerta
    console.log('Resolver alerta:', alertaId);
  }

  irACalendario(): void {
    // TODO: Navegar a calendario
    console.log('Ir a calendario de turnos');
  }

  irAReportes(): void {
    // TODO: Navegar a reportes
    console.log('Ir a reportes');
  }

  irAConfiguracion(): void {
    // TODO: Navegar a configuración
    console.log('Ir a configuración');
  }

  optimizarTurnos(): void {
    // TODO: Implementar optimización
    console.log('Optimizar turnos');
  }

  // Métodos de formateo
  formatearTiempo(timeSpan: string): string {
    if (!timeSpan) return '--:--';
    return timeSpan;
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearMoneda(valor: number): string {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  }

  getFechaActual(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'EnTurno': 'success',
      'EnDescanso': 'warning',
      'Pausado': 'danger',
      'Suspendido': 'danger'
    };
    return clases[estado] || 'secondary';
  }

  getEstadoEstacionClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Operativa': 'success',
      'Pausada': 'warning',
      'MantenimientoProgramado': 'info',
      'ProblemasTecnicos': 'danger'
    };
    return clases[estado] || 'secondary';
  }

  getEstadoEstacionTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'Operativa': 'Operativa',
      'Pausada': 'Pausada',
      'MantenimientoProgramado': 'Mantenimiento',
      'ProblemasTecnicos': 'Problemas'
    };
    return textos[estado] || estado;
  }

  getSeverityIcon(severidad: string): string {
    const iconos: { [key: string]: string } = {
      'Informativa': 'ℹ️',
      'Advertencia': '⚠️',
      'Error': '❌',
      'Critica': '🚨'
    };
    return iconos[severidad] || '📋';
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre.split(' ')
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
