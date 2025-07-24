import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardTurnos,
  EstadisticasTurnos,
  AlertaTurnos,
  TurnoConProblemas,
  MetricasProductividad,
  ConfiguracionTurnos,
  FiltrosTurnos,
  ReporteExportacion,
  TipoReporte,
  OptimizarTurnosRequest
} from '../models/reportes.models';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly apiUrl = 'http://localhost:5000/api'; // TODO: Usar environment cuando esté disponible

  constructor(private http: HttpClient) {}

  // ================== DASHBOARD PRINCIPAL ==================
  getDashboard(estacionId?: number): Observable<DashboardTurnos> {
    let params = new HttpParams();
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get<DashboardTurnos>(`${this.apiUrl}/turnos-admin/dashboard`, { params });
  }

  getMetricasTiempoReal(estacionId?: number): Observable<any> {
    let params = new HttpParams();
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get(`${this.apiUrl}/reportes-turnos/metricas-tiempo-real`, { params });
  }

  // ================== ESTADÍSTICAS Y REPORTES ==================
  getEstadisticasTurnos(filtros: FiltrosTurnos): Observable<EstadisticasTurnos> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());

    return this.http.get<EstadisticasTurnos>(`${this.apiUrl}/turnos-admin/estadisticas`, { params });
  }

  getReporteProductividadEmpleados(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/productividad-empleados`, { params });
  }

  getReporteRendimientoTurnos(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/rendimiento-turnos`, { params });
  }

  getReporteAsistenciaPuntualidad(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/asistencia-puntualidad`, { params });
  }

  getReporteHorasExtras(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/horas-extras`, { params });
  }

  getReporteCostosLaborales(filtros: FiltrosTurnos, incluirHorasExtras: boolean = true): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    params = params.set('incluirHorasExtras', incluirHorasExtras.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/costos-laborales`, { params });
  }

  getReporteIncidenciasEventos(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    if (filtros.tipoEvento) params = params.set('tipoEvento', filtros.tipoEvento);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);

    return this.http.get(`${this.apiUrl}/reportes-turnos/incidencias-eventos`, { params });
  }

  getDashboardEjecutivo(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/dashboard-ejecutivo`, { params });
  }

  getReporteCobertura(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/cobertura-turnos`, { params });
  }

  getAnalisisComparativo(
    periodo1Desde: Date,
    periodo1Hasta: Date,
    periodo2Desde: Date,
    periodo2Hasta: Date,
    estacionId?: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('periodo1Desde', periodo1Desde.toISOString())
      .set('periodo1Hasta', periodo1Hasta.toISOString())
      .set('periodo2Desde', periodo2Desde.toISOString())
      .set('periodo2Hasta', periodo2Hasta.toISOString());
    
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get(`${this.apiUrl}/reportes-turnos/analisis-comparativo`, { params });
  }

  getProyecciones(
    fechaDesde: Date,
    fechaHasta: Date,
    diasProyeccion: number = 30,
    estacionId?: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('fechaDesde', fechaDesde.toISOString())
      .set('fechaHasta', fechaHasta.toISOString())
      .set('diasProyeccion', diasProyeccion.toString());
    
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get(`${this.apiUrl}/reportes-turnos/proyecciones`, { params });
  }

  // ================== PROBLEMAS Y ALERTAS ==================
  getTurnosConProblemas(filtros: FiltrosTurnos): Observable<TurnoConProblemas[]> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());

    return this.http.get<TurnoConProblemas[]>(`${this.apiUrl}/turnos-admin/con-problemas`, { params });
  }

  getEstadoActualTurnos(estacionId?: number): Observable<any> {
    let params = new HttpParams();
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get(`${this.apiUrl}/turnos-admin/estado-actual`, { params });
  }

  getAlertas(tipo?: string): Observable<AlertaTurnos[]> {
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<AlertaTurnos[]>(`${this.apiUrl}/turnos-admin/alertas`, { params });
  }

  resolverAlerta(id: number, data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/turnos-admin/alertas/${id}/resolver`, data);
  }

  // ================== MÉTRICAS Y PRODUCTIVIDAD ==================
  getMetricasProductividad(filtros: FiltrosTurnos): Observable<MetricasProductividad> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get<MetricasProductividad>(`${this.apiUrl}/turnos-admin/metricas-productividad`, { params });
  }

  // ================== CONFIGURACIÓN ==================
  getConfiguracion(): Observable<ConfiguracionTurnos> {
    return this.http.get<ConfiguracionTurnos>(`${this.apiUrl}/turnos-admin/configuracion`);
  }

  updateConfiguracion(data: Partial<ConfiguracionTurnos>): Observable<ConfiguracionTurnos> {
    return this.http.put<ConfiguracionTurnos>(`${this.apiUrl}/turnos-admin/configuracion`, data);
  }

  // ================== OPTIMIZACIÓN ==================
  optimizarTurnos(request: OptimizarTurnosRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/turnos-admin/optimizar`, request);
  }

  // ================== EXPORTACIÓN ==================
  exportarReporte(tipoReporte: TipoReporte, filtros: FiltrosTurnos, formato: string = 'excel'): Observable<Blob> {
    let params = new HttpParams()
      .set('formato', formato);
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());

    return this.http.get(`${this.apiUrl}/reportes-turnos/exportar/${tipoReporte}`, {
      params,
      responseType: 'blob'
    });
  }

  // ================== UTILIDADES ==================
  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  formatearHora(timeSpan: string): string {
    if (!timeSpan) return '--:--';
    
    const partes = timeSpan.split(':');
    if (partes.length >= 2) {
      return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
    }
    
    return timeSpan;
  }

  formatearDuracion(minutos: number): string {
    if (!minutos || minutos === 0) return '0h 0m';
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    return `${horas}h ${mins}m`;
  }

  calcularPorcentaje(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
}
