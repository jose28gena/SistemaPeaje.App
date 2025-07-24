import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TurnoTemplate,
  CreateTurnoTemplate,
  TurnoAsignacion,
  CreateTurnoAsignacion,
  RegistroTiempo,
  CreateRegistroTiempo,
  TurnoEvento,
  CreateTurnoEvento,
  Turno
} from '../models/turnos.models';
import { FiltrosTurnos } from '../models/reportes.models';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private readonly apiUrl = 'http://localhost:5000/api'; // TODO: Usar environment cuando esté disponible

  constructor(private http: HttpClient) {}

  // ================== TURNOS BÁSICOS ==================
  getTurnos(filtros?: FiltrosTurnos): Observable<Turno[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
      if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
    }

    return this.http.get<Turno[]>(`${this.apiUrl}/turnos`, { params });
  }

  getTurnosActivos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.apiUrl}/turnos/activos`);
  }

  getTurno(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/turnos/${id}`);
  }

  abrirTurno(data: any): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos/abrir`, data);
  }

  cerrarTurno(id: number, montoFinalCaja: number): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos/${id}/cerrar`, { montoFinalCaja });
  }

  pausarTurno(id: number, data: any): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos-admin/turnos/${id}/pausar`, data);
  }

  reanudarTurno(id: number): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos-admin/turnos/${id}/reanudar`, {});
  }

  transferirTurno(id: number, data: any): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos-admin/turnos/${id}/transferir`, data);
  }

  // ================== PLANTILLAS DE TURNOS ==================
  getTurnoTemplates(soloActivos?: boolean): Observable<TurnoTemplate[]> {
    let params = new HttpParams();
    if (soloActivos !== undefined) {
      params = params.set('soloActivos', soloActivos.toString());
    }
    
    return this.http.get<TurnoTemplate[]>(`${this.apiUrl}/turno-templates`, { params });
  }

  getTurnoTemplate(id: number): Observable<TurnoTemplate> {
    return this.http.get<TurnoTemplate>(`${this.apiUrl}/turno-templates/${id}`);
  }

  createTurnoTemplate(data: CreateTurnoTemplate): Observable<TurnoTemplate> {
    return this.http.post<TurnoTemplate>(`${this.apiUrl}/turno-templates`, data);
  }

  updateTurnoTemplate(id: number, data: Partial<CreateTurnoTemplate>): Observable<TurnoTemplate> {
    return this.http.put<TurnoTemplate>(`${this.apiUrl}/turno-templates/${id}`, data);
  }

  deleteTurnoTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/turno-templates/${id}`);
  }

  getTurnoTemplatesAplicables(diaSemana: number): Observable<TurnoTemplate[]> {
    const params = new HttpParams().set('diaSemana', diaSemana.toString());
    return this.http.get<TurnoTemplate[]>(`${this.apiUrl}/turno-templates/aplicables`, { params });
  }

  duplicarTurnoTemplate(id: number, nuevoNombre: string): Observable<TurnoTemplate> {
    return this.http.post<TurnoTemplate>(`${this.apiUrl}/turno-templates/${id}/duplicar`, { nuevoNombre });
  }

  // ================== ASIGNACIONES DE TURNOS ==================
  getTurnoAsignaciones(filtros?: FiltrosTurnos): Observable<TurnoAsignacion[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
      if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
    }

    return this.http.get<TurnoAsignacion[]>(`${this.apiUrl}/turno-asignaciones`, { params });
  }

  getTurnoAsignacion(id: number): Observable<TurnoAsignacion> {
    return this.http.get<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones/${id}`);
  }

  createTurnoAsignacion(data: CreateTurnoAsignacion): Observable<TurnoAsignacion> {
    return this.http.post<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones`, data);
  }

  createTurnoAsignacionesLote(data: CreateTurnoAsignacion[]): Observable<TurnoAsignacion[]> {
    return this.http.post<TurnoAsignacion[]>(`${this.apiUrl}/turno-asignaciones/lote`, { asignaciones: data });
  }

  updateTurnoAsignacion(id: number, data: Partial<CreateTurnoAsignacion>): Observable<TurnoAsignacion> {
    return this.http.put<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones/${id}`, data);
  }

  confirmarTurnoAsignacion(id: number, data: any): Observable<TurnoAsignacion> {
    return this.http.post<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones/${id}/confirmar`, data);
  }

  asignarSustituto(id: number, data: any): Observable<TurnoAsignacion> {
    return this.http.post<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones/${id}/sustituir`, data);
  }

  cancelarTurnoAsignacion(id: number, data: any): Observable<TurnoAsignacion> {
    return this.http.post<TurnoAsignacion>(`${this.apiUrl}/turno-asignaciones/${id}/cancelar`, data);
  }

  getCalendarioTurnos(año: number, mes: number, estacionId?: number): Observable<any> {
    let params = new HttpParams()
      .set('año', año.toString())
      .set('mes', mes.toString());
    
    if (estacionId) {
      params = params.set('estacionId', estacionId.toString());
    }

    return this.http.get(`${this.apiUrl}/turno-asignaciones/calendario`, { params });
  }

  getAsignacionesPendientes(empleadoId?: number): Observable<TurnoAsignacion[]> {
    let params = new HttpParams();
    if (empleadoId) {
      params = params.set('empleadoId', empleadoId.toString());
    }

    return this.http.get<TurnoAsignacion[]>(`${this.apiUrl}/turno-asignaciones/pendientes`, { params });
  }

  // ================== REGISTRO DE TIEMPO ==================
  getRegistrosTiempo(filtros?: FiltrosTurnos): Observable<RegistroTiempo[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
      if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    }

    return this.http.get<RegistroTiempo[]>(`${this.apiUrl}/registro-tiempo`, { params });
  }

  registrarEntrada(data: CreateRegistroTiempo): Observable<RegistroTiempo> {
    return this.http.post<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/entrada`, data);
  }

  registrarSalida(data: CreateRegistroTiempo): Observable<RegistroTiempo> {
    return this.http.post<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/salida`, data);
  }

  registrarInicioDescanso(data: CreateRegistroTiempo): Observable<RegistroTiempo> {
    return this.http.post<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/inicio-descanso`, data);
  }

  registrarFinDescanso(data: CreateRegistroTiempo): Observable<RegistroTiempo> {
    return this.http.post<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/fin-descanso`, data);
  }

  getResumenAsistencia(empleadoId: number, fechaDesde: Date, fechaHasta: Date): Observable<any> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde.toISOString())
      .set('fechaHasta', fechaHasta.toISOString());

    return this.http.get(`${this.apiUrl}/registro-tiempo/resumen-asistencia/${empleadoId}`, { params });
  }

  corregirRegistroTiempo(id: number, data: any): Observable<RegistroTiempo> {
    return this.http.put<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/${id}/corregir`, data);
  }

  autorizarRegistroTiempo(id: number, data: any): Observable<RegistroTiempo> {
    return this.http.post<RegistroTiempo>(`${this.apiUrl}/registro-tiempo/${id}/autorizar`, data);
  }

  getEstadoActualEmpleado(empleadoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/registro-tiempo/estado-actual/${empleadoId}`);
  }

  getReporteHorasTrabajadas(filtros: FiltrosTurnos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.empleadoId) params = params.set('empleadoId', filtros.empleadoId.toString());
    if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());

    return this.http.get(`${this.apiUrl}/registro-tiempo/reporte-horas`, { params });
  }

  // ================== EVENTOS DE TURNOS ==================
  getTurnoEventos(filtros?: FiltrosTurnos): Observable<TurnoEvento[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
      if (filtros.tipoEvento) params = params.set('tipoEvento', filtros.tipoEvento);
      if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
      if (filtros.estacionId) params = params.set('estacionId', filtros.estacionId.toString());
    }

    return this.http.get<TurnoEvento[]>(`${this.apiUrl}/turno-eventos`, { params });
  }

  getTurnoEvento(id: number): Observable<TurnoEvento> {
    return this.http.get<TurnoEvento>(`${this.apiUrl}/turno-eventos/${id}`);
  }

  createTurnoEvento(data: CreateTurnoEvento): Observable<TurnoEvento> {
    return this.http.post<TurnoEvento>(`${this.apiUrl}/turno-eventos`, data);
  }

  updateTurnoEvento(id: number, data: Partial<CreateTurnoEvento>): Observable<TurnoEvento> {
    return this.http.put<TurnoEvento>(`${this.apiUrl}/turno-eventos/${id}`, data);
  }

  resolverTurnoEvento(id: number, data: any): Observable<TurnoEvento> {
    return this.http.post<TurnoEvento>(`${this.apiUrl}/turno-eventos/${id}/resolver`, data);
  }

  asignarTurnoEvento(id: number, data: any): Observable<TurnoEvento> {
    return this.http.post<TurnoEvento>(`${this.apiUrl}/turno-eventos/${id}/asignar`, data);
  }

  getEventosCriticos(): Observable<TurnoEvento[]> {
    return this.http.get<TurnoEvento[]>(`${this.apiUrl}/turno-eventos/criticos`);
  }
}
