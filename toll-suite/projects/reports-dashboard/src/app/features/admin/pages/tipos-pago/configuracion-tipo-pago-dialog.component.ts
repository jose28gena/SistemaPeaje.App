import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  ConfiguracionTiposPagoService,
  ConfiguracionTipoPago,
  UpdateConfiguracionTipoPagoDto,
  MonedasSoportadas,
  SIMBOLOS_MONEDA
} from '@data-access';

export interface ConfiguracionDialogData {
  configuracion: ConfiguracionTipoPago;
  modoEdicion: boolean;
}

@Component({
  selector: 'app-configuracion-tipo-pago-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Editar Configuración: {{ data.configuracion.tipoPagoNombre }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="formulario" class="configuracion-form">
          <div class="form-grid">
            <!-- Información del Tipo -->
            <div class="info-section">
              <h4>Información del Tipo de Pago</h4>
              <div class="info-item">
                <strong>Tipo:</strong> {{ data.configuracion.tipoPagoNombre }}
              </div>
              <div class="info-item">
                <strong>ID:</strong> {{ data.configuracion.tipoPagoId }}
              </div>
            </div>

            <!-- Configuración de Moneda -->
            <div class="section">
              <h4>Configuración de Moneda</h4>
              
              <mat-form-field>
                <mat-label>Moneda</mat-label>
                <mat-select formControlName="moneda" required>
                  <mat-option *ngFor="let moneda of monedas" [value]="moneda">
                    {{ SIMBOLOS_MONEDA[moneda] }} {{ moneda }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Símbolo de Moneda</mat-label>
                <input matInput formControlName="simboloMoneda" required>
              </mat-form-field>
            </div>

            <!-- Límites -->
            <div class="section">
              <h4>Límites de Transacción</h4>
              
              <mat-form-field>
                <mat-label>Límite Diario</mat-label>
                <input matInput type="number" formControlName="limiteDiario" min="0">
                <mat-hint>Monto máximo permitido por día</mat-hint>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Límite por Transacción</mat-label>
                <input matInput type="number" formControlName="limiteTransaccion" min="0">
                <mat-hint>Monto máximo por transacción individual</mat-hint>
              </mat-form-field>
            </div>

            <!-- Comisiones -->
            <div class="section">
              <h4>Configuración de Comisiones</h4>
              
              <mat-form-field>
                <mat-label>Comisión Porcentual (%)</mat-label>
                <input matInput type="number" formControlName="comisionPorcentaje" 
                       min="0" max="100" step="0.1">
                <mat-hint>Porcentaje aplicado sobre el monto</mat-hint>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Comisión Fija</mat-label>
                <input matInput type="number" formControlName="comisionFija" 
                       min="0" step="0.01">
                <mat-hint>Monto fijo agregado a cada transacción</mat-hint>
              </mat-form-field>
            </div>

            <!-- Descuento -->
            <div class="section">
              <h4>Descuento por Defecto</h4>
              
              <mat-form-field>
                <mat-label>Descuento (%)</mat-label>
                <input matInput type="number" formControlName="descuentoPorDefecto" 
                       min="0" max="100" step="0.1">
                <mat-hint>Descuento aplicado automáticamente</mat-hint>
              </mat-form-field>
            </div>

            <!-- Configuración de Validación -->
            <div class="section">
              <h4>Configuración de Validación</h4>
              
              <mat-form-field>
                <mat-label>Tiempo de Espera (segundos)</mat-label>
                <input matInput type="number" formControlName="tiempoEsperaSegundos" 
                       min="5" max="300">
                <mat-hint>Tiempo máximo para completar la transacción</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- Switches de Estado -->
          <div class="switches-section">
            <h4>Configuración de Estado</h4>
            
            <div class="switches-grid">
              <mat-slide-toggle formControlName="estaActivo">
                <div class="switch-info">
                  <strong>Configuración Activa</strong>
                  <small>Permite el uso de este tipo de pago</small>
                </div>
              </mat-slide-toggle>

              <mat-slide-toggle formControlName="requiereValidacionAdicional">
                <div class="switch-info">
                  <strong>Validación Adicional</strong>
                  <small>Requiere pasos extra de validación</small>
                </div>
              </mat-slide-toggle>

              <mat-slide-toggle formControlName="permiteTransaccionesParcialeS">
                <div class="switch-info">
                  <strong>Transacciones Parciales</strong>
                  <small>Permite pagos parciales del monto total</small>
                </div>
              </mat-slide-toggle>
            </div>
          </div>

          <!-- Configuración Específica -->
          <div class="section">
            <h4>Configuración Específica</h4>
            
            <mat-form-field class="full-width">
              <mat-label>JSON de Configuración</mat-label>
              <textarea matInput formControlName="configuracionEspecifica" 
                        rows="4" placeholder='{"ejemplo": "valor", "propiedad": true}'></textarea>
              <mat-hint>Configuración adicional en formato JSON</mat-hint>
              <mat-error *ngIf="formulario.get('configuracionEspecifica')?.hasError('invalidJson')">
                JSON inválido
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Observaciones -->
          <div class="section">
            <h4>Observaciones</h4>
            
            <mat-form-field class="full-width">
              <mat-label>Observaciones adicionales</mat-label>
              <textarea matInput formControlName="observaciones" rows="3"></textarea>
              <mat-hint>Notas adicionales sobre esta configuración</mat-hint>
            </mat-form-field>
          </div>

          <!-- Preview de Cálculo -->
          <div class="preview-section" *ngIf="previewCalculos">
            <h4>Vista Previa de Cálculos</h4>
            <div class="preview-grid">
              <div class="preview-item">
                <label>Ejemplo con $1,000:</label>
                <div class="preview-result">
                  <div>Descuento: -{{ calcularDescuento(1000) }}</div>
                  <div>Comisión: +{{ calcularComision(1000) }}</div>
                  <div class="total">Total: {{ calcularTotal(1000) }}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="guardando">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        
        <button mat-button (click)="togglePreview()">
          <mat-icon>{{ previewCalculos ? 'visibility_off' : 'visibility' }}</mat-icon>
          {{ previewCalculos ? 'Ocultar' : 'Ver' }} Preview
        </button>
        
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="formulario.invalid || guardando">
          <mat-icon>save</mat-icon>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          <mat-progress-spinner *ngIf="guardando" diameter="20" mode="indeterminate"></mat-progress-spinner>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .configuracion-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section {
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: #f8f9fa;

      h4 {
        margin: 0 0 1rem 0;
        color: #495057;
        font-size: 1rem;
        font-weight: 600;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .info-section {
      padding: 1rem;
      background: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 8px;

      h4 {
        margin: 0 0 0.75rem 0;
        color: #1565c0;
      }

      .info-item {
        margin-bottom: 0.5rem;
        color: #1565c0;

        strong {
          margin-right: 0.5rem;
        }
      }
    }

    .switches-section {
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: #f8f9fa;

      h4 {
        margin: 0 0 1rem 0;
        color: #495057;
        font-size: 1rem;
        font-weight: 600;
      }

      .switches-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        mat-slide-toggle {
          display: flex;
          align-items: flex-start;
          
          .switch-info {
            margin-left: 0.75rem;
            
            strong {
              display: block;
              color: #2c3e50;
              font-size: 0.9rem;
            }
            
            small {
              display: block;
              color: #6c757d;
              font-size: 0.8rem;
              margin-top: 0.25rem;
            }
          }
        }
      }
    }

    .preview-section {
      padding: 1rem;
      background: #e8f5e8;
      border: 1px solid #c3e6c3;
      border-radius: 8px;

      h4 {
        margin: 0 0 1rem 0;
        color: #155724;
        font-size: 1rem;
        font-weight: 600;
      }

      .preview-grid {
        .preview-item {
          label {
            display: block;
            font-weight: 600;
            color: #155724;
            margin-bottom: 0.5rem;
          }

          .preview-result {
            background: white;
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid #c3e6c3;

            div {
              margin-bottom: 0.25rem;
              font-size: 0.9rem;

              &.total {
                font-weight: 600;
                font-size: 1rem;
                color: #155724;
                border-top: 1px solid #c3e6c3;
                padding-top: 0.5rem;
                margin-top: 0.5rem;
              }
            }
          }
        }
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1.5rem 0 0 0;
      border-top: 1px solid #e9ecef;
      gap: 0.75rem;

      button {
        mat-icon {
          margin-right: 0.5rem;
        }

        mat-progress-spinner {
          margin-left: 0.5rem;
        }
      }
    }

    @media (max-width: 600px) {
      .dialog-container {
        max-width: 95vw;
      }

      .switches-grid {
        mat-slide-toggle .switch-info {
          margin-left: 0.5rem;
        }
      }
    }
  `]
})
export class ConfiguracionTipoPagoDialogComponent implements OnInit {
  formulario!: FormGroup;
  guardando = false;
  previewCalculos = false;
  monedas = Object.values(MonedasSoportadas);
  SIMBOLOS_MONEDA = SIMBOLOS_MONEDA;

  constructor(
    private dialogRef: MatDialogRef<ConfiguracionTipoPagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracionDialogData,
    private fb: FormBuilder,
    private configuracionService: ConfiguracionTiposPagoService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data.configuracion) {
      this.loadConfiguration();
    }
  }

  private initializeForm(): void {
    this.formulario = this.fb.group({
      moneda: ['MXN', Validators.required],
      simboloMoneda: ['$', Validators.required],
      limiteDiario: [null, [Validators.min(0)]],
      limiteTransaccion: [null, [Validators.min(0)]],
      comisionPorcentaje: [0, [Validators.min(0), Validators.max(100)]],
      comisionFija: [0, [Validators.min(0)]],
      estaActivo: [true],
      requiereValidacionAdicional: [false],
      tiempoEsperaSegundos: [30, [Validators.min(5), Validators.max(300)]],
      descuentoPorDefecto: [0, [Validators.min(0), Validators.max(100)]],
      permiteTransaccionesParcialeS: [false],
      configuracionEspecifica: ['', this.jsonValidator],
      observaciones: ['']
    });

    // Auto-actualizar símbolo cuando cambia moneda
    this.formulario.get('moneda')?.valueChanges.subscribe(moneda => {
      if (moneda && SIMBOLOS_MONEDA[moneda as keyof typeof SIMBOLOS_MONEDA]) {
        this.formulario.patchValue({
          simboloMoneda: SIMBOLOS_MONEDA[moneda as keyof typeof SIMBOLOS_MONEDA]
        });
      }
    });
  }

  private loadConfiguration(): void {
    const config = this.data.configuracion;
    this.formulario.patchValue({
      moneda: config.moneda,
      simboloMoneda: config.simboloMoneda,
      limiteDiario: config.limiteDiario,
      limiteTransaccion: config.limiteTransaccion,
      comisionPorcentaje: config.comisionPorcentaje,
      comisionFija: config.comisionFija,
      estaActivo: config.estaActivo,
      requiereValidacionAdicional: config.requiereValidacionAdicional,
      tiempoEsperaSegundos: config.tiempoEsperaSegundos,
      descuentoPorDefecto: config.descuentoPorDefecto,
      permiteTransaccionesParcialeS: config.permiteTransaccionesParcialeS,
      configuracionEspecifica: config.configuracionEspecifica || '',
      observaciones: config.observaciones || ''
    });
  }

  private jsonValidator(control: any) {
    if (!control.value) return null;
    
    try {
      JSON.parse(control.value);
      return null;
    } catch (error) {
      return { invalidJson: true };
    }
  }

  onSave(): void {
    if (this.formulario.invalid) return;

    this.guardando = true;
    const configuracion: UpdateConfiguracionTipoPagoDto = {
      id: this.data.configuracion.id,
      tipoPagoId: this.data.configuracion.tipoPagoId,
      ...this.formulario.value
    };

    this.configuracionService.update(configuracion.id, configuracion).subscribe({
      next: () => {
        this.snackBar.open('Configuración actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error actualizando configuración:', error);
        this.snackBar.open('Error al actualizar la configuración', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.guardando = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  togglePreview(): void {
    this.previewCalculos = !this.previewCalculos;
  }

  calcularDescuento(monto: number): string {
    const descuento = this.formulario.get('descuentoPorDefecto')?.value || 0;
    const montoDescuento = (monto * descuento) / 100;
    return this.formatearMonto(montoDescuento);
  }

  calcularComision(monto: number): string {
    const porcentaje = this.formulario.get('comisionPorcentaje')?.value || 0;
    const fija = this.formulario.get('comisionFija')?.value || 0;
    const descuento = this.formulario.get('descuentoPorDefecto')?.value || 0;
    
    const montoConDescuento = monto - (monto * descuento / 100);
    const comisionPorcentual = (montoConDescuento * porcentaje) / 100;
    const comisionTotal = comisionPorcentual + fija;
    
    return this.formatearMonto(comisionTotal);
  }

  calcularTotal(monto: number): string {
    const descuento = this.formulario.get('descuentoPorDefecto')?.value || 0;
    const porcentaje = this.formulario.get('comisionPorcentaje')?.value || 0;
    const fija = this.formulario.get('comisionFija')?.value || 0;
    
    const montoConDescuento = monto - (monto * descuento / 100);
    const comisionPorcentual = (montoConDescuento * porcentaje) / 100;
    const total = montoConDescuento + comisionPorcentual + fija;
    
    return this.formatearMonto(total);
  }

  private formatearMonto(monto: number): string {
    const simbolo = this.formulario.get('simboloMoneda')?.value || '$';
    return `${simbolo}${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
