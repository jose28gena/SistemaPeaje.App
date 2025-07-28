import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { 
  TurnoEvento,
  RegistrarEventoTurnoDto
} from '../models/turnos.models';

@Injectable({
  providedIn: 'root'
})
export class TurnoEventosService extends BaseApiService<TurnoEvento> {
  
  constructor(
    http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    super(http, 'turnos-admin/turno-eventos', baseUrl);
  }

  registrarEvento(turnoId: number, evento: RegistrarEventoTurnoDto): Observable<TurnoEvento> {
    return this.http.post<TurnoEvento>(`${this.baseUrl}/${this.endpoint}/turno/${turnoId}`, evento);
  }

  getEventosPorTurno(turnoId: number): Observable<TurnoEvento[]> {
    return this.http.get<TurnoEvento[]>(`${this.baseUrl}/${this.endpoint}/turno/${turnoId}`);
  }

  getEventosPorTipo(tipoEvento: string, fechaInicio?: Date, fechaFin?: Date): Observable<TurnoEvento[]> {
    let params = `tipo/${tipoEvento}`;
    if (fechaInicio && fechaFin) {
      params += `?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
    }
    return this.http.get<TurnoEvento[]>(`${this.baseUrl}/${this.endpoint}/${params}`);
  }
}
