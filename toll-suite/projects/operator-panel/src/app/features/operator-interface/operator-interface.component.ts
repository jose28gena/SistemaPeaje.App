import { Component, OnInit, HostListener, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiKitModule } from '@toll-suite/ui-kit';
import { PaymentModalComponent } from './payment-modal.component';
import { 
  TurnosService, 
  AbrirTurnoBackendDto, 
  CerrarTurnoBackendDto, 
  TurnoBackend,
  EstacionesService,
  EmpleadosService,
  Estacion,
  Carril,
  Empleado,
  ComandosPlcService,
  ComandoAbrirBarreraDto,
  LaneSemaphoreService,
  TarifasService,
  TiposVehiculoService,
  Tarifa,
  TipoVehiculo,
  CalculoTarifaRequest,
  CalculoTarifaResponse
} from '@toll-suite/data-access';

interface VehicleClass {
  id: number;
  name: string;
  descripcion?: string;
  categoria?: string;
  numeroEjes?: number;
  rate: number;
  tax: number;
  tarifaId?: number; // ID de la tarifa vigente
}

interface PaymentMethod {
  id: string;
  name: string;
  hotkey: string;
}

interface SystemStatus {
  camera: 'online' | 'warning' | 'offline';
  network: 'online' | 'warning' | 'offline';
  plc: 'online' | 'warning' | 'offline';
  loop: 'online' | 'warning' | 'offline';
  printer: 'online' | 'warning' | 'offline';
  ups: 'online' | 'warning' | 'offline';
}

