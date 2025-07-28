import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { 
  TurnoAsignacion,
  AsignarTurnoDto
} from '../models/turnos.models';

@Injectable({
  providedIn: 'root'
})
export class TurnoAsignacionesService extends BaseApiService<TurnoAsignacion> {
  
  constructor(
    http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    super(http, 'turnos-admin/turno-asignaciones', baseUrl);
  }

  asignarTurno(data: AsignarTurnoDto): Observable<TurnoAsignacion> {
    return this.http.post<TurnoAsignacion>(`${this.baseUrl}/${this.endpoint}`, data);
  }

  reasignarTurno(asignacionId: number, nuevoEmpleadoId: number, observaciones?: string): Observable<TurnoAsignacion> {
    return this.http.patch<TurnoAsignacion>(`${this.baseUrl}/${this.endpoint}/${asignacionId}/reasignar`, {
      nuevoEmpleadoId,
      observaciones
    });
  }

  getAsignacionesPorEmpleado(empleadoId: number): Observable<TurnoAsignacion[]> {
    return this.http.get<TurnoAsignacion[]>(`${this.baseUrl}/${this.endpoint}/empleado/${empleadoId}`);
  }

  getAsignacionesPorTurno(turnoId: number): Observable<TurnoAsignacion[]> {
    return this.http.get<TurnoAsignacion[]>(`${this.baseUrl}/${this.endpoint}/turno/${turnoId}`);
  }
}
