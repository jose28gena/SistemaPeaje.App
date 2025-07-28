import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { 
  RealTimeStationMonitoringService, 
  StationMonitoringData, 
  StationMonitoringResponse, 
  MonitoringStats 
} from '../services/real-time-station-monitoring.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface StationCard {
  id: number;
  name: string;
  ip: string;
  port: number;
  estacionId: number;
  carrilId: number;
  status: 'connected' | 'disconnected' | 'starting' | 'error' | 'stopped';
  lastConnection?: Date;
  coilsCount: number;
  activeCoils: number;
  alarmCoils: number;
  isActive: boolean;
  configuration: any; // Temporalmente any para compatibilidad
  estadoWorker: string;
}

@Component({
  selector: 'app-station-monitoring',
  template: `
    <div class="station-monitoring-container">
      <div class="header">
        <h1>
          <mat-icon>monitor_heart</mat-icon>
          Monitoreo de Estaciones
        </h1>
        
        <div class="header-actions">
          <div class="connection-status" [ngClass]="'status-' + connectionStatus">
            <mat-icon>{{ getConnectionIcon() }}</mat-icon>
            <span>{{ getConnectionText() }}</span>
          </div>
          
          <mat-form-field appearance="outline" class="refresh-interval">
            <mat-label>Actualización (ms)</mat-label>
            <mat-select [(value)]="refreshInterval" (selectionChange)="onRefreshIntervalChange()">
              <mat-option value="200">200ms (Ultra Rápido)</mat-option>
              <mat-option value="500">500ms (Tiempo Real)</mat-option>
              <mat-option value="1000">1s (Rápido)</mat-option>
              <mat-option value="2000">2s (Normal)</mat-option>
              <mat-option value="5000">5s (Lento)</mat-option>
            </mat-select>
          </mat-form-field>
          
          <button mat-raised-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Actualizar
          </button>
        </div>
      </div>

      <div class="status-summary" *ngIf="stats">
        <mat-card class="summary-card connected">
          <mat-card-header>
            <mat-icon>check_circle</mat-icon>
            <span>Conectadas</span>
          </mat-card-header>
          <mat-card-content>
            <div class="count">{{ stats.connectedStations }}</div>
            <div class="total">de {{ stats.totalStations }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card with-alarms">
          <mat-card-header>
            <mat-icon>warning</mat-icon>
            <span>Con Alarmas</span>
          </mat-card-header>
          <mat-card-content>
            <div class="count">{{ stats.stationsWithAlarms }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card performance">
          <mat-card-header>
            <mat-icon>speed</mat-icon>
            <span>Resp. Promedio</span>
          </mat-card-header>
          <mat-card-content>
            <div class="count">{{ stats.averageResponseTime | number:'1.0-0' }}ms</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card errors" *ngIf="stats.totalErrors > 0">
          <mat-card-header>
            <mat-icon>error_outline</mat-icon>
            <span>Errores</span>
          </mat-card-header>
          <mat-card-content>
            <div class="count">{{ stats.totalErrors }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="last-update" *ngIf="monitoringData">
        <span>Última actualización: {{ monitoringData.lastUpdated | date:'medium' }}</span>
        <span *ngIf="isMonitoring" class="monitoring-indicator">
          <mat-icon class="spinning">refresh</mat-icon>
          Actualizando...
        </span>
        <mat-icon *ngIf="!isMonitoring && !isLoading" class="monitoring-ready">check_circle</mat-icon>
      </div>

      <div class="stations-grid" *ngIf="!isLoading && stationCards.length > 0">
        <mat-card *ngFor="let station of stationCards; trackBy: trackByStationId" 
                  class="station-card" 
                  [ngClass]="'status-' + station.status">
          
          <mat-card-header>
            <div class="station-header">
              <div class="station-info">
                <h3>{{ station.name }}</h3>
                <span class="station-location">
                  Estación {{ station.estacionId }} - Carril {{ station.carrilId }}
                </span>
              </div>
              
              <div class="station-status">
                <mat-icon [ngClass]="'status-icon status-' + station.status">
                  {{ getStatusIcon(station.status) }}
                </mat-icon>
                <span class="status-text">{{ getStatusText(station.status) }}</span>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="connection-info">
              <div class="connection-detail">
                <mat-icon>router</mat-icon>
                <span>{{ station.ip }}:{{ station.port }}</span>
              </div>
              
              <div class="connection-detail" *ngIf="station.lastConnection">
                <mat-icon>schedule</mat-icon>
                <span>{{ station.lastConnection | date:'short' }}</span>
              </div>

              <div class="connection-detail worker-status">
                <mat-icon [ngClass]="getWorkerStatusClass(station.estadoWorker)">
                  {{ getWorkerStatusIcon(station.estadoWorker) }}
                </mat-icon>
                <span>Worker: {{ station.estadoWorker }}</span>
              </div>
            </div>

            <div class="coils-summary">
              <div class="coil-stat">
                <mat-icon>sensors</mat-icon>
                <span>{{ station.activeCoils }}/{{ station.coilsCount }} Activos</span>
              </div>
              
              <div class="coil-stat alarm" *ngIf="station.alarmCoils > 0">
                <mat-icon>warning</mat-icon>
                <span>{{ station.alarmCoils }} Alarmas</span>
              </div>
            </div>

            <div class="coils-detail" *ngIf="station.configuration.coilsConfiguracion?.length">
              <h4>Estado de Coils en tiempo real:</h4>
              <div class="coils-list">
                <div *ngFor="let coil of station.configuration.coilsConfiguracion" 
                     class="coil-item"
                     [ngClass]="{
                       'coil-active': coil.estadoActual,
                       'coil-alarm': coil.esAlarma && coil.estadoActual,
                       'coil-inactive': !coil.estadoActual
                     }"
                     [title]="getCoilTooltip(coil)">
                  <div class="coil-status">
                    <mat-icon [ngClass]="'coil-icon ' + (coil.estadoActual ? 'active' : 'inactive')">
                      {{ coil.estadoActual ? 'radio_button_checked' : 'radio_button_unchecked' }}
                    </mat-icon>
                    <span class="coil-name">{{ coil.nombre }}</span>
                  </div>
                  
                  <div class="coil-indicators">
                    <mat-icon *ngIf="coil.esAlarma && coil.estadoActual" 
                              class="alarm-icon pulse-alarm" 
                              title="Alarma activa">warning</mat-icon>
                    
                    <span *ngIf="coil.ultimaActualizacion" 
                          class="last-update" 
                          title="Última actualización: {{ coil.ultimaActualizacion | date:'medium' }}">
                      {{ getTimeAgo(coil.ultimaActualizacion) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="viewDetails(station)">
              <mat-icon>visibility</mat-icon>
              Detalles
            </button>
            
            <button mat-button 
                    (click)="testConnection(station)"
                    [disabled]="testingConnections.has(station.id)">
              <mat-icon>network_check</mat-icon>
              Probar
            </button>
            
            <button mat-button 
                    color="warn" 
                    (click)="restartWorker(station)"
                    [disabled]="restartingWorkers.has(station.id)">
              <mat-icon>restart_alt</mat-icon>
              Reiniciar
            </button>

            <mat-slide-toggle 
              [checked]="station.isActive"
              (change)="toggleStationActive(station, $event)"
              color="primary">
              {{ station.isActive ? 'Activo' : 'Inactivo' }}
            </mat-slide-toggle>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando datos de monitoreo...</p>
      </div>

      <div class="empty-state" *ngIf="!isLoading && stationCards.length === 0">
        <mat-icon>device_hub</mat-icon>
        <h2>No hay estaciones configuradas</h2>
        <p>Configure estaciones PLC para comenzar el monitoreo</p>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Agregar Estación
        </button>
      </div>
    </div>
  `,
  styles: [`
    .station-monitoring-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .refresh-interval {
      width: 120px;
    }

    .status-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      padding: 16px;
    }

    .summary-card mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .summary-card .count {
      font-size: 32px;
      font-weight: bold;
      text-align: center;
    }

    .summary-card.connected {
      border-left: 4px solid #4caf50;
    }

    .summary-card.connected .count {
      color: #4caf50;
    }

    .summary-card.disconnected {
      border-left: 4px solid #f44336;
    }

    .summary-card.disconnected .count {
      color: #f44336;
    }

    .summary-card.with-alarms {
      border-left: 4px solid #ff9800;
    }

    .summary-card.with-alarms .count {
      color: #ff9800;
    }

    .summary-card.performance {
      border-left: 4px solid #9c27b0;
    }

    .summary-card.performance .count {
      color: #9c27b0;
    }

    .summary-card.errors {
      border-left: 4px solid #f44336;
    }

    .summary-card.errors .count {
      color: #f44336;
    }

    .summary-card .total {
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .connection-status.status-connected {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .connection-status.status-disconnected {
      background-color: #ffebee;
      color: #f44336;
    }

    .connection-status.status-reconnecting {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .connection-status mat-icon {
      font-size: 16px;
    }

    .last-update {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #666;
    }

    .monitoring-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2196f3;
      font-weight: 500;
    }

    .monitoring-ready {
      color: #4caf50;
      font-size: 16px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .stations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .station-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .station-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .station-card.status-connected {
      border-left: 4px solid #4caf50;
    }

    .station-card.status-disconnected {
      border-left: 4px solid #f44336;
    }

    .station-card.status-starting {
      border-left: 4px solid #ff9800;
    }

    .station-card.status-error {
      border-left: 4px solid #9c27b0;
    }

    .station-card.status-stopped {
      border-left: 4px solid #607d8b;
    }

    .station-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .station-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .station-location {
      font-size: 12px;
      color: #666;
    }

    .station-status {
      display: flex;
      align-items: center;
      gap: 6px;
      text-align: right;
    }

    .status-icon {
      font-size: 20px;
    }

    .status-icon.status-connected {
      color: #4caf50;
    }

    .status-icon.status-disconnected {
      color: #f44336;
    }

    .status-icon.status-starting {
      color: #ff9800;
    }

    .status-icon.status-error {
      color: #9c27b0;
    }

    .status-icon.status-stopped {
      color: #607d8b;
    }

    .status-text {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    /* Worker Status Styles */
    .worker-status {
      padding: 4px 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }

    .worker-connected {
      color: #4caf50;
    }

    .worker-disconnected {
      color: #f44336;
    }

    .worker-timeout {
      color: #ff9800;
    }

    .worker-error {
      color: #9c27b0;
    }

    .worker-starting {
      color: #2196f3;
    }

    .worker-unknown {
      color: #607d8b;
    }

    .connection-info {
      margin: 16px 0;
    }

    .connection-detail {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      font-size: 14px;
    }

    .coils-summary {
      display: flex;
      justify-content: space-between;
      margin: 16px 0;
    }

    .coil-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .coil-stat.alarm {
      color: #ff9800;
      font-weight: 500;
    }

    .coils-detail {
      margin-top: 16px;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .coils-detail h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .coils-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
    }

    .coil-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: #f5f5f5;
      border-radius: 6px;
      font-size: 12px;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .coil-item:hover {
      background: #eeeeee;
    }

    .coil-item.coil-active {
      background: #e8f5e8;
      color: #2e7d32;
      border-left-color: #4caf50;
    }

    .coil-item.coil-inactive {
      background: #f5f5f5;
      color: #666;
      border-left-color: #bdbdbd;
    }

    .coil-item.coil-alarm {
      background: #fff3e0;
      color: #ef6c00;
      border-left-color: #ff9800;
    }

    .coil-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .coil-icon.active {
      color: #4caf50;
    }

    .coil-icon.inactive {
      color: #9e9e9e;
    }

    .coil-name {
      font-weight: 500;
    }

    .coil-indicators {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .last-update {
      font-size: 10px;
      color: #999;
      background: rgba(0,0,0,0.05);
      padding: 2px 4px;
      border-radius: 3px;
    }

    .pulse-alarm {
      animation: pulse-warning 1.5s infinite;
    }

    @keyframes pulse-warning {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .alarm-icon {
      color: #ff9800 !important;
      font-size: 16px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    mat-slide-toggle {
      margin-left: auto;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #999;
    }

    @media (max-width: 768px) {
      .stations-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .header-actions {
        justify-content: space-between;
      }
    }
  `]
})
export class StationMonitoringComponent implements OnInit, OnDestroy {
  monitoringData: StationMonitoringResponse | null = null;
  stationCards: StationCard[] = [];
  stats: MonitoringStats | null = null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  
  isLoading = true;
  isMonitoring = false;
  refreshInterval = 500; // 500ms por defecto para TIEMPO REAL EXTREMO
  