@Component({
  selector: 'op-operator-interface',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatToolbarModule,
    MatBadgeModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
  MatTooltipModule,
  UiKitModule,
    FormsModule
  ],
  template: `
    <div class="operator-layout">
      <div class="processing-overlay" *ngIf="isProcessing">
        <div class="processing-box">
          <mat-icon>hourglass_top</mat-icon>
          <span>Procesando…</span>
        </div>
      </div>
      <!-- Header (12x1) -->
      <mat-toolbar class="header-toolbar" color="primary">
        <div class="header-section">
          <img src="assets/logo.png" alt="Logo" class="logo" />
          <span class="booth-info">Caseta 01 - Carril 02</span>
        </div>
        <div class="header-center">
          <span class="clock">{{ currentTime | date:'HH:mm:ss' }}</span>
        </div>
        <div class="header-actions">
          <button mat-icon-button (click)="toggleFullscreen()" [matTooltip]="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
            <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
          <span class="operator-name">{{ operatorName }}</span>
        </div>
      </mat-toolbar>

      <!-- Turno Panel (quick open/close) -->
      <div class="turno-panel" style="padding: 8px 16px;">
        <mat-card>
          <mat-card-content>
            <div *ngIf="!turnoActivo; else cierreTpl">
              <div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: end;">
                <mat-form-field appearance="outline" style="width: 240px;">
                  <mat-label>Estación</mat-label>
                  <mat-select [(ngModel)]="selectedEstacionId" (selectionChange)="onEstacionChange()">
                    <mat-option *ngFor="let est of estaciones" [value]="est.id">{{ est.nombre }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" style="width: 240px;">
                  <mat-label>Carril</mat-label>
                  <mat-select [(ngModel)]="selectedCarrilId">
                    <mat-option [value]="null">Sin carril</mat-option>
                    <mat-option *ngFor="let c of carriles" [value]="c.id">{{ c.numero }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" style="width: 260px;">
                  <mat-label>Empleado</mat-label>
                  <mat-select [(ngModel)]="selectedEmpleadoId">
                    <mat-option *ngFor="let e of empleados" [value]="e.id">{{ e.nombres }} {{ e.apellidos }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" style="width: 180px;">
                  <mat-label>Saldo Inicial</mat-label>
                  <input matInput type="number" [(ngModel)]="montoInicialApertura">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="abrirTurno()" [disabled]="!puedeAbrirTurno()">
                  <mat-icon>login</mat-icon>
                  Abrir turno
                </button>
              </div>
            </div>

            <ng-template #cierreTpl>
              <div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: end;">
                <div style="margin-right: 12px;">
                  <strong>Turno activo:</strong>
                  <span>#{{ turnoActivo?.id }} · Estación {{ turnoActivo?.estacionId }} · Carril {{ turnoActivo?.carrilId || '-' }}</span>
                </div>
                <mat-form-field appearance="outline" style="width: 160px;">
                  <mat-label>Caja Final</mat-label>
                  <input matInput type="number" [(ngModel)]="montoFinalCaja">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width: 160px;">
                  <mat-label>Ventas Efectivo</mat-label>
                  <input matInput type="number" [(ngModel)]="ventasEfectivo">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width: 160px;">
                  <mat-label>Efectivo Contado</mat-label>
                  <input matInput type="number" [(ngModel)]="efectivoContado">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width: 160px;">
                  <mat-label>Ventas Prepago</mat-label>
                  <input matInput type="number" [(ngModel)]="ventasPrepago">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width: 140px;">
                  <mat-label>Exentos</mat-label>
                  <input matInput type="number" [(ngModel)]="cantidadExentos">
                </mat-form-field>
                <button mat-raised-button color="accent" (click)="cerrarTurno()" [disabled]="!puedeCerrarTurno()">
                  <mat-icon>logout</mat-icon>
                  Cerrar turno
                </button>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>

        <!-- Confirm Close Shift Dialog -->
        <ng-template #closeShiftTpl>
          <h2 mat-dialog-title>¿Cerrar turno?</h2>
          <div mat-dialog-content>
            <p>Se enviará el cierre con los importes capturados.</p>
          </div>
          <div mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancelar</button>
            <button mat-flat-button color="primary" (click)="confirmCloseShift()">Cerrar turno</button>
          </div>
        </ng-template>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Left: Kiosk Operations Panel -->
        <div class="kiosk-operations">
          <!-- Kiosk-style Operator Panel -->
          <div class="kiosk-wrapper">
            <h2 class="kiosk-title">
              Panel del Operador
              <span *ngIf="isLoadingTarifas" class="loading-indicator">
                <mat-icon>sync</mat-icon> Cargando tarifas...
              </span>
              <span *ngIf="!isLoadingTarifas && vehicleClasses.length > 0" class="tarifa-status">
                <mat-icon>check_circle</mat-icon> {{ vehicleClasses.length }} tarifas cargadas
              </span>
            </h2>
            <div class="kiosk-frame">
              <div class="kiosk-inner">
                <!-- Left block: categories and options -->
                <div class="kiosk-left">
                  <div class="row" *ngFor="let row of uiRows">
                    <button class="category-btn" [disabled]="row.disabled" (click)="onSelectCategory(row)">
                      <mat-icon class="category-icon">{{ row.icon }}</mat-icon>
                      <div class="category-text">
                        <div class="line1">{{ row.titleLine1 }}</div>
                        <div class="line2" *ngIf="row.titleLine2">{{ row.titleLine2 }}</div>
                      </div>
                    </button>
                    <div class="arrow">▶</div>
                    <div class="options" *ngIf="row.options?.length">
                      <button class="option-btn" [ngClass]="{ active: isActiveOption(opt) }" *ngFor="let opt of row.options" (click)="onSelectOption(opt)">{{ opt.label }}</button>
                    </div>
                    <div class="options" *ngIf="row.actions?.length">
                      <button class="option-btn" [disabled]="row.disabled" *ngFor="let act of row.actions" (click)="onAction(act)">{{ act.label }}</button>
                    </div>
                  </div>

                  <div class="controls-row">
                    <button class="control-btn" (click)="onClear()" aria-label="Clear">C</button>
                    <button class="control-btn" (click)="onUndo()" aria-label="Undo"><mat-icon>undo</mat-icon></button>
                    <button class="control-btn" (click)="onRedo()" aria-label="Redo"><mat-icon>redo</mat-icon></button>
                  
                  </div>
                </div>

                <!-- Right block: Payment and Receipt Section -->
                <div class="payment-section">
                  <!-- Receipt Preview -->
                  <div class="receipt-preview">
                    <h3 class="section-title">Vista Previa del Ticket</h3>
                    <div class="ticket-display">
                      <div class="ticket-header">
                        <div class="ticket-info">Fideicomiso Puente Colorado</div>
                        <div class="ticket-info">Km. 2.5 Carretera San Luis RC - Mexicali</div>
                        <div class="ticket-info">FOLIO: {{ generateFolio() }} FECHA: {{ currentTime | date:'dd/MM/yyyy HH:mm' }}</div>
                        <div class="ticket-info">CARRIL: {{ getCarrilDisplay() }}        CAJERO: {{ selectedEmpleadoId || '--' }}</div>
                        <div class="ticket-separator">==========================</div>
                        <div class="ticket-info">NF:{{ generateNF() }}</div>
                      </div>
                      <div class="ticket-details">
                        <div class="vehicle-info">
                          <span>CLASE: {{ selectedClass?.name || selectedOption?.label || '-' }}</span>
                        </div>
                        <div class="amount-breakdown">
                          <div class="amount-line">IMPORTE: \${{ calculateTotal().toFixed(2) }}</div>
                          <div class="amount-line">IVA: \${{ calculateTax().toFixed(2) }}</div>
                          <div class="amount-line total">TOTAL: \${{ calculateTotal().toFixed(2) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Payment Methods -->
                  <div class="payment-methods">
                    <h3 class="section-title">Métodos de Pago</h3>
                    <div class="payment-grid">
                      <button 
                        class="payment-btn" 
                        [ngClass]="{ active: selectedPaymentMethod?.id === method.id }"
                        *ngFor="let method of paymentMethods" 
                        (click)="selectPaymentMethod(method)">
                        <mat-icon>{{ getPaymentIcon(method.id) }}</mat-icon>
                        <span>{{ method.name }}</span>
                        <span class="hotkey">{{ method.hotkey }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Amount Entry (for cash payments) -->
                  <div class="amount-entry" *ngIf="selectedPaymentMethod?.id === 'cash'">
                    <h3 class="section-title">Cantidad Recibida</h3>
                    <div class="amount-input">
                      <mat-form-field appearance="outline">
                        <mat-label>Importe recibido</mat-label>
                        <input matInput type="number" [(ngModel)]="receivedAmount" (input)="calculateChange()" />
                        <span matPrefix>$&nbsp;</span>
                      </mat-form-field>
                    </div>
                    <div class="quick-amounts">
                      <button class="quick-btn" *ngFor="let amount of quickAmounts" (click)="setQuickAmount(amount)">
                        \${{ amount }}
                      </button>
                    </div>
                    <div class="change-display" *ngIf="changeAmount >= 0">
                      <span class="change-label">Cambio:</span>
                      <span class="change-value">\${{ changeAmount.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- Process Payment Button -->
                  <div class="process-payment">
                    <button 
                      class="process-payment-btn" 
                      [disabled]="!canProcessPayment()" 
                      (click)="processPayment()">
                      <mat-icon>payment</mat-icon>
                      COBRAR - \${{ calculateTotal().toFixed(2) }}
                    </button>
                  </div>

                  <!-- Incidents Semaphore -->
                  <div class="incidents-semaphore">
                    <ui-incident-semaphore
                      [state]="semaphoreState"
                      [totals]="semaphoreTotals"
                      [lastChange]="semaphoreLastChange"
                      (openPanel)="openIncidentPanel()"
                      (openHealth)="openHealthSummary()"
                      (ack)="ackIncidents($event)"
                      (filter)="openIncidentPanel($event)"></ui-incident-semaphore>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Status Bar (12x1) -->
      <div class="footer-status">
        <div class="status-indicators">
          <div class="status-item" [class]="systemStatus.camera" [matTooltip]="'Cámara: ' + systemStatus.camera">
            <mat-icon>videocam</mat-icon>
            <span>Cámara</span>
          </div>
          <div class="status-item" [class]="systemStatus.network" [matTooltip]="'Red: ' + systemStatus.network">
            <mat-icon>wifi</mat-icon>
            <span>Red</span>
          </div>
          <div class="status-item" [class]="systemStatus.plc" [matTooltip]="'PLC: ' + systemStatus.plc">
            <mat-icon>memory</mat-icon>
            <span>PLC</span>
          </div>
          <div class="status-item" [class]="systemStatus.loop" [matTooltip]="'Lazo: ' + systemStatus.loop">
            <mat-icon>sensors</mat-icon>
            <span>Lazo</span>
          </div>
          <div class="status-item" [class]="systemStatus.printer" [matTooltip]="'Impresora: ' + systemStatus.printer">
            <mat-icon>print</mat-icon>
            <span>Impresora</span>
          </div>
          <div class="status-item" [class]="systemStatus.ups" [matTooltip]="'UPS: ' + systemStatus.ups">
            <mat-icon>battery_charging_full</mat-icon>
            <span>UPS</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./operator-interface.component.scss']
})
export class OperatorInterfaceComponent implements OnInit {
  @ViewChild('closeShiftTpl') closeShiftTpl!: TemplateRef<any>;

  currentTime = new Date();
  operatorName = 'Juan Pérez';
  // Simple flow state
  state: 'idle' | 'detecting' | 'classified' | 'awaitingPayment' | 'processing' | 'ticket' | 'exiting' = 'idle';
  isProcessing = false;
  isDark = false;
  isFullscreen = false;
  // Turno state
  turnoActivo: TurnoBackend | null = null;
  estaciones: Estacion[] = [];
  carriles: Carril[] = [];
  empleados: Empleado[] = [];
  selectedEstacionId: number | null = null;
  selectedCarrilId: number | null = null;
  selectedEmpleadoId: number | null = null;
  montoInicialApertura: number | null = null;
  // Cierre fields
  montoFinalCaja: number | null = null;
  ventasEfectivo: number | null = null;
  efectivoContado: number | null = null;
  ventasPrepago: number | null = null;
  cantidadExentos: number | null = null;
  
  // Vehicle data  
  axlesCount = 2;
  
  // Vehicle classes (dynamic loading from database)
  vehicleClasses: VehicleClass[] = [];
  tiposVehiculo: TipoVehiculo[] = [];
  isLoadingTarifas = false;
  
  suggestedClass: VehicleClass | null = null;
  selectedClass: VehicleClass | null = null;
  
  // Payment data
  selectedPaymentMethod: PaymentMethod | null = null;
  receivedAmount: number = 0;
  changeAmount: number = 0;
  quickAmounts = [25, 50, 100, 200, 500];
  
  // Payment methods
  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Efectivo', hotkey: 'F1' },
    { id: 'rfid', name: 'RFID', hotkey: 'F2' },
    { id: 'qr', name: 'QR', hotkey: 'F3' },
    { id: 'exempt', name: 'Exento', hotkey: 'F4' }
  ];
  
  // System status
  systemStatus: SystemStatus = {
    camera: 'online',
    network: 'online',
    plc: 'warning',
    loop: 'online',
    printer: 'online',
    ups: 'online'
  };

  constructor(
    private turnosService: TurnosService,
    private estacionesService: EstacionesService,
    private empleadosService: EmpleadosService,
    private comandosPlcService: ComandosPlcService,
    private laneSemaphoreService: LaneSemaphoreService,
    private tarifasService: TarifasService,
    private tiposVehiculoService: TiposVehiculoService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    // Update clock every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Load catalog data for opening a turno
    this.loadEstaciones();
    this.loadEmpleados();
    this.loadTiposVehiculoYTarifas();

  // Try to load active turno from localStorage (if opened previously)
    try {
      const saved = localStorage.getItem('turnoActivo');
      if (saved) {
        this.turnoActivo = JSON.parse(saved);
        // Si hay un turno activo, cargar los carriles de esa estación
        if (this.turnoActivo?.estacionId) {
          this.selectedEstacionId = this.turnoActivo.estacionId;
          this.onEstacionChange();
        }
      }
    } catch {}

  // Initial load of semaphore state
  const laneId = this.turnoActivo?.carrilId ?? this.selectedCarrilId ?? 1;
  this.refreshSemaphore(laneId);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    // Removed F1-F4 hotkeys as payment method selection now happens in modal
    
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 't':
          event.preventDefault();
          this.closeShift();
          break;
      }
    }
  }

  selectClass(vehicleClass: VehicleClass) {
    this.selectedClass = vehicleClass;
    this.state = 'classified';
  }
  addAxle() {
    this.axlesCount++;
  }

  removeAxle() {
    if (this.axlesCount > 1) {
      this.axlesCount--;
    }
  }

  undo() {
    console.log('Deshaciendo última acción...');
  }


  calculateBaseRate(): number {
    return this.selectedClass?.rate || 0;
  }

  calculateTax(): number {
    return this.selectedClass?.tax || 0;
  }

  calculateTotal(): number {
    return this.calculateBaseRate() + this.calculateTax();
  }



  processPayment() {
    if (this.isProcessing || !this.selectedClass || !this.selectedPaymentMethod) {
      return;
    }

    // Validar pago en efectivo
    if (this.selectedPaymentMethod.id === 'cash' && this.receivedAmount < this.calculateTotal()) {
      this.snack.open('El monto recibido es insuficiente', 'OK', { duration: 3000 });
      return;
    }

    this.isProcessing = true;
    this.state = 'processing';

    console.log('Procesando pago...', {
      class: this.selectedClass,
      method: this.selectedPaymentMethod,
      total: this.calculateTotal(),
      received: this.receivedAmount,
      change: this.changeAmount
    });

    // Simular procesamiento de pago
    setTimeout(() => {
      // Procesar ticket
      this.emitTicket();
      
      // Llamar endpoint para abrir barrera
      this.openBarrierWithApi();
      
    }, 600);
  }

  private openBarrierWithApi() {
    const comando: ComandoAbrirBarreraDto = {
      casetaIp: '127.0.0.1', // IP del simulador/PLC
      coilAddress: 96, // Dirección del coil para abrir barrera
      unitId: 1,
      carrilId: this.turnoActivo?.carrilId || 1,
      observaciones: `Apertura automática - Clase: ${this.selectedClass?.name} - Pago: ${this.selectedPaymentMethod?.name}`
    };

    this.comandosPlcService.abrirBarrera(comando).subscribe({
      next: (resultado) => {
        if (resultado.exitoso) {
          console.log('✅ Barrera abierta correctamente:', resultado);
          this.snack.open('Pago procesado. Ticket emitido y barrera abierta.', 'OK', { duration: 2500 });
          this.systemStatus.plc = 'online';
        } else {
          console.error('❌ Error al abrir barrera:', resultado);
          this.snack.open(`Error al abrir barrera: ${resultado.mensaje}`, 'OK', { duration: 4000 });
          this.systemStatus.plc = 'offline';
        }
        
        this.state = 'ticket';
        setTimeout(() => {
          this.resetTransaction();
          this.state = 'idle';
          this.isProcessing = false;
        }, 1200);
      },
      error: (error) => {
        console.error('❌ Error de comunicación con API:', error);
        this.snack.open('Error de comunicación con el sistema PLC', 'OK', { duration: 4000 });
        this.systemStatus.plc = 'offline';
        
        this.state = 'ticket';
        setTimeout(() => {
          this.resetTransaction();
          this.state = 'idle';
          this.isProcessing = false;
        }, 1200);
      }
    });
  }

  closeShift() {
    this.dialog.open(this.closeShiftTpl, { width: '420px' });
  }

  confirmCloseShift() {
    this.dialog.closeAll();
    this.cerrarTurno();
  }

  logout() {
    console.log('Cerrando sesión...');
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    const cls = 'dark-theme';
    const body = document.body;
    if (this.isDark) {
      body.classList.add(cls);
    } else {
      body.classList.remove(cls);
    }
  }

  toggleFullscreen() {
    const doc: any = document;
    const el: any = document.documentElement;
    if (!doc.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      doc.exitFullscreen?.();
    }
  }

  @HostListener('document:fullscreenchange')
  onFsChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  private resetTransaction() {
    this.selectedClass = this.suggestedClass;
    this.selectedPaymentMethod = null;
    this.receivedAmount = 0;
    this.changeAmount = 0;
    this.selectedOption = null;
    this.extraAxles = 0;
  }

  // Incident semaphore state/logic
  semaphoreState: 'green'|'yellow'|'red'|'gray' = 'yellow';
  semaphoreTotals = { ok: 229, warn: 13, crit: 2, all: 244 };
  semaphoreLastChange?: Date;

  refreshSemaphore(laneId: number) {
    this.laneSemaphoreService.getSemaphore(laneId).subscribe({
      next: (data) => {
        this.semaphoreState = data.state ?? 'gray';
        this.semaphoreTotals = data.totals ?? { ok: 0, warn: 0, crit: 0, all: 0 };
        this.semaphoreLastChange = data.lastChange ? new Date(data.lastChange) : undefined;
      },
      error: () => {
        this.semaphoreState = 'gray';
      }
    });
  }

  openIncidentPanel(type?: 'ok'|'warn'|'crit') {
    console.log('Abrir Panel de Incidencias', { type, laneId: this.turnoActivo?.carrilId ?? this.selectedCarrilId });
  }

  openHealthSummary() {
    console.log('Abrir Resumen de salud de periféricos');
  }

  ackIncidents(seconds: number) {
    this.snack.open(`Alertas silenciadas por ${Math.round(seconds/60)} min`, 'OK', { duration: 2500 });
  }

  // Simulate PLC loop trigger and OCR/LPR
  onLoopDetected() {
    if (this.state !== 'idle') return;
    this.state = 'detecting';
    this.runOcrAndSuggest();
  }

  private runOcrAndSuggest() {
    setTimeout(() => {
      // Auto-select first vehicle class for demo
      this.selectedClass = this.vehicleClasses[0];
      this.state = 'awaitingPayment';
    }, 500);
  }

  private emitTicket() {
    // Placeholder for backend print call
    this.systemStatus.printer = 'online';
  }

  // Método anterior comentado - ahora usamos openBarrierWithApi()
  // private openBarrier() {
  //   // Placeholder for PLC open call
  //   this.systemStatus.plc = 'online';
  //   setTimeout(() => (this.systemStatus.plc = 'warning'), 2000);
  // }

  // Turno helpers
  loadEstaciones() {
    console.log('🔄 Cargando estaciones...');
    this.estacionesService.getAll().subscribe({
      next: (res) => {
        console.log('✅ Respuesta exitosa de estaciones:', res);
        this.estaciones = (res as any).data || res;
        console.log('🎯 Estaciones asignadas:', this.estaciones);
      },
      error: (err) => console.error('❌ Error cargando estaciones:', err)
    });
  }

  onEstacionChange() {
    console.log('🔄 onEstacionChange llamado - selectedEstacionId:', this.selectedEstacionId);
    this.carriles = [];
    if (this.selectedEstacionId != null) {
      console.log('📡 Llamando getCarrilesByEstacion para estación:', this.selectedEstacionId);
      this.estacionesService.getCarrilesByEstacion(this.selectedEstacionId).subscribe({
        next: (res) => {
          console.log('✅ Respuesta exitosa de carriles:', res);
          console.log('🔍 Tipo de respuesta:', typeof res);
          console.log('🔍 Es array?:', Array.isArray(res));
          
          // Asegurarse de que la respuesta sea un array
          if (Array.isArray(res)) {
            this.carriles = res;
          } else if (res && (res as any).data && Array.isArray((res as any).data)) {
            this.carriles = (res as any).data;
          } else {
            this.carriles = res ? [res] : [];
          }
          
          console.log('🎯 Carriles asignados:', this.carriles);
          console.log('📊 Cantidad de carriles:', this.carriles.length);
        },
        error: (err) => {
          console.error('❌ Error cargando carriles:', err);
        }
      });
    }
  }

  loadEmpleados() {
    this.empleadosService.getActivos().subscribe({
      next: (res) => this.empleados = (res as any).data || res,
      error: (err) => console.error('Error cargando empleados', err)
    });
  }

  loadTiposVehiculoYTarifas() {
    this.isLoadingTarifas = true;
    
    // Primero cargar tipos de vehículo
    this.tiposVehiculoService.getAll().subscribe({
      next: (res: any) => {
        this.tiposVehiculo = res.data || res;
        this.loadTarifasParaTipos();
      },
      error: (err: any) => {
        console.error('Error cargando tipos de vehículo', err);
        this.isLoadingTarifas = false;
      }
    });
  }

  loadTarifasParaTipos() {
    const estacionId = this.turnoActivo?.estacionId || this.selectedEstacionId || undefined;
    
    // Cargar todas las tarifas vigentes
    this.tarifasService.getVigentes(estacionId).subscribe({
      next: (tarifas) => {
        this.vehicleClasses = this.tiposVehiculo.map(tipo => {
          // Buscar la tarifa correspondiente a este tipo de vehículo
          const tarifa = tarifas.find(t => t.tipoVehiculoId === tipo.id);
          
          return {
            id: tipo.id,
            name: tipo.nombre,
            descripcion: tipo.descripcion,
            categoria: tipo.categoria,
            numeroEjes: tipo.numeroEjes,
            rate: tarifa ? tarifa.monto : tipo.tarifaBase || 0,
            tax: tarifa ? this.calcularIVA(tarifa.monto) : this.calcularIVA(tipo.tarifaBase || 0),
            tarifaId: tarifa?.id
          };
        });

        // Seleccionar la primera clase como sugerida
        if (this.vehicleClasses.length > 0) {
          this.suggestedClass = this.vehicleClasses[0];
          this.selectedClass = this.suggestedClass;
        }

        this.isLoadingTarifas = false;
        console.log('Tarifas cargadas:', this.vehicleClasses);
      },
      error: (err) => {
        console.error('Error cargando tarifas', err);
        this.isLoadingTarifas = false;
        // Fallback: usar tarifas base de tipos de vehículo
        this.useBaseTarifas();
      }
    });
  }

  private useBaseTarifas() {
    this.vehicleClasses = this.tiposVehiculo.map(tipo => ({
      id: tipo.id,
      name: tipo.nombre,
      descripcion: tipo.descripcion,
      categoria: tipo.categoria,
      numeroEjes: tipo.numeroEjes,
      rate: tipo.tarifaBase || 0,
      tax: this.calcularIVA(tipo.tarifaBase || 0)
    }));

    if (this.vehicleClasses.length > 0) {
      this.suggestedClass = this.vehicleClasses[0];
      this.selectedClass = this.suggestedClass;
    }
  }

  private calcularIVA(monto: number): number {
    // Calcular IVA del 16% (puedes ajustar según tu lógica de negocio)
    return monto * 0.16;
  }

  // Método para refrescar tarifas cuando cambie la estación
  refreshTarifasForEstacion(estacionId?: number) {
    if (this.tiposVehiculo.length > 0) {
      this.loadTarifasParaTipos();
    }
  }

  puedeAbrirTurno(): boolean {
    return !!(this.selectedEstacionId && this.selectedEmpleadoId && this.montoInicialApertura != null && this.montoInicialApertura >= 0);
  }

  abrirTurno() {
    if (!this.puedeAbrirTurno()) return;
    const payload: AbrirTurnoBackendDto = {
      empleadoId: this.selectedEmpleadoId!,
      estacionId: this.selectedEstacionId!,
      carrilId: this.selectedCarrilId ?? undefined,
      montoInicialCaja: Number(this.montoInicialApertura)
    };
    this.turnosService.abrirTurno(payload).subscribe({
      next: (turno) => {
        this.turnoActivo = turno;
        try { localStorage.setItem('turnoActivo', JSON.stringify(turno)); } catch {}
        
        // Refrescar tarifas para la estación del turno
        this.refreshTarifasForEstacion(turno.estacionId);
        
        // Reset apertura form
        this.montoInicialApertura = null;
      },
      error: (err) => console.error('Error abriendo turno', err)
    });
  }

  puedeCerrarTurno(): boolean {
    return !!(this.turnoActivo && this.montoFinalCaja != null);
  }

  cerrarTurno() {
    if (!this.turnoActivo) return;
    const payload: CerrarTurnoBackendDto = {
      montoFinalCaja: Number(this.montoFinalCaja ?? 0),
      ventasEfectivo: this.ventasEfectivo != null ? Number(this.ventasEfectivo) : undefined,
      efectivoContado: this.efectivoContado != null ? Number(this.efectivoContado) : undefined,
      ventasPrepago: this.ventasPrepago != null ? Number(this.ventasPrepago) : undefined,
      cantidadExentos: this.cantidadExentos != null ? Number(this.cantidadExentos) : undefined
    };
  this.turnosService.cerrarTurno(this.turnoActivo.id, payload).subscribe({
      next: (turnoCerrado) => {
        // Clear turno
        this.turnoActivo = null;
        try { localStorage.removeItem('turnoActivo'); } catch {}
        // Reset cierre fields
        this.montoFinalCaja = null;
        this.ventasEfectivo = null;
        this.efectivoContado = null;
        this.ventasPrepago = null;
        this.cantidadExentos = null;
      },
      error: (err) => console.error('Error cerrando turno', err)
    });
  }

  // ================= KIOSK PANEL STATE & LOGIC =================
  uiRows: any[] = [
    {
      titleLine1: 'MOTOCICLETA',
      titleLine2: '',
      icon: 'two_wheeler',
      options: [
        { id: 'moto', label: 'MOTO', group: 'moto' },
        { id: 'triciclo', label: 'TRICICLO', group: 'moto' }
      ]
    },
    {
      titleLine1: 'AUTOMÓVIL / PICK UP',
      titleLine2: '',
      icon: 'directions_car',
      options: [
        { id: 'auto', label: 'AUTO', group: 'auto' },
        { id: 'pickup', label: 'PICK/UP', group: 'auto' },
        { id: 'van', label: 'VAN', group: 'auto' },
        { id: 'suv', label: 'SUV', group: 'auto' }
      ]
    },
    {
      titleLine1: 'AUTOBÚS DE 2 A 4 EJES',
      titleLine2: '',
      icon: 'directions_bus',
      options: [
        { id: 'bus2', label: '2', group: 'bus' },
        { id: 'bus3', label: '3', group: 'bus' },
        { id: 'bus4', label: '4', group: 'bus' }
      ]
    },
    {
      titleLine1: 'CAMIÓN DE 2 A 4 EJES',
      titleLine2: '',
      icon: 'local_shipping',
      options: [
        { id: 'truck2', label: '2', group: 'truck' },
        { id: 'truck3', label: '3', group: 'truck' },
        { id: 'truck4', label: '4', group: 'truck' }
      ]
    },
    {
      titleLine1: 'CAMIÓN DE 5 A 6 EJES',
      titleLine2: '',
      icon: 'local_shipping',
      options: [
        { id: 'truck5', label: '5', group: 'truck' },
        { id: 'truck6', label: '6', group: 'truck' }
      ]
    },
    {
      titleLine1: 'CAMIÓN DE 7 A 9 EJES',
      titleLine2: '',
      icon: 'local_shipping',
      options: [
        { id: 'truck7', label: '7', group: 'truck' },
        { id: 'truck8', label: '8', group: 'truck' },
        { id: 'truck9', label: '9', group: 'truck' }
      ]
    },
    {
      titleLine1: 'EJE EXCEDENTE SENCILLO',
      titleLine2: '',
      icon: 'settings_ethernet',
      actions: [ { type: 'axle', value: 1, label: '+1' } ],
      disabled: false
    },
    {
      titleLine1: 'EJE DOBLE / EJE EXCEDENTE',
      titleLine2: '',
      icon: 'settings_input_component',
      actions: [ { type: 'axle', value: 2, label: '+2' } ],
      disabled: false
    }
  ];

  selectedOption: any = null;
  extraAxles = 0;
  history: any[] = [];
  future: any[] = [];

  isActiveOption(opt: any): boolean {
    return this.selectedOption?.id === opt.id;
  }

  onSelectCategory(row: any) {
    // No-op for now; reserved for future
  }

  onSelectOption(opt: any) {
    this.history.push({ selectedOption: this.selectedOption, extraAxles: this.extraAxles });
    this.future = [];
    this.selectedOption = opt;
    // Map option to class/axles
    const labelNum = Number(opt.label);
    if (!isNaN(labelNum)) {
      this.axlesCount = labelNum;
    }
    if (opt.group === 'moto') this.selectedClass = this.vehicleClasses.find(v => v.name.toLowerCase().includes('moto')) || this.selectedClass;
    if (opt.group === 'auto') this.selectedClass = this.vehicleClasses.find(v => v.name.toLowerCase().includes('auto')) || this.selectedClass;
    if (opt.group === 'bus') this.selectedClass = this.vehicleClasses.find(v => v.name.toLowerCase().includes('autobús')) || this.selectedClass;
    if (opt.group === 'truck') this.selectedClass = this.vehicleClasses.find(v => v.name.toLowerCase().includes('camión')) || this.selectedClass;
  }

  onAction(act: any) {
    if (act.type === 'axle') {
      this.history.push({ selectedOption: this.selectedOption, extraAxles: this.extraAxles });
      this.future = [];
      this.extraAxles += act.value;
      this.axlesCount += act.value;
    }
  }

  onClear() {
    this.history.push({ selectedOption: this.selectedOption, extraAxles: this.extraAxles });
    this.future = [];
    this.selectedOption = null;
    this.extraAxles = 0;
  }

  onUndo() {
    const prev = this.history.pop();
    if (prev) {
      this.future.push({ selectedOption: this.selectedOption, extraAxles: this.extraAxles });
      this.selectedOption = prev.selectedOption;
      this.extraAxles = prev.extraAxles;
    }
  }

  onRedo() {
    const next = this.future.pop();
    if (next) {
      this.history.push({ selectedOption: this.selectedOption, extraAxles: this.extraAxles });
      this.selectedOption = next.selectedOption;
      this.extraAxles = next.extraAxles;
    }
  }

  canProcessKiosk(): boolean {
    return !!(this.selectedOption || this.selectedClass);
  }

  onProcess() {
    this.processPayment();
    this.onClear();
  }

  triggerProcess() {
    if (!this.isProcessing && this.selectedClass) {
      this.processPayment();
    }
  }

  // Payment-related methods
  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    if (method.id !== 'cash') {
      this.receivedAmount = this.calculateTotal();
      this.calculateChange();
    }
  }

  calculateChange() {
    const total = this.calculateTotal();
    this.changeAmount = this.receivedAmount - total;
  }

  setQuickAmount(amount: number) {
    this.receivedAmount = amount;
    this.calculateChange();
  }

  canProcessPayment(): boolean {
    if (!this.selectedClass || !this.selectedPaymentMethod) {
      return false;
    }
    
    if (this.selectedPaymentMethod.id === 'cash') {
      return this.receivedAmount >= this.calculateTotal();
    }
    
    return true;
  }

  getPaymentIcon(paymentId: string): string {
    switch (paymentId) {
      case 'cash': return 'payments';
      case 'rfid': return 'contactless';
      case 'qr': return 'qr_code';
      case 'exempt': return 'check_circle';
      default: return 'payment';
    }
  }

  getCarrilDisplay(): string {
    const carrilId = this.turnoActivo?.carrilId ?? this.selectedCarrilId;
    return carrilId ? carrilId.toString().padStart(2, '0') : '--';
  }

  generateFolio(): string {
    return '0202513028';
  }

  generateNF(): string {
    return '0202513820245334';
  }

}
