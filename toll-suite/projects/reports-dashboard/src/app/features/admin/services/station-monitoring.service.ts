import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { switchMap, startWith, map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PlcConfiguration {
  id: number;
  nombre: string;
  ip: string;
  puerto: number;
  unitId: number;
  direccionInicial: number;
  cantidadCoils: number;
  intervaloMonitoreo: number;
  habilitarLoggingPeriodico: boolean;
  estacionId: number;
  carrilId: number;
  estaConectado: boolean;
  ultimaConexion?: string;
  observaciones?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  coilsConfiguracion: PlcCoilConfiguration[];
}

// Interfaz específica para monitoreo que coincide con el DTO del backend
export interface StationMonitoringData {
  id: number;
  nombre: string;
  ip: string;
  puerto: number;
  estacionNombre: string;
  carrilNombre: string;
  estaConectado: boolean;
  ultimaConexion?: string;
  workerActivo: boolean;
  estadoWorker: string;
  coilsConfiguracion: PlcCoilConfiguration[];
}

export interface PlcCoilConfiguration {
  indice: number;
  direccion: number;
  nombre: string;
  descripcion?: string;
  tipoEvento?: string;
  generarEvento: boolean;
  esAlarma: boolean;
  accionEspecial?: string;
  estadoActual: boolean; // Estado actual del coil
  ultimaActualizacion?: string; // Última actualización del estado
}

// Respuesta del endpoint de monitoreo
export interface StationMonitoringResponse {
  data: StationMonitoringData[];
  lastUpdated: Date;
  hasError: boolean;
  errorMessage?: string;
}

export interface WorkerStatus {
  [configId: string]: string; // 'Conectado' | 'Desconectado' | 'Iniciando' | 'Error' | 'Detenido'
}

@Injectable({
  providedIn: 'root'
})
export class StationMonitoringService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las configuraciones de PLC con sus coils incluidos
   */
  getPlcConfigurations(): Observable<PlcConfiguration[]> {
    return this.http.get<PlcConfiguration[]>(`${this.apiUrl}/PlcConfiguracion/with-coils`);
  }

  /**
   * Obtiene el estado de todos los workers
   */
  getWorkersStatus(): Observable<WorkerStatus> {
    return this.http.get<WorkerStatus>(`${this.apiUrl}/PlcConfiguracion/workers/status`);
  }

  /**
   * Obtiene una configuración específica por ID
   */
  getPlcConfiguration(id: number): Observable<PlcConfiguration> {
    return this.http.get<PlcConfiguration>(`${this.apiUrl}/PlcConfiguracion/${id}`);
  }

  /**
   * Obtiene datos combinados de monitoreo con actualizaciones automáticas
   */
  getStationMonitoringData(refreshInterval: number = 5000): Observable<StationMonitoringResponse> {
    return interval(refreshInterval).pipe(
      startWith(0),
      switchMap(() => this.fetchMonitoringData())
    );
  }

  /**
   * Obtiene los datos de monitoreo del endpoint específico
   */
  private fetchMonitoringData(): Observable<StationMonitoringResponse> {
    return this.http.get<StationMonitoringData[]>(`${this.apiUrl}/PlcConfiguracion/monitoring`).pipe(
      map(data => ({
        data: data || [],
        lastUpdated: new Date(),
        hasError: false,
        errorMessage: undefined
      })),
      catchError(error => {
        console.error('Error fetching monitoring data:', error);
        return of({
          data: [],
          lastUpdated: new Date(),
          hasError: true,
          errorMessage: error.status === 408 ? 'Timeout - Los PLCs no responden' : 'Error de conexión'
        });
      })
    );
  }

  /**
   * Actualiza el estado de un PLC (activo/inactivo)
   */
  updatePlcStatus(id: number, active: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/PlcConfiguracion/${id}/status`, { activo: active });
  }

  /**
   * Fuerza la reconexión de un worker específico
   */
  restartWorker(configId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/PlcConfiguracion/${configId}/restart`, {});
  }

  /**
   * Obtiene el historial de eventos de una estación
   */
  getStationEvents(estacionId: number, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/EventosTransito`, {
      params: { estacionId: estacionId.toString(), limit: limit.toString() }
    });
  }

  /**
   * Prueba la conexión de un PLC específico
   */
  testPlcConnection(id: number): Observable<{ connected: boolean; message: string }> {
    return this.http.post<{ connected: boolean; message: string }>(
      `${this.apiUrl}/PlcConfiguracion/${id}/test-connection`, {}
    );
  }
}
