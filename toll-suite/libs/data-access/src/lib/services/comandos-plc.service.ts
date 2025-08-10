import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './base-api.service';

export interface ComandoAbrirBarreraDto {
  casetaIp: string;
  coilAddress: number;
  unitId: number;
  carrilId: number;
  observaciones?: string;
}

export interface ResultadoComandoDto {
  exitoso: boolean;
  mensaje: string;
  fechaEjecucion: string;
  datosAdicionales?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class ComandosPlcService {
  private readonly endpoint = 'comandos';

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {}

  abrirBarrera(comando: ComandoAbrirBarreraDto): Observable<ResultadoComandoDto> {
    return this.http.post<ResultadoComandoDto>(`${this.baseUrl}/${this.endpoint}/abrir-barrera`, comando);
  }

  cerrarBarrera(comando: ComandoAbrirBarreraDto): Observable<ResultadoComandoDto> {
    return this.http.post<ResultadoComandoDto>(`${this.baseUrl}/${this.endpoint}/cerrar-barrera`, comando);
  }
}