  private subscription?: Subscription;
  private statsSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  private shouldStopMonitoring = false;
  
  testingConnections = new Set<number>();
  restartingWorkers = new Set<number>();

  constructor(
    private stationService: RealTimeStationMonitoringService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startRealTimeMonitoring();
    this.subscribeToStats();
    this.subscribeToConnectionStatus();
  }

  ngOnDestroy(): void {
    this.stationService.stopMonitoring();
    this.subscription?.unsubscribe();
    this.statsSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
  }

  private startRealTimeMonitoring(): void {
    this.subscription?.unsubscribe();
    
    // TIEMPO REAL EXTREMO: 500ms (0.5 segundos)
    this.subscription = this.stationService
      .startRealTimeMonitoring(500) // Forzar 500ms para tiempo real extremo
      .subscribe({
        next: (data: StationMonitoringResponse) => {
          this.monitoringData = data;
          this.processStationData(data);
          this.isLoading = false;
          this.isMonitoring = !data.hasError;
        },
        error: (error: any) => {
          console.error('Error in real-time monitoring:', error);
          this.isLoading = false;
          // No desactivar monitoreo en caso de error temporal
          setTimeout(() => {
            if (!this.isMonitoring) {
              this.startRealTimeMonitoring();
            }
          }, 1000);
        }
      });
  }

