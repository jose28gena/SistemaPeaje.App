import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'op-settings',
  template: `
    <div class="settings-container">
      <h1>Configuración del Panel de Operador</h1>
      
      <div class="settings-sections">
        <!-- Configuración General -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Configuración General</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="generalForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>ID de Estación de Peaje</mat-label>
                <input matInput formControlName="stationId" readonly>
              </mat-form-field>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Nombre del Operador</mat-label>
                <input matInput formControlName="operatorName">
              </mat-form-field>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Turno</mat-label>
                <mat-select formControlName="shift">
                  <mat-option value="morning">Mañana (06:00 - 14:00)</mat-option>
                  <mat-option value="afternoon">Tarde (14:00 - 22:00)</mat-option>
                  <mat-option value="night">Noche (22:00 - 06:00)</mat-option>
                </mat-select>
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveGeneralSettings()">
              Guardar Configuración
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Configuración de Carriles -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Configuración de Carriles</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="laneForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Número Total de Carriles</mat-label>
                <input matInput type="number" formControlName="totalLanes">
              </mat-form-field>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Carriles Activos por Defecto</mat-label>
                <input matInput type="number" formControlName="defaultActiveLanes">
              </mat-form-field>
              
              <div class="toggle-section">
                <mat-slide-toggle formControlName="autoActivation">
                  Activación Automática de Carriles
                </mat-slide-toggle>
              </div>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveLaneSettings()">
              Guardar Configuración
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Configuración de Notificaciones -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Notificaciones</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="notificationForm">
              <div class="toggle-section">
                <mat-slide-toggle formControlName="enableAudioAlerts">
                  Alertas de Audio
                </mat-slide-toggle>
              </div>
              
              <div class="toggle-section">
                <mat-slide-toggle formControlName="enableVisualAlerts">
                  Alertas Visuales
                </mat-slide-toggle>
              </div>
              
              <div class="toggle-section">
                <mat-slide-toggle formControlName="enableSystemNotifications">
                  Notificaciones del Sistema
                </mat-slide-toggle>
              </div>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Frecuencia de Actualización (segundos)</mat-label>
                <input matInput type="number" formControlName="refreshInterval">
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveNotificationSettings()">
              Guardar Configuración
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Configuración de Conexión -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Configuración de Conexión</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="connectionForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>URL del Servidor</mat-label>
                <input matInput formControlName="serverUrl">
              </mat-form-field>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Puerto</mat-label>
                <input matInput type="number" formControlName="port">
              </mat-form-field>
              
              <div class="toggle-section">
                <mat-slide-toggle formControlName="enableSSL">
                  Conexión Segura (SSL)
                </mat-slide-toggle>
              </div>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveConnectionSettings()">
              Guardar Configuración
            </button>
            <button mat-button (click)="testConnection()">
              Probar Conexión
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
    }

    .settings-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .settings-card {
      height: fit-content;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .toggle-section {
      margin: 15px 0;
    }

    mat-card-actions {
      padding: 16px;
    }

    mat-card-actions button {
      margin-right: 10px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  generalForm: FormGroup;
  laneForm: FormGroup;
  notificationForm: FormGroup;
  connectionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.generalForm = this.fb.group({
      stationId: ['TS001', Validators.required],
      operatorName: ['', Validators.required],
      shift: ['morning', Validators.required]
    });

    this.laneForm = this.fb.group({
      totalLanes: [6, [Validators.required, Validators.min(1), Validators.max(20)]],
      defaultActiveLanes: [4, [Validators.required, Validators.min(1)]],
      autoActivation: [true]
    });

    this.notificationForm = this.fb.group({
      enableAudioAlerts: [true],
      enableVisualAlerts: [true],
      enableSystemNotifications: [true],
      refreshInterval: [5, [Validators.required, Validators.min(1), Validators.max(60)]]
    });

    this.connectionForm = this.fb.group({
      serverUrl: ['localhost', Validators.required],
      port: [3000, [Validators.required, Validators.min(1), Validators.max(65535)]],
      enableSSL: [false]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Aquí cargarías la configuración desde el servicio
    console.log('Cargando configuración...');
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      console.log('Guardando configuración general:', this.generalForm.value);
      // Aquí guardarías la configuración
    }
  }

  saveLaneSettings(): void {
    if (this.laneForm.valid) {
      console.log('Guardando configuración de carriles:', this.laneForm.value);
      // Aquí guardarías la configuración
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationForm.valid) {
      console.log('Guardando configuración de notificaciones:', this.notificationForm.value);
      // Aquí guardarías la configuración
    }
  }

  saveConnectionSettings(): void {
    if (this.connectionForm.valid) {
      console.log('Guardando configuración de conexión:', this.connectionForm.value);
      // Aquí guardarías la configuración
    }
  }

  testConnection(): void {
    console.log('Probando conexión...');
    // Aquí probarías la conexión con los datos del formulario
  }
}
