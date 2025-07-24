import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { 
  Turno, 
  CreateTurnoDto,
  TurnoAsignacion,
  AsignarTurnoDto,
  FinalizarTurnoDto 
} from '../models/turnos.models';

@Injectable({
  providedIn: 'root'
})
export class TurnosService extends BaseApiService<Turno> {
  
  constructor(
    http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    super(http, 'api/TurnosAdmin', baseUrl);
  }

  // Métodos específicos para turnos
  createTurno(turno: CreateTurnoDto): Observable<Turno> {
    return this.http.post<Turno>(`${this.baseUrl}/${this.endpoint}`, turno);
  }

  getTurnosPorEmpleado(empleadoId: number, fechaInicio?: Date, fechaFin?: Date): Observable<Turno[]> {
    let params = `empleado/${empleadoId}`;
    if (fechaInicio && fechaFin) {
      params += `?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
    }
    return this.http.get<Turno[]>(`${this.baseUrl}/${this.endpoint}/${params}`);
  }

  getTurnosPorEstacion(estacionId: number, fecha?: Date): Observable<Turno[]> {
    let params = `estacion/${estacionId}`;
    if (fecha) {
      params += `?fecha=${fecha.toISOString()}`;
    }
    return this.http.get<Turno[]>(`${this.baseUrl}/${this.endpoint}/${params}`);
  }

  getTurnosActivos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.baseUrl}/${this.endpoint}/activos`);
  }

  iniciarTurno(id: number): Observable<Turno> {
    return this.http.patch<Turno>(`${this.baseUrl}/${this.endpoint}/${id}/iniciar`, {});
  }

  finalizarTurno(id: number, data: FinalizarTurnoDto): Observable<Turno> {
    return this.http.patch<Turno>(`${this.baseUrl}/${this.endpoint}/${id}/finalizar`, data);
  }

  cancelarTurno(id: number, motivo: string): Observable<Turno> {
    return this.http.patch<Turno>(`${this.baseUrl}/${this.endpoint}/${id}/cancelar`, { motivo });
  }
}
