import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, timer, NEVER, of } from 'rxjs';
import { 
  switchMap, 
  map, 
  catchError, 
  distinctUntilChanged, 
  shareReplay, 
  takeUntil,
  retryWhen,
  delay,
  tap,
  startWith
} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PlcCoilConfiguration {
  indice: number;
  direccion: number;
  nombre: string;
  descripcion?: string;
  tipoEvento?: string;
  generarEvento: boolean;
  esAlarma: boolean;
  estadoActual: boolean;
  ultimaActualizacion: string;
}

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
  // Campos adicionales para optimización
  lastUpdateHash?: string;
  dataTimestamp?: number;
}

export interface StationMonitoringResponse {
  data: StationMonitoringData[];
  lastUpdated: Date;
  hasError: boolean;
  errorMessage?: string;
  isRealTime?: boolean;
  responseDuration?: number;
}

export interface ConnectionTestResult {
  connected: boolean;
  responseTime?: number;
  message?: string;
}

export interface MonitoringStats {
  totalStations: number;
  connectedStations: number;
  stationsWithAlarms: number;
  averageResponseTime: number;
  lastErrorTime?: Date;
  totalErrors: number;
}

export interface UltraFastResponse {
  hasChanges: boolean;
  hash: string;
  data?: StationMonitoringData[];
  responseTime?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeStationMonitoringService {
  private readonly apiUrl = environment.apiUrl;
  private destroy$ = new Subject<void>();
  
  // Estado del monitoreo
  private monitoringData$ = new BehaviorSubject<StationMonitoringResponse>({
    data: [],
    lastUpdated: new Date(),
    hasError: false,
    isRealTime: false
  });

  private connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  private stats$ = new BehaviorSubject<MonitoringStats>({
    totalStations: 0,
    connectedStations: 0,
    stationsWithAlarms: 0,
    averageResponseTime: 0,
    totalErrors: 0
  });

  // Configuración del monitoreo ULTRA-RÁPIDO
  private pollingInterval = 500;   // 500ms para tiempo real extremo
  private reconnectDelay = 1000;   // 1 segundo para reconexión rápida
  private maxRetries = 5;
  private isMonitoring = false;
  private useUltraFastEndpoint = true; // Usar endpoint optimizado
  
  // Cache para optimización ultra-rápida
  private lastDataHash = '';
  private responseTimeHistory: number[] = [];
  private errorCount = 0;
  private consecutiveHashMatches = 0; // Para optimización dinámica

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {}

  /**
   * Inicia el monitoreo en tiempo real ULTRA-RÁPIDO
   */
  startRealTimeMonitoring(intervalMs: number = 500): Observable<StationMonitoringResponse> {
    // Mínimo 200ms para tiempo real extremo, máximo 2000ms
    this.pollingInterval = Math.max(Math.min(intervalMs, 2000), 200); 
    
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    this.isMonitoring = true;
    this.connectionStatus$.next('reconnecting');
    this.consecutiveHashMatches = 0;
    
    // Resetear el hash para forzar obtener datos frescos al iniciar
    this.lastDataHash = '';
    console.log('🚀 [RealTime] Starting monitoring with interval:', this.pollingInterval + 'ms');

    // Usar NgZone.runOutsideAngular para máxima performance
    this.ngZone.runOutsideAngular(() => {
      this.startUltraFastPolling();
    });

    return this.monitoringData$.asObservable();
  }

  /**
   * Detiene el monitoreo
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.connectionStatus$.next('disconnected');
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getConnectionStatus(): Observable<'connected' | 'disconnected' | 'reconnecting'> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Obtiene estadísticas del monitoreo
   */
  getMonitoringStats(): Observable<MonitoringStats> {
    return this.stats$.asObservable();
  }

  /**
   * Fuerza una actualización inmediata
   */
  forceRefresh(): Observable<StationMonitoringResponse> {
    return this.fetchUltraFastData().pipe(
      map((response: UltraFastResponse) => ({
        data: response.data || [],
        lastUpdated: new Date(),
        hasError: !!response.error,
        errorMessage: response.error,
        isRealTime: true,
        responseDuration: response.responseTime
      })),
      tap(response => {
        this.ngZone.run(() => {
          this.monitoringData$.next(response);
          this.updateStats(response);
        });
      })
    );
  }

  /**
   * Ciclo de polling ULTRA-OPTIMIZADO para tiempo real extremo
   */
  private startUltraFastPolling(): void {
    if (!this.isMonitoring) return;

    const startTime = performance.now();
    
    this.fetchUltraFastData().subscribe({
      next: (response: UltraFastResponse) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.ngZone.run(() => {
          // SIEMPRE actualizar la UI cuando hasChanges es true, independientemente del cache
          if (response.hasChanges && response.data) {
            console.log('� [SERVICE] HasChanges detected: true - Updating UI in NgZone', {
              currentHash: response.hash,
              lastHash: this.lastDataHash,
              dataLength: response.data.length,
              responseTime: responseTime
            });
            
            // NO actualizar el hash inmediatamente - mantener el estado anterior
            // para seguir detectando cambios en el siguiente ciclo
            this.monitoringData$.next({
              data: response.data,
              lastUpdated: new Date(),
              hasError: false,
              isRealTime: true,
              responseDuration: responseTime
            });
            this.consecutiveHashMatches = 0;
            
            // Solo actualizar el hash después de un breve retraso para permitir
            // que se detecten cambios rápidos subsecuentes
            setTimeout(() => {
              if (this.lastDataHash !== response.hash) {
                this.lastDataHash = response.hash;
                console.log('🔄 [SERVICE] Hash updated:', response.hash);
              }
            }, 100); // Reducir a 100ms para ser más ágil
            
          } else if (response.hasChanges && !response.data) {
            // Si hay cambios pero no hay data, forzar refresh
            console.log('⚠️ [SERVICE] HasChanges true but no data - Forcing refresh');
            this.useUltraFastEndpoint = false; // Fallback temporal
            this.consecutiveHashMatches = 0;
          } else {
            console.log('📋 [SERVICE] No changes detected', {
              currentHash: response.hash,
              lastHash: this.lastDataHash,
              consecutiveMatches: this.consecutiveHashMatches + 1
            });
            this.consecutiveHashMatches++;
            
            // Actualizar el hash inmediatamente cuando NO hay cambios
            if (this.lastDataHash !== response.hash) {
              this.lastDataHash = response.hash;
              console.log('✅ [SERVICE] Hash updated (no changes):', response.hash);
            }
          }

          this.updateResponseTimeStats(responseTime);
          this.updateStats({
            data: response.data || this.monitoringData$.value.data,
            lastUpdated: new Date(),
            hasError: !!response.error,
            errorMessage: response.error
          });
          
          this.errorCount = 0;
          this.connectionStatus$.next('connected');
        });

        // Optimización dinámica del intervalo
        const nextInterval = this.calculateOptimalInterval();
        setTimeout(() => this.startUltraFastPolling(), nextInterval);
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.handlePollingError(error);
        });

        // Reintentar más agresivamente
        const retryDelay = Math.min(this.reconnectDelay * Math.pow(1.5, this.errorCount), 5000);
        setTimeout(() => this.startUltraFastPolling(), retryDelay);
      }
    });
  }

  /**
   * Calcula el intervalo óptimo basado en la actividad
   */
  private calculateOptimalInterval(): number {
    // Si no hay cambios por un tiempo, aumentar levemente el intervalo
    if (this.consecutiveHashMatches > 10) {
      return Math.min(this.pollingInterval * 1.2, 1000); // Max 1 segundo
    }
    
    // Si hay cambios frecuentes, mantener intervalo mínimo
    if (this.consecutiveHashMatches < 3) {
      return this.pollingInterval;
    }
    
    return this.pollingInterval;
  }

  /**
   * Obtiene datos del servidor con optimizaciones ULTRA-RÁPIDAS
   */
  private fetchUltraFastData(): Observable<UltraFastResponse> {
    const endpoint = this.useUltraFastEndpoint 
      ? '/RealTimeMonitoring/ultra-fast'
      : '/PlcConfiguracion/monitoring';

    const params: any = {};
    
    // Solo enviar hash si realmente tenemos uno válido y estamos usando el endpoint ultra-fast
    if (this.lastDataHash && this.useUltraFastEndpoint && this.lastDataHash.length > 5) {
      params.hash = this.lastDataHash; // Usar 'hash' en lugar de 'lastHash'
    }

    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    console.log('📡 [SERVICE] Fetching ultra-fast data:', { 
      endpoint: this.useUltraFastEndpoint ? 'ultra-fast' : 'regular',
      sendingHash: !!this.lastDataHash,
      hashPreview: this.lastDataHash ? this.lastDataHash.substring(0, 8) + '...' : 'none',
      fullUrl: `${this.apiUrl}${endpoint}${Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : ''}`
    });

    return this.http.get<any>(`${this.apiUrl}${endpoint}`, { 
      headers, 
      params 
    }).pipe(
      map(response => {
        if (this.useUltraFastEndpoint) {
          // Respuesta del endpoint ultra-rápido
          return {
            hasChanges: response.hasChanges || false,
            hash: response.hash || '',
            data: response.data || null,
            responseTime: response.responseTimeMs || 0
          };
        } else {
          // Respuesta del endpoint tradicional
          return {
            hasChanges: true,
            hash: this.generateDataHash(response),
            data: response,
            responseTime: 0
          };
        }
      }),
      catchError(error => {
        console.error('❌ [RealTime] Error fetching data:', error);
        
        // Fallback al endpoint tradicional si falla el ultra-rápido
        if (this.useUltraFastEndpoint && error.status !== 0) {
          console.log('🔄 [RealTime] Switching to fallback endpoint');
          this.useUltraFastEndpoint = false;
          return this.fetchUltraFastData();
        }
        
        return of({
          hasChanges: false,
          hash: this.lastDataHash,
          data: [],
          error: error.message || 'Error de conexión'
        });
      })
    );
  }

  /**
   * Genera hash para detectar cambios en los datos
   */
  private generateDataHash(data: StationMonitoringData[]): string {
    const relevantData = data.map(station => ({
      id: station.id,
      estaConectado: station.estaConectado,
      estadoWorker: station.estadoWorker,
      coils: station.coilsConfiguracion?.map(c => ({ 
        direccion: c.direccion, 
        estadoActual: c.estadoActual,
        esAlarma: c.esAlarma 
      })) || []
    }));

    return btoa(JSON.stringify(relevantData));
  }

  /**
   * Actualiza estadísticas de tiempo de respuesta
   */
  private updateResponseTimeStats(responseTime: number): void {
    this.responseTimeHistory.push(responseTime);
    if (this.responseTimeHistory.length > 50) {
      this.responseTimeHistory.shift();
    }
  }

  /**
   * Actualiza estadísticas generales
   */
  private updateStats(response: StationMonitoringResponse): void {
    const totalStations = response.data.length;
    const connectedStations = response.data.filter(s => s.estaConectado).length;
    const stationsWithAlarms = response.data.filter(s => 
      s.coilsConfiguracion?.some(c => c.esAlarma && c.estadoActual)
    ).length;
    
    const averageResponseTime = this.responseTimeHistory.length > 0
      ? this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length
      : 0;

    this.stats$.next({
      totalStations,
      connectedStations,
      stationsWithAlarms,
      averageResponseTime,
      lastErrorTime: response.hasError ? new Date() : this.stats$.value.lastErrorTime,
      totalErrors: this.errorCount
    });
  }

  /**
   * Maneja errores de polling
   */
  private handlePollingError(error: any): void {
    this.errorCount++;
    this.connectionStatus$.next('reconnecting');
    
    const errorResponse: StationMonitoringResponse = {
      data: this.monitoringData$.value.data, // Mantener últimos datos
      lastUpdated: new Date(),
      hasError: true,
      errorMessage: `Error de conexión (${this.errorCount}): ${error.message}`
    };

    this.monitoringData$.next(errorResponse);
    this.updateStats(errorResponse);
  }

  /**
   * Prueba conexión con una estación específica
   */
  testPlcConnection(stationId: number): Observable<ConnectionTestResult> {
    const startTime = performance.now();
    
    return this.http.post<any>(`${this.apiUrl}/PlcConfiguracion/test-connection/${stationId}`, {}).pipe(
      map(result => {
        const responseTime = performance.now() - startTime;
        return {
          connected: result.success || result.connected || false,
          responseTime,
          message: result.message || (result.success ? 'Conexión exitosa' : 'Error de conexión')
        };
      }),
      catchError(error => of({
        connected: false,
        responseTime: performance.now() - startTime,
        message: error.message || 'Error al probar conexión'
      }))
    );
  }

  /**
   * Reinicia worker de una estación
   */
  restartWorker(stationId: number): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/PlcConfiguracion/restart-worker/${stationId}`, {}).pipe(
      map(result => result.success || false),
      catchError(() => of(false))
    );
  }

  /**
   * Actualiza estado activo de una estación
   */
  updatePlcStatus(stationId: number, isActive: boolean): Observable<boolean> {
    return this.http.put<any>(`${this.apiUrl}/PlcConfiguracion/update-status/${stationId}`, {
      workerActivo: isActive
    }).pipe(
      map(result => result.success || false),
      catchError(() => of(false))
    );
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopMonitoring();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
