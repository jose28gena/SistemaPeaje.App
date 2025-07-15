import { Component, OnInit, HostListener } from '@angular/core';
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

interface VehicleClass {
  id: number;
  name: string;
  rate: number;
  tax: number;
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
    FormsModule
  ],
  template: `
    <div class="operator-layout">
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
          <span class="operator-name">{{ operatorName }}</span>
          <button mat-icon-button (click)="logout()" matTooltip="Cerrar Sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-toolbar>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Vehicle Panel (8 columns) -->
        <div class="vehicle-panel">
          <mat-card class="panel-card">
            <mat-card-header>
              <mat-card-title>Panel Vehículo</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Live Camera Feed -->
              <div class="camera-section">
                <div class="camera-feed">
                  <div class="camera-placeholder">
                    <mat-icon>videocam</mat-icon>
                    <span>Cámara en vivo</span>
                  </div>
                </div>
              </div>

              <!-- OCR/LPR Results -->
              <div class="ocr-section">
                <div class="ocr-result">
                  <span class="label">Placa detectada:</span>
                  <span class="value">{{ detectedPlate }}</span>
                </div>
                <div class="confidence">
                  <span>Confianza: {{ ocrConfidence }}%</span>
                </div>
              </div>

              <!-- Vehicle Classification -->
              <div class="classification-section">
                <div class="suggested-class">
                  <span class="label">Clase sugerida:</span>
                  <mat-chip-listbox>
                    <mat-chip-option [selected]="selectedClass?.id === suggestedClass?.id">
                      {{ suggestedClass?.name }}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </div>
                <div class="vehicle-details">
                  <span>Ejes: {{ axlesCount }}</span>
                  <span>Velocidad: {{ speed }} km/h</span>
                  <span>Peso: {{ weight }} kg</span>
                </div>
              </div>

              <!-- Validation Actions -->
              <div class="validation-actions">
                <button mat-raised-button color="primary" (click)="validateClass()">
                  <mat-icon>check</mat-icon>
                  Validar
                </button>
                <button mat-raised-button color="accent" (click)="correctClass()">
                  <mat-icon>edit</mat-icon>
                  Corregir
                </button>
              </div>

              <!-- Class Selection Buttons -->
              <div class="class-buttons">
                <div class="class-grid">
                  <button 
                    mat-raised-button 
                    *ngFor="let vehicleClass of vehicleClasses"
                    [color]="selectedClass?.id === vehicleClass.id ? 'primary' : ''"
                    (click)="selectClass(vehicleClass)"
                    class="class-button">
                    {{ vehicleClass.name }}
                  </button>
                </div>
              </div>

              <!-- Axles Control -->
              <div class="axles-control">
                <button mat-icon-button (click)="addAxle()" matTooltip="+1 Eje">
                  <mat-icon>add</mat-icon>
                </button>
                <span class="axle-count">{{ axlesCount }} ejes</span>
                <button mat-icon-button (click)="removeAxle()" matTooltip="-1 Eje">
                  <mat-icon>remove</mat-icon>
                </button>
                <button mat-icon-button (click)="undo()" matTooltip="Deshacer" class="undo-btn">
                  <mat-icon>undo</mat-icon>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Payment Panel (4 columns) -->
        <div class="payment-panel">
          <mat-card class="panel-card">
            <mat-card-header>
              <mat-card-title>Panel de Cobro</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Rate Information -->
              <div class="rate-section">
                <div class="rate-details">
                  <div class="rate-line">
                    <span class="label">Clase:</span>
                    <span class="value">{{ selectedClass?.name || '-' }}</span>
                  </div>
                  <div class="rate-line">
                    <span class="label">Tarifa base:</span>
                    <span class="value">\${{ calculateBaseRate() | number:'1.2-2' }}</span>
                  </div>
                  <div class="rate-line">
                    <span class="label">IVA:</span>
                    <span class="value">\${{ calculateTax() | number:'1.2-2' }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="rate-line total">
                    <span class="label">Total:</span>
                    <span class="value">\${{ calculateTotal() | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="payment-methods">
                <h4>Método de pago:</h4>
                <div class="payment-buttons">
                  <button 
                    mat-raised-button 
                    *ngFor="let method of paymentMethods"
                    [color]="selectedPaymentMethod === method.id ? 'primary' : ''"
                    (click)="selectPaymentMethod(method.id)"
                    class="payment-button">
                    <span class="hotkey">[{{ method.hotkey }}]</span>
                    {{ method.name }}
                  </button>
                </div>
              </div>

              <!-- Payment Details -->
              <div class="payment-details" *ngIf="selectedPaymentMethod === 'cash'">
                <mat-form-field appearance="outline" class="amount-field">
                  <mat-label>Importe recibido</mat-label>
                  <input matInput type="number" [(ngModel)]="receivedAmount" (ngModelChange)="calculateChange()">
                  <span matPrefix>\$</span>
                </mat-form-field>
                <div class="change-amount" *ngIf="change !== null">
                  <span class="label">Cambio:</span>
                  <span class="value" [class.negative]="change < 0">\${{ change | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Process Button -->
              <div class="process-section">
                <button 
                  mat-raised-button 
                  color="primary" 
                  class="process-button"
                  [disabled]="!canProcess()"
                  (click)="processPayment()">
                  <mat-icon>payment</mat-icon>
                  PROCESAR
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Incidents Sidebar (12x3) -->
      <div class="incidents-sidebar">
        <mat-card class="sidebar-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>warning</mat-icon>
              Incidencias
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alerts-section">
              <div class="alert-item" *ngFor="let alert of activeAlerts">
                <mat-icon [color]="alert.severity">{{ alert.icon }}</mat-icon>
                <span>{{ alert.message }}</span>
              </div>
              <button mat-stroked-button (click)="registerIncident()" class="incident-button">
                <mat-icon>add</mat-icon>
                [Ctrl + I] Registrar Incidencia
              </button>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="shift-stats">
              <h4>Estadísticas del Turno</h4>
              <div class="stat-item">
                <span class="label">Total procesados:</span>
                <span class="value">{{ shiftStats.total }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Fallos:</span>
                <span class="value">{{ shiftStats.errors }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Tiempo promedio:</span>
                <span class="value">{{ shiftStats.averageTime }}s</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Footer Status Bar (12x1) -->
      <div class="footer-status">
        <div class="status-indicators">
          <div class="status-item" [class]="systemStatus.camera">
            <mat-icon>videocam</mat-icon>
            <span>Cámara</span>
          </div>
          <div class="status-item" [class]="systemStatus.network">
            <mat-icon>wifi</mat-icon>
            <span>Red</span>
          </div>
          <div class="status-item" [class]="systemStatus.plc">
            <mat-icon>memory</mat-icon>
            <span>PLC</span>
          </div>
          <div class="status-item" [class]="systemStatus.loop">
            <mat-icon>sensors</mat-icon>
            <span>Lazo</span>
          </div>
          <div class="status-item" [class]="systemStatus.ups">
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
  currentTime = new Date();
  operatorName = 'Juan Pérez';
  
  // Vehicle detection data
  detectedPlate = 'ABC-123';
  ocrConfidence = 95;
  speed = 45;
  weight = 2500;
  axlesCount = 2;
  
  // Vehicle classes
  vehicleClasses: VehicleClass[] = [
    { id: 1, name: 'Auto', rate: 25.00, tax: 4.00 },
    { id: 2, name: 'Motocicleta', rate: 15.00, tax: 2.40 },
    { id: 3, name: 'Camión 2 ejes', rate: 45.00, tax: 7.20 },
    { id: 4, name: 'Camión 3 ejes', rate: 65.00, tax: 10.40 },
    { id: 5, name: 'Tráiler', rate: 85.00, tax: 13.60 },
    { id: 6, name: 'Autobús', rate: 55.00, tax: 8.80 }
  ];
  
  suggestedClass = this.vehicleClasses[0];
  selectedClass: VehicleClass | null = null;
  
  // Payment methods
  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Efectivo', hotkey: 'F1' },
    { id: 'rfid', name: 'RFID', hotkey: 'F2' },
    { id: 'qr', name: 'QR', hotkey: 'F3' },
    { id: 'exempt', name: 'Exento', hotkey: 'F4' }
  ];
  
  selectedPaymentMethod: string | null = null;
  receivedAmount: number | null = null;
  change: number | null = null;
  
  // Alerts and incidents
  activeAlerts = [
    { severity: 'warn', icon: 'error', message: 'Sensor de peso desactivado' },
    { severity: 'primary', icon: 'info', message: 'Evasión detectada en carril 3' }
  ];
  
  // Shift statistics
  shiftStats = {
    total: 156,
    errors: 3,
    averageTime: 12.5
  };
  
  // System status
  systemStatus: SystemStatus = {
    camera: 'online',
    network: 'online',
    plc: 'warning',
    loop: 'online',
    ups: 'online'
  };

  ngOnInit() {
    // Update clock every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Select suggested class by default
    this.selectedClass = this.suggestedClass;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    switch (event.key) {
      case 'F1':
        event.preventDefault();
        this.selectPaymentMethod('cash');
        break;
      case 'F2':
        event.preventDefault();
        this.selectPaymentMethod('rfid');
        break;
      case 'F3':
        event.preventDefault();
        this.selectPaymentMethod('qr');
        break;
      case 'F4':
        event.preventDefault();
        this.selectPaymentMethod('exempt');
        break;
    }
    
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'i':
          event.preventDefault();
          this.registerIncident();
          break;
        case 't':
          event.preventDefault();
          this.closeShift();
          break;
      }
    }
  }

  selectClass(vehicleClass: VehicleClass) {
    this.selectedClass = vehicleClass;
  }

  validateClass() {
    console.log('Clase validada:', this.selectedClass);
  }

  correctClass() {
    console.log('Corrigiendo clase...');
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

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    if (method !== 'cash') {
      this.receivedAmount = null;
      this.change = null;
    }
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

  calculateChange() {
    if (this.receivedAmount !== null) {
      this.change = this.receivedAmount - this.calculateTotal();
    }
  }

  canProcess(): boolean {
    if (!this.selectedClass || !this.selectedPaymentMethod) {
      return false;
    }
    
    if (this.selectedPaymentMethod === 'cash') {
      return this.receivedAmount !== null && this.receivedAmount >= this.calculateTotal();
    }
    
    return true;
  }

  processPayment() {
    console.log('Procesando pago...', {
      class: this.selectedClass,
      method: this.selectedPaymentMethod,
      amount: this.calculateTotal(),
      received: this.receivedAmount,
      change: this.change
    });
    
    // Reset for next vehicle
    this.resetTransaction();
  }

  registerIncident() {
    console.log('Registrando incidencia...');
  }

  closeShift() {
    console.log('Cerrando turno...');
  }

  logout() {
    console.log('Cerrando sesión...');
  }

  private resetTransaction() {
    this.selectedPaymentMethod = null;
    this.receivedAmount = null;
    this.change = null;
    this.selectedClass = this.suggestedClass;
  }
}