  private subscribeToStats(): void {
    this.statsSubscription = this.stationService
      .getMonitoringStats()
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  private subscribeToConnectionStatus(): void {
    this.connectionSubscription = this.stationService
      .getConnectionStatus()
      .subscribe(status => {
        this.connectionStatus = status;
      });
  }

  private processStationData(data: StationMonitoringResponse): void {
    console.log('🔄 [COMPONENT] Processing station data:', {
      hasError: data.hasError,
      stationsCount: data.data.length,
      lastUpdated: data.lastUpdated,
      isRealTime: data.isRealTime
    });

    if (data.hasError) {
      this.snackBar.open(data.errorMessage || 'Error al cargar datos', 'Cerrar', {
        duration: 10000,
        panelClass: ['error-snackbar']
      });
    }

    const previousStationCards = JSON.stringify(this.stationCards);
    this.stationCards = data.data.map(station => {
      // Contabilizar correctamente los coils activos y de alarma basado en estado actual
      const activeCoils = station.coilsConfiguracion?.filter(c => c.estadoActual).length || 0;
      const alarmCoils = station.coilsConfiguracion?.filter(c => c.esAlarma && c.estadoActual).length || 0;

      return {
        id: station.id,
        name: station.nombre,
        ip: station.ip,
        port: station.puerto,
        estacionId: 1, // Valor por defecto - podrías parsearlo del estacionNombre
        carrilId: 1, // Valor por defecto - podrías parsearlo del carrilNombre
        status: this.mapConnectionStatus(station.estaConectado, station.estadoWorker),
        lastConnection: station.ultimaConexion ? new Date(station.ultimaConexion) : undefined,
        coilsCount: station.coilsConfiguracion?.length || 0,
        activeCoils,
        alarmCoils,
        isActive: station.workerActivo,
        configuration: station as any, // Conversión temporal para compatibilidad
        estadoWorker: station.estadoWorker
      };
    });

    // Log specific changes for PLC Simulador Local
    const plcSimulador = data.data.find(s => s.nombre === 'PLC Simulador Local');
    if (plcSimulador) {
      console.log('🎯 [COMPONENT] PLC Simulador Local coils:', 
        plcSimulador.coilsConfiguracion?.map(c => `${c.nombre}: ${c.estadoActual}`).join(', ')
      );
    }

    // Force change detection if there are changes
    const currentStationCards = JSON.stringify(this.stationCards);
    if (data.isRealTime || previousStationCards !== currentStationCards) {
      console.log('✅ [COMPONENT] Forcing change detection - UI should update');
      this.cdr.detectChanges();
    }
  }

  private mapConnectionStatus(connected: boolean, workerStatus: string): 'connected' | 'disconnected' | 'starting' | 'error' | 'stopped' {
    if (workerStatus.toLowerCase() === 'timeout') return 'error';
    if (workerStatus.toLowerCase() === 'error') return 'error';
    if (workerStatus.toLowerCase() === 'iniciando') return 'starting';
    if (connected) return 'connected';
    return 'disconnected';
  }

  onRefreshIntervalChange(): void {
    // Reiniciar el monitoreo con el nuevo intervalo
    this.stationService.stopMonitoring();
    this.startRealTimeMonitoring();
  }

  refreshData(): void {
    // Forzar una actualización inmediata
    this.isLoading = true;
    
    this.stationService.forceRefresh().subscribe({
      next: (data: StationMonitoringResponse) => {
        this.monitoringData = data;
        this.processStationData(data);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error refreshing data:', error);
        this.isLoading = false;
        this.snackBar.open('Error al actualizar datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStationsByStatus(status: string): StationCard[] {
    return this.stationCards.filter(station => station.status === status);
  }

  getStationsWithAlarms(): StationCard[] {
    return this.stationCards.filter(station => station.alarmCoils > 0);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'connected': return 'check_circle';
      case 'disconnected': return 'cancel';
      case 'starting': return 'hourglass_empty';
      case 'error': return 'error';
      default: return 'radio_button_unchecked';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'starting': return 'Iniciando';
      case 'error': return 'Error';
      default: return 'Detenido';
    }
  }

  getWorkerStatusIcon(workerStatus: string): string {
    switch (workerStatus.toLowerCase()) {
      case 'conectado': return 'play_circle';
      case 'desconectado': return 'pause_circle';
      case 'timeout': return 'access_time';
      case 'error': return 'error_outline';
      case 'iniciando': return 'refresh';
      default: return 'help_outline';
    }
  }

  getWorkerStatusClass(workerStatus: string): string {
    switch (workerStatus.toLowerCase()) {
      case 'conectado': return 'worker-connected';
      case 'desconectado': return 'worker-disconnected';
      case 'timeout': return 'worker-timeout';
      case 'error': return 'worker-error';
      case 'iniciando': return 'worker-starting';
      default: return 'worker-unknown';
    }
  }

  trackByStationId(index: number, station: StationCard): number {
    return station.id;
  }

  viewDetails(station: StationCard): void {
    // TODO: Implementar navegación a detalles de la estación
    console.log('Ver detalles de estación:', station);
    this.snackBar.open(`Viendo detalles de ${station.name}`, 'Cerrar', { duration: 2000 });
  }

  testConnection(station: StationCard): void {
    this.testingConnections.add(station.id);
    
    this.stationService.testPlcConnection(station.id).subscribe({
      next: (result) => {
        this.testingConnections.delete(station.id);
        const message = result.connected 
          ? `Conexión exitosa con ${station.name}`
          : `Fallo en conexión con ${station.name}: ${result.message}`;
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
          panelClass: result.connected ? ['success-snackbar'] : ['error-snackbar']
        });
      },
      error: (error) => {
        this.testingConnections.delete(station.id);
        this.snackBar.open(`Error al probar conexión: ${error.message}`, 'Cerrar', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  restartWorker(station: StationCard): void {
    this.restartingWorkers.add(station.id);
    
    this.stationService.restartWorker(station.id).subscribe({
      next: () => {
        this.restartingWorkers.delete(station.id);
        this.snackBar.open(`Worker reiniciado para ${station.name}`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Actualizar datos después de un breve delay
        setTimeout(() => this.refreshData(), 2000);
      },
      error: (error) => {
        this.restartingWorkers.delete(station.id);
        this.snackBar.open(`Error al reiniciar worker: ${error.message}`, 'Cerrar', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleStationActive(station: StationCard, event: any): void {
    const newStatus = event.checked;
    
    this.stationService.updatePlcStatus(station.id, newStatus).subscribe({
      next: () => {
        station.isActive = newStatus;
        this.snackBar.open(
          `Estación ${station.name} ${newStatus ? 'activada' : 'desactivada'}`, 
          'Cerrar', 
          { duration: 2000 }
        );
      },
      error: (error) => {
        // Revertir el toggle en caso de error
        event.source.checked = !newStatus;
        this.snackBar.open(`Error al cambiar estado: ${error.message}`, 'Cerrar', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getCoilTooltip(coil: any): string {
    const estado = coil.estadoActual ? 'ACTIVO' : 'INACTIVO';
    const alarma = coil.esAlarma ? ' (ALARMA)' : '';
    const ultimaActualizacion = coil.ultimaActualizacion 
      ? `\nÚltima actualización: ${new Date(coil.ultimaActualizacion).toLocaleString()}`
      : '';
    
    return `${coil.nombre}: ${estado}${alarma}${ultimaActualizacion}`;
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    
    const now = new Date().getTime();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    
    if (diffMs < 60000) return 'ahora';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
    return `${Math.floor(diffMs / 86400000)}d`;
  }

  onRefresh(): void {
    this.stationService.forceRefresh().subscribe();
  }

  onTogglePolling(): void {
    if (this.isMonitoring) {
      this.stationService.stopMonitoring();
      this.isMonitoring = false;
    } else {
      this.startRealTimeMonitoring();
    }
  }

  getConnectionIcon(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'check_circle';
      case 'reconnecting':
        return 'sync';
      default:
        return 'radio_button_unchecked';
    }
  }

  getConnectionText(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'reconnecting':
        return 'Reconectando...';
      default:
        return 'Desconectado';
    }
  }
}
