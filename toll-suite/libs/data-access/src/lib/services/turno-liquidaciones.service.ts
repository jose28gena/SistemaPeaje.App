import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { TurnoLiquidacion } from '../models/turnos.models';

@Injectable({
  providedIn: 'root'
})
export class TurnoLiquidacionesService extends BaseApiService<TurnoLiquidacion> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'turnos-liquidaciones', baseUrl);
  }

  // Métodos específicos para liquidaciones
  getByTurnoId(turnoId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/turno/${turnoId}`);
  }

  getLiquidacionesPorFecha(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/fecha-rango`, {
      params: {
        fechaInicio,
        fechaFin
      }
    });
  }

  getLiquidacionesPorEmpleado(empleadoId: number, fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/empleado/${empleadoId}`, {
      params: {
        fechaInicio,
        fechaFin
      }
    });
  }

  getResumenDiario(fecha: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/resumen-diario/${fecha}`);
  }
}
